/**
 * Seeds ModulKompetenzbereiche - Verknüpfung zwischen BFS/ÜK Modulen und Kompetenzbereichen
 * Nur BFS und ÜK Module werden mit Kompetenzbereichen verknüpft
 * BAND Module werden direkt mit Leistungszielen verknüpft
 */
export const seedModulKompetenzbereiche = async (db) => {
  console.log("🔗 Creating ModulKompetenzbereiche relationships...");

  const relationships = await Promise.all([
    // ========================================
    // BFS Module - Applikationsentwicklung
    // ========================================

    // Modul 162: Daten analysieren und modellieren → Datenbank-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 162, kompetenzbereich_id: "b_1" }), // Relationale Datenbanken
    db.modulKompetenzbereich.create({ modul_id: 162, kompetenzbereich_id: "a_2" }), // Algorithmen und Datenstrukturen

    // Modul 164: Datenbanken erstellen und Daten einfügen → Datenbank-Implementation
    db.modulKompetenzbereich.create({ modul_id: 164, kompetenzbereich_id: "b_1" }), // Relationale Datenbanken

    // Modul 165: NoSQL-Datenbanken einsetzen → NoSQL-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 165, kompetenzbereich_id: "b_2" }), // NoSQL und Big Data

    // Modul 183: Applikationssicherheit implementieren → Sicherheits-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 183, kompetenzbereich_id: "d_1" }), // IT-Sicherheit Grundlagen
    db.modulKompetenzbereich.create({ modul_id: 183, kompetenzbereich_id: "d_2" }), // Applikationssicherheit

    // Modul 226 existiert nicht in 02-modules.js - ÜBERSPRUNGEN

    // Modul 293: Web-Frontends mit Frameworks → Frontend-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 293, kompetenzbereich_id: "e_1" }), // Frontend-Entwicklung
    db.modulKompetenzbereich.create({ modul_id: 293, kompetenzbereich_id: "a_1" }), // Programmiersprachen und -techniken

    // Modul 294: Frontend einer interaktiven Webapplikation → Frontend-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 294, kompetenzbereich_id: "e_1" }), // Frontend-Entwicklung

    // Modul 295: Backend für Webapplikationen → Backend-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 295, kompetenzbereich_id: "e_2" }), // Backend-Entwicklung
    db.modulKompetenzbereich.create({ modul_id: 295, kompetenzbereich_id: "a_1" }), // Programmiersprachen und -techniken

    // Modul 321: Verteilte Systeme programmieren → Architektur-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 321, kompetenzbereich_id: "a_3" }), // Software-Architektur und Design Patterns
    db.modulKompetenzbereich.create({ modul_id: 321, kompetenzbereich_id: "e_2" }), // Backend-Entwicklung

    // Modul 322: Benutzerschnittstellen implementieren → UI/UX-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 322, kompetenzbereich_id: "e_1" }), // Frontend-Entwicklung
    db.modulKompetenzbereich.create({ modul_id: 322, kompetenzbereich_id: "a_1" }), // Programmiersprachen und -techniken

    // Modul 323: Funktionale Programmierung → Programmier-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 323, kompetenzbereich_id: "a_1" }), // Programmiersprachen und -techniken
    db.modulKompetenzbereich.create({ modul_id: 323, kompetenzbereich_id: "a_2" }), // Algorithmen und Datenstrukturen

    // ========================================
    // BFS Module - Plattform/ICT
    // ========================================

    // Modul 133 existiert nicht in 02-modules.js - ÜBERSPRUNGEN

    // Modul 346: Cloud-Lösungen konzipieren → Cloud-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 346, kompetenzbereich_id: "c_2" }), // Server und Cloud-Services
    db.modulKompetenzbereich.create({ modul_id: 346, kompetenzbereich_id: "h_1" }), // Container und DevOps

    // Modul 431: Aufträge im IT-Umfeld → Business-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 431, kompetenzbereich_id: "g_1" }), // Geschäftsprozesse
    db.modulKompetenzbereich.create({ modul_id: 431, kompetenzbereich_id: "g_2" }), // Stakeholder-Management

    // Modul 254: Geschäftsprozesse beschreiben → Business-Kompetenzen
    db.modulKompetenzbereich.create({ modul_id: 254, kompetenzbereich_id: "g_1" }), // Geschäftsprozesse

    // ========================================
    // ÜK Module
    // ========================================

    // Modul 187: ICT-Arbeitsplatz mit Betriebssystem → Infrastruktur-Grundlagen
    db.modulKompetenzbereich.create({ modul_id: 187, kompetenzbereich_id: "c_1" }), // Netzwerk-Grundlagen
    db.modulKompetenzbereich.create({ modul_id: 187, kompetenzbereich_id: "c_2" }), // Server und Cloud-Services

    // Module 117, 123, 129, 159, 169 existieren nicht in 02-modules.js - ÜBERSPRUNGEN

    // ========================================
    // Wahlpflichtmodule
    // ========================================

    // Module 152, 242, 347 existieren nicht in 02-modules.js - ÜBERSPRUNGEN
  ]);

  console.log(`✅ Created ${relationships.length} ModulKompetenzbereich relationships`);

  // Statistik ausgeben
  const moduleWithComps = new Set(relationships.map(r => r.modul_id)).size;
  const compsUsed = new Set(relationships.map(r => r.kompetenzbereich_id)).size;

  console.log(`📊 Statistics:`);
  console.log(`   • ${moduleWithComps} Module linked to Kompetenzbereiche`);
  console.log(`   • ${compsUsed} different Kompetenzbereiche used`);
  console.log(`   • Average ${(relationships.length / moduleWithComps).toFixed(1)} Kompetenzbereiche per Module`);

  return relationships;
};