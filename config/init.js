const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { mapLimit } = require('async');
const FtpManager = require('../modules/FtpManager');
const modelSync = require('../config/modelSync');
const setModelRelations = require('../config/modelRelations');


const Post = require('../models/post');

const createDir = (dirPath) => {
  try {
    fs.readdirSync(dirPath)
  } catch(err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

const downLoadPostDirs = async () => {
  if (!process.env.FTP_HOST) {
    return false;
  }
  const posts = await Post.findAll({
    attributes: ['id'],
    raw: true
  });
  await mapLimit(posts, 1, async post => {
    await FtpManager.downloadPostDir(`post_${post.id}`, 5);
  });
};

const autoPing = () => {
  if (process.env.SELF_URL) {
    setInterval(async () => {
      const response = await fetch(`${process.env.SELF_URL}/ping`);
    }, 59000);
  }
};

module.exports = async function () {
  await modelSync();
  await setModelRelations();
  createDir(path.join(__dirname, '../files/uploads'));
  createDir(path.join(__dirname, '../files/posts'));
  console.log('READ_DIR: ', path.join(__dirname, '../files/posts'));
  downLoadPostDirs();
  autoPing();
};