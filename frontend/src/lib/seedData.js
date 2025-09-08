import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Competency from "./src/models/Competency.js";
import Modul from "./src/models/Modul.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

// Sample competencies based on the education plan
const competencies = [
  // Handlungskompetenzbereich A: Begleiten von ICT-Projekten
  {
    code: "A1.1",
    title: "Projektziele und Parameter abklären",
    description:
      "Sie klären Projektziele und übergeordnete Parameter wie Kosten, Zeit, Qualität, Umfang, Verantwortlichkeiten und Methodik eines ICT-Projektes ab.",
    area: "a",
    taxonomy: "K3",
  },
  {
    code: "A1.2",
    title: "Befragungstechniken anwenden",
    description:
      "Sie wenden verschiedene Befragungstechniken und Beobachtungstechniken an (z.B. offene, geschlossene Fragen, Meeting, Workshop, Shadowing).",
    area: "a",
    taxonomy: "K5",
  },
  {
    code: "A2.1",
    title: "Konditionen analysieren",
    description:
      "Sie analysieren die vom Auftraggeber gegebenen Konditionen und Parameter.",
    area: "a",
    taxonomy: "K4",
  },
  // Handlungskompetenzbereich B: Unterstützen und Beraten im ICT-Umfeld
  {
    code: "B1.1",
    title: "Computer mit Betriebssystem aufsetzen",
    description: "Sie setzen einen Computer mit einem Betriebssystem auf.",
    area: "b",
    taxonomy: "K3",
  },
  {
    code: "B2.1",
    title: "Komplexe Anfragen analysieren",
    description:
      "Sie analysieren komplexe Anfragen systematisch (z.B. mit Hilfe eines Fragenkatalogs oder einer Checkliste).",
    area: "b",
    taxonomy: "K4",
  },
  // Handlungskompetenzbereich C: Aufbauen und Pflegen von digitalen Daten
  {
    code: "C1.1",
    title: "Daten sichten und einordnen",
    description:
      "Sie sichten Daten aus verschiedenen strukturierten und unstrukturierten Datenquellen und ordnen sie hinsichtlich des 4V-Modells ein.",
    area: "c",
    taxonomy: "K4",
  },
  {
    code: "C2.1",
    title: "Datenspeicher wählen",
    description:
      "Sie wählen einen geeigneten Datenspeicher (z.B. objektrelational, relational, verteilt/zentral).",
    area: "c",
    taxonomy: "K3",
  },
  // Handlungskompetenzbereich G: Entwickeln von Applikationen
  {
    code: "G1.1",
    title: "Anforderungen festhalten",
    description:
      "Sie halten Kundenbedürfnisse in Form von fachlichen und technischen Anforderungen nachvollziehbar und lösungsneutral fest.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G1.2",
    title: "Nutzermodelle entwickeln",
    description: "Sie entwickeln im Team Nutzermodelle anhand von Personas.",
    area: "g",
    taxonomy: "K5",
  },
  {
    code: "G2.1",
    title: "Gestaltungsentwürfe entwickeln",
    description:
      "Sie entwickeln Gestaltungsentwürfe für Benutzerschnittstellen anhand von geeigneten grafischen Tools.",
    area: "g",
    taxonomy: "K5",
  },
  // Handlungskompetenzbereich H: Ausliefern und Betreiben von Applikationen
  {
    code: "H1.1",
    title: "Abhängigkeiten identifizieren",
    description:
      "Sie identifizieren die Abhängigkeiten zwischen verschiedenen Komponenten.",
    area: "h",
    taxonomy: "K4",
  },
  {
    code: "H2.1",
    title: "Auslieferungsprozess analysieren",
    description:
      "Sie analysieren die Abhängigkeit der Komponenten in Bezug auf den Auslieferungsprozess.",
    area: "h",
    taxonomy: "K4",
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
    competencies: [], // Will be populated with competency IDs
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
    code: "M187",
    title: "ICT-Arbeitsplatz mit Betriebssystem in Betrieb nehmen",
    type: "ÜK",
    description: "Einrichtung und Konfiguration von ICT-Arbeitsplätzen",
    duration: 2,
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
  {
    code: "M322",
    title: "Benutzerschnittstellen entwerfen und implementieren",
    type: "BFS",
    description: "Design und Entwicklung benutzerfreundlicher Schnittstellen",
    duration: 4,
    competencies: [],
  },
  {
    code: "A1",
    title: "Projektinitalisierung",
    type: "BAND",
    description: "Erste Schritte bei der Initialisierung von ICT-Projekten",
    duration: 2,
    competencies: [],
  },
  {
    code: "A4",
    title: "Projektplanung",
    type: "BAND",
    description: "Planung und Strukturierung von ICT-Projekten",
    duration: 3,
    competencies: [],
  },
];

// Sample users
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

const seedData = async () => {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Competency.deleteMany({});
    await Modul.deleteMany({});
    console.log("Cleared existing data");

    // Create competencies
    const createdCompetencies = await Competency.insertMany(competencies);
    console.log(`Created ${createdCompetencies.length} competencies`);

    // Assign competencies to modules (example mapping)
    const competencyMap = createdCompetencies.reduce((map, comp) => {
      map[comp.code] = comp._id;
      return map;
    }, {});

    // Update modules with competency references
    modules[0].competencies = [competencyMap["C1.1"], competencyMap["C2.1"]]; // M106
    modules[1].competencies = [competencyMap["B1.1"]]; // M114
    modules[2].competencies = [competencyMap["B1.1"], competencyMap["B2.1"]]; // M187
    modules[3].competencies = [competencyMap["G1.1"], competencyMap["G1.2"]]; // M319
    modules[4].competencies = [competencyMap["G2.1"]]; // M322
    modules[5].competencies = [competencyMap["A1.1"], competencyMap["A1.2"]]; // A1
    modules[6].competencies = [competencyMap["A2.1"]]; // A4

    const createdModules = await Modul.insertMany(modules);
    console.log(`Created ${createdModules.length} modules`);

    // Hash passwords for users
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, 12);
    }

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Set up relationships
    const bb = createdUsers.find((u) => u.isBB);
    const students = createdUsers.filter((u) => !u.isBB);

    // Assign students to BB and vice versa
    bb.assignedStudents = students.map((s) => s._id);
    await bb.save();

    for (let student of students) {
      student.berufsbildner = [bb._id];

      // Add some completed modules for demo
      const randomModules = createdModules
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1); // 1-4 modules

      student.completedModules = randomModules.map((module) => ({
        module: module._id,
        completedAt: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ), // Random date within last year
      }));

      await student.save();
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📝 Demo Accounts:");
    console.log("Berufsbildner: bb@example.com / password123");
    console.log("Lernender: lernender@example.com / password123");
    console.log("Student 1: student1@example.com / password123");
    console.log("Student 2: student2@example.com / password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(seedData);
}

export default seedData;
