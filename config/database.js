const Sequelize = require('sequelize');

const config = {
  host: process.env.PGHOST,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  dialect: 'postgres',
  database: 'ya-blog',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const db = new Sequelize(config);

module.exports = db;