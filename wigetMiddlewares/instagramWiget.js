const moment = require('moment');
const fetch = require('node-fetch');
const Instagram = require('../models/instagram');
const Variable = require('../models/variable');

const refreshToken = async (oldToken) => {
  try {
    const res = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`);
    const { access_token } = await res.json();
    return Variable.setValue('INSTAGRAM_TOKEN', access_token);
  } catch (err) {
    console.log(err);
  }
};

const getLastPublications = async (token) => {
  try {
    const url = `https://graph.instagram.com/me/media?fields=id,media_url,timestamp&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.log('ERR: ', err);
  }
};

module.exports = async function (req, res, next) {
  let token = await Variable.getValue('INSTAGRAM_TOKEN');
  if (!token) {
    token = await refreshToken(process.env.INSTAGRAM_TOKEN);
  }
  const tokenDays = moment.duration(moment().diff(token.updatedAt)).asDays();
  if (tokenDays >= 10) {
    token = await refreshToken(token);
  }
  const lastUpd = await Instagram.max('createdAt');
  const cacheHours = moment.duration(moment().diff(lastUpd)).asHours();
  if (lastUpd === null || cacheHours > 1) {
    await Instagram.destroy({
      where: {}
    });
    let publications = await getLastPublications(token);
        publications = publications.slice(0, 9);
    await Instagram.bulkCreate(publications);
    req.instagram = publications;
  } else {
    req.instagram = await Instagram.findAll({
      attributes: ['media_url'],
      order: [['timestamp', 'DESC']],
      limit: 9,
      raw: true
    });
  }
  req.instagram.forEach(item => item.ext = item.media_url.split(/[#?]/)[0].split('.').pop().trim());

  next();
}