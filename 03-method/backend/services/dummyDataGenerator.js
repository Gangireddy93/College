/**
 * Dummy Dataset Generator for All 4 Academic Years & Unlimited Examination Rooms
 * Matches the user-provided 680-student branch specifications (8 branches x 85 students)
 */

const STUDENT_NAMES = [
  "Aarav Sen", "Venu Devi", "Rohan Krishna", "Ananya Shetty", "Priya Das",
  "Sai Verma", "Keerthana Gowda", "Nikhil Lakshmi", "Divya Kumar", "Harsha Sen",
  "Meghana Devi", "Pranav Krishna", "Sravani Shetty", "Manoj Das", "Lakshmi Verma",
  "Karthik Gowda", "Bhavana Lakshmi", "Vamsi Kumar", "Sowmya Sen", "Abhishek Devi",
  "Nandini Krishna", "Charan Shetty", "Harini Das", "Dinesh Verma", "Swathi Gowda",
  "Rohit Lakshmi", "Tejaswi Kumar", "Aarav Sharma", "Venu Rao", "Rohan Patel",
  "Ananya Prasad", "Priya Singh", "Sai Nair", "Keerthana Raju", "Nikhil Mohan",
  "Divya Joshi", "Harsha Sharma", "Meghana Rao", "Pranav Patel", "Sravani Prasad",
  "Manoj Singh", "Lakshmi Nair", "Karthik Raju", "Bhavana Mohan", "Vamsi Joshi",
  "Sowmya Sharma", "Abhishek Rao", "Nandini Patel", "Charan Prasad", "Harini Singh",
  "Dinesh Nair", "Swathi Raju", "Rohit Mohan", "Tejaswi Joshi", "Siddharth Verma",
  "Kavya Reddy", "Gautam Iyer", "Deepika Pillai", "Aditya Hegde", "Pooja Hegde",
  "Varun Chawla", "Sneha Kulkarni", "Tarun Bhat", "Tanvi Desai", "Manish Menon",
  "Shreya Nambiar", "Surya Prakash", "Sandhya Rani", "Rajeshwari Bai", "Kishore Kumar",
  "Lavanya Sundaram", "Hemant Kulkarni", "Geetha Madhuri", "Pradeep Namboodiri", "Padma Priya",
  "Jagadeesh Chandra", "Jyothi Swaroop", "Balaji Srinivasan", "Bindu Madhavi", "Chethan Anand",
  "Chaitra Bhat", "Mohan Babu", "Mythili Devi", "Eswar Prasad", "Gowri Shankar"
];

const BRANCH_CONFIGS = [
  {
    branch: "Computer Science & Engineering (CSE)",
    code: "CSE",
    yearSubjects: {
      "1st Year": ["Data Structures", "Operating Systems", "Discrete Mathematics"],
      "2nd Year": ["Database Management Systems", "Design & Analysis of Algorithms", "Computer Networks"],
      "3rd Year": ["Software Engineering", "Artificial Intelligence", "Web Technologies"],
      "4th Year": ["Cloud Computing", "Distributed Systems", "Major Project Viva"],
    },
  },
  {
    branch: "Computer Science & Artificial Intelligence (CSE-AI)",
    code: "AI",
    yearSubjects: {
      "1st Year": ["Machine Learning", "Deep Neural Networks", "Python for AI"],
      "2nd Year": ["Computer Vision", "Natural Language Processing", "Reinforcement Learning"],
      "3rd Year": ["Knowledge Representation", "Robotics & Automation", "AI Ethics & Safety"],
      "4th Year": ["Generative AI Models", "Autonomous Systems", "AI Capstone Project"],
    },
  },
  {
    branch: "Cyber Security",
    code: "CY",
    yearSubjects: {
      "1st Year": ["Network Security", "Cryptography", "Computer Fundamentals"],
      "2nd Year": ["Information Security Principles", "Ethical Hacking", "Operating Systems Security"],
      "3rd Year": ["Digital Forensics & Incident Response", "Penetration Testing", "Cloud Security"],
      "4th Year": ["Cyber Laws & Security Governance", "Malware Analysis", "Cyber Defense Project"],
    },
  },
  {
    branch: "Data Sciences",
    code: "DS",
    yearSubjects: {
      "1st Year": ["Statistics", "Data Analytics", "R & Python Programming"],
      "2nd Year": ["Data Mining & Warehousing", "Applied Predictive Analytics", "Database Systems"],
      "3rd Year": ["Big Data Analytics", "Hadoop & Spark", "Data Visualization & BI"],
      "4th Year": ["Business Analytics", "Deep Learning for Analytics", "Data Science Capstone"],
    },
  },
  {
    branch: "Electronics & Communication Engineering (ECE)",
    code: "ECE",
    yearSubjects: {
      "1st Year": ["Digital Logic Design", "Signals & Systems", "Network Theory"],
      "2nd Year": ["Analog Electronics", "Microprocessors & Microcontrollers", "Electromagnetic Fields"],
      "3rd Year": ["Digital Signal Processing (DSP)", "VLSI Design", "Antennas & Wave Propagation"],
      "4th Year": ["Embedded Systems", "Optical & Wireless Communication", "ECE Major Project"],
    },
  },
  {
    branch: "Electrical & Electronics Engineering (EEE)",
    code: "EEE",
    yearSubjects: {
      "1st Year": ["Electrical Circuits", "Electrical Machines", "Engineering Physics"],
      "2nd Year": ["Power Systems-I", "Control Systems Engineering", "Power Electronics"],
      "3rd Year": ["Transmission & Distribution", "Renewable Energy Systems", "Microcontroller Applications"],
      "4th Year": ["High Voltage Engineering", "Smart Grid Technologies", "EEE Capstone Project"],
    },
  },
  {
    branch: "Mechanical Engineering",
    code: "MEC",
    yearSubjects: {
      "1st Year": ["Engineering Mechanics", "Engineering Graphics", "Material Science"],
      "2nd Year": ["Thermodynamics", "Kinematics of Machinery", "Fluid Mechanics & Hydraulic Machinery"],
      "3rd Year": ["Design of Machine Elements", "Heat Transfer", "CAD/CAM Manufacturing"],
      "4th Year": ["Automobile Engineering", "Finite Element Analysis (FEA)", "Mechanical Project Viva"],
    },
  },
  {
    branch: "Civil Engineering",
    code: "CIV",
    yearSubjects: {
      "1st Year": ["Building Materials", "Surveying & Geomatics", "Applied Mechanics"],
      "2nd Year": ["Strength of Materials", "Fluid Mechanics", "Structural Analysis"],
      "3rd Year": ["Concrete Technology", "Geotechnical Engineering", "Transportation Engineering"],
      "4th Year": ["Design of Steel Structures", "Environmental Engineering", "Civil Capstone Project"],
    },
  },
];

const YEAR_CODES = {
  "1st Year": { yearStr: "1st Year", prefix: "HT2026", examDate: "24-10-2026" },
  "2nd Year": { yearStr: "2nd Year", prefix: "HT2025", examDate: "25-10-2026" },
  "3rd Year": { yearStr: "3rd Year", prefix: "HT2024", examDate: "26-10-2026" },
  "4th Year": { yearStr: "4th Year", prefix: "HT2023", examDate: "27-10-2026" },
};

/**
 * Generate 680 students for a given academic year
 */
function generateStudentsForYear(academicYear = "1st Year", countPerBranch = 85, collegeCode = "GIT") {
  const yearConfig = YEAR_CODES[academicYear] || YEAR_CODES["1st Year"];
  const students = [];

  for (const branchConfig of BRANCH_CONFIGS) {
    const subjects = branchConfig.yearSubjects[academicYear] || ["Engineering Mathematics", "Communicative English"];

    for (let i = 1; i <= countPerBranch; i++) {
      const ticketNum = `${yearConfig.prefix}${branchConfig.code}${String(i).padStart(3, "0")}`;
      const nameIndex = (i - 1) % STUDENT_NAMES.length;
      const studentName = STUDENT_NAMES[nameIndex];

      students.push({
        hallTicketNumber: ticketNum,
        studentName,
        academicYear,
        branch: branchConfig.branch,
        subject: subjects,
        examSession: "FN (10:00 AM - 01:00 PM)",
        examDate: yearConfig.examDate,
        collegeCode: collegeCode.toUpperCase(),
        allocationStatus: "Pending",
      });
    }
  }

  return students;
}

/**
 * Generate all 4 years (680 x 4 = 2,720 students)
 */
function generateAll4YearsStudents(collegeCode = "GIT") {
  const allYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  let allStudents = [];
  for (const y of allYears) {
    allStudents = allStudents.concat(generateStudentsForYear(y, 85, collegeCode));
  }
  return allStudents;
}

/**
 * Generate unlimited examination rooms dynamically to accommodate any number of students
 * Standard capacity: 25 seats (5 cols x 5 rows) per room with column-wise numbering
 */
function generateUnlimitedRooms(requiredSeats, collegeCode = "GIT", academicYear = "All Years") {
  const SEATS_PER_ROOM = 25;
  const numRooms = Math.max(Math.ceil(requiredSeats / SEATS_PER_ROOM), 28);
  const rooms = [];

  const BLOCKS = [
    { block: "A Block", floor: "Ground Floor", startRoom: 101 },
    { block: "A Block", floor: "1st Floor", startRoom: 120 },
    { block: "B Block", floor: "Ground Floor", startRoom: 201 },
    { block: "B Block", floor: "1st Floor", startRoom: 220 },
    { block: "C Block", floor: "Ground Floor", startRoom: 301 },
    { block: "C Block", floor: "1st Floor", startRoom: 320 },
    { block: "D Block", floor: "Ground Floor", startRoom: 401 },
    { block: "D Block", floor: "1st Floor", startRoom: 420 },
  ];

  let roomCount = 0;
  for (const section of BLOCKS) {
    for (let i = 0; i < 18; i++) {
      if (roomCount >= numRooms) break;
      const rNum = String(section.startRoom + i);

      // Build 5x5 grid with column-wise sequential numbering
      const numCols = 5;
      const numRows = 5;
      const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(null));

      let seatCounter = 1;
      for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
          const seatNum = seatCounter++;
          const benchStr = `B${String(r + 1).padStart(2, "0")}`;
          matrix[r][c] = {
            seatNumber: seatNum,
            columnNumber: c + 1,
            rowNumber: r + 1,
            benchNumber: benchStr,
            seatLabel: `C${c + 1}-${benchStr} (Seat ${seatNum})`,
            isActive: true,
            hallTicketNumber: null,
            studentName: "",
            branch: "",
            academicYear: "",
            subject: [],
          };
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

      rooms.push({
        roomNumber: rNum,
        block: section.block,
        floor: section.floor,
        academicYear: academicYear || "All Years",
        collegeCode: collegeCode.toUpperCase(),
        totalRows: numRows,
        columnCapacities: [5, 5, 5, 5, 5],
        rows,
        totalSeats: 25,
        allocatedSeats: 0,
        availableSeats: 25,
      });

      roomCount++;
    }
    if (roomCount >= numRooms) break;
  }

  return rooms;
}

/**
 * Format students as CSV string
 */
function convertStudentsToCSV(studentsList) {
  const header = "Hall Ticket Number,Student Name,Academic Year,Branch,Subject\n";
  const rows = studentsList.map((s) => {
    const subjectsStr = Array.isArray(s.subject) ? s.subject.join(", ") : s.subject || "";
    return `"${s.hallTicketNumber}","${s.studentName}","${s.academicYear}","${s.branch}","${subjectsStr}"`;
  });
  return header + rows.join("\n");
}

/**
 * Format rooms as CSV string
 */
function convertRoomsToCSV(roomsList) {
  const header = "Room Number,Block,Floor,Total Rows,C1,C2,C3,C4,C5,Total Capacity,Academic Year\n";
  const rows = roomsList.map((r) => {
    const c = r.columnCapacities || [5, 5, 5, 5, 5];
    return `"${r.roomNumber}","${r.block}","${r.floor}",${r.totalRows || 5},${c[0] || 5},${c[1] || 5},${c[2] || 5},${c[3] || 5},${c[4] || 5},${r.totalSeats || 25},"${r.academicYear || "All Years"}"`;
  });
  return header + rows.join("\n");
}

module.exports = {
  BRANCH_CONFIGS,
  generateStudentsForYear,
  generateAll4YearsStudents,
  generateUnlimitedRooms,
  convertStudentsToCSV,
  convertRoomsToCSV,
};
