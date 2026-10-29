const express = require("express");
const multer = require("multer");

const router = express.Router();
const {
  uploadStudentsExcel,
  runAllocation,
  resetAllocation,
  getStudents,
  searchStudent,
  addStudent,
  deleteStudent,
  deleteStudentsByYear,
  downloadStudentsTemplate,
  seedDemoData,
  seed680Dataset,
  seedAll4Years,
  cleanEmptyDataAndRooms,
  clearAllData,
  getDashboardStats,
  checkYearStatus,
  downloadSampleCsv,
} = require("../controllers/studentController");

const { verifyAdminToken } = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = /\.(xlsx|xls|csv)$/i;
    if (!allowed.test(file.originalname)) {
      return callback(new Error("Only .xlsx, .xls, and .csv files are allowed"));
    }
    callback(null, true);
  },
});

// 1. PUBLIC ROUTES (Accessible by students & guests)
// Search student by Hall Ticket Number
router.get("/search/:hallTicketNumber", searchStudent);
// Download sample Excel template
router.get("/template", downloadStudentsTemplate);
// Download ready-to-use CSV sample datasets (1st to 4th year, All Years, Rooms)
router.get("/download-sample", downloadSampleCsv);

// 2. PROTECTED ADMIN ROUTES (Requires valid Admin JWT Token)
// Check if academic year data already exists (for duplicate upload confirmation modal)
router.get("/check-year/:year", verifyAdminToken, checkYearStatus);

// Dashboard stats
router.get("/stats", verifyAdminToken, getDashboardStats);

// Student listing with filters
router.get("/", verifyAdminToken, getStudents);

// Add single student manually
router.post("/", verifyAdminToken, addStudent);

// Upload students Excel file (Supports replaceExisting=true for overwrite/delete old year data)
router.post("/upload-excel", verifyAdminToken, upload.single("file"), uploadStudentsExcel);

// Run allocation algorithm manually (Auto-expands rooms if capacity is insufficient)
router.post("/allocate", verifyAdminToken, runAllocation);

// Reset / Clear allocation
router.post("/reset-allocation", verifyAdminToken, resetAllocation);

// Clean empty records and empty rooms
router.post("/clean-empty", verifyAdminToken, cleanEmptyDataAndRooms);

// Completely wipe all data for fresh uploads
router.post("/clear-all", verifyAdminToken, clearAllData);

// Seed all 4 years dataset (2,720 students + 110 examination rooms with 2,750 seats)
router.post("/seed-all-years", verifyAdminToken, seedAll4Years);
router.post("/seed-680", verifyAdminToken, seed680Dataset);
router.post("/seed-demo", verifyAdminToken, seedDemoData);

// Delete all students of an academic year
router.delete("/by-year/:year", verifyAdminToken, deleteStudentsByYear);

// Delete single student
router.delete("/:id", verifyAdminToken, deleteStudent);

module.exports = router;
