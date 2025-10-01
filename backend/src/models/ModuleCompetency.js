export default (sequelize, DataTypes) => {
  const ModuleCompetency = sequelize.define("module_competencies", {
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
    indexes: [
      {
        unique: true,
        fields: ['module_id', 'competency_id'],
      },
    ],
  });

  return ModuleCompetency;
};