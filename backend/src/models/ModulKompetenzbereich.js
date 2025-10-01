export default (sequelize, DataTypes) => {
  const ModulKompetenzbereich = sequelize.define("modul_kompetenzbereich", {
    modul_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "modules",
        key: "id",
      },
    },
    kompetenzbereich_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
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
    tableName: "modul_kompetenzbereiche",
    indexes: [
      {
        unique: true,
        fields: ['modul_id', 'kompetenzbereich_id'],
      },
      {
        fields: ['kompetenzbereich_id'],
      },
    ],
  });

  return ModulKompetenzbereich;
};