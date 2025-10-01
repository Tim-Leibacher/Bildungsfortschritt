export default (sequelize, DataTypes) => {
  const Durchfuehrung = sequelize.define("durchfuehrung", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modul_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "modules",
        key: "id",
      },
    },
    bezeichnung: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "z.B. 'Modul 320 Herbst 2024', 'M-346 Klasse A'"
    },
    start_datum: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_datum: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterStartDate(value) {
          if (this.start_datum && value <= this.start_datum) {
            throw new Error('End-Datum muss nach Start-Datum liegen');
          }
        }
      }
    },
    notizen: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: "durchfuehrungen",
    indexes: [
      {
        fields: ['modul_id'],
      },
      {
        fields: ['start_datum', 'end_datum'],
      },
    ],
    validate: {
      dateRangeValid() {
        if (this.start_datum && this.end_datum && this.start_datum >= this.end_datum) {
          throw new Error('Start-Datum muss vor End-Datum liegen');
        }
      }
    }
  });

  return Durchfuehrung;
};