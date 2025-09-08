import mongoose from "mongoose";

const compentencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
      enum: ["a", "b", "c", "d", "e", "f", "g", "h"],
    },
    taxonomy: {
      type: String,
      required: true,
      enum: ["K1", "K2", "K3", "K4", "K5", "K6"],
    },
  },
  { timestamps: true }
);

const Competency = mongoose.model("Competency", compentencySchema);

export default Competency;
