// Debug Script - backend/src/scripts/debugSeed.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../../.env") });

console.log("🔍 DEBUGGING SEED SCRIPT");
console.log("========================");

console.log("1. Environment Variables:");
console.log("   NODE_ENV:", process.env.NODE_ENV);
console.log("   MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");

console.log("\n2. File Paths:");
console.log("   __filename:", __filename);
console.log("   __dirname:", __dirname);
console.log("   .env path:", join(__dirname, "../../.env"));

console.log("\n3. Importing modules...");

try {
  console.log("   Importing mongoose...");
  const mongoose = await import("mongoose");
  console.log("   ✅ mongoose imported");

  console.log("   Importing bcryptjs...");
  const bcrypt = await import("bcryptjs");
  console.log("   ✅ bcryptjs imported");

  console.log("   Importing User model...");
  const User = await import("../models/User.js");
  console.log("   ✅ User model imported");

  console.log("   Importing Competency model...");
  const Competency = await import("../models/Competency.js");
  console.log("   ✅ Competency model imported");

  console.log("   Importing Modul model...");
  const Modul = await import("../models/Modul.js");
  console.log("   ✅ Modul model imported");

  console.log("   Importing connectDB...");
  const { connectDB } = await import("../../config/db.js");
  console.log("   ✅ connectDB imported");

  console.log("\n4. Testing database connection...");
  await connectDB();
  console.log("   ✅ Database connected successfully!");

  console.log("\n5. Testing basic operations...");
  const userCount = await User.default.countDocuments();
  const competencyCount = await Competency.default.countDocuments();
  const modulCount = await Modul.default.countDocuments();

  console.log(`   Current data in database:`);
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Competencies: ${competencyCount}`);
  console.log(`   - Modules: ${modulCount}`);

  await mongoose.default.connection.close();
  console.log("   ✅ Database connection closed");

  console.log("\n🎉 All checks passed! The seed script should work.");
  console.log("📝 Issue might be in the existing seedData.js file content.");
} catch (error) {
  console.error("\n❌ Error during debugging:");
  console.error("   Message:", error.message);
  console.error("   Stack:", error.stack);
}

console.log("\n========================");
console.log("🔍 DEBUG COMPLETE");
