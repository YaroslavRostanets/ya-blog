process.env.NODE_ENV='development'
require('dotenv-flow').config({});

module.exports = {
    development: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: "ya-blog",
    host: '127.0.0.1',
    posrt: process.env.PGPORT,
    dialect: "postgres"
    }
  }
  