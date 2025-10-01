export default (sequelize, DataTypes) => {
  const ModuleSchedule = sequelize.define("module_schedule", {
    // Zeitraum-Identifikation
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3
      },
      comment: "Lehrjahr (1, 2 oder 3)"
    },

    // Nur die essentiellen Kalenderwochen-Daten
    start_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 53
      },
      comment: "Erste KW des Zeitraums"
    },
    end_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 53
      },
      comment: "Letzte KW des Zeitraums"
    },


    // Zusätzliche Informationen
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Zusätzliche Bemerkungen oder Besonderheiten"
    }
  }, {
    indexes: [
      {
        fields: ['year']
      },
      {
        fields: ['start_week', 'end_week']
      },
      {
        fields: ['module_context']
      }
    ],
    validate: {
      weekRangeValid() {
        if (this.start_week > this.end_week) {
          throw new Error('start_week muss kleiner oder gleich end_week sein');
        }
      }
    }
  });

  return ModuleSchedule;
};