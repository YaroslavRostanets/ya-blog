const fs = require('fs');
const path = require('path');

const createDir = (dirPath) => {
  try {
    fs.readdirSync(dirPath)
  } catch(err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

module.exports = function () {
  // ToDo створення папок files/upload, files/posts
  // ToDo скачування файлів з ftp
  createDir(path.join(__dirname, '../files/uploads'));
  createDir(path.join(__dirname, '../files/posts'));
};