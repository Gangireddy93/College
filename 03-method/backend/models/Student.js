const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    hallTicketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    collegeCode: {
      type: String,
      default: "GIT",
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      default: "1st Year",
    },
    subject: {
      type: [String],
      default: [],
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      default: "Computer Science & Engineering (CSE)",
    },
    examSession: {
      type: String,
      default: "FN (Forenoon)",
      trim: true,
    },
    examDate: {
      type: String,
      default: "",
      trim: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    roomNumber: {
      type: String,
      default: "",
    },
    block: {
      type: String,
      default: "",
    },
    floor: {
      type: String,
      default: "",
    },
    rowNumber: {
      type: Number,
      default: null,
    },
    columnNumber: {
      type: Number,
      default: null,
    },
    seatNumber: {
      type: Number,
      default: null,
    },
    benchNumber: {
      type: String,
      default: "",
    },
    seatLabel: {
      type: String,
      default: "",
    },
    allocationStatus: {
      type: String,
      enum: ["Allocated", "Pending"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Student", studentSchema);