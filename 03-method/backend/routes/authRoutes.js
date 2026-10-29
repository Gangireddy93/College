const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  studentLogin,
  verifySession,
  getColleges,
} = require("../controllers/authController");
const { verifyAdminToken } = require("../middleware/authMiddleware");

// Public routes
router.get("/colleges", getColleges);
router.post("/login", loginAdmin);
router.post("/student-login", studentLogin);

// Protected routes
router.get("/verify", verifyAdminToken, verifySession);

module.exports = router;
