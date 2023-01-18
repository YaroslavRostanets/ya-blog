const fetch = require('node-fetch');
const Instagram = require("../models/instagram");

const getLastPublications = async () => {
  const url = `https://graph.instagram.com/me/media?fields=id,media_url,timestamp&access_token=${process.env.INSTAGRAM_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data;

};

module.exports = async function (req, res, next) {
  const count = await Instagram.count();
  if (!count) {
    const publications = await getLastPublications();
    await Instagram.bulkCreate(publications.slice(0, 9));
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