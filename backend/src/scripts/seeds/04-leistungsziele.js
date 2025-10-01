/**
 * Seeds Leistungsziele - basierend auf BAND Leistungsziele.md
 */
export const seedLeistungsziele = async (db) => {
  console.log("🎯 Creating Leistungsziele...");

  const leistungsziele = await Promise.all([
    // ========================================
    // Bereich A: Projektinitialisierung, Anforderungen, Planung, Agil, Einführung
    // ========================================

    // A1: Projektinitialisierung (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Notizen aus mündlichem Kundengespräch (Fallbeispiel) erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Kundenbedürfnisse aus Gespräch identifizieren und dokumentieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Projektabgrenzung und Systemkontext dokumentieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Projektziele definieren, überprüfen, Feedback geben",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Projektziele überprüfen, Feedback geben",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "a_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Checkliste für Projektziele und Anforderungen definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_1",
    }),

    // A2: PMM (3 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "Projektmanagement-Methodik anwenden (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Projektmanagement-Tools nutzen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Projektdokumentation erstellen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_2",
    }),

    // A3: Innovation (5 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "Innovative Lösungsansätze entwickeln (2. Lehrjahr)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "a_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Kreativitätstechniken anwenden (2. Lehrjahr)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Innovationskonzepte präsentieren (2. Lehrjahr)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Feedback zu Innovationen einholen (2. Lehrjahr)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Innovationsansätze iterativ verbessern (2. Lehrjahr)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "a_3",
    }),

    // A4: Planung (5 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Anforderungen in User Stories/Aktivitäten unterteilen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Aufwand für User Stories/Aktivitäten festlegen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_4",
    }),
    db.leistungsziel.create({
      beschreibung: "User Stories/Aktivitäten schätzen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Abhängigkeiten zwischen User Stories/Aktivitäten festlegen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_4",
    }),
    db.leistungsziel.create({
      beschreibung: "User Stories nach Priorität ordnen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_4",
    }),

    // A5: Zielgruppe (4 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Zielgruppe identifizieren (Persona)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Bedürfnisse der Zielgruppe aufzeigen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Zielgruppe visualisieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Lösung präsentieren (Elevator Pitch)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_5",
    }),

    // A6: Agil (5 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Task-Status mitteilen (z. B. Daily)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Tasks bewerten (z. B. Story Points)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Massnahmen für Tasks festhalten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Fortschritt dokumentieren (z. B. Burndown Chart)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Rückblick (Sprint Review / Bericht ans Management)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "a_6",
    }),

    // A7: Abnahme, Schulung, Einführung (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Zielgruppe für Schulung analysieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Abnahmekriterien festlegen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Abnahme mit Kunde vorbereiten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Schulung planen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Schulung vorbereiten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Abnahme mit Kunde durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),
    db.leistungsziel.create({
      beschreibung: "Projekt archivieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "a_7",
    }),

    // ========================================
    // Bereich B: Support, Datenschutz, Prozesse
    // ========================================

    // B1: ÜK187 (6 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 1 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 2 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 3 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 4 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 5 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ÜK187 Inhalt 6 (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_1",
    }),

    // B2: Support (4 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "Support-Anfragen bearbeiten (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Support-Dokumentation erstellen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Kundenbetreuung durchführen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Support-Prozesse optimieren (noch offen)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "b_2",
    }),

    // B3: Datenschutz (4 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Kundengespräch über Datenschutz (System, Netzwerk, Software)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Kunden über Gefahren im Netz schulen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Vorschlag Schutzmassnahmen erarbeiten",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "b_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Mitarbeiterschulung zu IT-Richtlinien durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_3",
    }),

    // B4: BPMN (4 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "BPMN-Diagramme erstellen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Geschäftsprozesse modellieren (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Prozesse analysieren und optimieren (noch offen)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "b_4",
    }),
    db.leistungsziel.create({
      beschreibung: "BPMN-Notation anwenden (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "b_4",
    }),

    // ========================================
    // Bereich C: Datenbanken und Schnittstellen
    // ========================================

    // C1: DB1 (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "4V-Modell (Volume, Variety, Velocity, Veracity) analysieren",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ERM nach UML zeichnen (Entities)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ERM nach UML zeichnen (Relationships)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ERM nach UML zeichnen (Attributes)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Normalisierung durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "ERM verfeinern und validieren",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenmodell dokumentieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_1",
    }),

    // C2: DB2 (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Datenbank nach UML umsetzen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Performance Tests planen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Performance Tests durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Performance Tests auswerten",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenbankmigration planen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenbankmigration durchführen und überprüfen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Migration von anderen überprüfen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_2",
    }),

    // C3: Schnittstelle (8 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Schützenswerte Daten identifizieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenschutzkonzept erstellen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Schutzmechanismen definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Rollenkonzept erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Backup & Restore durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Backup verschlüsseln",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Datensicherheit überprüfen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Datensicherheit konzipieren",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_3",
    }),

    // C4: PowerBI (6 Leistungsziele - Platzhalter)
    db.leistungsziel.create({
      beschreibung: "PowerBI Dashboards erstellen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Daten visualisieren (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenquellen anbinden (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Reports erstellen (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Datenanalyse durchführen (noch offen)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "c_4",
    }),
    db.leistungsziel.create({
      beschreibung: "PowerBI-Projekte dokumentieren (noch offen)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "c_4",
    }),

    // ========================================
    // Bereich G: Mockups, Studien, Cybersecurity, Realisierung, Testing
    // ========================================

    // G1: Anforderungen (8 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "User Stories definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Personas definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen katalogisieren (Teil 1)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen katalogisieren (Teil 2)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen katalogisieren (Teil 3)",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen schätzen, priorisieren, Peer Review",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen mit Kunden prüfen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Änderungswünsche umsetzen und mitteilen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_1",
    }),

    // G2: Mockup (6 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Wireframes erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Interaction Design entwickeln",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Prototyp erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Prototyp mit Kunde besprechen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Feedback einarbeiten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Umsetzung vom Prototyp in Realität",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_2",
    }),

    // G3: Cybersecurity (5 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Risikoanalyse durchführen (CIA-Triade)",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Informationsbeschaffung zu Sicherheitsrisiken",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Sicherheitsmassnahmen festlegen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Sicherheitskonzept erstellen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Anforderungen anpassen nach Security-Analyse",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_3",
    }),

    // G4: Studie (5 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Variantenvergleich durchführen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Nutzwertanalyse erstellen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Kundengespräch zu Varianten führen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Diagramme zur Visualisierung erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_4",
    }),
    db.leistungsziel.create({
      beschreibung: "SWOT-Analyse durchführen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_4",
    }),

    // G5: Realisierung (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Entwicklungsumgebung einrichten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Backend entwickeln",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Frontend entwickeln",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Ergebnisse überprüfen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Code-Review durchführen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Git für Versionskontrolle nutzen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_5",
    }),
    db.leistungsziel.create({
      beschreibung: "Konzept nach Feedback anpassen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_5",
    }),

    // G6: Testing (9 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Testkonzept erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Testfälle definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Testumgebung aufsetzen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Manuelle Tests durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Testautomatisierung implementieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Testergebnisse protokollieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Fehler dokumentieren und tracken",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Regressionstests durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),
    db.leistungsziel.create({
      beschreibung: "Testbericht erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "g_6",
    }),

    // ========================================
    // Bereich H: Deployment und Monitoring
    // ========================================

    // H1: Docker (6 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Docker-Compose File erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Variantenvergleich nach Anforderungen durchführen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Provider-Vergleich für Deployment durchführen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Deployment-Variante wählen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Variantenvergleich im Team durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_1",
    }),
    db.leistungsziel.create({
      beschreibung: "Container-Konfiguration dokumentieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_1",
    }),

    // H2: Deployment 1 (4 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Migrationsreihenfolge festlegen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Pipeline-Inhalte definieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Deliver/Rollback-Strategie planen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_2",
    }),
    db.leistungsziel.create({
      beschreibung: "Deployment-Plattform wählen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_2",
    }),

    // H3: Deployment 2 (7 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "CI/CD-Pipeline einrichten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Deployment durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Versionierung implementieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Deployment-Abnahme vorbereiten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Produktiv-Deployment durchführen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Rollback-Prozeduren testen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),
    db.leistungsziel.create({
      beschreibung: "Deployment-Dokumentation erstellen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_3",
    }),

    // H4: Monitoring (6 Leistungsziele)
    db.leistungsziel.create({
      beschreibung: "Monitoring-Konzept entwickeln",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Monitoring-Tools einrichten",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Metriken und Alerts konfigurieren",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Monitoring-Daten analysieren",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Verbesserungen ableiten und umsetzen",
      taxonomie_stufe: "K4",
      kompetenzbereich_id: "h_4",
    }),
    db.leistungsziel.create({
      beschreibung: "Monitoring-Ergebnisse mit Kunden besprechen",
      taxonomie_stufe: "K3",
      kompetenzbereich_id: "h_4",
    }),
  ]);

  console.log(`✅ Created ${leistungsziele.length} Leistungsziele`);

  return leistungsziele;
};
