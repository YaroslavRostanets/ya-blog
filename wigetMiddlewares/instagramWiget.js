const moment = require('moment');
const fetch = require('node-fetch');
const Instagram = require('../models/instagram');
const Variable = require('../models/variable');

const refreshToken = async (oldToke) => {
  const res = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToke}`);
  const { access_token } = await res.json();
  return Variable.setValue('INSTAGRAM_TOKEN', access_token);
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
  console.log('lastUpd: ', lastUpd)
  const cacheHours = moment.duration(moment().diff(lastUpd)).asHours();
  if (lastUpd === null || cacheHours > 1) {
    await Instagram.destroy({
      where: {}
    });
    console.log('token: ', token);
    let publications = await getLastPublications(token.value);
        publications = publications.slice(0, 9);
    await Instagram.bulkCreate(publications);
    req.instagram = publications;
  } else {
    req.instagram = await Instagram.findAll({
      attributes: ['media_url'],
      order: [['timestamp', 'DESC']],
      limit: 9
    });
  }
  next();
}