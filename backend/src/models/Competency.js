export default (sequelize, DataTypes) => {
  const Competency = sequelize.define("competencies", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    area: {
      type: DataTypes.ENUM("a", "b", "c", "d", "e", "f", "g", "h"),
      allowNull: false,
      validate: {
        isIn: [["a", "b", "c", "d", "e", "f", "g", "h"]],
      },
    },
    areaTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return Competency;
};
