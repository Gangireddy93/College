const express = require("express");
const router = express.Router();
const {
  getMaterials,
  addMaterial,
  deleteMaterial,
  downloadMaterial,
} = require("../controllers/studyMaterialController");
const { verifyAdminToken } = require("../middleware/authMiddleware");

// Public routes (for students)
router.get("/", getMaterials);
router.post("/:id/download", downloadMaterial);

// Protected routes (for admin)
router.post("/", verifyAdminToken, addMaterial);
router.delete("/:id", verifyAdminToken, deleteMaterial);

module.exports = router;
