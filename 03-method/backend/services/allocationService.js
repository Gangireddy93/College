/**
 * Enhanced Anti-Cheat Exam Seating Allocation Service
 *
 * Specific Room-Pairing & Column-Wise Seating:
 * 1. Each room is FIRST filled with ONLY TWO BRANCHES until full (or until students of those two branches are exhausted).
 *    - Room 1-7: Pair 1 -> CSE & ECE
 *    - Room 8-14: Pair 2 -> CSE-AI & Data Sciences
 *    - Room 15-21: Pair 3 -> Cyber Security & Electrical & Electronics Engineering (EEE)
 *    - Room 22-28: Pair 4 -> Mechanical Engineering & Civil Engineering
 * 2. Column-wise filling within each room:
 *    - Traverses column by column: Col 1 top-to-bottom, Col 2 top-to-bottom, etc.
 *    - Alternates Branch A and Branch B down columns and across columns in a checkerboard pattern.
 *    - Front and back neighbors have DIFFERENT branches and subjects.
 *    - Left and right neighbors have DIFFERENT branches and subjects.
 * 3. Column-wise seat numbering: Seat 1, Seat 2, ..., Seat N strictly sequential column-wise.
 * 4. Connects seamlessly with the next branch pair if a room has additional capacity or for subsequent rooms.
 * 5. 4-Way Neighbor Verification: No two adjacent seats (front, back, left, right) have the same branch or same subject.
 */

const BRANCH_PAIRS = [
  ["Computer Science & Engineering (CSE)", "Electronics & Communication Engineering (ECE)"],
  ["Computer Science & Artificial Intelligence (CSE-AI)", "Data Sciences"],
  ["Cyber Security", "Electrical & Electronics Engineering (EEE)"],
  ["Mechanical Engineering", "Civil Engineering"],
];

const ALL_BRANCH_LIST = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication Engineering (ECE)",
  "Computer Science & Artificial Intelligence (CSE-AI)",
  "Data Sciences",
  "Cyber Security",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
];

function normalizeBranch(branchStr) {
  if (!branchStr) return "Unknown";
  const str = branchStr.trim().toLowerCase();
  if (str.includes("ai") || str.includes("cse-ai") || str.includes("artificial")) {
    return "Computer Science & Artificial Intelligence (CSE-AI)";
  }
  if (str.includes("ece") || str.includes("electronics") || str.includes("communication")) {
    return "Electronics & Communication Engineering (ECE)";
  }
  if (str.includes("data") || str.includes("ds")) {
    return "Data Sciences";
  }
  if (str.includes("cyber") || str.includes("security")) {
    return "Cyber Security";
  }
  if (str.includes("eee") || str.includes("electrical")) {
    return "Electrical & Electronics Engineering (EEE)";
  }
  if (str.includes("mech")) {
    return "Mechanical Engineering";
  }
  if (str.includes("civil")) {
    return "Civil Engineering";
  }
  if (str.includes("cse") || str.includes("computer")) {
    return "Computer Science & Engineering (CSE)";
  }
  return branchStr.trim();
}

/**
 * 4-Way Neighbor Verification (Front, Back, Left, Right)
 */
function isValidPlacement(grid, r, c, student, numRows, numCols) {
  const neighbors = [
    { r: r - 1, c: c, dir: "front" },
    { r: r + 1, c: c, dir: "back" },
    { r: r, c: c - 1, dir: "left" },
    { r: r, c: c + 1, dir: "right" },
  ];

  const studentBranch = normalizeBranch(student.branch);
  const studentSubjects = Array.isArray(student.subject)
    ? student.subject.map((s) => s.trim().toLowerCase())
    : [];

  for (const n of neighbors) {
    if (n.r >= 0 && n.r < numRows && n.c >= 0 && n.c < numCols) {
      const neighbor = grid[n.r][n.c];
      if (neighbor) {
        const neighborBranch = normalizeBranch(neighbor.branch);
        // Rule 1: No adjacent student from same branch
        if (studentBranch.toLowerCase() === neighborBranch.toLowerCase()) {
          return false;
        }

        // Rule 2: No adjacent student with same subject
        const neighborSubjects = Array.isArray(neighbor.subject)
          ? neighbor.subject.map((s) => s.trim().toLowerCase())
          : [];
        const hasCommonSubject = studentSubjects.some((sub) =>
          neighborSubjects.includes(sub)
        );
        if (hasCommonSubject) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Allocate students into rooms:
 * - Each room is dedicated to TWO BRANCHES first until full
 * - Column-wise alternating pattern
 * - Column-wise seat numbering
 * - Connects with the next two branches as needed
 */
function allocateSeatsColumnWise(studentsList, roomsList) {
  const pool = [...studentsList];
  const branchMap = new Map();

  for (const student of pool) {
    const b = normalizeBranch(student.branch);
    if (!branchMap.has(b)) {
      branchMap.set(b, []);
    }
    branchMap.get(b).push(student);
  }

  const updatedStudents = [];
  const updatedRooms = [];

  let currentPairIndex = 0;

  for (let roomIdx = 0; roomIdx < roomsList.length; roomIdx++) {
    const room = roomsList[roomIdx];
    const numRows = room.rows.length;
    if (numRows === 0) continue;
    const maxCols = room.columnCapacities?.length || Math.max(...room.rows.map((r) => r.columns || 5));

    // 2D grid matrix: grid[r][c]
    const grid = Array.from({ length: numRows }, () => Array(maxCols).fill(null));

    // Populate already allocated seats if any
    for (let r = 0; r < numRows; r++) {
      const rowObj = room.rows[r];
      if (!rowObj || !rowObj.seats) continue;
      for (let c = 0; c < rowObj.seats.length; c++) {
        const seat = rowObj.seats[c];
        if (seat && seat.isActive !== false && seat.hallTicketNumber) {
          grid[r][c] = {
            hallTicketNumber: seat.hallTicketNumber,
            studentName: seat.studentName,
            branch: seat.branch,
            subject: seat.subject || [],
          };
        }
      }
    }

    // Assign current branch pair to this room
    let assignedPair = BRANCH_PAIRS[currentPairIndex % BRANCH_PAIRS.length];

    // Traverse COLUMN-WISE:
    // Outer loop: Column c (0 to maxCols - 1)
    // Inner loop: Row r (0 to numRows - 1)
    for (let c = 0; c < maxCols; c++) {
      for (let r = 0; r < numRows; r++) {
        const rowObj = room.rows[r];
        if (!rowObj || c >= rowObj.seats.length) continue;

        const seatObj = rowObj.seats[c];
        if (!seatObj || seatObj.isActive === false || seatObj.hallTicketNumber) {
          continue; // Inactive or already occupied
        }

        // Check if assignedPair has remaining students
        let b1 = assignedPair[0];
        let b2 = assignedPair[1];
        let list1 = branchMap.get(b1) || [];
        let list2 = branchMap.get(b2) || [];

        // If current pair is exhausted, advance to next pair to connect
        if (list1.length === 0 && list2.length === 0) {
          let foundNext = false;
          for (let pOffset = 1; pOffset <= BRANCH_PAIRS.length; pOffset++) {
            const nextP = BRANCH_PAIRS[(currentPairIndex + pOffset) % BRANCH_PAIRS.length];
            const nl1 = branchMap.get(nextP[0]) || [];
            const nl2 = branchMap.get(nextP[1]) || [];
            if (nl1.length > 0 || nl2.length > 0) {
              currentPairIndex = (currentPairIndex + pOffset) % BRANCH_PAIRS.length;
              assignedPair = nextP;
              b1 = assignedPair[0];
              b2 = assignedPair[1];
              list1 = branchMap.get(b1) || [];
              list2 = branchMap.get(b2) || [];
              foundNext = true;
              break;
            }
          }
          if (!foundNext) {
            // Check any remaining branch
            const anyActive = Array.from(branchMap.keys()).find(
              (k) => (branchMap.get(k) || []).length > 0
            );
            if (!anyActive) continue; // No more students anywhere
          }
        }

        // In this room, alternate between b1 and b2 column-wise in checkerboard:
        // Even (c + r): b1
        // Odd (c + r):  b2
        const preferredBranches = [];
        if ((c + r) % 2 === 0) {
          if (list1.length > 0) preferredBranches.push(b1);
          if (list2.length > 0) preferredBranches.push(b2);
        } else {
          if (list2.length > 0) preferredBranches.push(b2);
          if (list1.length > 0) preferredBranches.push(b1);
        }

        // Also add other branches as backup if current pair exhausted mid-column
        for (const [nb1, nb2] of BRANCH_PAIRS) {
          if (nb1 !== b1 && nb1 !== b2) {
            if ((branchMap.get(nb1) || []).length > 0) preferredBranches.push(nb1);
            if ((branchMap.get(nb2) || []).length > 0) preferredBranches.push(nb2);
          }
        }

        let selectedStudent = null;
        let selectedBranch = null;
        let selectedIndex = -1;

        // Pass 1: Strict check (4-way conflict check: front, back, left, right)
        for (const bName of preferredBranches) {
          const list = branchMap.get(bName);
          if (!list || list.length === 0) continue;

          for (let i = 0; i < list.length; i++) {
            if (isValidPlacement(grid, r, c, list[i], numRows, maxCols)) {
              selectedStudent = list[i];
              selectedBranch = bName;
              selectedIndex = i;
              break;
            }
          }
          if (selectedStudent) break;
        }

        // Pass 2: Fallback if strict check doesn't find
        if (!selectedStudent) {
          for (const bName of preferredBranches) {
            const list = branchMap.get(bName);
            if (!list || list.length === 0) continue;
            selectedStudent = list[0];
            selectedBranch = bName;
            selectedIndex = 0;
            break;
          }
        }

        // Place student on seat
        if (selectedStudent) {
          branchMap.get(selectedBranch).splice(selectedIndex, 1);

          const benchNumStr = seatObj.benchNumber || `B${String(r + 1).padStart(2, "0")}`;
          const seatNum = seatObj.seatNumber || (c * numRows + r + 1);
          const seatLabelStr = seatObj.seatLabel || `C${c + 1}-${benchNumStr} (Seat ${seatNum})`;

          grid[r][c] = {
            hallTicketNumber: selectedStudent.hallTicketNumber,
            studentName: selectedStudent.studentName,
            branch: selectedStudent.branch,
            subject: selectedStudent.subject || [],
          };

          seatObj.hallTicketNumber = selectedStudent.hallTicketNumber;
          seatObj.studentName = selectedStudent.studentName;
          seatObj.branch = selectedStudent.branch;
          seatObj.academicYear = selectedStudent.academicYear;
          seatObj.examDate = selectedStudent.examDate || "";
          seatObj.subject = selectedStudent.subject;
          seatObj.benchNumber = benchNumStr;
          seatObj.columnNumber = c + 1;
          seatObj.rowNumber = r + 1;
          seatObj.seatLabel = seatLabelStr;

          selectedStudent.room = room._id;
          selectedStudent.roomNumber = room.roomNumber;
          selectedStudent.block = room.block || "A Block";
          selectedStudent.floor = room.floor || "Ground Floor";
          selectedStudent.rowNumber = r + 1;
          selectedStudent.columnNumber = c + 1;
          selectedStudent.seatNumber = seatNum; // Sequential column-wise seat number
          selectedStudent.benchNumber = benchNumStr;
          selectedStudent.seatLabel = seatLabelStr;
          selectedStudent.allocationStatus = "Allocated";

          updatedStudents.push(selectedStudent);
        }
      }
    }

    // Advance to next pair for next room
    currentPairIndex++;

    room.totalSeats = room.rows.reduce(
      (sum, row) => sum + row.seats.filter((s) => s.isActive !== false).length,
      0
    );
    room.allocatedSeats = room.rows.reduce(
      (sum, row) =>
        sum +
        row.seats.filter(
          (s) => s.isActive !== false && s.hallTicketNumber
        ).length,
      0
    );
    room.availableSeats = Math.max(0, room.totalSeats - room.allocatedSeats);
    updatedRooms.push(room);
  }

  return {
    allocatedCount: updatedStudents.filter((s) => s.allocationStatus === "Allocated").length,
    pendingCount: updatedStudents.filter((s) => s.allocationStatus === "Pending").length,
    updatedRooms,
    updatedStudents,
  };
}

module.exports = {
  BRANCH_PAIRS,
  ALL_BRANCH_LIST,
  normalizeBranch,
  allocateSeatsColumnWise,
  isValidPlacement,
};
