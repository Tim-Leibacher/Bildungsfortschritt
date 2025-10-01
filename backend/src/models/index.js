import dbConfig from "../config/db.js";
import Sequelize from "sequelize";
import User from "./User.js";
import Role from "./Role.js";
import Modul from "./Modul.js";
import UserModule from "./UserModule.js";
import Kompetenzbereich from "./Kompetenzbereich.js";
import Leistungsziel from "./Leistungsziel.js";
import LB from "./LB.js";
import Durchfuehrung from "./Durchfuehrung.js";
import ModulKompetenzbereich from "./ModulKompetenzbereich.js";
import ModulePerformanceGoal from "./ModulePerformanceGoal.js";

// Debug DB configuration
console.log('DB Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  database: dbConfig.database,
  dialect: dbConfig.dialect
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
    logging: console.log
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = User(sequelize, Sequelize);
db.role = Role(sequelize, Sequelize);
db.modul = Modul(sequelize, Sequelize);
db.userModule = UserModule(sequelize, Sequelize);
db.kompetenzbereich = Kompetenzbereich(sequelize, Sequelize);
db.leistungsziel = Leistungsziel(sequelize, Sequelize);
db.lb = LB(sequelize, Sequelize);
db.durchfuehrung = Durchfuehrung(sequelize, Sequelize);
db.modulKompetenzbereich = ModulKompetenzbereich(sequelize, Sequelize);
db.modulePerformanceGoal = ModulePerformanceGoal(sequelize, Sequelize);

// User - Role Beziehungen (Many-to-Many)
db.role.belongsToMany(db.user, { through: "user_roles" });
db.user.belongsToMany(db.role, { through: "user_roles", as: "roles" });

// Coach-Lernender Beziehungen (Self-referencing)
db.user.belongsTo(db.user, { as: "coach", foreignKey: "coach_id" });
db.user.hasMany(db.user, { as: "students", foreignKey: "coach_id" });

// Module - Durchfuehrungen Beziehungen (One-to-Many)
db.modul.hasMany(db.durchfuehrung, {
  foreignKey: "modul_id",
  as: "durchfuehrungen",
});
db.durchfuehrung.belongsTo(db.modul, { foreignKey: "modul_id", as: "modul" });

// User - Durchfuehrungen Beziehungen (Many-to-Many durch UserModule)
db.user.belongsToMany(db.durchfuehrung, {
  through: db.userModule,
  foreignKey: "user_id",
  otherKey: "durchfuehrung_id",
  as: "durchfuehrungen",
});
db.durchfuehrung.belongsToMany(db.user, {
  through: db.userModule,
  foreignKey: "durchfuehrung_id",
  otherKey: "user_id",
  as: "teilnehmer",
});

// Direkte UserModule Beziehungen
db.userModule.belongsTo(db.user, { foreignKey: "user_id", as: "user" });
db.userModule.belongsTo(db.durchfuehrung, {
  foreignKey: "durchfuehrung_id",
  as: "durchfuehrung",
});
db.user.hasMany(db.userModule, { foreignKey: "user_id", as: "userModules" });
db.durchfuehrung.hasMany(db.userModule, {
  foreignKey: "durchfuehrung_id",
  as: "userModules",
});

// Module - Kompetenzbereiche Beziehungen (Many-to-Many, nur für BFS/ÜK)
db.modul.belongsToMany(db.kompetenzbereich, {
  through: db.modulKompetenzbereich,
  foreignKey: "modul_id",
  otherKey: "kompetenzbereich_id",
  as: "kompetenzbereiche",
});
db.kompetenzbereich.belongsToMany(db.modul, {
  through: db.modulKompetenzbereich,
  foreignKey: "kompetenzbereich_id",
  otherKey: "modul_id",
  as: "module",
});

// Direkte ModulKompetenzbereich Beziehungen
db.modulKompetenzbereich.belongsTo(db.modul, { foreignKey: "modul_id" });
db.modulKompetenzbereich.belongsTo(db.kompetenzbereich, {
  foreignKey: "kompetenzbereich_id",
});
db.modul.hasMany(db.modulKompetenzbereich, { foreignKey: "modul_id" });
db.kompetenzbereich.hasMany(db.modulKompetenzbereich, {
  foreignKey: "kompetenzbereich_id",
});

// Kompetenzbereiche - Leistungsziele Beziehungen (One-to-Many)
db.kompetenzbereich.hasMany(db.leistungsziel, {
  foreignKey: "kompetenzbereich_id",
  as: "leistungsziele",
});
db.leistungsziel.belongsTo(db.kompetenzbereich, {
  foreignKey: "kompetenzbereich_id",
  as: "kompetenzbereich",
});

// Module - Leistungsziele Beziehungen (Many-to-Many, nur für BAND Module)
db.modul.belongsToMany(db.leistungsziel, {
  through: db.modulePerformanceGoal,
  foreignKey: "module_id",
  otherKey: "performance_goal_id",
  as: "leistungsziele",
});
db.leistungsziel.belongsToMany(db.modul, {
  through: db.modulePerformanceGoal,
  foreignKey: "performance_goal_id",
  otherKey: "module_id",
  as: "module",
});

// Direkte ModulePerformanceGoal Beziehungen
db.modulePerformanceGoal.belongsTo(db.modul, { foreignKey: "module_id" });
db.modulePerformanceGoal.belongsTo(db.leistungsziel, {
  foreignKey: "performance_goal_id",
});
db.modul.hasMany(db.modulePerformanceGoal, { foreignKey: "module_id" });
db.leistungsziel.hasMany(db.modulePerformanceGoal, {
  foreignKey: "performance_goal_id",
});

// LB - Module Beziehungen (Many-to-One)
db.lb.belongsTo(db.modul, { foreignKey: "module_id", as: "module" });
db.modul.hasMany(db.lb, { foreignKey: "module_id", as: "lbs" });

db.ROLES = ["bb"]; // Nur Berufsbildner als explizite Rolle

export default db;
