/**
 * Seeds BAND modules and assigns them to Leistungsziele
 * BAND = Betriebliche Ausbildung (company-specific modules)
 *
 * Based on Leistungsziele.md mapping table
 */
export const seedBandModules = async (db) => {
  console.log("📚 Creating BAND modules...");

  // BAND-Module erstellen (ID-Bereich 1000+)
  const bandModules = await Promise.all([
    // ========================================
    // A - Projektinitialisierung, Anforderungen, Planung, Agil, Einführung
    // ========================================
    db.modul.create({
      id: 1001,
      name: "Projektinitialisierung",
      beschreibung: "Projektinitialisierung mit Kundengespräch, Projektabgrenzung und Zielsetzung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1002,
      name: "Anforderungen",
      beschreibung: "Anforderungsanalyse und -definition für Softwareprojekte",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1003,
      name: "Planung",
      beschreibung: "Projektplanung mit User Stories, Aufwandschätzung und Priorisierung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1004,
      name: "Zielgruppe",
      beschreibung: "Zielgruppenanalyse mit Personas und Bedürfnisidentifikation",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1005,
      name: "Agil",
      beschreibung: "Agile Methoden und Praktiken (Daily, Story Points, Burndown Chart)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1006,
      name: "Schulung",
      beschreibung: "Schulungsplanung und -durchführung für Endanwender",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1007,
      name: "Abnahme",
      beschreibung: "Projektabnahme mit Kunde vorbereiten und durchführen",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1008,
      name: "Einführung",
      beschreibung: "Projekteinführung und Archivierung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1009,
      name: "PMM",
      beschreibung: "Projektmanagement-Methodik (noch offen)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1010,
      name: "Innovation",
      beschreibung: "Innovative Lösungsansätze entwickeln (2. Lehrjahr)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),

    // ========================================
    // B - Support, Datenschutz, Prozesse
    // ========================================
    db.modul.create({
      id: 1011,
      name: "ÜK187",
      beschreibung: "Überbetriebliche Kurse (noch offen)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1012,
      name: "Support",
      beschreibung: "IT-Support und Kundenbetreuung (noch offen)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1013,
      name: "Datenschutz",
      beschreibung: "Datenschutz und Sicherheitskonzepte",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1014,
      name: "IT-Richtlinien",
      beschreibung: "IT-Richtlinien und Mitarbeiterschulung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1015,
      name: "BPMN",
      beschreibung: "Business Process Modeling Notation (noch offen)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),

    // ========================================
    // C - Datenbanken und Schnittstellen
    // ========================================
    db.modul.create({
      id: 1016,
      name: "DB1",
      beschreibung: "Datenbank-Design und -Modellierung (ERM, Normalisierung)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1017,
      name: "DB2",
      beschreibung: "Datenbank-Implementation, Performance, Migration und Backup",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1018,
      name: "Schnittstelle",
      beschreibung: "API-Design, Datenschutz und Sicherheit an Schnittstellen",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1019,
      name: "PowerBI",
      beschreibung: "Business Intelligence mit PowerBI (noch offen)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),

    // ========================================
    // G - Mockups, Studien, Cybersecurity, Realisierung, Testing
    // ========================================
    db.modul.create({
      id: 1020,
      name: "Mockup",
      beschreibung: "Wireframes, Interaction Design und Prototyping",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1021,
      name: "Cybersecurity",
      beschreibung: "Risikoanalyse und Sicherheitsmassnahmen (CIA-Triade)",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1022,
      name: "Studie",
      beschreibung: "Variantenvergleich und Nutzwertanalyse",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 1023,
      name: "Realisierung",
      beschreibung: "Backend- und Frontend-Entwicklung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1024,
      name: "Code Review",
      beschreibung: "Code-Review, Git und Qualitätssicherung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1025,
      name: "Testing",
      beschreibung: "Testkonzept, Testfälle und Testautomatisierung",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),

    // ========================================
    // H - Deployment und Monitoring
    // ========================================
    db.modul.create({
      id: 1026,
      name: "Docker",
      beschreibung: "Containerisierung mit Docker und Docker Compose",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1027,
      name: "Deployment 1",
      beschreibung: "Deployment-Planung und Provider-Vergleich",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1028,
      name: "Deployment 2",
      beschreibung: "CI/CD Pipeline und Produktiv-Deployment",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 1029,
      name: "Monitoring",
      beschreibung: "Monitoring-Konzept, Einrichtung und Analyse",
      typ: "BAND",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
  ]);

  console.log(`✅ Created ${bandModules.length} BAND modules`);

  // ========================================
  // Erstelle Zuordnungen zwischen Modulen und Leistungszielen
  // ========================================
  console.log("🔗 Creating Module-Leistungsziel assignments...");

  // Helper function to find module by name
  const findModule = (name) => bandModules.find(m => m.name === name);

  // A-Bereich: Projektinitialisierung, Anforderungen, Planung, Agil, Einführung
  const projektinitialisierung = findModule("Projektinitialisierung");
  const anforderungen = findModule("Anforderungen");
  const planung = findModule("Planung");
  const zielgruppe = findModule("Zielgruppe");
  const agil = findModule("Agil");
  const schulung = findModule("Schulung");
  const abnahme = findModule("Abnahme");
  const einfuehrung = findModule("Einführung");
  const pmm = findModule("PMM");
  const innovation = findModule("Innovation");

  // A1: Projektinitialisierung (7 Leistungsziele)
  const a1Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_1' },
    order: [['id', 'ASC']]
  });

  if (a1Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[0].id }, // A1.1
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[1].id }, // A1.2
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[2].id }, // A1.3
      { module_id: anforderungen.id, performance_goal_id: a1Goals[3].id }, // A1.4
      { module_id: anforderungen.id, performance_goal_id: a1Goals[4].id }, // A1.5
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[4].id }, // A1.5 (auch Projektinitialisierung)
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[5].id }, // A1.6
      { module_id: projektinitialisierung.id, performance_goal_id: a1Goals[6].id }, // A1.7
    ]);
  }

  // A2: PMM (3 Leistungsziele - noch offen)
  const a2Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_2' },
    order: [['id', 'ASC']]
  });

  if (a2Goals.length >= 3) {
    await db.modulePerformanceGoal.bulkCreate(
      a2Goals.map(goal => ({ module_id: pmm.id, performance_goal_id: goal.id }))
    );
  }

  // A3: Innovation (5 Leistungsziele - 2. Lehrjahr)
  const a3Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_3' },
    order: [['id', 'ASC']]
  });

  if (a3Goals.length >= 5) {
    await db.modulePerformanceGoal.bulkCreate(
      a3Goals.map(goal => ({ module_id: innovation.id, performance_goal_id: goal.id }))
    );
  }

  // A4: Planung (5 Leistungsziele)
  const a4Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_4' },
    order: [['id', 'ASC']]
  });

  if (a4Goals.length >= 5) {
    await db.modulePerformanceGoal.bulkCreate(
      a4Goals.map(goal => ({ module_id: planung.id, performance_goal_id: goal.id }))
    );
  }

  // A5: Zielgruppe (4 Leistungsziele)
  const a5Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_5' },
    order: [['id', 'ASC']]
  });

  if (a5Goals.length >= 4) {
    await db.modulePerformanceGoal.bulkCreate(
      a5Goals.map(goal => ({ module_id: zielgruppe.id, performance_goal_id: goal.id }))
    );
  }

  // A6: Agil (5 Leistungsziele)
  const a6Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_6' },
    order: [['id', 'ASC']]
  });

  if (a6Goals.length >= 5) {
    await db.modulePerformanceGoal.bulkCreate(
      a6Goals.map(goal => ({ module_id: agil.id, performance_goal_id: goal.id }))
    );
  }

  // A7: Schulung, Abnahme, Einführung (7 Leistungsziele)
  const a7Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'a_7' },
    order: [['id', 'ASC']]
  });

  if (a7Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: zielgruppe.id, performance_goal_id: a7Goals[0].id }, // A7.1 - Zielgruppe/Schulung
      { module_id: schulung.id, performance_goal_id: a7Goals[0].id }, // A7.1 - Schulung
      { module_id: planung.id, performance_goal_id: a7Goals[1].id }, // A7.2 - Planung/Anforderungen
      { module_id: anforderungen.id, performance_goal_id: a7Goals[1].id }, // A7.2 - Anforderungen
      { module_id: abnahme.id, performance_goal_id: a7Goals[2].id }, // A7.3 - Abnahme/Planung
      { module_id: planung.id, performance_goal_id: a7Goals[2].id }, // A7.3 - Planung
      { module_id: schulung.id, performance_goal_id: a7Goals[3].id }, // A7.4 - Schulung
      { module_id: schulung.id, performance_goal_id: a7Goals[4].id }, // A7.5 - Schulung
      { module_id: abnahme.id, performance_goal_id: a7Goals[5].id }, // A7.6 - Abnahme
      { module_id: einfuehrung.id, performance_goal_id: a7Goals[6].id }, // A7.7 - Einführung
    ]);
  }

  // B-Bereich: Support, Datenschutz, Prozesse
  const uek187 = findModule("ÜK187");
  const support = findModule("Support");
  const datenschutz = findModule("Datenschutz");
  const itRichtlinien = findModule("IT-Richtlinien");
  const bpmn = findModule("BPMN");

  // B1: ÜK187 (6 Leistungsziele - noch offen)
  const b1Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'b_1' },
    order: [['id', 'ASC']]
  });

  if (b1Goals.length >= 6) {
    await db.modulePerformanceGoal.bulkCreate(
      b1Goals.map(goal => ({ module_id: uek187.id, performance_goal_id: goal.id }))
    );
  }

  // B2: Support (4 Leistungsziele - noch offen)
  const b2Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'b_2' },
    order: [['id', 'ASC']]
  });

  if (b2Goals.length >= 4) {
    await db.modulePerformanceGoal.bulkCreate(
      b2Goals.map(goal => ({ module_id: support.id, performance_goal_id: goal.id }))
    );
  }

  // B3: Datenschutz (4 Leistungsziele)
  const b3Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'b_3' },
    order: [['id', 'ASC']]
  });

  if (b3Goals.length >= 4) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: datenschutz.id, performance_goal_id: b3Goals[0].id }, // B3.1
      { module_id: datenschutz.id, performance_goal_id: b3Goals[1].id }, // B3.2
      { module_id: datenschutz.id, performance_goal_id: b3Goals[2].id }, // B3.3
      { module_id: itRichtlinien.id, performance_goal_id: b3Goals[3].id }, // B3.4
    ]);
  }

  // B4: BPMN (4 Leistungsziele - noch offen)
  const b4Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'b_4' },
    order: [['id', 'ASC']]
  });

  if (b4Goals.length >= 4) {
    await db.modulePerformanceGoal.bulkCreate(
      b4Goals.map(goal => ({ module_id: bpmn.id, performance_goal_id: goal.id }))
    );
  }

  // C-Bereich: Datenbanken und Schnittstellen
  const db1 = findModule("DB1");
  const db2 = findModule("DB2");
  const schnittstelle = findModule("Schnittstelle");
  const powerbi = findModule("PowerBI");

  // C1: DB1 (7 Leistungsziele)
  const c1Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'c_1' },
    order: [['id', 'ASC']]
  });

  if (c1Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate(
      c1Goals.map(goal => ({ module_id: db1.id, performance_goal_id: goal.id }))
    );
  }

  // C2: DB2 (7 Leistungsziele)
  const c2Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'c_2' },
    order: [['id', 'ASC']]
  });

  if (c2Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate(
      c2Goals.map(goal => ({ module_id: db2.id, performance_goal_id: goal.id }))
    );
  }

  // C3: Schnittstelle (8 Leistungsziele)
  const c3Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'c_3' },
    order: [['id', 'ASC']]
  });

  if (c3Goals.length >= 8) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[0].id }, // C3.1
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[1].id }, // C3.2
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[2].id }, // C3.3
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[3].id }, // C3.4
      { module_id: db2.id, performance_goal_id: c3Goals[4].id }, // C3.5 - DB2
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[5].id }, // C3.6
      { module_id: db2.id, performance_goal_id: c3Goals[6].id }, // C3.7 - DB2
      { module_id: schnittstelle.id, performance_goal_id: c3Goals[7].id }, // C3.8
    ]);
  }

  // C4: PowerBI (6 Leistungsziele - noch offen)
  const c4Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'c_4' },
    order: [['id', 'ASC']]
  });

  if (c4Goals.length >= 6) {
    await db.modulePerformanceGoal.bulkCreate(
      c4Goals.map(goal => ({ module_id: powerbi.id, performance_goal_id: goal.id }))
    );
  }

  // G-Bereich: Mockups, Studien, Cybersecurity, Realisierung, Testing
  const mockup = findModule("Mockup");
  const cybersecurity = findModule("Cybersecurity");
  const studie = findModule("Studie");
  const realisierung = findModule("Realisierung");
  const codeReview = findModule("Code Review");
  const testing = findModule("Testing");

  // G1: Anforderungen (8 Leistungsziele)
  const g1Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_1' },
    order: [['id', 'ASC']]
  });

  if (g1Goals.length >= 8) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: planung.id, performance_goal_id: g1Goals[0].id }, // G1.1 - Planung
      { module_id: zielgruppe.id, performance_goal_id: g1Goals[1].id }, // G1.2 - Zielgruppe
      { module_id: anforderungen.id, performance_goal_id: g1Goals[2].id }, // G1.3 - Anforderungen
      { module_id: anforderungen.id, performance_goal_id: g1Goals[3].id }, // G1.4 - Anforderungen
      { module_id: anforderungen.id, performance_goal_id: g1Goals[4].id }, // G1.5 - Anforderungen
      { module_id: anforderungen.id, performance_goal_id: g1Goals[5].id }, // G1.6 - Anforderungen
      { module_id: anforderungen.id, performance_goal_id: g1Goals[6].id }, // G1.7 - Anforderungen
      { module_id: anforderungen.id, performance_goal_id: g1Goals[7].id }, // G1.8 - Anforderungen
    ]);
  }

  // G2: Mockup (6 Leistungsziele)
  const g2Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_2' },
    order: [['id', 'ASC']]
  });

  if (g2Goals.length >= 6) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: mockup.id, performance_goal_id: g2Goals[0].id }, // G2.1
      { module_id: mockup.id, performance_goal_id: g2Goals[1].id }, // G2.2
      { module_id: mockup.id, performance_goal_id: g2Goals[2].id }, // G2.3
      { module_id: mockup.id, performance_goal_id: g2Goals[3].id }, // G2.4
      { module_id: mockup.id, performance_goal_id: g2Goals[4].id }, // G2.5
      { module_id: schnittstelle.id, performance_goal_id: g2Goals[5].id }, // G2.6 - Schnittstelle
    ]);
  }

  // G3: Cybersecurity (5 Leistungsziele)
  const g3Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_3' },
    order: [['id', 'ASC']]
  });

  if (g3Goals.length >= 5) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: cybersecurity.id, performance_goal_id: g3Goals[0].id }, // G3.1
      { module_id: cybersecurity.id, performance_goal_id: g3Goals[1].id }, // G3.2
      { module_id: cybersecurity.id, performance_goal_id: g3Goals[2].id }, // G3.3
      { module_id: cybersecurity.id, performance_goal_id: g3Goals[3].id }, // G3.4
      { module_id: schnittstelle.id, performance_goal_id: g3Goals[4].id }, // G3.5 - Schnittstelle
    ]);
  }

  // G4: Studie (5 Leistungsziele)
  const g4Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_4' },
    order: [['id', 'ASC']]
  });

  if (g4Goals.length >= 5) {
    await db.modulePerformanceGoal.bulkCreate(
      g4Goals.map(goal => ({ module_id: studie.id, performance_goal_id: goal.id }))
    );
  }

  // G5: Realisierung (7 Leistungsziele)
  const g5Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_5' },
    order: [['id', 'ASC']]
  });

  if (g5Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: realisierung.id, performance_goal_id: g5Goals[0].id }, // G5.1
      { module_id: realisierung.id, performance_goal_id: g5Goals[1].id }, // G5.2
      { module_id: realisierung.id, performance_goal_id: g5Goals[2].id }, // G5.3
      { module_id: codeReview.id, performance_goal_id: g5Goals[3].id }, // G5.4 - Code Review
      { module_id: codeReview.id, performance_goal_id: g5Goals[4].id }, // G5.5 - Code Review
      { module_id: codeReview.id, performance_goal_id: g5Goals[5].id }, // G5.6 - Code Review
      { module_id: codeReview.id, performance_goal_id: g5Goals[6].id }, // G5.7 - Code Review
    ]);
  }

  // G6: Testing (9 Leistungsziele)
  const g6Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'g_6' },
    order: [['id', 'ASC']]
  });

  if (g6Goals.length >= 9) {
    await db.modulePerformanceGoal.bulkCreate(
      g6Goals.map(goal => ({ module_id: testing.id, performance_goal_id: goal.id }))
    );
  }

  // H-Bereich: Deployment und Monitoring
  const docker = findModule("Docker");
  const deployment1 = findModule("Deployment 1");
  const deployment2 = findModule("Deployment 2");
  const monitoring = findModule("Monitoring");

  // H1: Docker (6 Leistungsziele)
  const h1Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'h_1' },
    order: [['id', 'ASC']]
  });

  if (h1Goals.length >= 6) {
    await db.modulePerformanceGoal.bulkCreate([
      { module_id: docker.id, performance_goal_id: h1Goals[0].id }, // H1.1
      { module_id: docker.id, performance_goal_id: h1Goals[1].id }, // H1.2
      { module_id: deployment1.id, performance_goal_id: h1Goals[2].id }, // H1.3 - Deployment 1
      { module_id: deployment1.id, performance_goal_id: h1Goals[3].id }, // H1.4 - Deployment 1
      { module_id: deployment1.id, performance_goal_id: h1Goals[4].id }, // H1.5 - Deployment 1
      { module_id: deployment1.id, performance_goal_id: h1Goals[5].id }, // H1.6 - Deployment 1
    ]);
  }

  // H2: Deployment 1 (4 Leistungsziele)
  const h2Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'h_2' },
    order: [['id', 'ASC']]
  });

  if (h2Goals.length >= 4) {
    await db.modulePerformanceGoal.bulkCreate(
      h2Goals.map(goal => ({ module_id: deployment1.id, performance_goal_id: goal.id }))
    );
  }

  // H3: Deployment 2 (7 Leistungsziele)
  const h3Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'h_3' },
    order: [['id', 'ASC']]
  });

  if (h3Goals.length >= 7) {
    await db.modulePerformanceGoal.bulkCreate(
      h3Goals.map(goal => ({ module_id: deployment2.id, performance_goal_id: goal.id }))
    );
  }

  // H4: Monitoring (6 Leistungsziele)
  const h4Goals = await db.leistungsziel.findAll({
    where: { kompetenzbereich_id: 'h_4' },
    order: [['id', 'ASC']]
  });

  if (h4Goals.length >= 6) {
    await db.modulePerformanceGoal.bulkCreate(
      h4Goals.map(goal => ({ module_id: monitoring.id, performance_goal_id: goal.id }))
    );
  }

  console.log(`✅ Created module-leistungsziel assignments for all BAND modules`);

  return bandModules;
};
