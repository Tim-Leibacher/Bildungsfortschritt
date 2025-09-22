import dbConfig from "../config/dbConfig.js";
import Sequelize from "sequelize";
import User from "./models/User.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.PORT,
  pool: dbConfig.pool,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = User(sequelize, Sequelize);

export default db;
