const express = require("express");
const multer = require("multer");

const router = express.Router();
const {
  addRoom,
  getRooms,
  getRoomById,
  deleteRoom,
  deleteRoomsByYear,
  uploadRoomsExcel,
  seed40Rooms,
  seedUnlimitedRooms,
  autoExpandRooms,
  checkRoomsStatus,
  downloadRoomsTemplate,
} = require("../controllers/roomController");

const { verifyAdminToken } = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = /\.(xlsx|xls|csv)$/i;
    if (!allowed.test(file.originalname)) {
      return callback(new Error("Only .xlsx, .xls, and .csv files are allowed"));
    }
    callback(null, true);
  },
});

// Public: Download room template
router.get("/template", downloadRoomsTemplate);

// Check if rooms already exist (used for upload duplicate warning modal)
router.get("/check-rooms", verifyAdminToken, checkRoomsStatus);

// Protected Admin Routes (Requires valid JWT token)
router.get("/", verifyAdminToken, getRooms);
router.get("/:id", verifyAdminToken, getRoomById);
router.post("/", verifyAdminToken, addRoom);
router.delete("/by-year/:year", verifyAdminToken, deleteRoomsByYear);
router.delete("/:id", verifyAdminToken, deleteRoom);
router.post("/upload-excel", verifyAdminToken, upload.single("file"), uploadRoomsExcel);
router.post("/seed-40", verifyAdminToken, seed40Rooms);
router.post("/seed-unlimited", verifyAdminToken, seedUnlimitedRooms);
router.post("/auto-expand", verifyAdminToken, autoExpandRooms);

module.exports = router;