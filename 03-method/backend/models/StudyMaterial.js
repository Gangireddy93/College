const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "All Years"],
      default: "1st Year",
    },
    semester: {
      type: String,
      required: true,
      enum: [
        "Semester 1",
        "Semester 2",
        "Semester 3",
        "Semester 4",
        "Semester 5",
        "Semester 6",
        "Semester 7",
        "Semester 8",
      ],
      default: "Semester 1",
    },
    branch: {
      type: String,
      required: true,
      default: "All Branches",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    materialType: {
      type: String,
      enum: [
        "Lecture Notes",
        "Question Bank",
        "Lab Manual",
        "Previous Question Papers (PYQ)",
        "Syllabus & Curriculum",
      ],
      default: "Lecture Notes",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    fileSize: {
      type: String,
      default: "3.5 MB",
    },
    downloads: {
      type: Number,
      default: 0,
    },
    collegeCode: {
      type: String,
      default: "GIT",
      uppercase: true,
    },
    uploadedBy: {
      type: String,
      default: "Faculty / Examination Department",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
