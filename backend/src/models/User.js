// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isBB: { type: Boolean, required: true },
    firstName: { type: String },
    lastName: { type: String },
    lehrjahr: { type: Number },
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
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
