export default (sequelize, DataTypes) => {
  const Modul = sequelize.define("module", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: "Modulnummer als ID (z.B. 320, 346, etc.)",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    beschreibung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    typ: {
      type: DataTypes.ENUM("BFS", "ÜK", "BAND"),
      allowNull: false,
      validate: {
        isIn: [["BFS", "ÜK", "BAND"]],
      },
      comment: "Typ des Moduls: BFS (Berufsfachschule), ÜK (Überbetriebliche Kurse), BAND (Betriebliche Ausbildung)",
    },
    fachrichtungen: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["Appli"],
      comment: "Array von Fachrichtungen: ['Appli', 'Plattform', 'ICT', 'Medi', 'edb']",
      validate: {
        isValidFachrichtungen(value) {
          const validFachrichtungen = ["Appli", "Plattform", "ICT", "Medi", "edb", "Mediamatik", "EDB"];
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Fachrichtungen muss ein Array mit mindestens einem Element sein");
          }
          for (const fach of value) {
            if (!validFachrichtungen.includes(fach)) {
              throw new Error(`Ungültige Fachrichtung: ${fach}`);
            }
          }
        },
      },
    },
    wahlmodul: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lehrjahr: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4,
      },
      comment: "Lehrjahr in dem das Modul durchgeführt wird (1-4)",
    },
  }, {
    timestamps: true,
  });

  return Modul;
};
