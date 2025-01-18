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
  req.instagram = await Instagram.findAll({
    attributes: ['media_url'],
    order: [['timestamp', 'DESC']],
    limit: 9,
    raw: true
  });

  next();
}
