const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Student = require("../models/Student");
const Room = require("../models/Room");
const { allocateSeatsColumnWise, normalizeBranch } = require("../services/allocationService");

// Standard branches supported
const ALL_BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Computer Science & Artificial Intelligence (CSE-AI)",
  "Cyber Security",
  "Data Sciences",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
];

// Helper to normalize Excel column names
const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Get a value using alternative column names
const getValue = (row, possibleNames) => {
  const key = Object.keys(row).find((column) =>
    possibleNames.includes(normalize(column))
  );
  return key ? row[key] : "";
};

// Convert subject text into an array
const parseSubjects = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  return String(value)
    .split(/[,;|]/)
    .map((subject) => subject.trim())
    .filter(Boolean);
};

// Convert date or Excel serial into clean readable date string
const parseExamDate = (value) => {
  if (!value) return "";
  if (typeof value === "number") {
    // Excel date serial number (days since 1900-01-01)
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }
  return String(value).trim();
};

// Normalize academic year across all variations (e.g. "2", "2nd", "II Year", "2nd Year")
const normalizeAcademicYear = (val) => {
  if (!val) return "1st Year";
  const s = String(val).trim().toLowerCase();
  if (s.includes("1") || s.includes("first") || s === "i" || s.startsWith("1")) return "1st Year";
  if (s.includes("2") || s.includes("second") || s === "ii" || s.startsWith("2")) return "2nd Year";
  if (s.includes("3") || s.includes("third") || s === "iii" || s.startsWith("3")) return "3rd Year";
  if (s.includes("4") || s.includes("fourth") || s === "iv" || s.startsWith("4")) return "4th Year";
  return String(val).trim();
};

// Recalculate room capacity
const recalculateRoom = (room) => {
  room.totalSeats = room.rows.reduce(
    (total, row) =>
      total + row.seats.filter((seat) => seat.isActive !== false).length,
    0
  );
  room.allocatedSeats = room.rows.reduce(
    (total, row) =>
      total +
      row.seats.filter(
        (seat) =>
          seat.isActive !== false &&
          seat.hallTicketNumber !== null &&
          seat.hallTicketNumber !== ""
      ).length,
    0
  );
  room.availableSeats = Math.max(0, room.totalSeats - room.allocatedSeats);
};

/**
 * Upload students Excel file and run automatic column-wise allocation
 */
const uploadStudentsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file (.xlsx or .xls)",
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

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: "Excel or CSV file contains no student records",
      });
    }

    const reqYear = req.body.academicYear && req.body.academicYear !== "All Years" ? normalizeAcademicYear(req.body.academicYear) : "";
    const parsedStudents = [];
    const seenTickets = new Set();

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const rawTicket = String(
        getValue(row, ["hallticketnumber", "hallticketno", "hallticket", "htno", "rollno"])
      ).trim();
      const studentName = String(
        getValue(row, ["studentname", "name", "fullname", "student"])
      ).trim();

      if (!rawTicket || !studentName) {
        continue; // skip empty rows
      }

      // Skip summary rows at bottom of file (e.g. "Branch,Student Count", "TOTAL,680")
      const lowerTicket = rawTicket.toLowerCase();
      const lowerName = studentName.toLowerCase();
      if (
        lowerTicket.includes("total") ||
        lowerTicket.includes("branch") ||
        lowerTicket.includes("student count") ||
        lowerName.includes("count") ||
        lowerName.includes("total")
      ) {
        continue;
      }
      const fileYear = getValue(row, ["academicyear", "year", "class", "batch", "semester"]);
      const academicYear = reqYear || (fileYear ? normalizeAcademicYear(fileYear) : "1st Year");
      const branchRaw = String(
        getValue(row, ["branch", "department", "stream", "specialization"])
      ).trim() || "Computer Science & Engineering (CSE)";
      const branch = normalizeBranch(branchRaw);
      const subjects = parseSubjects(
        getValue(row, ["subject", "subjects", "examsubject", "papers"])
      );
      const examSession = String(
        getValue(row, ["examsession", "session", "time"])
      ).trim() || "FN (Forenoon)";
      const examDateRaw = getValue(row, ["examdate", "date", "examinationdate", "testdate", "schedule"]);
      const examDate = parseExamDate(examDateRaw);

      const normalizedTicket = rawTicket.toUpperCase();
      if (seenTickets.has(normalizedTicket)) {
        continue; // skip duplicate in same file
      }
      seenTickets.add(normalizedTicket);

      parsedStudents.push({
        hallTicketNumber: normalizedTicket,
        studentName,
        academicYear,
        branch,
        subject: subjects.length > 0 ? subjects : ["Engineering Mathematics", "Communicative English"],
        examSession,
        examDate,
        allocationStatus: "Pending",
      });
    }

    if (parsedStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid student records found in file",
      });
    }

    // Check if replaceExisting is set
    const replaceExisting = req.body.replaceExisting === "true" || req.query.replaceExisting === "true";
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();
    const targetYear = reqYear || (parsedStudents[0] ? parsedStudents[0].academicYear : "1st Year");

    if (replaceExisting && targetYear) {
      // Delete existing students for this academic year
      await Student.deleteMany({
        academicYear: targetYear,
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });

      // Clear room seats for this academic year
      const roomsToClear = await Room.find({
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });

      for (const room of roomsToClear) {
        let mod = false;
        for (const row of room.rows) {
          for (const seat of row.seats) {
            if (seat.academicYear === targetYear) {
              seat.hallTicketNumber = null;
              seat.studentName = "";
              seat.branch = "";
              seat.academicYear = "";
              seat.examDate = "";
              seat.subject = [];
              mod = true;
            }
          }
        }
        if (mod) {
          recalculateRoom(room);
          await room.save();
        }
      }
    }

    // Save or update students in database
    const savedStudents = [];
    const uploadedTickets = new Set(parsedStudents.map((s) => s.hallTicketNumber));

    for (const sData of parsedStudents) {
      let student = await Student.findOne({
        hallTicketNumber: sData.hallTicketNumber,
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
      if (student) {
        student.studentName = sData.studentName;
        student.academicYear = sData.academicYear;
        student.branch = sData.branch;
        student.subject = sData.subject;
        student.examSession = sData.examSession;
        student.collegeCode = cleanCollege;
        if (sData.examDate) student.examDate = sData.examDate;
        student.allocationStatus = "Pending";
      } else {
        student = new Student({ ...sData, collegeCode: cleanCollege });
      }
      await student.save();
      savedStudents.push(student);
    }

    // Clear any previous room seat assignments for these uploaded students so fresh allocation applies
    const rooms = await Room.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    }).sort({ roomNumber: 1 });

    for (const room of rooms) {
      let modified = false;
      for (const row of room.rows) {
        for (const seat of row.seats) {
          if (seat.hallTicketNumber && uploadedTickets.has(seat.hallTicketNumber)) {
            seat.hallTicketNumber = null;
            seat.studentName = "";
            seat.branch = "";
            seat.academicYear = "";
            seat.examDate = "";
            seat.subject = [];
            modified = true;
          }
        }
      }
      if (modified) {
        recalculateRoom(room);
        await room.save();
      }
    }

    // Check available seats across existing rooms
    const currentAvailableSeats = rooms.reduce((sum, r) => sum + (r.availableSeats || 0), 0);
    const pendingCount = await Student.countDocuments({
      allocationStatus: "Pending",
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });

    // Auto-increase rooms dynamically if available seats are fewer than pending students
    if (currentAvailableSeats < pendingCount) {
      const { generateUnlimitedRooms } = require("../services/dummyDataGenerator");
      const neededExtraSeats = pendingCount - currentAvailableSeats;
      const extraRooms = generateUnlimitedRooms(neededExtraSeats, cleanCollege, "All Years");

      for (const rData of extraRooms) {
        const exists = await Room.findOne({
          roomNumber: rData.roomNumber,
          $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
        });
        if (!exists) {
          const created = await Room.create(rData);
          rooms.push(created);
        }
      }
    }

    // Now automatically allocate seats using anti-cheating column-wise engine
    let allocationSummary = null;

    if (rooms.length > 0) {
      const allPendingStudents = await Student.find({
        allocationStatus: "Pending",
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
      const result = allocateSeatsColumnWise(allPendingStudents, rooms);

      for (const r of result.updatedRooms) {
        recalculateRoom(r);
        await r.save();
      }

      for (const s of result.updatedStudents) {
        await s.save();
      }

      allocationSummary = {
        totalAllocated: result.allocatedCount,
        totalPending: result.pendingCount,
      };
    }

    res.status(200).json({
      success: true,
      message: replaceExisting
        ? `Replaced existing data for ${targetYear}! Uploaded ${savedStudents.length} students. Automatic seat allocation executed.`
        : `Uploaded ${savedStudents.length} students for ${targetYear}. Automatic seat allocation executed.`,
      uploadedCount: savedStudents.length,
      allocationSummary,
    });
  } catch (error) {
    console.error("Student Excel Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Run allocation algorithm manually (e.g. for specific year or all years)
 * Auto-expands rooms if capacity is insufficient
 */
const runAllocation = async (req, res) => {
  try {
    const { academicYear } = req.body;
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();

    const studentFilter = {
      allocationStatus: "Pending",
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    };

    if (academicYear && academicYear !== "All Years") {
      studentFilter.academicYear = normalizeAcademicYear(academicYear);
    }

    const students = await Student.find(studentFilter);
    if (students.length === 0) {
      const anyTotal = await Student.countDocuments({
        ...(studentFilter.academicYear ? { academicYear: studentFilter.academicYear } : {}),
        $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      });
      return res.json({
        success: true,
        message:
          anyTotal > 0
            ? `All students for ${academicYear || "All Years"} are already allocated! No pending students.`
            : `No student records found to allocate. Please upload a student Excel or CSV file first.`,
        allocatedCount: 0,
      });
    }

    // Get rooms for this college
    let rooms = await Room.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    }).sort({ roomNumber: 1 });

    // Calculate total available seats in current rooms
    const currentAvailableSeats = rooms.reduce((sum, r) => sum + (r.availableSeats || 0), 0);

    // If available room seats < students, AUTO-EXPAND ROOMS so that 100% of students get seated!
    if (currentAvailableSeats < students.length) {
      const { generateUnlimitedRooms } = require("../services/dummyDataGenerator");
      const neededSeats = students.length - currentAvailableSeats;
      const extraRooms = generateUnlimitedRooms(neededSeats, cleanCollege, "All Years");

      for (const rData of extraRooms) {
        const exists = await Room.findOne({
          roomNumber: rData.roomNumber,
          $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
        });
        if (!exists) {
          const created = await Room.create(rData);
          rooms.push(created);
        }
      }
    }

    if (rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rooms available for allocation. Please add or upload rooms first.",
      });
    }

    const result = allocateSeatsColumnWise(students, rooms);

    for (const r of result.updatedRooms) {
      recalculateRoom(r);
      await r.save();
    }

    for (const s of result.updatedStudents) {
      await s.save();
    }

    res.json({
      success: true,
      message: `Allocated ${result.allocatedCount} students successfully into ${rooms.length} examination halls using column-wise anti-cheat algorithm!`,
      allocatedCount: result.allocatedCount,
      pendingCount: result.pendingCount,
      totalRoomsUsed: rooms.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reset / Deallocate students (optionally by academic year)
 */
const resetAllocation = async (req, res) => {
  try {
    const { academicYear } = req.body;
    const filter = {};
    if (academicYear && academicYear !== "All Years") {
      filter.academicYear = academicYear;
    }

    // Reset student fields
    await Student.updateMany(filter, {
      $set: {
        room: null,
        roomNumber: "",
        block: "",
        floor: "",
        rowNumber: null,
        seatNumber: null,
        benchNumber: "",
        seatLabel: "",
        allocationStatus: "Pending",
      },
    });

    // Clear matching room seats
    const rooms = await Room.find();
    for (const room of rooms) {
      for (const row of room.rows) {
        for (const seat of row.seats) {
          if (filter.academicYear) {
            if (seat.academicYear === filter.academicYear) {
              seat.hallTicketNumber = null;
              seat.studentName = "";
              seat.branch = "";
              seat.academicYear = "";
              seat.subject = [];
            }
          } else {
            seat.hallTicketNumber = null;
            seat.studentName = "";
            seat.branch = "";
            seat.academicYear = "";
            seat.subject = [];
          }
        }
      }
      recalculateRoom(room);
      await room.save();
    }

    res.json({
      success: true,
      message: `Allocations cleared successfully${academicYear && academicYear !== "All Years" ? ` for ${academicYear}` : ""}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get students list with filters & pagination
 */
const getStudents = async (req, res) => {
  try {
    const {
      academicYear,
      room,
      branch,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (academicYear && academicYear !== "All Years") {
      query.academicYear = academicYear;
    }

    if (room && room !== "All Rooms") {
      query.roomNumber = room;
    }

    if (branch && branch !== "All Branches") {
      query.branch = branch;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { hallTicketNumber: { $regex: q, $options: "i" } },
        { studentName: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalStudents = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate("room", "roomNumber block floor")
      .sort({ hallTicketNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      totalStudents,
      currentPage: pageNum,
      totalPages: Math.ceil(totalStudents / limitNum) || 1,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Search student by Hall Ticket Number (Public Portal)
 */
const searchStudent = async (req, res) => {
  try {
    const rawInput = String(req.params.hallTicketNumber).trim();
    const cleanInput = rawInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. Exact match (case-insensitive)
    let student = await Student.findOne({
      hallTicketNumber: {
        $regex: `^${cleanInput}$`,
        $options: "i",
      },
    }).populate("room");

    // 2. Flexible fallback if student typed e.g. HT2026001 or 2026001 instead of HT2026CSE001
    if (!student) {
      const orConditions = [];

      // Check if format matches year + optional branch + sequence (e.g., HT2026001, 2026001, HT2026CSE001)
      const parsedMatch = rawInput.match(/^(?:HT)?(20\d{2})([A-Za-z]*)(\d+)$/i);
      if (parsedMatch) {
        const year = parsedMatch[1];
        const branchCode = parsedMatch[2];
        const seq = parsedMatch[3].padStart(3, "0");

        if (branchCode) {
          // If branch code was given, match that branch
          orConditions.push({
            hallTicketNumber: { $regex: `^HT?${year}.*${branchCode}.*${seq}$`, $options: "i" },
          });
        } else {
          // No branch code given (e.g. HT2026001) - match any branch with this year and roll number
          orConditions.push({
            hallTicketNumber: { $regex: `^HT?${year}.*${seq}$`, $options: "i" },
          });
        }
      }

      // Roll number suffix fallback (e.g. searching "001" or "1")
      const suffixMatch = rawInput.match(/(\d+)$/);
      if (suffixMatch) {
        const seqNum = suffixMatch[1].padStart(3, "0");
        orConditions.push({
          hallTicketNumber: { $regex: `${seqNum}$`, $options: "i" },
        });
      }

      // Stripped alphanumeric fallback
      const cleanAlpha = rawInput.replace(/[^a-zA-Z0-9]/g, "");
      if (cleanAlpha && cleanAlpha.length >= 3) {
        orConditions.push({
          hallTicketNumber: { $regex: cleanAlpha, $options: "i" },
        });
      }

      if (orConditions.length > 0) {
        student = await Student.findOne({ $or: orConditions }).populate("room");
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with Hall Ticket Number: "${rawInput}"`,
      });
    }

    // Also fetch the full room layout for the student's room so the frontend can render the floor map
    let roomDetails = null;
    if (student.room) {
      roomDetails = await Room.findById(student.room._id || student.room);
    } else if (student.roomNumber) {
      roomDetails = await Room.findOne({ roomNumber: student.roomNumber });
    }

    res.json({
      success: true,
      student,
      roomDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add single student manually
 */
const addStudent = async (req, res) => {
  try {
    const {
      hallTicketNumber,
      studentName,
      academicYear,
      branch,
      subject,
      examSession,
    } = req.body;

    if (!hallTicketNumber || !studentName) {
      return res.status(400).json({
        success: false,
        message: "Hall Ticket Number and Student Name are required",
      });
    }

    const normalizedTicket = String(hallTicketNumber).trim().toUpperCase();
    const existing = await Student.findOne({ hallTicketNumber: normalizedTicket });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with Hall Ticket Number ${normalizedTicket} already exists`,
      });
    }

    const student = new Student({
      hallTicketNumber: normalizedTicket,
      studentName: String(studentName).trim(),
      academicYear: academicYear || "1st Year",
      branch: branch || "Computer Science & Engineering (CSE)",
      subject: parseSubjects(subject),
      examSession: examSession || "FN (Forenoon)",
      allocationStatus: "Pending",
    });

    await student.save();

    // Auto-allocate this student if rooms available
    const rooms = await Room.find().sort({ roomNumber: 1 });
    if (rooms.length > 0) {
      const result = allocateSeatsColumnWise([student], rooms);
      for (const r of result.updatedRooms) {
        recalculateRoom(r);
        await r.save();
      }
      for (const s of result.updatedStudents) {
        await s.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a student
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Clear seat in room if allocated
    if (student.roomNumber) {
      const room = await Room.findOne({ roomNumber: student.roomNumber });
      if (room) {
        for (const row of room.rows) {
          for (const seat of row.seats) {
            if (seat.hallTicketNumber === student.hallTicketNumber) {
              seat.hallTicketNumber = null;
              seat.studentName = "";
              seat.branch = "";
              seat.academicYear = "";
              seat.subject = [];
            }
          }
        }
        recalculateRoom(room);
        await room.save();
      }
    }

    await Student.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Student ${student.hallTicketNumber} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete students year-wise
 */
const deleteStudentsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    if (!year) {
      return res.status(400).json({ success: false, message: "Year is required" });
    }

    const students = await Student.find({ academicYear: year });
    const tickets = new Set(students.map((s) => s.hallTicketNumber));

    // Clear room seats for these students
    const rooms = await Room.find();
    for (const room of rooms) {
      let modified = false;
      for (const row of room.rows) {
        for (const seat of row.seats) {
          if (seat.hallTicketNumber && tickets.has(seat.hallTicketNumber)) {
            seat.hallTicketNumber = null;
            seat.studentName = "";
            seat.branch = "";
            seat.academicYear = "";
            seat.subject = [];
            modified = true;
          }
        }
      }
      if (modified) {
        recalculateRoom(room);
        await room.save();
      }
    }

    const deleteResult = await Student.deleteMany({ academicYear: year });

    res.json({
      success: true,
      message: `Deleted ${deleteResult.deletedCount} students for academic year: ${year}`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Download sample student Excel template
 */
const downloadStudentsTemplate = (req, res) => {
  try {
    const templatePath = path.join(__dirname, "../templates/students_template.xlsx");
    if (fs.existsSync(templatePath)) {
      return res.download(templatePath, "students_template.xlsx");
    }

    const sampleStudents = [
      {
        "Hall Ticket Number": "HT2026001",
        "Student Name": "Aarav Kumar",
        "Academic Year": "1st Year",
        "Branch": "CSE-AI",
        "Subject": "Communicative English, Engineering Mathematics",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026002",
        "Student Name": "Venu Kumar",
        "Academic Year": "1st Year",
        "Branch": "Electronics & Communication (ECE)",
        "Subject": "Network Analysis, Electronic Devices",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026003",
        "Student Name": "Priya Sharma",
        "Academic Year": "1st Year",
        "Branch": "Computer Science & Engineering (CSE)",
        "Subject": "Python Programming, Discrete Mathematics",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026004",
        "Student Name": "Rahul Verma",
        "Academic Year": "1st Year",
        "Branch": "Data Sciences",
        "Subject": "Data Science Foundations, Probability & Statistics",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026005",
        "Student Name": "Sneha Reddy",
        "Academic Year": "1st Year",
        "Branch": "Cyber Security",
        "Subject": "Cyber Security Basics, Computer Networks",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026006",
        "Student Name": "Kiran Patel",
        "Academic Year": "1st Year",
        "Branch": "Electrical & Electronics (EEE)",
        "Subject": "Electric Circuits, Power Systems",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026007",
        "Student Name": "Ajay Singh",
        "Academic Year": "1st Year",
        "Branch": "Mechanical",
        "Subject": "Thermodynamics, Engineering Mechanics",
        "Exam Session": "FN (Forenoon)",
      },
      {
        "Hall Ticket Number": "HT2026008",
        "Student Name": "Divya Rao",
        "Academic Year": "1st Year",
        "Branch": "Civil Engineering",
        "Subject": "Structural Analysis, Fluid Mechanics",
        "Exam Session": "FN (Forenoon)",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students_template.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Seed demo data disabled per user request
 */
const seedDemoData = async (req, res) => {
  res.status(200).json({
    success: false,
    message: "Demo seed has been removed. Upload your official college Excel files directly.",
  });
};

/**
 * Clean database: delete empty student records and empty rooms
 */
const cleanEmptyDataAndRooms = async (req, res) => {
  try {
    // 1. Delete student records with missing or empty hallTicketNumber or name
    const deletedStudents = await Student.deleteMany({
      $or: [
        { hallTicketNumber: { $in: [null, "", undefined] } },
        { studentName: { $in: [null, "", undefined] } },
      ],
    });

    // 2. Delete empty rooms (rooms with 0 allocated students)
    const emptyRooms = await Room.find({ allocatedSeats: 0 });
    const emptyRoomCount = emptyRooms.length;
    await Room.deleteMany({ allocatedSeats: 0 });

    res.json({
      success: true,
      message: `Cleaned database: deleted ${deletedStudents.deletedCount} empty student records and ${emptyRoomCount} empty rooms.`,
      deletedStudentsCount: deletedStudents.deletedCount,
      deletedRoomsCount: emptyRoomCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const isYearFiltered = academicYear && academicYear !== "All Years";
    const studentQuery = isYearFiltered ? { academicYear } : {};

    const totalStudents = await Student.countDocuments(studentQuery);
    const allocatedStudents = await Student.countDocuments({
      ...studentQuery,
      allocationStatus: "Allocated",
    });
    const pendingStudents = await Student.countDocuments({
      ...studentQuery,
      allocationStatus: "Pending",
    });

    const rooms = await Room.find().sort({ roomNumber: 1 });
    const totalRooms = rooms.length;

    // Process each room to compute dynamic student count for the selected year
    const processedRooms = rooms.map((room) => {
      const roomObj = room.toObject();
      let yearCount = 0;
      let totalOccupied = 0;

      if (Array.isArray(roomObj.rows)) {
        for (const row of roomObj.rows) {
          if (Array.isArray(row.seats)) {
            for (const seat of row.seats) {
              if (seat.isActive !== false && seat.hallTicketNumber) {
                totalOccupied++;
                if (!isYearFiltered || seat.academicYear === academicYear) {
                  yearCount++;
                }
              }
            }
          }
        }
      }

      roomObj.yearAllocatedSeats = isYearFiltered ? yearCount : totalOccupied;
      roomObj.yearAvailableSeats = Math.max(0, roomObj.totalSeats - roomObj.yearAllocatedSeats);
      roomObj.allocatedSeats = totalOccupied;
      return roomObj;
    });

    const totalSeats = processedRooms.reduce((sum, r) => sum + r.totalSeats, 0);
    const totalAllocatedSeats = processedRooms.reduce(
      (sum, r) => sum + r.yearAllocatedSeats,
      0
    );
    const totalAvailableSeats = Math.max(0, totalSeats - totalAllocatedSeats);

    const distinctSubjects = await Student.distinct("subject", studentQuery);
    const totalSubjects = distinctSubjects.filter(Boolean).length;

    const yearCounts = {
      "1st Year": await Student.countDocuments({ academicYear: "1st Year" }),
      "2nd Year": await Student.countDocuments({ academicYear: "2nd Year" }),
      "3rd Year": await Student.countDocuments({ academicYear: "3rd Year" }),
      "4th Year": await Student.countDocuments({ academicYear: "4th Year" }),
    };

    const branchCounts = {};
    for (const b of ALL_BRANCHES) {
      branchCounts[b] = await Student.countDocuments({
        ...studentQuery,
        branch: b,
      });
    }

    res.json({
      success: true,
      selectedYear: academicYear || "All Years",
      stats: {
        totalStudents,
        allocatedStudents,
        pendingStudents,
        totalRooms,
        totalSeats,
        totalAllocatedSeats,
        totalAvailableSeats,
        totalSubjects: totalSubjects || 5,
        academicYearsCount: 4,
        yearCounts,
        branchCounts,
      },
      rooms: processedRooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1-Click Seed 680 dataset disabled per user request for clean empty database
 */
const seed680Dataset = async (req, res) => {
  res.status(200).json({
    success: false,
    message: "Seed 680 dataset has been removed. Upload your official college Excel files directly.",
  });
};

/**
 * Completely wipe all student records and rooms for a fresh start
 */
const clearAllData = async (req, res) => {
  try {
    const studentDel = await Student.deleteMany({});
    const roomDel = await Room.deleteMany({});
    res.json({
      success: true,
      message: `Cleared all data successfully: ${studentDel.deletedCount} students and ${roomDel.deletedCount} rooms removed. Database is now completely empty.`,
      deletedStudents: studentDel.deletedCount,
      deletedRooms: roomDel.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check if students exist for a specific academic year (for duplicate upload confirmation modal)
 */
const checkYearStatus = async (req, res) => {
  try {
    const { year } = req.params;
    const collegeCode = req.user?.collegeCode || req.query.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();
    const normYear = normalizeAcademicYear(year);

    const count = await Student.countDocuments({
      academicYear: normYear,
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });

    res.json({
      success: true,
      exists: count > 0,
      count,
      academicYear: normYear,
      message:
        count > 0
          ? `Data for "${normYear}" is already uploaded (${count} student records found in database).`
          : `No student records found for "${normYear}". Ready to upload.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 1-Click Seed All 4 Years Dummy Dataset (680 students x 4 = 2,720 students)
 * Matches the user-provided 8 branches x 85 students structure
 * Automatically sets up 110 examination halls (2,750 seats) so total students == total seats
 * Runs 100% anti-cheat column-wise allocation
 */
const seedAll4Years = async (req, res) => {
  try {
    const collegeCode = req.user?.collegeCode || req.body.collegeCode || "GIT";
    const cleanCollege = String(collegeCode).toUpperCase();
    const {
      generateAll4YearsStudents,
      generateUnlimitedRooms,
    } = require("../services/dummyDataGenerator");

    // 1. Wipe existing data for this college cleanly
    await Student.deleteMany({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });
    await Room.deleteMany({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    });

    // 2. Generate all 4 years (680 students x 4 = 2,720 students)
    const allStudentsData = generateAll4YearsStudents(cleanCollege);
    const savedStudents = await Student.insertMany(allStudentsData);

    // 3. Generate 110 examination rooms (2,750 seats) across Blocks A, B, C, D
    const allRoomsData = generateUnlimitedRooms(2750, cleanCollege, "All Years");
    const savedRooms = await Room.insertMany(allRoomsData);

    // 4. Execute anti-cheat column-wise allocation across all rooms
    const pendingStudents = await Student.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
      allocationStatus: "Pending",
    });
    const rooms = await Room.find({
      $or: [{ collegeCode: cleanCollege }, { collegeCode: { $exists: false } }],
    }).sort({ roomNumber: 1 });

    const result = allocateSeatsColumnWise(pendingStudents, rooms);

    for (const r of result.updatedRooms) {
      recalculateRoom(r);
      await r.save();
    }
    for (const s of result.updatedStudents) {
      await s.save();
    }

    res.json({
      success: true,
      message: `Successfully seeded all 4 academic years (2,720 students) and 110 examination halls (2,750 seats) with 100% column-wise anti-cheat allocation!`,
      totalStudents: savedStudents.length,
      totalRooms: savedRooms.length,
      allocatedCount: result.allocatedCount,
      yearBreakdown: {
        "1st Year": 680,
        "2nd Year": 680,
        "3rd Year": 680,
        "4th Year": 680,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Download sample CSV datasets for testing & instant uploads
 * Supports 1st Year (680), 2nd Year (680), 3rd Year (680), 4th Year (680), All Years (2,720), or Rooms
 */
const downloadSampleCsv = (req, res) => {
  try {
    const { year = "1st Year", type = "students" } = req.query;
    const {
      generateStudentsForYear,
      generateAll4YearsStudents,
      generateUnlimitedRooms,
      convertStudentsToCSV,
      convertRoomsToCSV,
    } = require("../services/dummyDataGenerator");

    if (type === "rooms") {
      const rooms = generateUnlimitedRooms(700, "GIT", "All Years");
      const csv = convertRoomsToCSV(rooms);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="examination_rooms_unlimited.csv"'
      );
      return res.send(csv);
    }

    let students = [];
    let filename = "students_1st_year_680.csv";

    if (year === "All Years") {
      students = generateAll4YearsStudents("GIT");
      filename = "students_all_4_years_2720.csv";
    } else {
      students = generateStudentsForYear(year, 85, "GIT");
      filename = `students_${year.toLowerCase().replace(/\s+/g, "_")}_680.csv`;
    }

    const csv = convertStudentsToCSV(students);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating CSV: " + err.message);
  }
};

module.exports = {
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
};
