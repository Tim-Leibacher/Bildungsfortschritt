export default (sequelize, DataTypes) => {
  const UserModule = sequelize.define("user_modules", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    durchfuehrung_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'durchfuehrungen',
        key: 'id',
      },
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'enrolled',
    },
    note: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 1.0,
        max: 6.0,
      },
      comment: "Note als Dezimalzahl (z.B. 4.5, 5.2)"
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'durchfuehrung_id'],
        name: 'unique_user_durchfuehrung'
      },
    ],
  });

  return UserModule;
};