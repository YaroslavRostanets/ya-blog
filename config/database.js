const Sequelize = require('sequelize');

const config = {
  host: process.env.PGHOST,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  dialect: 'postgres',
  database: process.env.PGDATABASE,
  pool: {
    max: 18,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

const db = new Sequelize(config);

module.exports = db;