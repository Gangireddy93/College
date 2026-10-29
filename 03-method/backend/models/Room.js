const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
    },
    columnNumber: {
      type: Number,
      default: 1,
    },
    rowNumber: {
      type: Number,
      default: 1,
    },
    benchNumber: {
      type: String,
      default: "",
    },
    seatLabel: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hallTicketNumber: {
      type: String,
      default: null,
    },
    studentName: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    academicYear: {
      type: String,
      default: "",
    },
    examDate: {
      type: String,
      default: "",
    },
    subject: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const rowSchema = new mongoose.Schema(
  {
    rowNumber: {
      type: Number,
      required: true,
    },
    columns: {
      type: Number,
      required: true,
      min: 1,
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
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
    block: {
      type: String,
      default: "A Block",
      trim: true,
    },
    floor: {
      type: String,
      default: "Ground Floor",
      trim: true,
    },
    academicYear: {
      type: String,
      default: "All Years",
      trim: true,
    },
    totalRows: {
      type: Number,
      default: 5,
    },
    columnCapacities: {
      type: [Number],
      default: [5, 5, 5, 5, 5],
    },
    rows: {
      type: [rowSchema],
      default: [],
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    allocatedSeats: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate room capacity and allocated seats automatically
roomSchema.pre("validate", function () {
  this.totalSeats = this.rows.reduce(
    (total, row) =>
      total + row.seats.filter((seat) => seat.isActive !== false).length,
    0
  );

  this.allocatedSeats = this.rows.reduce(
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

  this.availableSeats = Math.max(0, this.totalSeats - this.allocatedSeats);
});

module.exports = mongoose.model("Room", roomSchema);
