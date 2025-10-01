// ============================================================================
// USER CONTROLLER - PostgreSQL/Sequelize Version
// ============================================================================

export const allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

export const userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

export const bbBoard = (req, res) => {
  res.status(200).send("Berufsbildner Content.");
};

export const getAllBBs = async (req, res) => {
  try {
    // Import db here to avoid circular dependency issues
    const db = (await import("../models/index.js")).default;

    // Find all users with BB role
    const bbs = await db.user.findAll({
      include: [
        {
          model: db.role,
          as: "roles",
          where: { name: "bb" },
          attributes: [],
        },
      ],
      attributes: ["id", "email"],
      order: [["email", "ASC"]],
    });

    res.status(200).json(bbs);
  } catch (error) {
    console.error("Error fetching BBs:", error);
    res.status(500).json({ message: "Error fetching Berufsbildner" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const db = (await import("../models/index.js")).default;

    // Find all students (users without BB role)
    const students = await db.user.findAll({
      include: [
        {
          model: db.role,
          as: "roles",
          required: false,
        },
        {
          model: db.user,
          as: "coach", // Coach info (der zugewiesene BB)
          attributes: ["id", "email"],
          required: false,
        },
        {
          model: db.userModule,
          as: "userModules",
          include: [
            {
              model: db.durchfuehrung,
              as: "durchfuehrung",
              include: [
                {
                  model: db.modul,
                  as: "modul",
                  attributes: ["id", "name", "typ"],
                },
              ],
            },
          ],
          required: false,
        },
      ],
      where: {
        // Students have no roles or roles other than BB
        [db.Sequelize.Op.or]: [
          { "$roles.name$": { [db.Sequelize.Op.ne]: "bb" } },
          { "$roles.name$": { [db.Sequelize.Op.is]: null } }
        ]
      },
      attributes: ["id", "email", "lehrjahr", "fachrichtung", "createdAt"],
      order: [["email", "ASC"]],
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const db = (await import("../models/index.js")).default;
    const coachId = req.user.id; // From JWT token

    // Find students assigned to this coach
    const myStudents = await db.user.findAll({
      include: [
        {
          model: db.role,
          as: "roles",
          required: false,
        },
        {
          model: db.user,
          as: "coach",
          attributes: ["id", "email"],
          required: false,
        },
        {
          model: db.userModule,
          as: "userModules",
          include: [
            {
              model: db.durchfuehrung,
              as: "durchfuehrung",
              include: [
                {
                  model: db.modul,
                  as: "modul",
                  attributes: ["id", "name", "typ"],
                },
              ],
            },
          ],
          required: false,
        },
      ],
      where: {
        coach_id: coachId,
        [db.Sequelize.Op.or]: [
          { "$roles.name$": { [db.Sequelize.Op.ne]: "bb" } },
          { "$roles.name$": { [db.Sequelize.Op.is]: null } }
        ]
      },
      attributes: ["id", "email", "lehrjahr", "fachrichtung", "createdAt"],
      order: [["email", "ASC"]],
    });

    res.status(200).json(myStudents);
  } catch (error) {
    console.error("Error fetching my students:", error);
    res.status(500).json({ message: "Error fetching my students" });
  }
};

// ============================================================================
// TODO: Implement proper Sequelize versions of these functions when needed
// ============================================================================

// export const getCurrentUser = async (req, res) => {
//   // TODO: Implement with Sequelize when user system is fully developed
// };

// export const getUserById = async (req, res) => {
//   // TODO: Implement with Sequelize when user system is fully developed
// };

// export const updateUser = async (req, res) => {
//   // TODO: Implement with Sequelize when user system is fully developed
// };

// export const deleteUser = async (req, res) => {
//   // TODO: Implement with Sequelize when user system is fully developed
// };

// export const markModuleAsCompleted = async (req, res) => {
//   // TODO: Implement with UserModule table when module system is developed
// };

// export const getUserProgress = async (req, res) => {
//   // TODO: Implement with UserModule and ModuleCompetency tables when ready
// };