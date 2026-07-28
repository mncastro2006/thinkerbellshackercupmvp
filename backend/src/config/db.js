const { Sequelize } = require("sequelize");

const {
  DB_HOST = "mysql",
  DB_PORT = 3306,
  DB_NAME = "thinkerbells",
  DB_USER = "thinkerbells",
  DB_PASSWORD = "thinkerbells",
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  retry: {
    max: 10,
  },
});

module.exports = sequelize;
