const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      default: "",
    },
    tagline: {
      type: String,
      default: "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade by NAAC",
    },
    affiliation: {
      type: String,
      default: "Affiliated to JNTUA • An Autonomous Institution",
    },
    location: {
      type: String,
      default: "Gooty Road, Anantapur, Andhra Pradesh - 515002",
    },
    examTitle: {
      type: String,
      default: "Autonomous Theory End Semester Examinations 2026",
    },
    adminUsername: {
      type: String,
      required: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      default: "Chief Superintendent of Examinations",
    },
    helplinePhone: {
      type: String,
      default: "+91 8554 222333",
    },
    helplineEmail: {
      type: String,
      default: "exams@college.edu",
    },
    primaryColor: {
      type: String,
      default: "#2563eb",
    },
    accentColor: {
      type: String,
      default: "#4f46e5",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", collegeSchema);
