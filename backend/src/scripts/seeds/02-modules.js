/**
 * Seeds modules - All ICT education modules (BFS, ÜK, BAND)
 */
export const seedModules = async (db) => {
  console.log("📚 Creating modules...");

  const modules = await Promise.all([
    // ========================================
    // BFS Module - Lehrjahr 1
    // ========================================
    db.modul.create({
      id: 431,
      name: "Aufträge im eigenen Berufsumfeld selbständig durchführen",
      beschreibung:
        "Führt Aufträge aus dem eigenen Berufsumfeld gemäss Vorgaben des Auftraggebers selbständig und mit Hilfe geeigneter Techniken, Methoden und Hilfsmittel durch.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "ICT", "Medi"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 162,
      name: "Daten analysieren und modellieren",
      beschreibung:
        "Analysiert Informationsbestände aus verschiedenen Quellen, charakterisiert Daten und ordnet sie ein. Erstellt durch die in der Analyse gewonnenen Anhaltspunkte ein konzeptionelles Datenmodell und überführt dieses in ein logisches, relationales Datenmodell.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "edb"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 319,
      name: "Applikationen entwerfen und implementieren",
      beschreibung:
        "Die Lernenden kennen die Grundlagen des Programmierens, deren Herkunft, ihrer Voraussetzungen und sind in der Lage im Beruflichen Umfeld Probleme zu verstehen und Lösungen dafür zu entwickeln.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "edb"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 114,
      name: "Codierungs-, Kompressions- und Verschlüsselungsverfahren einsetzen",
      beschreibung:
        "Codierungs-, Kompressions- und Verschlüsselungsverfahren im täglichen Berufsalltag korrekt einsetzten.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 164,
      name: "Datenbanken erstellen und Daten einfügen",
      beschreibung:
        "Implementiert ein logisches, relationales Datenmodell in einem Datenbankmanagementsystem. Fügt Daten in die Datenbank ein, prüft die eingefügten Daten und korrigiert allfällige Fehler.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "edb"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 231,
      name: "Datenschutz und Datensicherheit anwenden",
      beschreibung:
        "Setzt Datenschutz und Datensicherheit bei Informatiksystemen ein. Überprüft vorhandene Systeme auf Einhaltung von Richtlinien.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "edb"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 122,
      name: "Abläufe mit einer Scriptsprache automatisieren",
      beschreibung:
        "Automatisiert Abläufe in der Systemadministration mithilfe einer Scriptsprache",
      typ: "BFS",
      fachrichtungen: ["Appli", "ICT", "Plattform", "edb"],
      wahlmodul: false,
      lehrjahr: 1,
    }),

    // ========================================
    // BFS Module - Lehrjahr 2
    // ========================================
    db.modul.create({
      id: 320,
      name: "Objektorientiert Programmieren",
      beschreibung:
        "Applikationen und Schnittstellen objektorientiert modellieren, implementieren, testen und dokumentieren.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 293,
      name: "Webauftritt erstellen und veröffentlichen",
      beschreibung:
        "Erstellt einen Webauftritt mit modernen Webtechnologien und -sprachen nach Vorgaben und veröffentlicht ihn.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 346,
      name: "Cloud Lösungen konzipieren und realisieren",
      beschreibung:
        "Beurteilt die Eignung von Cloud Services hinsichtlich der betrieblichen Anforderung. Entwickelt ein technisches Konzept und realisiert die gewählte Lösung.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 322,
      name: "Benutzerschnittstellen entwerfen und implementieren",
      beschreibung:
        "Entwirft und implementiert Benutzerschnittstellen für eine Applikation. Beachtet dabei Standards und ergonomische Anforderungen.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 165,
      name: "NoSQL-Datenbanken einsetzen",
      beschreibung:
        "Wählt einen geeigneten digitalen Datenspeicher, wenn ein relationales Datenbankmanagementsystem nicht eingesetzt werden soll oder kann. Implementiert eine Datenbank auf einem NoSQL (Not only SQL) Datenbankmanagementsystem, importiert Daten und verwaltet diese.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 347,
      name: "Dienst mit Container anwenden",
      beschreibung:
        "Erkennt Unterschiede der Containeranwendungsmöglichkeiten im eigenen beruflichen Alltag. Entwickelt mittels einer geeigneten Containerkomposition eine ICT-Lösung für den eigenen Betrieb oder für das betriebliche Umfeld.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 254,
      name: "Geschäftsprozesse im eigenen Berufsumfeld beschreiben",
      beschreibung:
        "Dokumentiert Geschäftsprozesse, führt eine Aufgabenanalyse durch und stellt Prozessabläufe grafisch dar.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "EDB"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 426,
      name: "Software mit agilen Methoden entwickeln",
      beschreibung:
        "Agile Methoden zur Softwareentwicklung in Release-Zyklen anwenden.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),

    // ========================================
    // BFS Module - Lehrjahr 3
    // ========================================
    db.modul.create({
      id: 323,
      name: "Funktional Programmieren",
      beschreibung:
        "Algorithmen und Teile von Applikationen deklarativ beschreiben und funktional implementieren.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 3,
    }),
    db.modul.create({
      id: 450,
      name: "Applikationen testen",
      beschreibung:
        "Erstellt anhand einer Testbasis ein Testkonzept und leitet daraus Testfälle ab. Implementiert und dokumentiert diese, definiert Korrekturmassnahmen und überprüft Schnittstellen anhand von Sicherheitsvorgaben.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 3,
    }),
    db.modul.create({
      id: 306,
      name: "Kleinprojekte im eigenen Berufsumfeld abwickeln",
      beschreibung:
        "Wickelt Kleinprojekte im Team mit klar definierter Zielsetzung, Anforderungen, vorgegebenen Ressourcen und Terminen mit geeigneten Softwaretools ab.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform", "Mediamatik"],
      wahlmodul: false,
      lehrjahr: 3,
    }),
    db.modul.create({
      id: 183,
      name: "Applikationssicherheit implementieren",
      beschreibung:
        "Applikationen sicher planen, entwickeln und in Betrieb nehmen.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 3,
    }),

    // ========================================
    // BFS Module - Lehrjahr 4
    // ========================================
    db.modul.create({
      id: 241,
      name: "Innovative ICT-Lösungen initialisieren",
      beschreibung:
        "Erarbeitet mögliche innovative Lösungsansätze für eine bestimmte Problemstellung einer Zielgruppe. Präsentiert diese anderen Fachpersonen in Form eines kurzen Pitch.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform"],
      wahlmodul: false,
      lehrjahr: 4,
    }),
    db.modul.create({
      id: 324,
      name: "DevOps-Prozesse mit Tools unterstützen",
      beschreibung:
        "Setzt automatisierende Tools für die verschiedenen Prozesschritte der Applikationsentwicklung ein (Continuous Integration/Continuous Deploy).",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 4,
    }),
    db.modul.create({
      id: 321,
      name: "Verteilte Systeme programmieren",
      beschreibung:
        "Verteilte Systeme analysieren, verstehen, planen, erweitern und anwenden, sowie bestehende Applikationen in ein verteiltes System überführen.",
      typ: "BFS",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 4,
    }),
    db.modul.create({
      id: 245,
      name: "Innovative ICT-Lösungen umsetzen",
      beschreibung:
        "Realisiert auf der Basis eines erarbeiteten innovativen Lösungsansatzes einen Proof of Concept. Präsentiert diesen anderen Fachpersonen in Form eines kurzen Pitch.",
      typ: "BFS",
      fachrichtungen: ["Appli", "Plattform"],
      wahlmodul: false,
      lehrjahr: 4,
    }),

    // ========================================
    // ÜK Module
    // ========================================
    db.modul.create({
      id: 106,
      name: "Datenbanken abfragen, bearbeiten und warten",
      beschreibung:
        "Bereitet Daten durch Abfragen auf und nimmt Optimierungen zur Leistungssteigerung vor. Ändert Struktur und Daten einer Datenbank, schützt die Daten durch Zugriffsberechtigungen und sichert die Daten wie auch das Datenbankschema in einem Backup.",
      typ: "ÜK",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 187,
      name: "ICT-Arbeitsplatz mit Betriebssystem in Betrieb nehmen",
      beschreibung:
        "ICT-Arbeitsplatz in Betrieb nehmen: Wichtige Aspekte der Hardwarekompatibilität überprüfen, Betriebssystem gemäss Vorgaben installieren, konfigurieren und administrieren, Sicherheitsaspekte erkennen und anwenden, Arbeitsschritte dokumentieren und testen.",
      typ: "ÜK",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 1,
    }),
    db.modul.create({
      id: 294,
      name: "Frontend einer interaktiven Webapplikation realisieren",
      beschreibung:
        "Implementiert mittels vorgegebener Technologie und mit Hilfe eines existierenden Back-Ends ein Front-End einer interaktiven Webapplikation, welches die Verwaltung von Daten ermöglicht.",
      typ: "ÜK",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 295,
      name: "Backend für Applikationen realisieren",
      beschreibung:
        "Implementiert mittels vorgegebener Technologie eine Back-End-Schnittstelle, welche aktuelle Schnittstellen-Standards einhält.",
      typ: "ÜK",
      fachrichtungen: ["Appli"],
      wahlmodul: false,
      lehrjahr: 2,
    }),
    db.modul.create({
      id: 210,
      name: "Public Cloud für Anwendungen nutzen",
      beschreibung:
        "Definiert die Nutzung von Cloud Services (Container- und Serverless Technologien) hinsichtlich der betrieblichen Anforderung für eine Beispielanwendung und realisiert die gewählte Lösung mit Hilfe von CI/CD Prozessen.",
      typ: "ÜK",
      fachrichtungen: ["Appli"],
      wahlmodul: true,
      lehrjahr: 2,
    }),

  ]);

  console.log(`✅ Created ${modules.length} modules`);

  return modules;
};