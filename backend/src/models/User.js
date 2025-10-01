export default (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    coach_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    lehrjahr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 4
      },
      comment: "Lehrjahr des Lernenden (1-4), nur für Lernende relevant"
    },
    fachrichtung: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["Applikation", "ICT-Fachmann/frau", "Plattform", "Mediamatik"]],
      },
      comment: "Fachrichtung des Lernenden (z.B. Applikation, ICT-Fachmann/frau, Plattform)"
    },
  });

  return User;
};
