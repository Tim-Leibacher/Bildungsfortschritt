// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Moderne E-Mail-Validierung die Umlaute und internationale Zeichen unterstützt
const emailValidation = {
  type: String,
  required: [true, "E-Mail-Adresse ist erforderlich"],
  unique: true,
  lowercase: true,
  trim: true,
  validate: {
    validator: function (email) {
      // RFC 5322 konforme E-Mail-Validierung mit Unicode-Unterstützung
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      // Alternative: Modernere Unicode-bewusste Regex
      const unicodeEmailRegex =
        /^[\w.!#$%&'*+/=?^`{|}~\u00C0-\u017F-]+@[a-zA-Z0-9\u00C0-\u017F](?:[a-zA-Z0-9\u00C0-\u017F-]{0,61}[a-zA-Z0-9\u00C0-\u017F])?(?:\.[a-zA-Z0-9\u00C0-\u017F](?:[a-zA-Z0-9\u00C0-\u017F-]{0,61}[a-zA-Z0-9\u00C0-\u017F])?)*$/;

      // Verwende die Unicode-bewusste Validierung
      return unicodeEmailRegex.test(email);
    },
    message:
      "Bitte geben Sie eine gültige E-Mail-Adresse ein. Umlaute (ä, ö, ü) sind vor dem @ erlaubt.",
  },
};

const userSchema = new mongoose.Schema(
  {
    email: emailValidation,
    password: {
      type: String,
      required: [true, "Passwort ist erforderlich"],
      minlength: [6, "Passwort muss mindestens 6 Zeichen lang sein"],
    },
    isBB: {
      type: Boolean,
      required: true,
      default: false,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "Vorname darf maximal 50 Zeichen lang sein"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Nachname darf maximal 50 Zeichen lang sein"],
    },
    lehrjahr: {
      type: Number,
      min: [1, "Lehrjahr muss mindestens 1 sein"],
      max: [4, "Lehrjahr darf maximal 4 sein"],
    },
    berufsbildner: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    completedModules: [
      {
        module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Modul",
        },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    // Verbesserte Index-Konfiguration
    indexes: [
      { email: 1 }, // Eindeutiger Index für E-Mail
      { isBB: 1 }, // Index für schnelle BB-Abfragen
      { berufsbildner: 1 }, // Index für BB-Student-Zuordnungen
    ],
  }
);

// Pre-save Middleware für Passwort-Hashing
userSchema.pre("save", async function (next) {
  // Nur hashen wenn Passwort geändert wurde
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instanz-Methode für Passwort-Vergleich
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Statische Methode für sichere User-Suche (ohne Passwort)
userSchema.statics.findSecure = function (query) {
  return this.find(query).select("-password");
};

userSchema.statics.findByIdSecure = function (id) {
  return this.findById(id).select("-password");
};

// Virtuelle Felder
userSchema.virtual("fullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

// JSON-Transformation (entfernt automatisch das Passwort bei JSON-Ausgabe)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
