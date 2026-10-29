const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// The 27 names provided for CSE, ECE, EEE, MEC, CIV
const commonNames = [
  "Aarav Sen", "Venu Devi", "Rohan Krishna", "Ananya Shetty", "Priya Das",
  "Sai Verma", "Keerthana Gowda", "Nikhil Lakshmi", "Divya Kumar", "Harsha Sen",
  "Meghana Devi", "Pranav Krishna", "Sravani Shetty", "Manoj Das", "Lakshmi Verma",
  "Karthik Gowda", "Bhavana Lakshmi", "Vamsi Kumar", "Sowmya Sen", "Abhishek Devi",
  "Nandini Krishna", "Charan Shetty", "Harini Das", "Dinesh Verma", "Swathi Gowda",
  "Rohit Lakshmi", "Tejaswi Kumar"
];

// The 27 names provided for AI, CY, DS
const aiNames = [
  "Aarav Sharma", "Venu Rao", "Rohan Patel", "Ananya Prasad", "Priya Singh",
  "Sai Nair", "Keerthana Raju", "Nikhil Mohan", "Divya Joshi", "Harsha Sharma",
  "Meghana Rao", "Pranav Patel", "Sravani Prasad", "Manoj Singh", "Lakshmi Nair",
  "Karthik Raju", "Bhavana Mohan", "Vamsi Joshi", "Sowmya Sharma", "Abhishek Rao",
  "Nandini Patel", "Charan Prasad", "Harini Singh", "Dinesh Nair", "Swathi Raju",
  "Rohit Mohan", "Tejaswi Joshi"
];

const branchesConfig = [
  {
    prefix: "HT2026CSE",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Data Structures, Operating Systems",
    names: commonNames,
  },
  {
    prefix: "HT2026AI",
    branch: "Computer Science & Artificial Intelligence (CSE-AI)",
    subject: "Machine Learning, Deep Neural Networks",
    names: aiNames,
  },
  {
    prefix: "HT2026CY",
    branch: "Cyber Security",
    subject: "Network Security, Cryptography",
    names: aiNames,
  },
  {
    prefix: "HT2026DS",
    branch: "Data Sciences",
    subject: "Statistics, Data Analytics",
    names: aiNames,
  },
  {
    prefix: "HT2026ECE",
    branch: "Electronics & Communication Engineering (ECE)",
    subject: "Digital Logic Design, Signals & Systems",
    names: commonNames,
  },
  {
    prefix: "HT2026EEE",
    branch: "Electrical & Electronics Engineering (EEE)",
    subject: "Electrical Circuits, Electrical Machines",
    names: commonNames,
  },
  {
    prefix: "HT2026MEC",
    branch: "Mechanical Engineering",
    subject: "Engineering Mechanics, Engineering Graphics",
    names: commonNames,
  },
  {
    prefix: "HT2026CIV",
    branch: "Civil Engineering",
    subject: "Building Materials, Surveying",
    names: commonNames,
  },
];

const allStudents = [];
for (const config of branchesConfig) {
  for (let i = 1; i <= 85; i++) {
    const ticket = `${config.prefix}${String(i).padStart(3, "0")}`;
    const nameIndex = (i - 1) % config.names.length;
    const name = config.names[nameIndex];
    allStudents.push({
      "Hall Ticket Number": ticket,
      "Student Name": name,
      "Academic Year": "1st Year",
      "Branch": config.branch,
      "Subject": config.subject,
    });
  }
}

console.log(`Generated ${allStudents.length} student records.`);

// Write CSV
const csvHeader = "Hall Ticket Number,Student Name,Academic Year,Branch,Subject\n";
const csvRows = allStudents.map(
  (s) =>
    `"${s["Hall Ticket Number"]}","${s["Student Name"]}","${s["Academic Year"]}","${s["Branch"]}","${s["Subject"]}"`
);
const csvContent = csvHeader + csvRows.join("\n") + "\n";

fs.writeFileSync(path.join(__dirname, "../data/students_680.csv"), csvContent);
fs.writeFileSync(path.join(__dirname, "../data/students_680.json"), JSON.stringify(allStudents, null, 2));

// Generate students template xlsx
const studentsWb = XLSX.utils.book_new();
const studentsWs = XLSX.utils.json_to_sheet(allStudents);
XLSX.utils.book_append_sheet(studentsWb, studentsWs, "Students");
XLSX.writeFile(studentsWb, path.join(__dirname, "../templates/students_template.xlsx"));
fs.writeFileSync(path.join(__dirname, "../templates/students_template.csv"), csvContent);

// Generate rooms template xlsx
const roomsCsvPath = path.join(__dirname, "../data/rooms_40.csv");
const roomsCsvContent = fs.readFileSync(roomsCsvPath, "utf8");
const roomsWb = XLSX.read(roomsCsvContent, { type: "string" });
XLSX.writeFile(roomsWb, path.join(__dirname, "../templates/rooms_template.xlsx"));
fs.writeFileSync(path.join(__dirname, "../templates/rooms_template.csv"), roomsCsvContent);

console.log("Successfully generated all dataset and template files!");
