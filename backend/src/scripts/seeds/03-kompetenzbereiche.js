/**
 * Seeds Kompetenzbereiche - basierend auf BAND Leistungsziele
 */
export const seedKompetenzbereiche = async (db) => {
  console.log("🎯 Creating Kompetenzbereiche...");

  const kompetenzbereiche = await Promise.all([
    // ========================================
    // Bereich A: Projektinitialisierung, Anforderungen, Planung, Agil, Einführung
    // ========================================
    db.kompetenzbereich.create({
      id: "a_1",
      titel: "Projektinitialisierung",
      beschreibung: "Kundengespräche führen, Projektabgrenzung und Systemkontext dokumentieren, Projektziele definieren.",
    }),
    db.kompetenzbereich.create({
      id: "a_2",
      titel: "PMM (Projektmanagement-Methodik)",
      beschreibung: "Projektmanagement-Methoden und -Werkzeuge anwenden.",
    }),
    db.kompetenzbereich.create({
      id: "a_3",
      titel: "Innovation",
      beschreibung: "Innovative Lösungsansätze entwickeln und umsetzen.",
    }),
    db.kompetenzbereich.create({
      id: "a_4",
      titel: "Planung",
      beschreibung: "User Stories definieren, Aufwände schätzen, Abhängigkeiten und Prioritäten festlegen.",
    }),
    db.kompetenzbereich.create({
      id: "a_5",
      titel: "Zielgruppe",
      beschreibung: "Zielgruppe identifizieren, Bedürfnisse aufzeigen, Personas entwickeln.",
    }),
    db.kompetenzbereich.create({
      id: "a_6",
      titel: "Agil",
      beschreibung: "Agile Methoden anwenden (Daily, Story Points, Sprint Review, Burndown Chart).",
    }),
    db.kompetenzbereich.create({
      id: "a_7",
      titel: "Abnahme, Schulung und Einführung",
      beschreibung: "Abnahmekriterien festlegen, Schulung planen und durchführen, Projekt archivieren.",
    }),

    // ========================================
    // Bereich B: Support, Datenschutz, Prozesse
    // ========================================
    db.kompetenzbereich.create({
      id: "b_1",
      titel: "ÜK187",
      beschreibung: "Überbetriebliche Kurse und spezifische Fachinhalte.",
    }),
    db.kompetenzbereich.create({
      id: "b_2",
      titel: "Support",
      beschreibung: "IT-Support und Kundenbetreuung sicherstellen.",
    }),
    db.kompetenzbereich.create({
      id: "b_3",
      titel: "Datenschutz",
      beschreibung: "Datenschutz gewährleisten, Kunden schulen, Schutzmassnahmen erarbeiten.",
    }),
    db.kompetenzbereich.create({
      id: "b_4",
      titel: "BPMN",
      beschreibung: "Business Process Model and Notation anwenden.",
    }),

    // ========================================
    // Bereich C: Datenbanken und Schnittstellen
    // ========================================
    db.kompetenzbereich.create({
      id: "c_1",
      titel: "DB1 - Datenbank-Design",
      beschreibung: "4V-Modell analysieren, ERM nach UML zeichnen, Normalisierung durchführen.",
    }),
    db.kompetenzbereich.create({
      id: "c_2",
      titel: "DB2 - Datenbank-Implementation",
      beschreibung: "Datenbank umsetzen, Performance Tests durchführen, Migration und Backup.",
    }),
    db.kompetenzbereich.create({
      id: "c_3",
      titel: "Schnittstelle",
      beschreibung: "Schützenswerte Daten identifizieren, Datenschutzkonzept und Rollenkonzept erstellen.",
    }),
    db.kompetenzbereich.create({
      id: "c_4",
      titel: "PowerBI",
      beschreibung: "Business Intelligence und Datenvisualisierung mit PowerBI.",
    }),

    // ========================================
    // Bereich G: Mockups, Studien, Cybersecurity, Realisierung, Testing
    // ========================================
    db.kompetenzbereich.create({
      id: "g_1",
      titel: "Anforderungen",
      beschreibung: "User Stories definieren, Personas erstellen, Anforderungen katalogisieren und prüfen.",
    }),
    db.kompetenzbereich.create({
      id: "g_2",
      titel: "Mockup",
      beschreibung: "Wireframes, Interaction Design, Prototyping und Kundengespräche.",
    }),
    db.kompetenzbereich.create({
      id: "g_3",
      titel: "Cybersecurity",
      beschreibung: "Risikoanalyse (CIA-Triade), Informationsbeschaffung, Sicherheitsmassnahmen.",
    }),
    db.kompetenzbereich.create({
      id: "g_4",
      titel: "Studie",
      beschreibung: "Variantenvergleich, Nutzwertanalyse, SWOT-Analyse, Kundengespräche.",
    }),
    db.kompetenzbereich.create({
      id: "g_5",
      titel: "Realisierung",
      beschreibung: "Umgebung einrichten, Backend & Frontend entwickeln, Code-Review.",
    }),
    db.kompetenzbereich.create({
      id: "g_6",
      titel: "Testing",
      beschreibung: "Testkonzept, Testfälle, Testumgebung, Automatisierung, Protokollierung.",
    }),

    // ========================================
    // Bereich H: Deployment und Monitoring
    // ========================================
    db.kompetenzbereich.create({
      id: "h_1",
      titel: "Docker",
      beschreibung: "Docker-Compose File erstellen, Variantenvergleich nach Anforderungen.",
    }),
    db.kompetenzbereich.create({
      id: "h_2",
      titel: "Deployment 1",
      beschreibung: "Provider-Vergleich, Variante wählen, Migrationsreihenfolge planen.",
    }),
    db.kompetenzbereich.create({
      id: "h_3",
      titel: "Deployment 2",
      beschreibung: "Pipeline einrichten, Deployment durchführen, Versionieren, Abnahme.",
    }),
    db.kompetenzbereich.create({
      id: "h_4",
      titel: "Monitoring",
      beschreibung: "Monitoring-Konzept entwickeln, einrichten, analysieren, Verbesserungen.",
    }),
  ]);

  console.log(`✅ Created ${kompetenzbereiche.length} Kompetenzbereiche`);

  return kompetenzbereiche;
};
