import bcrypt from "bcryptjs";

/**
 * Seeds roles and users
 */
export const seedUsersAndRoles = async (db) => {
  console.log("👥 Creating roles...");

  // Create Roles
  const roles = await Promise.all([
    db.role.create({
      id: 1,
      name: "bb",
      description: "Berufsbildner"
    })
  ]);
  console.log(`✅ Created ${roles.length} roles`);

  // Hash password for all users
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("password123", saltRounds);

  console.log("👤 Creating users...");

  // Berufsbildner users
  const bbUsersData = [
    { name: "Simon Dietler", email: "simon.dietler@band.ch" },
    { name: "Manuel Hotz", email: "manuel.hotz@band.ch" },
    { name: "Tim Leibacher", email: "tim.leibacher@band.ch" },
    { name: "Kevin Suter", email: "kevin.suter@band.ch" },
    { name: "Thomas Schläppi", email: "thomas.schlaeppi@band.ch" },
    { name: "Simon Baumann", email: "simon.baumann@band.ch" }
  ];

  const bbUsers = await Promise.all(
    bbUsersData.map(bb =>
      db.user.create({
        email: bb.email,
        password: hashedPassword
      })
    )
  );

  // Create a map for easy BB lookup
  const bbMap = {};
  bbUsersData.forEach((bb, index) => {
    bbMap[bb.name] = bbUsers[index];
  });

  // Student users with Fachrichtung and assigned BB
  const studentUsersData = [
    { name: "Rinaldo De Maddalena", fachrichtung: "ICT-Fachmann/frau", bb: "Thomas Schläppi", lehrjahr: 1 },
    { name: "Karim Kachmar", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 1 },
    { name: "Janis Schärer", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 1 },
    { name: "Janis Knutzen", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 1 },
    { name: "Hamdani Firas", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 1 },
    { name: "Aralim Nesvadba", fachrichtung: "ICT-Fachmann/frau", bb: "Thomas Schläppi", lehrjahr: 2 },
    { name: "Tobias Rotoli", fachrichtung: "ICT-Fachmann/frau", bb: "Thomas Schläppi", lehrjahr: 2 },
    { name: "Semyon Oeler", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 2 },
    { name: "Jason Meikle", fachrichtung: "ICT-Fachmann/frau", bb: "Manuel Hotz", lehrjahr: 2 },
    { name: "Denis Domeisen", fachrichtung: "ICT-Fachmann/frau", bb: "Manuel Hotz", lehrjahr: 3 },
    { name: "Dario Dirren", fachrichtung: "ICT-Fachmann/frau", bb: "Manuel Hotz", lehrjahr: 3 },
    { name: "Jason Staub", fachrichtung: "ICT-Fachmann/frau", bb: "Simon Baumann", lehrjahr: 3 },
    { name: "Yoel Estifanos", fachrichtung: "ICT-Fachmann/frau", bb: "Thomas Schläppi", lehrjahr: 3 },
    { name: "Doan Huu Nhan", fachrichtung: "ICT-Fachmann/frau", bb: "Manuel Hotz", lehrjahr: 3 },
    { name: "Maxamed Xamdi", fachrichtung: "ICT-Fachmann/frau", bb: "Manuel Hotz", lehrjahr: 3 },
    { name: "Saul Rincon", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 1 },
    { name: "Samuel Kreis", fachrichtung: "Applikation", bb: "Kevin Suter", lehrjahr: 1 },
    { name: "Rahul Gurung", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 1 },
    { name: "Frederic König", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 1 },
    { name: "Miles Wood", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 1 },
    { name: "Jovana Markovic", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 1 },
    { name: "Gian Galli", fachrichtung: "Applikation", bb: "Kevin Suter", lehrjahr: 1 },
    { name: "Sven Zihlmann", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 1 },
    { name: "Fabian Engel", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 1 },
    { name: "Adrian Andjelic", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 1 },
    { name: "Maxim Schürch", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 2 },
    { name: "Eduard Iltgen", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 2 },
    { name: "Leos Venditti", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 3 },
    { name: "Jan David Bryner", fachrichtung: "Applikation", bb: "Kevin Suter", lehrjahr: 3 },
    { name: "Sandro Eloi Siegrist", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 4 },
    { name: "Melanie Burri", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 4 },
    { name: "Rico Siegrist", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 4 },
    { name: "Joel Bulliard", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 4 },
    { name: "Patrick Bürdel", fachrichtung: "Applikation", bb: "Simon Dietler", lehrjahr: 4 },
    { name: "Samuel Moor", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 4 },
    { name: "Ron Mule", fachrichtung: "Applikation", bb: "Tim Leibacher", lehrjahr: 4 }
  ];

  const studentUsers = await Promise.all(
    studentUsersData.map(student => {
      const emailName = student.name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/\s+/g, '.');

      return db.user.create({
        email: `${emailName}@band.ch`,
        password: hashedPassword,
        fachrichtung: student.fachrichtung,
        coach_id: bbMap[student.bb].id,
        lehrjahr: student.lehrjahr
      });
    })
  );

  const allUsers = [...bbUsers, ...studentUsers];
  console.log(`✅ Created ${allUsers.length} users (${bbUsers.length} BB, ${studentUsers.length} students)`);

  // Assign BB role to Berufsbildner users
  console.log("🔗 Assigning roles to users...");
  const bbRole = roles[0];
  await Promise.all(bbUsers.map(user => user.addRole(bbRole)));
  console.log("✅ Roles assigned successfully");
  console.log("✅ Coaches assigned during user creation");

  return {
    roles,
    bbUsers,
    studentUsers,
    allUsers
  };
};