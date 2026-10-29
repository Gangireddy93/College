const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Room = require("../models/Room");
const Student = require("../models/Student");

/**
 * Build a structured room grid with column-wise sequential seat numbering
 * @param {string} roomNumber
 * @param {string} block
 * @param {string} floor
 * @param {string} academicYear
 * @param {number} totalRows
 * @param {number[]} columnCapacities array of capacities per column, e.g. [5, 4, 5, 4, 5]
 * @param {Array} existingSeats optional existing seat allocations to preserve
 */
const buildRoomGrid = (
  roomNumber,
  block = "A Block",
  floor = "Ground Floor",
  academicYear = "All Years",
  totalRows = 5,
  columnCapacities = [5, 5, 5, 5, 5],
  existingSeats = []
) => {
  const numCols = columnCapacities.length > 0 ? columnCapacities.length : 5;
  const numRows = Math.max(
    Number(totalRows) || 0,
    ...columnCapacities.map((c) => Number(c) || 0),
    1
  );

  // Map of existing allocations by hallTicketNumber or benchNumber
  const existingMap = new Map();
  if (Array.isArray(existingSeats)) {
    for (const s of existingSeats) {
      if (s.hallTicketNumber) {
        existingMap.set(`C${s.columnNumber}-R${s.rowNumber}`, s);
      }
    }
  }

  // Column-wise sequential seat numbering:
  // Col 1: Seat 1, 2, ..., C1
  // Col 2: Seat C1+1, ..., C1+C2
  // etc.
  let seatCounter = 1;
  const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(null));

  for (let c = 0; c < numCols; c++) {
    const colCapacity = Number(columnCapacities[c]) || 0;
    for (let r = 0; r < numRows; r++) {
      const benchStr = `B${String(r + 1).padStart(2, "0")}`;
      const colNum = c + 1;
      const rowNum = r + 1;

      if (r < colCapacity) {
        const seatNum = seatCounter++;
        const seatLabel = `C${colNum}-${benchStr} (Seat ${seatNum})`;
        const key = `C${colNum}-R${rowNum}`;
        const existing = existingMap.get(key);

        matrix[r][c] = {
          seatNumber: seatNum,
          columnNumber: colNum,
          rowNumber: rowNum,
          benchNumber: benchStr,
          seatLabel,
          isActive: true,
          hallTicketNumber: existing ? existing.hallTicketNumber : null,
          studentName: existing ? existing.studentName : "",
          branch: existing ? existing.branch : "",
          academicYear: existing ? existing.academicYear : "",
          subject: existing ? existing.subject : [],
        };
      } else {
        // Inactive seat (e.g. aisle, corridor, or shorter column)
        matrix[r][c] = {
          seatNumber: 0,
          columnNumber: colNum,
          rowNumber: rowNum,
          benchNumber: benchStr,
          seatLabel: "",
          isActive: false,
          hallTicketNumber: null,
          studentName: "",
          branch: "",
          academicYear: "",
          subject: [],
        };
      }
    }
  }

  const rows = [];
  for (let r = 0; r < numRows; r++) {
    rows.push({
      rowNumber: r + 1,
      columns: numCols,
      seats: matrix[r],
    });
  }

  return {
    roomNumber: String(roomNumber).trim(),
    block: block || "A Block",
    floor: floor || "Ground Floor",
    academicYear: academicYear || "All Years",
    totalRows: numRows,
    columnCapacities: columnCapacities.map((c) => Number(c) || 0),
    rows,
  };
};

// Add one room manually
const addRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, rowCount, columns, columnCapacities, academicYear } = req.body;

    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: "Room number is required",
      });
    }

    const existingRoom = await Room.findOne({ roomNumber: String(roomNumber).trim() });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: `Room "${roomNumber}" already exists`,
      });
    }

    let colCaps = [];
    if (Array.isArray(columnCapacities) && columnCapacities.length > 0) {
      colCaps = columnCapacities.map((c) => Number(c) || 5);
    } else {
      const numCols = Number(columns || 5);
      const numRows = Number(rowCount || 5);
      colCaps = Array(numCols).fill(numRows);
    }

    const roomData = buildRoomGrid(
      roomNumber,
      block,
      floor,
      academicYear || "All Years",
      rowCount || colCaps[0] || 5,
      colCaps
    );

    const room = new Room(roomData);
    await room.save();

    res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created with ${room.totalSeats} seats (column-wise numbered)`,
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all rooms (with optional academicYear and collegeCode filter)
const getRooms = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const collegeCode = req.user?.collegeCode || req.query.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();

    const filter = {
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    };

    if (academicYear && academicYear !== "All Years") {
      filter.$and = [
        {
          $or: [
            { academicYear },
            { academicYear: "All Years" },
            { academicYear: { $exists: false } },
            { "rows.seats.academicYear": academicYear },
          ],
        },
      ];
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });

    const processedRooms = rooms.map((room) => {
      const roomObj = room.toObject ? room.toObject() : room;
      let yearCount = 0;
      let totalOccupied = 0;

      if (Array.isArray(roomObj.rows)) {
        for (const row of roomObj.rows) {
          if (Array.isArray(row.seats)) {
            for (const seat of row.seats) {
              if (seat.isActive !== false && seat.hallTicketNumber) {
                totalOccupied++;
                if (!academicYear || academicYear === "All Years" || seat.academicYear === academicYear) {
                  yearCount++;
                }
              }
            }
          }
        }
      }

      roomObj.yearAllocatedSeats = academicYear && academicYear !== "All Years" ? yearCount : totalOccupied;
      roomObj.yearAvailableSeats = Math.max(0, (roomObj.totalSeats || 25) - roomObj.yearAllocatedSeats);
      roomObj.allocatedSeats = totalOccupied;
      return roomObj;
    });

    res.json({
      success: true,
      totalRooms: processedRooms.length,
      rooms: processedRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Unallocate any students allocated to this room
    await Student.updateMany(
      { $or: [{ room: room._id }, { roomNumber: room.roomNumber }] },
      {
        $set: {
          room: null,
          roomNumber: "",
          block: "",
          floor: "",
          rowNumber: null,
          columnNumber: null,
          seatNumber: null,
          benchNumber: "",
          seatLabel: "",
          allocationStatus: "Pending",
        },
      }
    );

    await Room.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully and assigned students deallocated`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete rooms by Academic Year
const deleteRoomsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    if (!year) {
      return res.status(400).json({ success: false, message: "Year is required" });
    }

    const filter = year === "All Years" ? {} : { academicYear: year };
    const rooms = await Room.find(filter);
    const roomIds = rooms.map((r) => r._id);
    const roomNumbers = rooms.map((r) => r.roomNumber);

    if (roomIds.length > 0) {
      await Student.updateMany(
        { $or: [{ room: { $in: roomIds } }, { roomNumber: { $in: roomNumbers } }] },
        {
          $set: {
            room: null,
            roomNumber: "",
            block: "",
            floor: "",
            rowNumber: null,
            columnNumber: null,
            seatNumber: null,
            benchNumber: "",
            seatLabel: "",
            allocationStatus: "Pending",
          },
        }
      );
    }

    const result = await Room.deleteMany(filter);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} rooms assigned to ${year}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Upload rooms Excel/CSV file:
 * Supports:
 * Format 1: Room Number, Block, Floor, Total Rows, C1, C2, C3, C4, C5, C6, Total Capacity
 * Format 2: Room Number, Block, Floor, Rows, Columns, Academic Year
 */
const uploadRoomsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel or CSV file (.xlsx, .xls, .csv)",
      });
    }

    const selectedYear = req.body.academicYear || "All Years";
    const replaceExisting = req.body.replaceExisting === "true" || req.query.replaceExisting === "true";
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();

    if (replaceExisting) {
      // Clear rooms for this college and reset student room references
      await Student.updateMany(
        { $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }] },
        {
          $set: {
            room: null,
            roomNumber: "",
            block: "",
            floor: "",
            rowNumber: null,
            columnNumber: null,
            seatNumber: null,
            benchNumber: "",
            seatLabel: "",
            allocationStatus: "Pending",
          },
        }
      );
      await Room.deleteMany({
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
    }

    let workbook;
    const isCsv = req.file.originalname.toLowerCase().endsWith(".csv");
    if (isCsv) {
      const csvStr = req.file.buffer.toString("utf8");
      workbook = XLSX.read(csvStr, { type: "string" });
    } else {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file is empty",
      });
    }

    const normalize = (value) =>
      String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

    const getValue = (row, possibleNames) => {
      const key = Object.keys(row).find((name) =>
        possibleNames.includes(normalize(name))
      );
      return key ? row[key] : "";
    };

    let savedCount = 0;

    for (const row of data) {
      const roomNumber = String(
        getValue(row, ["roomnumber", "roomno", "room", "roomid"])
      ).trim();

      if (!roomNumber) continue;

      const block =
        String(getValue(row, ["block", "blockname", "building"])).trim() || "A Block";
      const floor =
        String(getValue(row, ["floor", "floorname", "level"])).trim() || "Ground Floor";
      const academicYear =
        String(getValue(row, ["academicyear", "year", "targetyear"])).trim() || selectedYear;
      const totalRowsVal = Number(
        getValue(row, ["totalrows", "rows", "rowcount", "benches"])
      );

      // Check for column capacities C1, C2, C3, C4, C5, C6...
      const colCaps = [];
      const colKeys = Object.keys(row)
        .filter((k) => /^c\d+$/i.test(k.trim()) || /^col\d+$/i.test(k.trim()))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

      for (const ck of colKeys) {
        const val = Number(row[ck]);
        if (!isNaN(val) && val > 0) {
          colCaps.push(val);
        }
      }

      // If no C1..Cn keys found, check for standard "columns" field
      if (colCaps.length === 0) {
        const colsVal = Number(
          getValue(row, ["columns", "column", "columncount", "seats", "seatcount"])
        );
        const numCols = colsVal > 0 ? colsVal : 5;
        const numRows = totalRowsVal > 0 ? totalRowsVal : 5;
        for (let i = 0; i < numCols; i++) {
          colCaps.push(numRows);
        }
      }

      const totalRows = totalRowsVal > 0 ? totalRowsVal : Math.max(...colCaps, 5);

      const roomData = buildRoomGrid(
        roomNumber,
        block,
        floor,
        academicYear,
        totalRows,
        colCaps
      );
      roomData.collegeCode = cleanCollege;

      let room = await Room.findOne({
        roomNumber,
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });

      if (room) {
        room.block = roomData.block;
        room.floor = roomData.floor;
        room.academicYear = roomData.academicYear;
        room.totalRows = roomData.totalRows;
        room.columnCapacities = roomData.columnCapacities;
        room.rows = roomData.rows;
        room.collegeCode = cleanCollege;
      } else {
        room = new Room(roomData);
      }

      await room.save();
      savedCount++;
    }

    res.status(200).json({
      success: true,
      message: replaceExisting
        ? `Replaced existing rooms and uploaded ${savedCount} examination rooms successfully!`
        : `Uploaded and parsed ${savedCount} examination rooms with column-wise seat numbering!`,
      totalRooms: savedCount,
    });
  } catch (error) {
    console.error("Rooms Excel Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 1-Click Seed the 40 Rooms dataset provided by user
 */
const seed40Rooms = async (req, res) => {
  try {
    const csvPath = path.join(__dirname, "../data/rooms_40.csv");
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ success: false, message: "Rooms dataset not found" });
    }

    const csvStr = fs.readFileSync(csvPath, "utf8");
    const workbook = XLSX.read(csvStr, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let count = 0;
    for (const row of data) {
      const roomNumber = String(row["Room Number"] || "").trim();
      if (!roomNumber) continue;

      const block = String(row["Block"] || "A Block").trim();
      const floor = String(row["Floor"] || "Ground Floor").trim();
      const totalRows = Number(row["Total Rows"] || 5);

      const colCaps = [];
      for (let i = 1; i <= 6; i++) {
        const val = Number(row[`C${i}`]);
        if (!isNaN(val) && val > 0) {
          colCaps.push(val);
        }
      }

      const roomData = buildRoomGrid(
        roomNumber,
        block,
        floor,
        "All Years",
        totalRows,
        colCaps.length > 0 ? colCaps : [5, 5, 5, 5, 5]
      );

      let room = await Room.findOne({ roomNumber });
      if (room) {
        room.block = roomData.block;
        room.floor = roomData.floor;
        room.totalRows = roomData.totalRows;
        room.columnCapacities = roomData.columnCapacities;
        room.rows = roomData.rows;
      } else {
        room = new Room(roomData);
      }
      await room.save();
      count++;
    }

    res.json({
      success: true,
      message: `Successfully seeded ${count} examination rooms across A, B, C, D Blocks!`,
      count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download sample rooms Excel template
const downloadRoomsTemplate = (req, res) => {
  try {
    const templatePath = path.join(__dirname, "../templates/rooms_template.xlsx");
    if (fs.existsSync(templatePath)) {
      return res.download(templatePath, "rooms_template.xlsx");
    }

    // Dynamic generation fallback
    const sampleRooms = [
      {
        "Room Number": "101",
        Block: "A Block",
        Floor: "Ground Floor",
        "Total Rows": 5,
        C1: 5,
        C2: 5,
        C3: 5,
        C4: 5,
        C5: 5,
        C6: 0,
        "Total Capacity": 25,
      },
      {
        "Room Number": "102",
        Block: "A Block",
        Floor: "Ground Floor",
        "Total Rows": 6,
        C1: 4,
        C2: 4,
        C3: 4,
        C4: 4,
        C5: 4,
        C6: 5,
        "Total Capacity": 25,
      },
      {
        "Room Number": "105",
        Block: "A Block",
        Floor: "Ground Floor",
        "Total Rows": 5,
        C1: 5,
        C2: 4,
        C3: 5,
        C4: 4,
        C5: 5,
        C6: 0,
        "Total Capacity": 23,
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleRooms);
    XLSX.utils.book_append_sheet(wb, ws, "RoomsTemplate");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=rooms_template.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Error generating template: " + error.message);
  }
};

/**
 * Check if rooms exist in the database (for upload confirmation popup)
 */
const checkRoomsStatus = async (req, res) => {
  try {
    const collegeCode = req.user?.collegeCode || req.query.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();
    const count = await Room.countDocuments({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });
    res.json({
      success: true,
      exists: count > 0,
      count,
      message:
        count > 0
          ? `${count} examination rooms are already configured in the database.`
          : "No examination rooms uploaded yet.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Auto-Expand Rooms to match total students (unlimited rooms, no 40 rooms limit)
 */
const autoExpandRooms = async (req, res) => {
  try {
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();

    const totalStudents = await Student.countDocuments({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });

    const existingRooms = await Room.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });
    const currentSeats = existingRooms.reduce((sum, r) => sum + (r.totalSeats || 0), 0);

    const neededSeats = Math.max(0, totalStudents - currentSeats);
    const targetSeats = req.body.targetSeats
      ? Number(req.body.targetSeats)
      : neededSeats > 0
      ? neededSeats
      : 700;

    const { generateUnlimitedRooms } = require("../services/dummyDataGenerator");
    const newRooms = generateUnlimitedRooms(
      targetSeats,
      cleanCollege,
      req.body.academicYear || "All Years"
    );

    let added = 0;
    for (const rData of newRooms) {
      const exists = await Room.findOne({
        roomNumber: rData.roomNumber,
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
      if (!exists) {
        await Room.create(rData);
        added++;
      }
    }

    const allRooms = await Room.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    }).sort({ roomNumber: 1 });
    const totalNewSeats = allRooms.reduce((sum, r) => sum + (r.totalSeats || 0), 0);

    res.json({
      success: true,
      message: `Expanded rooms by ${added} halls! Total examination rooms: ${allRooms.length}, Total seating capacity: ${totalNewSeats}. Accommodates all ${totalStudents} students!`,
      addedCount: added,
      totalRooms: allRooms.length,
      totalSeats: totalNewSeats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 1-Click Seed Unlimited Rooms (Default: 110 examination rooms = 2,750 seats)
 */
const seedUnlimitedRooms = async (req, res) => {
  try {
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();
    const { generateUnlimitedRooms } = require("../services/dummyDataGenerator");

    // Generate 110 rooms (2,750 seats) across Blocks A, B, C, D
    const rooms = generateUnlimitedRooms(2750, cleanCollege, "All Years");

    let count = 0;
    for (const rData of rooms) {
      let room = await Room.findOne({
        roomNumber: rData.roomNumber,
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
      if (room) {
        room.block = rData.block;
        room.floor = rData.floor;
        room.totalRows = rData.totalRows;
        room.columnCapacities = rData.columnCapacities;
        room.rows = rData.rows;
        room.collegeCode = cleanCollege;
      } else {
        room = new Room(rData);
      }
      await room.save();
      count++;
    }

    res.json({
      success: true,
      message: `Successfully configured ${count} examination halls across Blocks A, B, C, D (Total: ${count * 25} column-wise seats)!`,
      count,
      totalSeats: count * 25,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  buildRoomGrid,
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
};
