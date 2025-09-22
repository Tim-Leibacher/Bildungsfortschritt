export default {
  HOST: "192.168.11.20",
  USER: "postgres",
  PASSWORD: "postgres",
  DB: "bildungsfortschritt",
  dialect: "postgres",
  PORT: 5432,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
