const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const College = require("../models/College");

// Pre-configured Colleges for Multi-Tenant Architecture
const SYSTEM_COLLEGES = [
  {
    code: "GIT",
    name: "Gates Institute of Technology",
    shortName: "Gates Tech",
    tagline: "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade by NAAC",
    affiliation: "Autonomous Institution • Affiliated to JNTUA • Gooty Road, Anantapur",
    location: "NH-44, Gooty Road, Anantapur, Andhra Pradesh - 515002",
    examTitle: "Autonomous Theory End Semester Examinations 2026",
    primaryColor: "#2563eb",
    accentColor: "#1d4ed8",
    adminUsername: "admin_gates",
    adminPassword: "admin@gates2026",
    adminName: "Dr. P. Ramesh Kumar (Controller of Exams - GIT)",
  },
  {
    code: "AIST",
    name: "Apex Institute of Science & Technology",
    shortName: "Apex Tech",
    tagline: "Premier Autonomous Engineering Campus • Approved by AICTE & UGC",
    affiliation: "Affiliated to VTU • NAAC Grade A++ Autonomous Campus",
    location: "Electronic City Phase 1, Bengaluru, Karnataka - 560100",
    examTitle: "Autonomous B.Tech Regular & Supplementary Examinations 2026",
    primaryColor: "#059669",
    accentColor: "#047857",
    adminUsername: "admin_apex",
    adminPassword: "admin@apex2026",
    adminName: "Dr. Arvind Hegde (Dean of Examinations - AIST)",
  },
  {
    code: "NCE",
    name: "National College of Engineering",
    shortName: "National Engg",
    tagline: "Centrally Funded Autonomous Institution • NBA Accredited Programs",
    affiliation: "Autonomous Campus • Affiliated to JNTUH • Hyderabad",
    location: "Kukatpally Housing Board, Hyderabad, Telangana - 500085",
    examTitle: "Annual Theory & Practical Seating Examination 2026",
    primaryColor: "#7c3aed",
    accentColor: "#6d28d9",
    adminUsername: "admin_nce",
    adminPassword: "admin@nce2026",
    adminName: "Dr. S. K. Murthy (Chief Superintendent - NCE)",
  },
  {
    code: "OGU",
    name: "Oxford Global University",
    shortName: "Oxford Global",
    tagline: "Deemed to be University • World-Class Research & Innovation Hub",
    affiliation: "Approved by UGC & AICTE • International Accreditation Board",
    location: "IT Corridor, OMR, Chennai, Tamil Nadu - 600096",
    examTitle: "University End Term Examinations 2026",
    primaryColor: "#dc2626",
    accentColor: "#b91c1c",
    adminUsername: "admin_oxford",
    adminPassword: "admin@oxford2026",
    adminName: "Prof. E. Henderson (Registrar & Controller - OGU)",
  },
];

// Universal super admin credentials
const SUPER_ADMINS = [
  { username: "admin", password: "admin@college2026", name: "Institutional Chief Administrator" },
  { username: "admin", password: "admin123", name: "Institutional Chief Administrator" },
  { username: "controller", password: "exam@college2026", name: "Controller of Examinations" },
];

// Ensure colleges exist in DB
const initColleges = async () => {
  if (require("mongoose").connection.readyState !== 1) return;
  try {
    for (const c of SYSTEM_COLLEGES) {
      const exists = await College.findOne({ code: c.code });
      if (!exists) {
        await College.create(c);
      }
    }
  } catch (err) {
    // ignore error
  }
};
require("mongoose").connection.on("connected", initColleges);

const getColleges = async (req, res) => {
  try {
    if (require("mongoose").connection.readyState === 1) {
      await initColleges();
    }
    const colleges = await College.find({ isActive: true }).select("-adminPassword");
    res.json({
      success: true,
      colleges: colleges.length > 0 ? colleges : SYSTEM_COLLEGES,
    });
  } catch (err) {
    res.json({ success: true, colleges: SYSTEM_COLLEGES });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password, collegeCode = "GIT" } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();
    const cleanCode = String(collegeCode).trim().toUpperCase();

    // 1. Check if user is a Universal Super Admin
    const superAdmin = SUPER_ADMINS.find(
      (a) => a.username.toLowerCase() === cleanUser && a.password === cleanPass
    );

    // 2. Check if user matches a specific College Admin
    const college = SYSTEM_COLLEGES.find(
      (c) =>
        (c.adminUsername.toLowerCase() === cleanUser && c.adminPassword === cleanPass) ||
        (c.code === cleanCode && superAdmin)
    ) || SYSTEM_COLLEGES[0];

    let authenticatedAdmin = null;

    if (superAdmin) {
      authenticatedAdmin = {
        username: superAdmin.username,
        name: `${superAdmin.name} (${college.shortName})`,
        role: "super_admin",
        collegeCode: college.code,
        collegeName: college.name,
      };
    } else {
      const matchedCollegeAdmin = SYSTEM_COLLEGES.find(
        (c) => c.adminUsername.toLowerCase() === cleanUser && c.adminPassword === cleanPass
      );
      if (matchedCollegeAdmin) {
        authenticatedAdmin = {
          username: matchedCollegeAdmin.adminUsername,
          name: matchedCollegeAdmin.adminName,
          role: "college_admin",
          collegeCode: matchedCollegeAdmin.code,
          collegeName: matchedCollegeAdmin.name,
        };
      }
    }

    if (!authenticatedAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin username or password. Default credentials: admin / admin@college2026 or admin_gates / admin@gates2026",
      });
    }

    const token = jwt.sign(
      {
        username: authenticatedAdmin.username,
        name: authenticatedAdmin.name,
        role: authenticatedAdmin.role,
        collegeCode: authenticatedAdmin.collegeCode,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: `Admin login successful. Access granted for ${authenticatedAdmin.collegeName}.`,
      token,
      user: authenticatedAdmin,
      college: {
        code: college.code,
        name: college.name,
        shortName: college.shortName,
        tagline: college.tagline,
        affiliation: college.affiliation,
        location: college.location,
        examTitle: college.examTitle,
        primaryColor: college.primaryColor,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { hallTicketNumber, dob, collegeCode = "GIT" } = req.body;

    if (!hallTicketNumber) {
      return res.status(400).json({
        success: false,
        message: "Hall ticket number is required",
      });
    }

    const cleanTicket = String(hallTicketNumber).trim().toUpperCase();

    const student = await Student.findOne({
      hallTicketNumber: {
        $regex: `^${cleanTicket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    }).populate("room");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with Hall Ticket Number "${cleanTicket}". Please verify your hall ticket number.`,
      });
    }

    // Generate student session token
    const token = jwt.sign(
      {
        hallTicketNumber: student.hallTicketNumber,
        studentName: student.studentName,
        academicYear: student.academicYear,
        branch: student.branch,
        role: "student",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: `Welcome, ${student.studentName}! Logged in successfully.`,
      token,
      student,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifySession = async (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: req.user,
  });
};

module.exports = {
  getColleges,
  loginAdmin,
  studentLogin,
  verifySession,
  SYSTEM_COLLEGES,
};
