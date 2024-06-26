const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

const options = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: true,
  secureOptions: {
    ca: [ fs.readFileSync('ca.pem') ],
    rejectUnauthorized: false
  }
};

const uploadDir = async (dirName, count= 5) => {
  if (!process.env.FTP_HOST) {
    return true;
  }
  if (!count) {
    return false;
  }
  const client = new ftp.Client();
  client.ftp.verbose = true
  try {
    await client.access(options);
    console.log(await client.list())
    console.log(fs.readdirSync(path.join(__dirname, '../files/posts')));
    await client.uploadFromDir(path.join(__dirname, '../files/posts', dirName), `/htdocs/files/posts/${dirName}`);
  } catch(err) {
    console.log(err);
    if (count === 1) {
      throw err;
    }
    await uploadDir(dirName, count - 1);
  } finally {
    client.close();
  }
};

const downloadPostDir = async (dirName, count = 5) => {
  if (!process.env.FTP_HOST) {
    return true;
  }
  if (!count) {
    return false;
  }
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access(options);
    console.log(await client.list());
    console.log(fs.readdirSync(path.join(__dirname, '../files/posts')));
    await client.downloadToDir(path.join(__dirname, '../files/posts', dirName), `/htdocs/files/posts/${dirName}`);
  } catch(err) {
    console.log(err);
    if (count === 1) {
      throw err;
    }
    await uploadDir(dirName, count - 1);
  } finally {
    client.close();
  }
};

module.exports = {
  uploadDir,
  downloadPostDir
}