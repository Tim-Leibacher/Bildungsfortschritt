import mongoose from "mongoose";

const modulSchema = new mongoose.Schema(
  {
    code: {
      // z.B. A1, M106
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BFS", "BAND", "ÜK"],
      required: true,
    },
    description: {
      type: String,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modul",
      },
    ],
    duration: Number, // in Wochen
    competencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Competency",
      },
    ],
  },
  { timestamps: true }
);

const Modul = mongoose.model("Modul", modulSchema);

export default Modul;
