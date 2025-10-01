export default (sequelize, DataTypes) => {
  const ModulePerformanceGoal = sequelize.define("module_performance_goals", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id',
      },
    },
    performance_goal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'performance_goals',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['module_id', 'performance_goal_id']
      }
    ]
  });

  return ModulePerformanceGoal;
};