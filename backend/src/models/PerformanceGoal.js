export default (sequelize, DataTypes) => {
  const PerformanceGoal = sequelize.define("performance_goals", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    taxonomy: {
      type: DataTypes.ENUM("K1", "K2", "K3", "K4", "K5", "K6"),
      allowNull: false,
      validate: {
        isIn: [["K1", "K2", "K3", "K4", "K5", "K6"]],
      },
    },
    competency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'competencies',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
  });

  return PerformanceGoal;
};