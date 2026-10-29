/**
 * Export and Print Utilities for College Hall Ticket System
 * Provides standalone Print and Download (PDF / CSV) functionality
 * without requiring heavy external dependencies.
 */

/**
 * Downloads a CSV string as a file in the browser
 */
export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cleanly prints an isolated HTML string via a hidden iframe
 */
export function printHtmlDocument(htmlContent, title = "Print Document") {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 350);
}

/**
 * Downloads an HTML document as a standalone offline file (which can be opened/saved as PDF)
 */
export function downloadHtmlFile(htmlContent, filename) {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { getCollegeSettings } from "./collegeSettings";

/**
 * Generates official Hall Ticket HTML formatted for high-definition A4 print / PDF
 */
export function generateHallTicketHtml(student) {
  const settings = getCollegeSettings();
  const collegeName = settings.collegeName || "College of Engineering & Technology";
  const affiliation = settings.affiliation || "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade";
  const examTitle = settings.examTitle || "Official Semester Examination Seating Admit Card";

  const subjects = Array.isArray(student.subject)
    ? student.subject
    : [student.subject || "General Engineering"];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hall Ticket - ${student.hallTicketNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 20px; color: #1e293b; background: #fff; }
    .card { border: 2px solid #0f172a; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .college-name { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0 0 4px 0; }
    .sub-title { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; }
    .badge { display: inline-block; background: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .val { font-weight: 700; color: #0f172a; }
    .seat-badge { background: #1e3a8a; color: #fff; padding: 3px 8px; border-radius: 4px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
    th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 8px; border: 1px solid #cbd5e1; }
    td { padding: 8px; border: 1px solid #cbd5e1; color: #1e293b; }
    .instructions { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-top: 18px; font-size: 11px; color: #78350f; }
    .instructions ul { margin: 4px 0 0 16px; padding: 0; }
    .instructions li { margin-bottom: 3px; color: #451a03; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; text-align: center; }
    .sign-line { width: 160px; border-top: 1px solid #64748b; padding-top: 4px; font-weight: 600; }
    .barcode { font-family: monospace; letter-spacing: 4px; font-size: 14px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="college-name">${collegeName}</h1>
      <p class="sub-title">${affiliation}</p>
      <span class="badge">${examTitle}</span>
    </div>

    <div class="grid">
      <div class="info-box">
        <div class="info-row"><span class="label">Student Name:</span><span class="val">${student.studentName}</span></div>
        <div class="info-row"><span class="label">Hall Ticket No:</span><span class="val" style="color: #1e3a8a; font-family: monospace;">${student.hallTicketNumber}</span></div>
        <div class="info-row"><span class="label">Academic Year:</span><span class="val">${student.academicYear || "1st Year"}</span></div>
        <div class="info-row"><span class="label">Branch:</span><span class="val">${student.branch}</span></div>
        ${student.examDate ? `<div class="info-row"><span class="label">Exam Date:</span><span class="val" style="color: #0369a1;">${student.examDate}</span></div>` : ""}
      </div>

      <div class="info-box">
        <div class="info-row"><span class="label">Room / Hall:</span><span class="val">${student.roomNumber || student.room?.roomNumber || "Room 1"}</span></div>
        <div class="info-row"><span class="label">Block & Floor:</span><span class="val">${student.block || "A Block"} — ${student.floor || "Ground Floor"}</span></div>
        <div class="info-row"><span class="label">Bench & Column:</span><span class="val">${student.columnNumber ? "Col " + student.columnNumber + " • " : ""}${student.benchNumber || "B01"}</span></div>
        <div class="info-row"><span class="label">Allocated Seat:</span><span class="val"><span class="seat-badge">Seat #${student.seatNumber || 1}</span></span></div>
        <div class="info-row"><span class="label">Exam Session:</span><span class="val">${student.examSession || "FN (10:00 AM - 01:00 PM)"}</span></div>
      </div>
    </div>

    <div>
      <strong style="font-size: 12px; text-transform: uppercase; color: #0f172a;">Registered Examination Papers</strong>
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Subject Name</th>
            <th style="width: 140px; text-align: center;">Invigilator Sign</th>
          </tr>
        </thead>
        <tbody>
          ${subjects
            .map(
              (sub, i) => `<tr>
                <td style="text-align: center; color: #64748b;">${i + 1}</td>
                <td><strong>${sub}</strong></td>
                <td style="text-align: center; color: #cbd5e1;">________________</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="instructions">
      <strong>Anti-Cheat & Examination Instructions:</strong>
      <ul>
        <li>Seats are strictly allocated column-wise. Front, back, left, and right neighbours have different branches/subjects.</li>
        <li>Candidates must occupy their designated seat 15 minutes before the exam begins.</li>
        <li>Electronic gadgets, mobile phones, and smart watches are strictly prohibited.</li>
      </ul>
    </div>

    <div class="footer">
      <div>
        <div class="barcode">||| | |||| | ||||| |</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${student.hallTicketNumber}</div>
      </div>
      <div>
        <div class="sign-line">Student Signature</div>
      </div>
      <div>
        <div class="sign-line">Controller of Examinations</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads Hall Ticket as PDF (or opens print-to-PDF / downloads HTML document)
 */
export function downloadHallTicketPDF(student) {
  const html = generateHallTicketHtml(student);
  // Open dedicated print dialog for PDF saving
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback: download standalone document
    downloadHtmlFile(html, `HallTicket_${student.hallTicketNumber}.html`);
  }
}

/**
 * Generates and downloads a CSV of a room's seat allocations
 */
export function downloadRoomAllocationCSV(room, selectedYear = "All Years") {
  if (!room || !room.rows) return;

  const rows = [];
  rows.push(["Room Number", room.roomNumber]);
  rows.push(["Block", room.block || "A Block"]);
  rows.push(["Floor", room.floor || "Ground Floor"]);
  rows.push(["Academic Year Filter", selectedYear]);
  rows.push(["Total Seats", room.totalSeats]);
  rows.push(["Allocated Seats", room.allocatedSeats]);
  rows.push(["Available Seats", room.availableSeats]);
  rows.push([]);
  rows.push([
    "Seat Number",
    "Column",
    "Bench",
    "Hall Ticket Number",
    "Student Name",
    "Branch",
    "Academic Year",
    "Subject",
    "Status",
  ]);

  const numRows = room.rows.length;
  const numCols =
    room.columnCapacities?.length ||
    room.rows[0]?.seats?.length ||
    room.rows[0]?.columns ||
    5;

  for (let c = 0; c < numCols; c++) {
    for (let r = 0; r < numRows; r++) {
      const rowObj = room.rows[r];
      const seat = rowObj?.seats?.[c];
      const seatNum = seat?.seatNumber || c * numRows + r + 1;
      const colNum = seat?.columnNumber || c + 1;
      const benchStr = seat?.benchNumber || `B${String(r + 1).padStart(2, "0")}`;
      const isOccupied = seat && seat.hallTicketNumber;

      if (
        selectedYear !== "All Years" &&
        isOccupied &&
        seat.academicYear &&
        seat.academicYear !== selectedYear
      ) {
        continue;
      }

      rows.push([
        seatNum,
        `Col ${colNum}`,
        benchStr,
        isOccupied ? seat.hallTicketNumber : "—",
        isOccupied ? `"${seat.studentName}"` : "—",
        isOccupied ? `"${seat.branch}"` : "—",
        isOccupied ? `"${seat.academicYear || ""}"` : "—",
        isOccupied
          ? `"${Array.isArray(seat.subject) ? seat.subject.join(", ") : seat.subject || ""}"`
          : "—",
        isOccupied ? "Allocated" : "Available",
      ]);
    }
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  downloadCSV(`Room_${room.roomNumber}_Allocation_${selectedYear.replace(/\s+/g, "_")}.csv`, csvContent);
}

/**
 * Generates printable HTML of room seating layout & roster
 */
export function generateRoomLayoutHtml(room, selectedYear = "All Years") {
  const settings = getCollegeSettings();
  const collegeName = settings.collegeName || "College of Engineering & Technology";
  const subTitle = settings.affiliation
    ? `${settings.affiliation} • Examination Hall Seating Layout`
    : "Examination Hall Seating Layout & Anti-Cheat Column-Wise Chart";

  const numRows = room.rows?.length || 5;
  const numCols =
    room.columnCapacities?.length ||
    room.rows?.[0]?.seats?.length ||
    room.rows?.[0]?.columns ||
    5;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Room ${room.roomNumber} Seating Allocation Chart</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { padding: 15px; color: #1e293b; }
    .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .college { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; }
    .sub { font-size: 12px; font-weight: 600; color: #475569; }
    .meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; background: #f8fafc; padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: 60px repeat(${numCols}, 1fr); gap: 6px; margin-bottom: 16px; }
    .col-header { background: #f1f5f9; border: 1px solid #cbd5e1; font-weight: 800; text-align: center; padding: 4px; font-size: 11px; border-radius: 6px; }
    .row-header { background: #f8fafc; border: 1px solid #cbd5e1; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 6px; }
    .seat { border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px; font-size: 10px; min-height: 52px; display: flex; flex-direction: column; justify-content: space-between; }
    .seat-occupied { background: #eff6ff; border-color: #93c5fd; }
    .seat-available { background: #fafafa; border-style: dashed; color: #94a3b8; text-align: center; display: flex; align-items: center; justify-content: center; }
    .seat-num { font-weight: 800; color: #1e3a8a; font-family: monospace; font-size: 10px; }
    .ht { font-weight: 800; color: #0f172a; font-family: monospace; font-size: 11px; }
    .name { font-size: 9px; font-weight: 600; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .branch { font-size: 8px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div class="college">${collegeName}</div>
    <div class="sub">${subTitle}</div>
  </div>

  <div class="meta">
    <span>Room Number: <strong>${room.roomNumber}</strong> (${room.block} - ${room.floor})</span>
    <span>Year: <strong>${selectedYear}</strong></span>
    <span>Capacity: <strong>${room.totalSeats} Total</strong> (${room.allocatedSeats} Allocated • ${room.availableSeats} Available)</span>
  </div>

  <div class="grid">
    <div class="col-header">Row / Col</div>
    ${Array.from({ length: numCols }, (_, c) => `<div class="col-header">Column ${c + 1}</div>`).join("")}

    ${room.rows
      .map((row, rIdx) => {
        const rowNum = row.rowNumber || rIdx + 1;
        const benchStr = `B${String(rowNum).padStart(2, "0")}`;

        const cells = Array.from({ length: numCols }, (_, cIdx) => {
          const seat = row.seats ? row.seats[cIdx] : null;
          const seatNum = seat?.seatNumber || cIdx * numRows + rowNum;
          const isOccupied = seat && seat.hallTicketNumber;

          if (!isOccupied) {
            return `<div class="seat seat-available">Seat #${seatNum}<br>Available</div>`;
          }

          return `<div class="seat seat-occupied">
            <div style="display:flex; justify-content:space-between;">
              <span class="seat-num">#${seatNum}</span>
              <span style="font-size:8px; color:#64748b;">${benchStr}</span>
            </div>
            <div class="ht">${seat.hallTicketNumber}</div>
            <div class="name">${seat.studentName}</div>
            <div class="branch">${seat.branch ? seat.branch.split(" ")[0] : ""}</div>
          </div>`;
        }).join("");

        return `<div class="row-header">Row ${rowNum}<br>${benchStr}</div>${cells}`;
      })
      .join("")}
  </div>

  <div style="margin-top: 15px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    Anti-Cheat Column-Wise Layout • Notice Board / Entrance Copy
  </div>
</body>
</html>`;
}

/**
 * Downloads Room Layout as PDF (via print-to-PDF dialog)
 */
export function downloadRoomLayoutPDF(room, selectedYear = "All Years") {
  const html = generateRoomLayoutHtml(room, selectedYear);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    downloadHtmlFile(html, `Room_${room.roomNumber}_Layout_${selectedYear.replace(/\s+/g, "_")}.html`);
  }
}

/**
 * Generates consolidated printable HTML document for multiple rooms across selected academic years
 */
export function generateMultiYearRoomsHtml(rooms = [], selectedYears = ["All Years"]) {
  const settings = getCollegeSettings();
  const collegeName = settings.collegeName || "Gates Institute of Technology";
  const subTitle = settings.affiliation || "Autonomous Theory End Semester Examinations 2026";
  const yearLabel = Array.isArray(selectedYears) ? selectedYears.join(", ") : selectedYears;

  const validRooms = rooms.filter((room) => {
    if (!room || !room.rows) return false;
    if (selectedYears.includes("All Years")) return true;
    for (const r of room.rows) {
      if (r.seats) {
        for (const s of r.seats) {
          if (s && s.hallTicketNumber && selectedYears.includes(s.academicYear)) {
            return true;
          }
        }
      }
    }
    return false;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Consolidated Examination Seating Report - ${yearLabel}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { padding: 15px; color: #1e293b; background: #fff; }
    .page-break { page-break-after: always; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px dashed #cbd5e1; }
    .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .college { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; }
    .sub { font-size: 11px; font-weight: 600; color: #475569; }
    .meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; background: #f8fafc; padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px; }
    .grid { display: grid; gap: 6px; margin-bottom: 16px; }
    .col-header { background: #f1f5f9; border: 1px solid #cbd5e1; font-weight: 800; text-align: center; padding: 4px; font-size: 11px; border-radius: 6px; }
    .row-header { background: #f8fafc; border: 1px solid #cbd5e1; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 11px; border-radius: 6px; }
    .seat { border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px; font-size: 10px; min-height: 52px; display: flex; flex-direction: column; justify-content: space-between; }
    .seat-occupied { background: #eff6ff; border-color: #93c5fd; }
    .seat-available { background: #fafafa; border-style: dashed; color: #94a3b8; text-align: center; display: flex; align-items: center; justify-content: center; }
    .seat-num { font-weight: 800; color: #1e3a8a; font-family: monospace; font-size: 10px; }
    .ht { font-weight: 800; color: #0f172a; font-family: monospace; font-size: 11px; }
    .name { font-size: 9px; font-weight: 600; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .branch { font-size: 8px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; }
  </style>
</head>
<body>
  <div style="text-align:center; padding: 10px 0; margin-bottom: 20px; border-bottom: 3px double #1e3a8a;">
    <h1 style="margin:0; font-size: 22px; color:#1e3a8a; text-transform:uppercase;">${collegeName}</h1>
    <h3 style="margin:4px 0; font-size: 13px; color:#475569;">${subTitle}</h3>
    <div style="margin-top: 6px; display:inline-block; background:#e0f2fe; color:#0369a1; padding: 4px 14px; border-radius: 9999px; font-weight:bold; font-size: 11px;">
      CONSOLIDATED SEATING ALLOCATION REPORT • ${yearLabel.toUpperCase()} • ${validRooms.length} ROOMS
    </div>
  </div>

  ${validRooms.map((room, idx) => {
    const numRows = room.rows?.length || 5;
    const numCols =
      room.columnCapacities?.length ||
      room.rows?.[0]?.seats?.length ||
      5;

    let yrStudents = 0;
    for (const r of room.rows) {
      if (r.seats) {
        for (const s of r.seats) {
          if (s && s.hallTicketNumber && (selectedYears.includes("All Years") || selectedYears.includes(s.academicYear))) {
            yrStudents++;
          }
        }
      }
    }

    return `
    <div class="page-break">
      <div class="header">
        <div class="college">${collegeName}</div>
        <div class="sub">Room ${room.roomNumber} (${room.block} - ${room.floor}) • Entrance Notice Board Sheet</div>
      </div>

      <div class="meta">
        <span>Room: <strong>Room ${room.roomNumber}</strong> (${room.block} - ${room.floor})</span>
        <span>Selected Academic Years: <strong>${yearLabel}</strong></span>
        <span>Allocated: <strong>${yrStudents} Candidates</strong> (Room Capacity: ${room.totalSeats})</span>
      </div>

      <div class="grid" style="grid-template-columns: 60px repeat(${numCols}, 1fr);">
        <div class="col-header">Row / Col</div>
        ${Array.from({ length: numCols }, (_, c) => `<div class="col-header">Column ${c + 1}</div>`).join("")}

        ${room.rows
          .map((row, rIdx) => {
            const rowNum = row.rowNumber || rIdx + 1;
            const benchStr = `B${String(rowNum).padStart(2, "0")}`;

            const cells = Array.from({ length: numCols }, (_, cIdx) => {
              const seat = row.seats ? row.seats[cIdx] : null;
              const seatNum = seat?.seatNumber || cIdx * numRows + rowNum;
              const isOccupied = seat && seat.hallTicketNumber && (selectedYears.includes("All Years") || selectedYears.includes(seat.academicYear));

              if (!isOccupied) {
                return `<div class="seat seat-available">Seat #${seatNum}<br>Available</div>`;
              }

              return `<div class="seat seat-occupied">
                <div style="display:flex; justify-content:space-between;">
                  <span class="seat-num">#${seatNum}</span>
                  <span style="font-size:8px; color:#64748b;">${benchStr}</span>
                </div>
                <div class="ht">${seat.hallTicketNumber}</div>
                <div class="name">${seat.studentName}</div>
                <div class="branch">${seat.branch ? seat.branch.split(" ")[0] : ""} • ${seat.academicYear || ""}</div>
              </div>`;
            }).join("");

            return `<div class="row-header">Row ${rowNum}<br>${benchStr}</div>${cells}`;
          })
          .join("")}
      </div>
      <div style="font-size:9px; color:#64748b; text-align:right;">Room ${idx + 1} of ${validRooms.length}</div>
    </div>`;
  }).join("")}
</body>
</html>`;
}

/**
 * Downloads consolidated multi-year rooms PDF/print document
 */
export function downloadMultiYearRoomsPDF(rooms = [], selectedYears = ["All Years"]) {
  const html = generateMultiYearRoomsHtml(rooms, selectedYears);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    downloadHtmlFile(html, `Consolidated_Rooms_${selectedYears.join("_").replace(/\s+/g, "")}.html`);
  }
}

/**
 * Downloads consolidated CSV for selected rooms and academic years (e.g. 1st Year, 2nd Year, or All Years)
 */
export function downloadMultiYearRoomsCSV(rooms = [], selectedYears = ["All Years"]) {
  const rows = [
    [
      "Academic Year",
      "Room Number",
      "Block",
      "Floor",
      "Column Number",
      "Bench Number",
      "Seat Number",
      "Hall Ticket Number",
      "Student Name",
      "Branch",
      "Exam Session",
      "Status",
    ],
  ];

  const yearFilter = Array.isArray(selectedYears) ? selectedYears : [selectedYears];
  const isAllYears = yearFilter.includes("All Years");

  let totalAllocated = 0;

  for (const room of rooms) {
    if (!room || !room.rows) continue;
    const numRows = room.rows.length;
    const numCols =
      room.columnCapacities?.length ||
      room.rows[0]?.seats?.length ||
      5;

    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < numRows; r++) {
        const seat = room.rows[r]?.seats?.[c];
        if (seat && seat.isActive !== false) {
          const isOccupied = !!seat.hallTicketNumber;
          const seatYear = seat.academicYear || "1st Year";

          if (isOccupied && !isAllYears && !yearFilter.includes(seatYear)) {
            continue;
          }

          if (isOccupied) totalAllocated++;

          rows.push([
            isOccupied ? seatYear : isAllYears ? "All Years" : yearFilter[0],
            room.roomNumber,
            room.block || "A Block",
            room.floor || "Ground Floor",
            `Col ${c + 1}`,
            seat.benchNumber || `B${String(r + 1).padStart(2, "0")}`,
            seat.seatNumber || c * numRows + r + 1,
            isOccupied ? seat.hallTicketNumber : "—",
            isOccupied ? `"${seat.studentName}"` : "—",
            isOccupied ? `"${seat.branch}"` : "—",
            seat.examSession || "FN (10:00 AM - 01:00 PM)",
            isOccupied ? "Allocated" : "Available",
          ]);
        }
      }
    }
  }

  const csvContent = rows.map((e) => e.join(",")).join("\n");
  const filename = `Rooms_Seating_${yearFilter.join("_").replace(/\s+/g, "")}.csv`;
  downloadCSV(filename, csvContent);
}
