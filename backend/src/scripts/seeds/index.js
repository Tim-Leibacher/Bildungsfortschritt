import db from "../../models/index.js";
import { seedUsersAndRoles } from "./01-users.js";
import { seedModules } from "./02-modules.js";
import { seedKompetenzbereiche } from "./03-kompetenzbereiche.js";
import { seedLeistungsziele } from "./04-leistungsziele.js";
import { seedDurchfuehrungen } from "./05-durchfuehrungen.js";
import { seedModulKompetenzbereiche } from "./06-modul-kompetenzbereiche.js";
import { seedBandModules } from "./07-band-modules.js";

/**
 * Master seed function that orchestrates all seeding operations
 * Runs all seed scripts in the correct order for the new normalized structure
 */
export const seedAll = async () => {
  try {
    console.log("🌱 Starting comprehensive database seeding...");
    console.log("=====================================");

    // Sync database (force: true will drop existing tables)
    console.log("📋 Syncing database...");
    await db.sequelize.sync({ force: true });
    console.log("✅ Database synced successfully");
    console.log("");

    // 1. Seed Users and Roles
    console.log("👥 === SEEDING USERS & ROLES ===");
    const { roles, bbUsers, studentUsers, allUsers } = await seedUsersAndRoles(db);
    console.log("");

    // 2. Seed Modules (with lehrjahr)
    console.log("📚 === SEEDING MODULES ===");
    const modules = await seedModules(db);
    console.log("");

    // 3. Seed Kompetenzbereiche (new structure with a_1, b_2, etc.)
    console.log("🎯 === SEEDING KOMPETENZBEREICHE ===");
    const kompetenzbereiche = await seedKompetenzbereiche(db);
    console.log("");

    // 4. Seed Leistungsziele (linked to Kompetenzbereiche)
    console.log("🏆 === SEEDING LEISTUNGSZIELE ===");
    const leistungsziele = await seedLeistungsziele(db);
    console.log("");

    // 5. Seed Durchführungen (concrete module implementations)
    console.log("📅 === SEEDING DURCHFÜHRUNGEN ===");
    const durchfuehrungen = await seedDurchfuehrungen(db);
    console.log("");

    // 6. Seed ModulKompetenzbereiche (BFS/ÜK modules → Kompetenzbereiche)
    console.log("🔗 === SEEDING MODULE-KOMPETENZBEREICH RELATIONS ===");
    const modulKompetenzbereichRelations = await seedModulKompetenzbereiche(db);
    console.log("");

    // 7. Seed BAND modules and their Leistungsziele
    console.log("🏢 === SEEDING BAND MODULES ===");
    const bandModules = await seedBandModules(db);
    console.log("");

    // Final summary
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=====================================");
    console.log(`
📊 SUMMARY:
┌─────────────────────────────────────────┐
│ 👥 Users & Roles:                      │
│    • ${roles.length} roles created                    │
│    • ${allUsers.length} users created (${bbUsers.length} BB, ${studentUsers.length} students)  │
│                                         │
│ 📚 Learning Structure:                  │
│    • ${modules.length} BFS/ÜK modules created          │
│    • ${bandModules.length} BAND modules created             │
│    • ${kompetenzbereiche.length} kompetenzbereiche created         │
│    • ${leistungsziele.length} leistungsziele created            │
│    • ${durchfuehrungen.length} durchführungen created            │
│                                         │
│ 🔗 Relationships:                       │
│    • ${modulKompetenzbereichRelations.length} BFS/ÜK-kompetenzbereich links  │
│    • BAND modules linked to leistungsziele │
└─────────────────────────────────────────┘

🔑 LOGIN CREDENTIALS:
├─ Berufsbildner:
│  • tim.leibacher@band.ch : password123
│  • simon.dietler@band.ch : password123
│  • manuel.hotz@band.ch : password123
│  • kira.beutler@band.ch : password123
│  • jeannine.jung@band.ch : password123
│
└─ Students:
   • student1@example.com : password123
   • student2@example.com : password123
   • student3@example.com : password123
   • student4@example.com : password123
   • student5@example.com : password123

📖 STRUCTURE NOTES:
• BFS/ÜK modules are linked to Kompetenzbereiche
• BAND modules are linked directly to Leistungsziele (via ModulePerformanceGoal)
• Durchführungen represent concrete module implementations
• Users enroll in Durchführungen (not abstract modules)
    `);

    return {
      roles,
      users: allUsers,
      modules,
      bandModules,
      kompetenzbereiche,
      leistungsziele,
      durchfuehrungen,
      relations: {
        modulKompetenzbereichRelations
      }
    };

  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

/**
 * Main function to run seeding when script is executed directly
 */
const main = async () => {
  try {
    await seedAll();
    console.log("✅ Seeding script completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding script failed:", error);
    process.exit(1);
  }
};

// Run main function if script is executed directly
// Use proper file URL comparison that works on Windows
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}

export default seedAll;