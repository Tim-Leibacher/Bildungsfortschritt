export default (sequelize, DataTypes) => {
  const LB = sequelize.define("lb", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nummer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Die wievielte LB im Modul ist es (1, 2, 3, etc.)",
    },
    gewichtung: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment: "Gewichtung in Prozent (z.B. 25.50 für 25,5%)",
    },
    beschreibung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "modules",
        key: "id",
      },
    },
  }, {
    timestamps: true,
    tableName: "lbs",
    indexes: [
      {
        unique: true,
        fields: ["module_id", "nummer"],
        name: "unique_lb_nummer_per_module",
      },
    ],
  });

  return LB;
};