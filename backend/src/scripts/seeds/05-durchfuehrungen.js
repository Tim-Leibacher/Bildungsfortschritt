/**
 * Seeds Durchführungen - Konkrete Modulinstanzen mit Terminen
 */
export const seedDurchfuehrungen = async (db) => {
  console.log("📅 Creating Durchführungen...");

  const durchfuehrungen = await Promise.all([
    // ========================================
    // BFS Module - 1. Lehrjahr (2024)
    // ========================================
    db.durchfuehrung.create({
      modul_id: 162,
      start_datum: "2024-08-19",
      end_datum: "2024-12-13",
      bezeichnung: "162: Daten analysieren und modellieren - Klasse 1A",
      max_teilnehmer: 22,
    }),
    db.durchfuehrung.create({
      modul_id: 162,
      start_datum: "2024-08-19",
      end_datum: "2024-12-13",
      bezeichnung: "162: Daten analysieren und modellieren - Klasse 1B",
      max_teilnehmer: 24,
    }),
    db.durchfuehrung.create({
      modul_id: 431,
      start_datum: "2024-08-19",
      end_datum: "2024-12-13",
      bezeichnung: "431: Aufträge im IT-Umfeld - ICT Klasse",
      max_teilnehmer: 18,
    }),

    // ========================================
    // BFS Module - 2. Lehrjahr (2023-2024)
    // ========================================
    db.durchfuehrung.create({
      modul_id: 164,
      start_datum: "2024-02-19",
      end_datum: "2024-06-28",
      bezeichnung: "164: Datenbanken erstellen - Frühjahr 2024",
      max_teilnehmer: 20,
    }),
    db.durchfuehrung.create({
      modul_id: 254,
      start_datum: "2024-02-19",
      end_datum: "2024-06-28",
      bezeichnung: "254: Geschäftsprozesse beschreiben - ICT",
      max_teilnehmer: 18,
    }),

    // ========================================
    // BFS Module - 3. Lehrjahr (2023)
    // ========================================
    db.durchfuehrung.create({
      modul_id: 165,
      start_datum: "2023-08-21",
      end_datum: "2023-12-22",
      bezeichnung: "165: NoSQL-Datenbanken - Herbst 2023",
      max_teilnehmer: 18,
    }),
    db.durchfuehrung.create({
      modul_id: 183,
      start_datum: "2023-08-21",
      end_datum: "2023-12-22",
      bezeichnung: "183: Applikationssicherheit implementieren",
      max_teilnehmer: 22,
    }),
    db.durchfuehrung.create({
      modul_id: 293,
      start_datum: "2023-08-21",
      end_datum: "2023-12-22",
      bezeichnung: "293: Web-Frontends mit Frameworks - React/Vue",
      max_teilnehmer: 20,
    }),
    db.durchfuehrung.create({
      modul_id: 294,
      start_datum: "2024-02-19",
      end_datum: "2024-06-28",
      bezeichnung: "294: Frontend interaktive Webapplikation",
      max_teilnehmer: 20,
    }),
    db.durchfuehrung.create({
      modul_id: 295,
      start_datum: "2024-02-19",
      end_datum: "2024-06-28",
      bezeichnung: "295: Backend für Webapplikationen - Node.js",
      max_teilnehmer: 18,
    }),

    // ========================================
    // BFS Module - 4. Lehrjahr (2022-2023)
    // ========================================
    db.durchfuehrung.create({
      modul_id: 321,
      start_datum: "2023-02-20",
      end_datum: "2023-06-30",
      bezeichnung: "321: Verteilte Systeme programmieren",
      max_teilnehmer: 16,
    }),
    db.durchfuehrung.create({
      modul_id: 322,
      start_datum: "2023-02-20",
      end_datum: "2023-06-30",
      bezeichnung: "322: Benutzerschnittstellen implementieren",
      max_teilnehmer: 18,
    }),
    db.durchfuehrung.create({
      modul_id: 323,
      start_datum: "2022-08-22",
      end_datum: "2022-12-23",
      bezeichnung: "323: Funktionale Programmierung - Scala/Haskell",
      max_teilnehmer: 14,
    }),
    db.durchfuehrung.create({
      modul_id: 346,
      start_datum: "2023-02-20",
      end_datum: "2023-06-30",
      bezeichnung: "346: Cloud-Lösungen konzipieren - AWS/Azure",
      max_teilnehmer: 20,
    }),

    // ========================================
    // ÜK Module - Verschiedene Zeiträume
    // ========================================
    db.durchfuehrung.create({
      modul_id: 187,
      start_datum: "2024-09-02",
      end_datum: "2024-09-06",
      bezeichnung: "187: ICT-Arbeitsplatz - ÜK Woche 1",
      max_teilnehmer: 16,
    }),

    // ========================================
    // Wahlpflichtmodule
    // ========================================
    db.durchfuehrung.create({
      modul_id: 347,
      start_datum: "2023-02-20",
      end_datum: "2023-06-30",
      bezeichnung: "347: Dienst mit Webschnittstelle - Advanced API",
      max_teilnehmer: 16,
    }),

    // ========================================
    // Zusätzliche Durchführungen für kommende Semester
    // ========================================
    db.durchfuehrung.create({
      modul_id: 162,
      start_datum: "2025-02-17",
      end_datum: "2025-06-27",
      bezeichnung: "162: Daten analysieren - Frühjahr 2025",
      max_teilnehmer: 24,
    }),
    db.durchfuehrung.create({
      modul_id: 164,
      start_datum: "2025-08-18",
      end_datum: "2025-12-19",
      bezeichnung: "164: Datenbanken erstellen - Herbst 2025",
      max_teilnehmer: 22,
    }),
  ]);

  console.log(`✅ Created ${durchfuehrungen.length} Durchführungen`);

  return durchfuehrungen;
};