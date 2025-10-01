export default (sequelize, DataTypes) => {
  const Kompetenzbereich = sequelize.define("kompetenzbereich", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: "Format: bereich_nummer (z.B. 'a_1', 'h_4')",
      validate: {
        is: /^[a-h]_\d+$/i,
        notEmpty: true
      }
    },
    titel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    beschreibung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: "kompetenzbereiche",
    indexes: [
      {
        fields: ['id'],
        unique: true,
      },
    ],
  });

  return Kompetenzbereich;
};