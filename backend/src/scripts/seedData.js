import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ES6 Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../../.env") });

import User from "../models/User.js";
import Competency from "../models/Compentency.js";
import Modul from "../models/Modul.js";
import { connectDB } from "../../config/db.js";

// Sample users - **WICHTIG: Diese sind die Testaccounts für das Login!**
const users = [
  {
    email: "bb@example.com",
    password: "password123",
    firstName: "Max",
    lastName: "Muster",
    isBB: true,
    assignedStudents: [],
    completedModules: [],
  },
  {
    email: "lernender@example.com",
    password: "password123",
    firstName: "Anna",
    lastName: "Schmidt",
    isBB: false,
    lehrjahr: 2,
    berufsbildner: [],
    completedModules: [],
  },
  {
    email: "student1@example.com",
    password: "password123",
    firstName: "Lisa",
    lastName: "Weber",
    isBB: false,
    lehrjahr: 1,
    berufsbildner: [],
    completedModules: [],
  },
  {
    email: "student2@example.com",
    password: "password123",
    firstName: "Tom",
    lastName: "Müller",
    isBB: false,
    lehrjahr: 3,
    berufsbildner: [],
    completedModules: [],
  },
];

// Sample competencies
const competencies = [
  {
    code: "A1.1",
    title: "Projektziele und Parameter abklären",
    description:
      "Sie klären Projektziele und übergeordnete Parameter wie Kosten, Zeit, Qualität, Umfang, Verantwortlichkeiten und Methodik eines ICT-Projektes ab.",
    area: "a",
    taxonomy: "K3",
  },
  {
    code: "B1.1",
    title: "Computer mit Betriebssystem aufsetzen",
    description: "Sie setzen einen Computer mit einem Betriebssystem auf.",
    area: "b",
    taxonomy: "K3",
  },
  {
    code: "C1.1",
    title: "Daten sichten und einordnen",
    description:
      "Sie sichten Daten aus verschiedenen strukturierten und unstrukturierten Datenquellen und ordnen sie hinsichtlich des 4V-Modells ein.",
    area: "c",
    taxonomy: "K4",
  },
  {
    code: "G1.1",
    title: "Anforderungen festhalten",
    description:
      "Sie halten Kundenbedürfnisse in Form von fachlichen und technischen Anforderungen nachvollziehbar und lösungsneutral fest.",
    area: "g",
    taxonomy: "K3",
  },
];

// Sample modules
const modules = [
  {
    code: "M106",
    title: "Datenbanken abfragen, bearbeiten und warten",
    type: "BFS",
    description: "Grundlagen der Datenbankabfrage und -verwaltung mit SQL",
    duration: 4,
    competencies: [],
  },
  {
    code: "M114",
    title: "Codierungs-, Kompressions- und Verschlüsselungsverfahren einsetzen",
    type: "BFS",
    description:
      "Implementierung verschiedener Codierungs- und Verschlüsselungsverfahren",
    duration: 3,
    competencies: [],
  },
  {
    code: "M319",
    title: "Applikationen entwerfen und implementieren",
    type: "BFS",
    description:
      "Entwicklung von Software-Applikationen von der Konzeption bis zur Implementierung",
    duration: 6,
    competencies: [],
  },
];

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Competency.deleteMany({});
    await Modul.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create competencies
    const createdCompetencies = await Competency.insertMany(competencies);
    console.log(`✅ Created ${createdCompetencies.length} competencies`);

    // Create modules
    const createdModules = await Modul.insertMany(modules);
    console.log(`✅ Created ${createdModules.length} modules`);

    // Hash passwords for users
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, 12);
    }

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Set up relationships
    const bb = createdUsers.find((u) => u.isBB);
    const students = createdUsers.filter((u) => !u.isBB);

    // Assign students to BB and vice versa
    bb.assignedStudents = students.map((s) => s._id);
    await bb.save();

    for (let student of students) {
      student.berufsbildner = [bb._id];
      await student.save();
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n🔑 Demo Accounts:");
    console.log("📚 Berufsbildner: bb@example.com / password123");
    console.log("🎓 Lernender: lernender@example.com / password123");
    console.log("👤 Student 1: student1@example.com / password123");
    console.log("👤 Student 2: student2@example.com / password123");
    console.log("\n🌐 Sie können sich jetzt mit diesen Accounts anmelden!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seeding if this file is executed directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  connectDB()
    .then(seedData)
    .then(() => {
      console.log("🎉 Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export default seedData;
