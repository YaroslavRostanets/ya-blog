require('dotenv-flow').config({});

module.exports = {
    development: {
    username: process.env.PGUSER,
    password: proces.env.PGPASSWORD,
    database: "ya-blog",
    host: process.env.PGHOST,
    posrt: process.env.PGPORT,
    dialect: "postgres"
    }
  }
  