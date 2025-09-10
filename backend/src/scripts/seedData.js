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
import Competency from "../models/Competency.js";
import Modul from "../models/Modul.js";
import { connectDB } from "../../config/db.js";

/**
 * ==========================================
 * BENUTZER GEMÄSS ANFORDERUNG
 * ==========================================
 */
const users = [
  // Berufsbildner
  {
    email: "tim.leibacher@band.ch",
    password: "password123",
    firstName: "Tim",
    lastName: "Leibacher",
    isBB: true,
    assignedStudents: [],
    completedModules: [],
  },
  {
    email: "kevin.suter@band.ch",
    password: "password123",
    firstName: "Kevin",
    lastName: "Suter",
    isBB: true,
    assignedStudents: [],
    completedModules: [],
  },
  {
    email: "simon.dietler@band.ch",
    password: "password123",
    firstName: "Simon",
    lastName: "Dietler",
    isBB: true,
    assignedStudents: [],
    completedModules: [],
  },
  // Lernende
  {
    email: "maxim.schuerch@band.ch",
    password: "password123",
    firstName: "Maxim",
    lastName: "Schürch",
    isBB: false,
    lehrjahr: 2,
    berufsbildner: [], // Wird zu Tim zugewiesen
    completedModules: [],
  },
  {
    email: "fabian.engel@band.ch",
    password: "password123",
    firstName: "Fabian",
    lastName: "Engel",
    isBB: false,
    lehrjahr: 1,
    berufsbildner: [], // Wird zu Tim zugewiesen
    completedModules: [],
  },
  {
    email: "rahul.gurung@band.ch",
    password: "password123",
    firstName: "Rahul",
    lastName: "Gurung",
    isBB: false,
    lehrjahr: 1,
    berufsbildner: [], // Wird zu Simon zugewiesen
    completedModules: [],
  },
];

/**
 * ==========================================
 * VOLLSTÄNDIGE HANDLUNGSKOMPETENZEN AUS BILDUNGSPLAN
 * Basierend auf dem Informatiker BiVo 2021 für Applikationsentwicklung
 * ==========================================
 */
const competencies = [
  // ===========================================
  // HANDLUNGSKOMPETENZBEREICH A: Begleiten von ICT-Projekten
  // ===========================================
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
      "Sie wenden verschiedene Befragungstechniken und Beobachtungstechniken an (z.B. offene, geschlossene Fragen, Meeting, Workshop, Shadowing, Simulation der anzustrebenden Lösung in Form eines Zeitsprungs).",
    area: "a",
    taxonomy: "K5",
  },
  {
    code: "A1.3",
    title: "Systemkontext analysieren",
    description:
      "Sie analysieren den Systemkontext, nehmen eine System- und Kontextabgrenzung vor und identifizieren Schnittstellen.",
    area: "a",
    taxonomy: "K4",
  },
  {
    code: "A1.4",
    title: "Lösungen zur Beseitigung von Zielkonflikten erarbeiten",
    description:
      "Sie erarbeiten Lösungen zur Beseitigung möglicher Zielkonflikte.",
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
  {
    code: "A3.1",
    title: "Informationen systematisch suchen",
    description:
      "Sie suchen gezielt und systematisch nach Informationen aus digitalen und analogen Quellen.",
    area: "a",
    taxonomy: "K4",
  },
  {
    code: "A3.2",
    title: "Verlässliche Quellen identifizieren",
    description: "Sie identifizieren verlässliche Quellen.",
    area: "a",
    taxonomy: "K4",
  },
  {
    code: "A3.3",
    title: "Varianten vergleichen und bewerten",
    description:
      "Sie vergleichen mehrere Varianten aus den Ergebnissen und bewerten sie.",
    area: "a",
    taxonomy: "K4",
  },
  {
    code: "A3.4",
    title: "Technische Potenziale und Risiken aufzeigen",
    description:
      "Sie zeigen technische Potenziale und Risiken von Varianten auf.",
    area: "a",
    taxonomy: "K4",
  },
  {
    code: "A3.5",
    title: "Proof of Concept erstellen",
    description: "Sie erstellen ein technisches Proof of Concept (PoC).",
    area: "a",
    taxonomy: "K5",
  },

  // ===========================================
  // HANDLUNGSKOMPETENZBEREICH B: Unterstützen und Beraten im ICT-Umfeld
  // ===========================================
  {
    code: "B1.1",
    title: "Computer mit Betriebssystem aufsetzen",
    description: "Sie setzen einen Computer mit einem Betriebssystem auf.",
    area: "b",
    taxonomy: "K3",
  },
  {
    code: "B1.2",
    title: "Software installieren und konfigurieren",
    description: "Sie installieren und konfigurieren Software-Applikationen.",
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
  {
    code: "B2.2",
    title: "Lösungsansätze entwickeln",
    description:
      "Sie entwickeln verschiedene Lösungsansätze für die identifizierten Probleme.",
    area: "b",
    taxonomy: "K5",
  },

  // ===========================================
  // HANDLUNGSKOMPETENZBEREICH C: Aufbauen und Pflegen von digitalen Daten
  // ===========================================
  {
    code: "C1.1",
    title: "Daten sichten und einordnen",
    description:
      "Sie sichten Daten aus verschiedenen strukturierten und unstrukturierten Datenquellen und ordnen sie hinsichtlich des 4V-Modells ein.",
    area: "c",
    taxonomy: "K4",
  },
  {
    code: "C1.2",
    title: "Datenqualität beurteilen",
    description:
      "Sie beurteilen die Qualität von Daten und identifizieren Datenprobleme.",
    area: "c",
    taxonomy: "K4",
  },
  {
    code: "C1.3",
    title: "Datenmodelle erstellen",
    description: "Sie erstellen Datenmodelle mit geeigneten Notationen.",
    area: "c",
    taxonomy: "K5",
  },
  {
    code: "C1.4",
    title: "Datenstrukturen normalisieren",
    description: "Sie normalisieren Datenstrukturen nach den gängigen Regeln.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C1.5",
    title: "Daten migrieren",
    description: "Sie migrieren Daten zwischen verschiedenen Systemen.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C1.6",
    title: "Daten normalisieren",
    description: "Sie normalisieren Daten für die weitere Verwendung.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C1.7",
    title: "Entitäts-Beziehungsmodelle zeichnen",
    description: "Sie zeichnen ERM nach UML-Standards.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C2.1",
    title: "Datenspeicher wählen",
    description:
      "Sie wählen einen geeigneten Datenspeicher (z.B. objektrelational, relational, verteilt/zentral).",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C2.2",
    title: "Datenbank implementieren",
    description: "Sie implementieren eine Datenbank nach UML-Vorgaben.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C2.3",
    title: "Performance Tests planen",
    description: "Sie planen Performance-Tests für Datenbankabfragen.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C2.4",
    title: "Performance Tests durchführen",
    description:
      "Sie führen Performance-Tests durch und dokumentieren die Ergebnisse.",
    area: "c",
    taxonomy: "K3",
  },
  {
    code: "C2.5",
    title: "Performance Tests auswerten",
    description:
      "Sie werten Performance-Tests aus und leiten Optimierungsmaßnahmen ab.",
    area: "c",
    taxonomy: "K4",
  },
  {
    code: "C2.6",
    title: "Datenbankmigration planen",
    description: "Sie planen und implementieren Datenbankmigrationen.",
    area: "c",
    taxonomy: "K5",
  },
  {
    code: "C2.7",
    title: "Datenbankmigration überprüfen",
    description:
      "Sie überprüfen Datenbankmigrationen auf Vollständigkeit und Korrektheit.",
    area: "c",
    taxonomy: "K4",
  },

  // ===========================================
  // HANDLUNGSKOMPETENZBEREICH G: Entwickeln von Applikationen (Fachrichtung)
  // ===========================================
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
    code: "G1.3",
    title: "Anforderungen überprüfen",
    description:
      "Sie überprüfen fachliche und technische Anforderungen auf Konsistenz, Vollständigkeit und Messbarkeit.",
    area: "g",
    taxonomy: "K4",
  },
  {
    code: "G1.4",
    title: "Anforderungen katalogisieren",
    description:
      "Sie katalogisieren Anforderungen nach branchen- oder projektspezifischen Kriterien und halten diese schriftlich fest.",
    area: "g",
    taxonomy: "K4",
  },
  {
    code: "G1.5",
    title: "Anforderungen mit eindeutiger Bezeichnung versehen",
    description:
      "Sie versehen Anforderungen mit einer eindeutigen Bezeichnung.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G1.6",
    title: "Aufwand schätzen",
    description:
      "Sie schätzen Zeitaufwand, Komplexität, Umfang und Priorisierung von Arbeitspaketen im Team ab.",
    area: "g",
    taxonomy: "K4",
  },
  {
    code: "G1.7",
    title: "Anforderungen validieren",
    description:
      "Sie überprüfen die Anforderungen mit relevanten Stakeholdern auf Validität.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G1.8",
    title: "Anforderungen nachführen",
    description:
      "Sie dokumentieren fachliche und technische Anforderungen laufend nach.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G2.1",
    title: "Gestaltungsentwürfe entwickeln",
    description:
      "Sie entwickeln Gestaltungsentwürfe für Benutzerschnittstellen anhand von geeigneten grafischen Tools.",
    area: "g",
    taxonomy: "K5",
  },
  {
    code: "G2.2",
    title: "Prototypen erstellen",
    description:
      "Sie erstellen interaktive Prototypen zur Validierung von Designkonzepten.",
    area: "g",
    taxonomy: "K5",
  },
  {
    code: "G2.3",
    title: "Usability Tests durchführen",
    description: "Sie führen Usability Tests mit Prototypen durch.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G2.4",
    title: "Designsystem implementieren",
    description: "Sie implementieren ein konsistentes Designsystem.",
    area: "g",
    taxonomy: "K3",
  },
  {
    code: "G2.5",
    title: "Responsives Design umsetzen",
    description: "Sie setzen responsive Designs für verschiedene Endgeräte um.",
    area: "g",
    taxonomy: "K3",
  },

  // ===========================================
  // HANDLUNGSKOMPETENZBEREICH H: Ausliefern und Betreiben von Applikationen
  // ===========================================
  {
    code: "H1.1",
    title: "Abhängigkeiten identifizieren",
    description:
      "Sie identifizieren die Abhängigkeiten zwischen verschiedenen Komponenten.",
    area: "h",
    taxonomy: "K4",
  },
  {
    code: "H1.2",
    title: "Deployment-Strategien planen",
    description:
      "Sie planen geeignete Deployment-Strategien für verschiedene Umgebungen.",
    area: "h",
    taxonomy: "K5",
  },
  {
    code: "H2.1",
    title: "Auslieferungsprozess analysieren",
    description:
      "Sie analysieren die Abhängigkeit der Komponenten in Bezug auf den Auslieferungsprozess.",
    area: "h",
    taxonomy: "K4",
  },
  {
    code: "H2.2",
    title: "CI/CD Pipeline implementieren",
    description:
      "Sie implementieren Continuous Integration und Continuous Deployment Pipelines.",
    area: "h",
    taxonomy: "K5",
  },
];

/**
 * ==========================================
 * VOLLSTÄNDIGE MODULSAMMLUNG - BFS, ÜK und BAND
 * Basierend auf ICT-Modulbaukasten und Bildungskonzept
 * ==========================================
 */
const modules = [
  // ===========================================
  // BFS MODULE (Berufsfachschule)
  // ===========================================
  {
    code: "M106",
    title: "Datenbanken abfragen, bearbeiten und warten",
    type: "BFS",
    description:
      "Grundlagen der Datenbankabfrage und -verwaltung mit SQL. Erstellung, Wartung und Optimierung von Datenbankstrukturen.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit C1.1, C2.1, C2.2
  },
  {
    code: "M114",
    title: "Codierungs-, Kompressions- und Verschlüsselungsverfahren einsetzen",
    type: "BFS",
    description:
      "Implementierung verschiedener Codierungs-, Kompressions- und Verschlüsselungsverfahren für sichere Datenübertragung.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit B1.1, B1.2
  },
  {
    code: "M122",
    title: "Benutzerschnittstellen mit dynamischen Anteilen erweitern",
    type: "BFS",
    description:
      "Entwicklung interaktiver Benutzerschnittstellen mit JavaScript und modernen Frontend-Frameworks.",
    duration: 5,
    competencies: [], // Wird später verknüpft mit G2.1, G2.2
  },
  {
    code: "M133",
    title: "Webserver in Betrieb nehmen",
    type: "BFS",
    description:
      "Installation, Konfiguration und Betrieb von Webservern und deren Sicherheitsaspekte.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit H1.1, H2.1
  },
  {
    code: "M164",
    title: "Datenbanken erstellen und Daten einfügen",
    type: "BFS",
    description:
      "Datenbankdesign, Erstellung von Datenstrukturen und Implementierung von Datenmanipulationsprozessen.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit C1.3, C1.4, C2.2
  },
  {
    code: "M254",
    title: "Geschäftsprozesse beschreiben",
    type: "BFS",
    description:
      "Analyse, Dokumentation und Modellierung von Geschäftsprozessen in Unternehmen.",
    duration: 2,
    competencies: [], // Wird später verknüpft mit A1.1, A1.3
  },
  {
    code: "M319",
    title: "Applikationen entwerfen und implementieren",
    type: "BFS",
    description:
      "Vollständige Entwicklung von Software-Applikationen von der Konzeption bis zur Implementierung mit modernen Entwicklungsmethoden.",
    duration: 6,
    competencies: [], // Wird später verknüpft mit G1.1, G1.2, G1.3
  },
  {
    code: "M320",
    title: "Objektorientiert programmieren",
    type: "BFS",
    description:
      "Grundlagen und fortgeschrittene Konzepte der objektorientierten Programmierung.",
    duration: 5,
    competencies: [], // Wird später verknüpft mit G1.1, G1.4
  },
  {
    code: "M321",
    title: "Verteilte Systeme programmieren",
    type: "BFS",
    description:
      "Entwicklung von Anwendungen für verteilte Systeme und Netzwerkkommunikation.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit H1.1, H1.2
  },
  {
    code: "M322",
    title: "Benutzerschnittstellen entwerfen und implementieren",
    type: "BFS",
    description:
      "Design und Entwicklung benutzerfreundlicher und zugänglicher Benutzerschnittstellen.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit G2.1, G2.4, G2.5
  },
  {
    code: "M323",
    title: "Funktional programmieren",
    type: "BFS",
    description: "Konzepte und Anwendung der funktionalen Programmierung.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit G1.1, G1.4
  },
  {
    code: "M324",
    title: "DevOps Engineering Practices",
    type: "BFS",
    description:
      "Implementierung von DevOps-Praktiken für automatisierte Entwicklungs- und Bereitstellungsprozesse.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit H2.1, H2.2
  },

  // ===========================================
  // ÜK MODULE (Überbetriebliche Kurse)
  // ===========================================
  {
    code: "M187",
    title: "ICT-Arbeitsplatz mit Betriebssystem in Betrieb nehmen",
    type: "ÜK",
    description:
      "Einrichtung und Konfiguration von ICT-Arbeitsplätzen mit verschiedenen Betriebssystemen.",
    duration: 2,
    competencies: [], // Wird später verknüpft mit B1.1, B1.2
  },
  {
    code: "M210",
    title: "Public Cloud für Anwendungen nutzen",
    type: "ÜK",
    description:
      "Nutzung von Cloud-Services für die Entwicklung und den Betrieb von Anwendungen.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit H1.2, H2.2
  },
  {
    code: "M226",
    title: "Software mit agilen Methoden entwickeln",
    type: "ÜK",
    description: "Anwendung agiler Entwicklungsmethoden in Softwareprojekten.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit A1.2, G1.6
  },
  {
    code: "M335",
    title: "Mobile-Applikation realisieren",
    type: "ÜK",
    description: "Entwicklung nativer und hybrider mobiler Anwendungen.",
    duration: 5,
    competencies: [], // Wird später verknüpft mit G2.1, G2.5
  },
  {
    code: "M346",
    title: "Cloud Lösungen konzipieren und realisieren",
    type: "ÜK",
    description: "Konzeption und Implementierung von Cloud-basierten Lösungen.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit H1.1, H1.2, H2.1
  },

  // ===========================================
  // BAND MODULE (Betriebliche Ausbildung)
  // ===========================================
  {
    code: "BAND-A1",
    title: "Projektinitialisierung",
    type: "BAND",
    description:
      "Erste Schritte bei der Initialisierung von ICT-Projekten und Projektplanung.",
    duration: 2,
    competencies: [], // Wird später verknüpft mit A1.1, A1.2
  },
  {
    code: "BAND-A2",
    title: "Anforderungsanalyse",
    type: "BAND",
    description:
      "Systematische Analyse und Dokumentation von Projekt- und Kundenanforderungen.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit A2.1, G1.1, G1.3
  },
  {
    code: "BAND-A3",
    title: "Technologie-Research",
    type: "BAND",
    description: "Recherche und Bewertung von ICT-Technologien und -Lösungen.",
    duration: 2,
    competencies: [], // Wird später verknüpft mit A3.1, A3.2, A3.3, A3.4
  },
  {
    code: "BAND-B1",
    title: "Support und Problemlösung",
    type: "BAND",
    description:
      "Systematische Problemanalyse und Lösungsentwicklung im ICT-Support.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit B2.1, B2.2
  },
  {
    code: "BAND-C1",
    title: "Datenanalyse und -modellierung",
    type: "BAND",
    description:
      "Praktische Anwendung von Datenanalyse- und Modellierungstechniken.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit C1.1, C1.2, C1.3
  },
  {
    code: "BAND-C2",
    title: "Datenbankdesign und -implementation",
    type: "BAND",
    description: "Praktisches Datenbankdesign und Performance-Optimierung.",
    duration: 3,
    competencies: [], // Wird später verknüpft mit C2.1, C2.3, C2.4, C2.5
  },
  {
    code: "BAND-G1",
    title: "Requirements Engineering",
    type: "BAND",
    description:
      "Professionelles Requirements Engineering in realen Projekten.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit G1.4, G1.5, G1.6, G1.7, G1.8
  },
  {
    code: "BAND-G2",
    title: "UX/UI Design und Prototyping",
    type: "BAND",
    description:
      "Praktische Anwendung von UX/UI Design-Prinzipien und Prototyping-Techniken.",
    duration: 5,
    competencies: [], // Wird später verknüpft mit G2.2, G2.3, G2.4
  },
  {
    code: "BAND-H1",
    title: "Deployment und DevOps",
    type: "BAND",
    description:
      "Praktische Implementierung von Deployment-Strategien und DevOps-Prozessen.",
    duration: 4,
    competencies: [], // Wird später verknüpft mit H1.2, H2.2
  },
];

/**
 * ==========================================
 * SEED-FUNKTION MIT BEST PRACTICES
 * ==========================================
 */
const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    console.log("📊 Bildungsplan-basierte Daten werden erstellt...");

    // Verbindung zur Datenbank prüfen
    if (mongoose.connection.readyState !== 1) {
      console.log("📡 Stelle Datenbankverbindung her...");
      await connectDB();
    }

    // Prüfen ob bereits Daten vorhanden sind (Best Practice)
    const existingCompetencies = await Competency.countDocuments();
    const existingModules = await Modul.countDocuments();
    const existingUsers = await User.countDocuments();

    if (existingCompetencies > 0 || existingModules > 0 || existingUsers > 0) {
      console.log(
        "⚠️  Datenbank enthält bereits Daten. Lösche alle vorhandenen Daten..."
      );
      // Sichere Löschung in korrekter Reihenfolge
      await User.deleteMany({});
      await Modul.deleteMany({});
      await Competency.deleteMany({});
      console.log("🗑️  Alle vorhandenen Daten wurden gelöscht");
    }

    // ===========================================
    // 1. HANDLUNGSKOMPETENZEN ERSTELLEN
    // ===========================================
    console.log("📚 Erstelle Handlungskompetenzen...");
    const createdCompetencies = await Competency.insertMany(competencies);
    console.log(
      `✅ ${createdCompetencies.length} Handlungskompetenzen erstellt`
    );

    // Map für einfache Referenzierung erstellen
    const competencyMap = {};
    createdCompetencies.forEach((comp) => {
      competencyMap[comp.code] = comp._id;
    });

    // ===========================================
    // 2. MODULE MIT VERKNÜPFTEN KOMPETENZEN ERSTELLEN
    // ===========================================
    console.log("🏗️  Erstelle Module und verknüpfe Handlungskompetenzen...");

    // Modulverknüpfungen definieren (basierend auf Bildungsplan)
    const moduleCompetencyMappings = {
      // BFS Module
      M106: ["C1.1", "C2.1", "C2.2"],
      M114: ["B1.1", "B1.2"],
      M122: ["G2.1", "G2.2"],
      M133: ["H1.1", "H2.1"],
      M164: ["C1.3", "C1.4", "C2.2"],
      M254: ["A1.1", "A1.3"],
      M319: ["G1.1", "G1.2", "G1.3"],
      M320: ["G1.1", "G1.4"],
      M321: ["H1.1", "H1.2"],
      M322: ["G2.1", "G2.4", "G2.5"],
      M323: ["G1.1", "G1.4"],
      M324: ["H2.1", "H2.2"],

      // ÜK Module
      M187: ["B1.1", "B1.2"],
      M210: ["H1.2", "H2.2"],
      M226: ["A1.2", "G1.6"],
      M335: ["G2.1", "G2.5"],
      M346: ["H1.1", "H1.2", "H2.1"],

      // BAND Module
      "BAND-A1": ["A1.1", "A1.2"],
      "BAND-A2": ["A2.1", "G1.1", "G1.3"],
      "BAND-A3": ["A3.1", "A3.2", "A3.3", "A3.4"],
      "BAND-B1": ["B2.1", "B2.2"],
      "BAND-C1": ["C1.1", "C1.2", "C1.3"],
      "BAND-C2": ["C2.1", "C2.3", "C2.4", "C2.5"],
      "BAND-G1": ["G1.4", "G1.5", "G1.6", "G1.7", "G1.8"],
      "BAND-G2": ["G2.2", "G2.3", "G2.4"],
      "BAND-H1": ["H1.2", "H2.2"],
    };

    // Module mit Kompetenzverknüpfungen erstellen
    const modulesWithCompetencies = modules.map((module) => {
      const competencyCodes = moduleCompetencyMappings[module.code] || [];
      const competencyIds = competencyCodes
        .filter((code) => competencyMap[code]) // Nur vorhandene Kompetenzen
        .map((code) => competencyMap[code]);

      return {
        ...module,
        competencies: competencyIds,
      };
    });

    const createdModules = await Modul.insertMany(modulesWithCompetencies);
    console.log(
      `✅ ${createdModules.length} Module erstellt und mit Handlungskompetenzen verknüpft`
    );

    // ===========================================
    // 3. BENUTZER ERSTELLEN UND ZUWEISUNGEN
    // ===========================================
    console.log("👥 Erstelle Benutzer...");

    // Passwörter hashen (Security Best Practice)
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ ${createdUsers.length} Benutzer erstellt`);

    // ===========================================
    // 4. BEZIEHUNGEN GEMÄSS ANFORDERUNG KONFIGURIEREN
    // ===========================================
    console.log("🔗 Konfiguriere Benutzerbeziehungen...");

    // Berufsbildner finden
    const timLeibacher = createdUsers.find(
      (u) => u.email === "tim.leibacher@band.ch"
    );
    const kevinSuter = createdUsers.find(
      (u) => u.email === "kevin.suter@band.ch"
    );
    const simonDietler = createdUsers.find(
      (u) => u.email === "simon.dietler@band.ch"
    );

    // Lernende finden
    const maximSchuerch = createdUsers.find(
      (u) => u.email === "maxim.schuerch@band.ch"
    );
    const fabianEngel = createdUsers.find(
      (u) => u.email === "fabian.engel@band.ch"
    );
    const rahulGurung = createdUsers.find(
      (u) => u.email === "rahul.gurung@band.ch"
    );

    // Zuweisungen gemäss Anforderung:
    // - Maxim Schürch 2.LJ bei Tim als BB
    // - Fabian Engel 1.LJ bei Tim als BB
    // - Rahul Gurung 1.LJ bei Simon als BB

    // Tim Leibacher: Maxim und Fabian zuweisen
    if (timLeibacher && maximSchuerch && fabianEngel) {
      timLeibacher.assignedStudents = [maximSchuerch._id, fabianEngel._id];
      await timLeibacher.save();

      maximSchuerch.berufsbildner = [timLeibacher._id];
      fabianEngel.berufsbildner = [timLeibacher._id];
      await maximSchuerch.save();
      await fabianEngel.save();

      console.log(
        "✅ Tim Leibacher: Maxim Schürch (2.LJ) und Fabian Engel (1.LJ) zugewiesen"
      );
    }

    // Simon Dietler: Rahul zuweisen
    if (simonDietler && rahulGurung) {
      simonDietler.assignedStudents = [rahulGurung._id];
      await simonDietler.save();

      rahulGurung.berufsbildner = [simonDietler._id];
      await rahulGurung.save();

      console.log("✅ Simon Dietler: Rahul Gurung (1.LJ) zugewiesen");
    }

    // Kevin Suter bleibt erstmal ohne zugewiesene Lernende
    console.log(
      "ℹ️  Kevin Suter: Keine Lernenden zugewiesen (bereit für zukünftige Zuweisungen)"
    );

    // ===========================================
    // 5. DEMO-FORTSCHRITT FÜR LERNENDE
    // ===========================================
    console.log("📈 Erstelle realistischen Lernfortschritt...");

    // Maxim (2. Lehrjahr) - mehr abgeschlossene Module
    if (maximSchuerch) {
      const maximModules = createdModules
        .filter((m) =>
          [
            "M187",
            "M106",
            "M114",
            "M254",
            "BAND-A1",
            "BAND-B1",
            "M122",
          ].includes(m.code)
        )
        .slice(0, 7)
        .map((module) => ({
          module: module._id,
          completedAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ), // Zufällig im letzten Jahr
        }));

      maximSchuerch.completedModules = maximModules;
      await maximSchuerch.save();
      console.log(
        `✅ Maxim Schürch: ${maximModules.length} Module als abgeschlossen markiert`
      );
    }

    // Fabian (1. Lehrjahr) - weniger abgeschlossene Module
    if (fabianEngel) {
      const fabianModules = createdModules
        .filter((m) => ["M187", "M106", "BAND-A1"].includes(m.code))
        .slice(0, 3)
        .map((module) => ({
          module: module._id,
          completedAt: new Date(
            Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
          ), // Zufällig in den letzten 6 Monaten
        }));

      fabianEngel.completedModules = fabianModules;
      await fabianEngel.save();
      console.log(
        `✅ Fabian Engel: ${fabianModules.length} Module als abgeschlossen markiert`
      );
    }

    // Rahul (1. Lehrjahr) - ähnlicher Fortschritt wie Fabian
    if (rahulGurung) {
      const rahulModules = createdModules
        .filter((m) => ["M187", "M254", "BAND-A1"].includes(m.code))
        .slice(0, 3)
        .map((module) => ({
          module: module._id,
          completedAt: new Date(
            Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
          ), // Zufällig in den letzten 6 Monaten
        }));

      rahulGurung.completedModules = rahulModules;
      await rahulGurung.save();
      console.log(
        `✅ Rahul Gurung: ${rahulModules.length} Module als abgeschlossen markiert`
      );
    }

    // ===========================================
    // 6. STATISTIKEN UND ABSCHLUSS
    // ===========================================
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDING ERFOLGREICH ABGESCHLOSSEN!");
    console.log("=".repeat(60));

    console.log("\n📊 ERSTELLTE DATEN:");
    console.log(`   📚 Handlungskompetenzen: ${createdCompetencies.length}`);
    console.log(`   🏗️  Module: ${createdModules.length}`);
    console.log(
      `       - BFS Module: ${
        createdModules.filter((m) => m.type === "BFS").length
      }`
    );
    console.log(
      `       - ÜK Module: ${
        createdModules.filter((m) => m.type === "ÜK").length
      }`
    );
    console.log(
      `       - BAND Module: ${
        createdModules.filter((m) => m.type === "BAND").length
      }`
    );
    console.log(`   👥 Benutzer: ${createdUsers.length}`);
    console.log(
      `       - Berufsbildner: ${createdUsers.filter((u) => u.isBB).length}`
    );
    console.log(
      `       - Lernende: ${createdUsers.filter((u) => !u.isBB).length}`
    );

    console.log("\n🔑 DEMO ACCOUNTS:");
    console.log("   🎓 BERUFSBILDNER:");
    console.log("      📧 tim.leibacher@band.ch / password123");
    console.log(
      "         └─ Zugewiesene Lernende: Maxim Schürch (2.LJ), Fabian Engel (1.LJ)"
    );
    console.log("      📧 kevin.suter@band.ch / password123");
    console.log("         └─ Zugewiesene Lernende: (keine)");
    console.log("      📧 simon.dietler@band.ch / password123");
    console.log("         └─ Zugewiesene Lernende: Rahul Gurung (1.LJ)");

    console.log("\n   👨‍🎓 LERNENDE:");
    console.log(
      "      📧 maxim.schuerch@band.ch / password123 (2. Lehrjahr, BB: Tim Leibacher)"
    );
    console.log(
      "      📧 fabian.engel@band.ch / password123 (1. Lehrjahr, BB: Tim Leibacher)"
    );
    console.log(
      "      📧 rahul.gurung@band.ch / password123 (1. Lehrjahr, BB: Simon Dietler)"
    );

    console.log("\n✨ FEATURES:");
    console.log("   📈 Realistische Lernfortschritte basierend auf Lehrjahr");
    console.log("   🔗 Vollständig verknüpfte Handlungskompetenzen und Module");
    console.log("   📋 Bildungsplan-konforme Datenstruktur");
    console.log("   🔒 Sichere Passwort-Hashes (bcrypt, 12 rounds)");
    console.log("   ⚡ Clean Code und Best Practices");

    console.log("\n🌐 Sie können sich jetzt mit diesen Accounts anmelden!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ FEHLER beim Seeding der Datenbank:", error);
    console.error("Stack Trace:", error.stack);
    throw error; // Re-throw für bessere Fehlerbehandlung
  }
};

/**
 * ==========================================
 * HAUPTFUNKTION FÜR DIREKTE AUSFÜHRUNG
 * ==========================================
 */
const main = async () => {
  try {
    console.log("🚀 Seed-Skript gestartet...");
    await connectDB();
    await seedData();
    console.log("✅ Seeding erfolgreich abgeschlossen!");

    // Datenbankverbindung schließen
    await mongoose.connection.close();
    console.log("📪 Datenbankverbindung geschlossen");

    process.exit(0);
  } catch (error) {
    console.error("❌ Kritischer Fehler:", error);

    // Datenbankverbindung schließen bei Fehler
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

// Automatische Ausführung wenn Datei direkt ausgeführt wird
main();
