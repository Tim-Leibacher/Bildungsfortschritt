export default (sequelize, DataTypes) => {
  const Leistungsziel = sequelize.define("leistungsziel", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    beschreibung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    taxonomie_stufe: {
      type: DataTypes.ENUM("K1", "K2", "K3", "K4", "K5"),
      allowNull: false,
      validate: {
        isIn: [["K1", "K2", "K3", "K4", "K5"]],
      },
    },
    kompetenzbereich_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "kompetenzbereiche",
        key: "id",
      },
      validate: {
        is: /^[a-h]_\d+$/i,
      },
    },
  }, {
    timestamps: false,
    tableName: "leistungsziele",
  });

  return Leistungsziel;
};