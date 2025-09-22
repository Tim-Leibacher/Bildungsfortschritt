// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Mail ist erforderlich"],
    },
    password: {
      type: String,
      required: [true, "Passwort ist erforderlich"],
      minlength: [6, "Passwort muss mindestens 6 Zeichen lang sein"],
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    lehrjahr: {
      type: Number,
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
  },
  {
    timestamps: true,
    // Verbesserte Index-Konfiguration
    indexes: [
      { email: 1 }, // Eindeutiger Index für E-Mail
      { role: 1 }, // Index für schnelle BB-Abfragen
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
