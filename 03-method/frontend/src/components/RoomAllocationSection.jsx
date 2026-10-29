import React, { useState, useMemo } from "react";
import {
  Grid,
  Filter,
  Printer,
  Download,
  FileSpreadsheet,
  DoorClosed,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Eye,
  ShieldCheck,
  Building,
} from "lucide-react";
import RoomLayoutVisualizer from "./RoomLayoutVisualizer";
import MultiYearRoomDownloadModal from "./MultiYearRoomDownloadModal";
import {
  downloadRoomAllocationCSV,
  downloadRoomLayoutPDF,
  generateRoomLayoutHtml,
  printHtmlDocument,
  downloadCSV,
} from "../utils/exportUtils";

export default function RoomAllocationSection({
  rooms = [],
  selectedRoom,
  onSelectRoom,
  onViewStudent,
  stats,
}) {
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table" | "both"
  const [showMultiYearModal, setShowMultiYearModal] = useState(false);

  const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Dynamic room count calculation based on selected year
  const getRoomCountForYear = (room, year) => {
    if (!room || !room.rows) return room?.allocatedSeats || 0;
    if (year === "All Years") return room.allocatedSeats || 0;
    let count = 0;
    for (const row of room.rows) {
      if (row.seats) {
        for (const seat of row.seats) {
          if (seat.isActive !== false && seat.hallTicketNumber && seat.academicYear === year) {
            count++;
          }
        }
      }
    }
    return count;
  };

  // Filter rooms: Show all rooms holding students for selected year or available examination halls
  const filteredRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    if (selectedYear === "All Years") return rooms;
    const matched = rooms.filter((r) => {
      const yearCount = getRoomCountForYear(r, selectedYear);
      if (yearCount > 0) return true;
      if (!r.academicYear || r.academicYear === "All Years" || r.academicYear === selectedYear) {
        return true;
      }
      return false;
    });
    return matched.length > 0 ? matched : rooms;
  }, [rooms, selectedYear]);

  // Current active room
  const currentRoom = useMemo(() => {
    if (!selectedRoom && filteredRooms.length > 0) return filteredRooms[0];
    if (selectedRoom) {
      const match = filteredRooms.find((r) => r._id === selectedRoom._id);
      return match || filteredRooms[0] || selectedRoom;
    }
    return null;
  }, [selectedRoom, filteredRooms]);

  // Extract all allocated students in current room
  const roomStudents = useMemo(() => {
    if (!currentRoom || !currentRoom.rows) return [];
    const students = [];
    const numRows = currentRoom.rows.length;

    for (let r = 0; r < currentRoom.rows.length; r++) {
      const rowObj = currentRoom.rows[r];
      if (!rowObj || !rowObj.seats) continue;
      for (let c = 0; c < rowObj.seats.length; c++) {
        const seat = rowObj.seats[c];
        if (seat && seat.isActive !== false && seat.hallTicketNumber) {
          // Check year filter
          if (
            selectedYear === "All Years" ||
            !seat.academicYear ||
            seat.academicYear === selectedYear
          ) {
            students.push({
              ...seat,
              rowNumber: r + 1,
              columnNumber: c + 1,
              seatNumber: seat.seatNumber || c * numRows + r + 1,
              benchNumber: seat.benchNumber || `B${String(r + 1).padStart(2, "0")}`,
            });
          }
        }
      }
    }

    // Sort by column-wise seat number
    return students.sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));
  }, [currentRoom, selectedYear]);

  // Filter students in room by search term
  const searchedStudents = useMemo(() => {
    if (!searchTerm.trim()) return roomStudents;
    const term = searchTerm.toLowerCase();
    return roomStudents.filter(
      (s) =>
        s.hallTicketNumber?.toLowerCase().includes(term) ||
        s.studentName?.toLowerCase().includes(term) ||
        s.branch?.toLowerCase().includes(term)
    );
  }, [roomStudents, searchTerm]);

  // Branch breakdown in current room
  const branchBreakdown = useMemo(() => {
    const counts = {};
    for (const s of roomStudents) {
      const b = s.branch || "Other";
      counts[b] = (counts[b] || 0) + 1;
    }
    return counts;
  }, [roomStudents]);

  // Year breakdown in current room
  const yearBreakdown = useMemo(() => {
    const counts = {};
    for (const s of roomStudents) {
      const y = s.academicYear || "1st Year";
      counts[y] = (counts[y] || 0) + 1;
    }
    return counts;
  }, [roomStudents]);

  // Download all rooms allocation as CSV
  const handleDownloadAllRoomsCSV = () => {
    if (!rooms || rooms.length === 0) {
      alert("No rooms available to export.");
      return;
    }

    const rows = [
      [
        "Room Number",
        "Block",
        "Floor",
        "Column",
        "Bench",
        "Seat Number",
        "Hall Ticket Number",
        "Student Name",
        "Branch",
        "Academic Year",
        "Subject",
        "Status",
      ],
    ];

    for (const room of rooms) {
      const numRows = room.rows?.length || 5;
      const numCols =
        room.columnCapacities?.length ||
        room.rows?.[0]?.seats?.length ||
        room.rows?.[0]?.columns ||
        5;

      for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
          const seat = room.rows?.[r]?.seats?.[c];
          if (seat && seat.isActive !== false) {
            const isOccupied = !!seat.hallTicketNumber;
            if (
              selectedYear !== "All Years" &&
              isOccupied &&
              seat.academicYear &&
              seat.academicYear !== selectedYear
            ) {
              continue;
            }

            rows.push([
              room.roomNumber,
              room.block || "A Block",
              room.floor || "Ground Floor",
              `Col ${c + 1}`,
              seat.benchNumber || `B${String(r + 1).padStart(2, "0")}`,
              seat.seatNumber || c * numRows + r + 1,
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
      }
    }

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    downloadCSV(`All_Rooms_Allocation_${selectedYear.replace(/\s+/g, "_")}.csv`, csvContent);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Room Allocation Dashboard Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Grid className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Examination Room Allocation
            </h2>
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              All Years & Multi-Room
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Select academic years and examination rooms to inspect anti-cheat column-wise seating allocations, print entrance charts, or export records.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRoom && (
            <>
              <button
                onClick={() => downloadRoomAllocationCSV(currentRoom, selectedYear)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition-all"
                title="Download this room's allocation roster as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Room CSV</span>
              </button>

              <button
                onClick={() => downloadRoomLayoutPDF(currentRoom, selectedYear)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 shadow-xs transition-all"
                title="Download this room's layout chart as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Room PDF</span>
              </button>

              <button
                onClick={() => {
                  const html = generateRoomLayoutHtml(currentRoom, selectedYear);
                  printHtmlDocument(html, `Room ${currentRoom.roomNumber} Seating Layout`);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                title="Print this room's allocation layout"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Room</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowMultiYearModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Download rooms for 1st Year, 2nd Year, or All Years"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📥 Download by Year(s)</span>
          </button>

          <button
            onClick={handleDownloadAllRoomsCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Download complete allocation roster for all rooms as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Rooms CSV</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Year Selection & Room Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Row 1: Academic Year Selection Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Academic Year:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {years.map((year) => {
              const count =
                year === "All Years"
                  ? stats?.totalStudents || 0
                  : stats?.yearCounts?.[year] || 0;
              const isSelected = selectedYear === year;

              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>{year}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-blue-800 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Room Selection Pills / Chips & Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Select Examination Room:
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredRooms.length} available)
            </span>
          </div>

          {/* Quick Room Buttons & Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentRoom?._id || ""}
              onChange={(e) => {
                const found = rooms.find((r) => r._id === e.target.value);
                if (found) onSelectRoom(found);
              }}
              className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            >
              {filteredRooms.map((r) => {
                const yrCount = getRoomCountForYear(r, selectedYear);
                return (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} — {r.block} ({r.floor}) • {yrCount}/{r.totalSeats} seats {selectedYear !== "All Years" ? `(${selectedYear})` : ""}
                  </option>
                );
              })}
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Layout Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Student List
              </button>
              <button
                onClick={() => setViewMode("both")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "both"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Both
              </button>
            </div>
          </div>
        </div>

        {/* Quick Room Chips Carousel */}
        {filteredRooms.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {filteredRooms.map((r) => {
              const isSelected = currentRoom?._id === r._id;
              const yrCount = getRoomCountForYear(r, selectedYear);
              const fillPct =
                r.totalSeats > 0 ? Math.round((yrCount / r.totalSeats) * 100) : 0;

              return (
                <button
                  key={r._id}
                  onClick={() => onSelectRoom(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>Room {r.roomNumber}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-blue-800 text-white"
                        : fillPct === 100
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {yrCount}/{r.totalSeats}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Room Metadata & Anti-Cheat Summary Card */}
      {currentRoom && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Selected Hall</p>
              <h4 className="font-extrabold text-base text-slate-900">
                Room {currentRoom.roomNumber}
              </h4>
              <p className="text-[11px] text-slate-500">
                {currentRoom.block} • {currentRoom.floor}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Allocated Seats</p>
              <h4 className="font-extrabold text-base text-slate-900">
                {roomStudents.length}{" "}
                <span className="text-xs font-normal text-slate-500">
                  / {currentRoom.totalSeats}
                </span>
              </h4>
              <p className="text-[11px] text-emerald-600 font-bold">
                {currentRoom.totalSeats - roomStudents.length} Seats Available
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Anti-Cheat Pairing</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {Object.keys(branchBreakdown).length > 0 ? (
                  Object.entries(branchBreakdown).map(([branch, count]) => (
                    <span
                      key={branch}
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      {branch.split(" ")[0]}: {count}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No students allocated</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Academic Year Filter</p>
              <h4 className="font-extrabold text-base text-slate-900">{selectedYear}</h4>
              <p className="text-[11px] text-slate-500">
                {selectedYear === "All Years"
                  ? "Showing all academic batches"
                  : `Filtered strictly for ${selectedYear}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area: Layout Visualizer and/or Student Roster Table */}
      {currentRoom ? (
        <div className="space-y-6">
          {/* Layout Visualizer (Grid View) */}
          {(viewMode === "grid" || viewMode === "both") && (
            <div className="space-y-3">
              <RoomLayoutVisualizer
                room={currentRoom}
                roomsList={filteredRooms}
                onSelectRoom={onSelectRoom}
                selectedYear={selectedYear}
                onSeatClick={(seat) => {
                  if (seat.hallTicketNumber && onViewStudent) {
                    onViewStudent(seat);
                  }
                }}
              />
            </div>
          )}

          {/* Student Roster Table for this Room */}
          {(viewMode === "table" || viewMode === "both") && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Room {currentRoom.roomNumber} Student Allocation Roster
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {searchedStudents.length} Students
                  </span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search in this room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="px-3.5 py-3 text-center">Seat #</th>
                      <th className="px-3.5 py-3">Column & Bench</th>
                      <th className="px-3.5 py-3">Hall Ticket Number</th>
                      <th className="px-3.5 py-3">Student Name</th>
                      <th className="px-3.5 py-3">Academic Year</th>
                      <th className="px-3.5 py-3">Branch</th>
                      <th className="px-3.5 py-3">Subject</th>
                      <th className="px-3.5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {searchedStudents.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          No students allocated in Room {currentRoom.roomNumber} matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      searchedStudents.map((seat) => (
                        <tr key={seat.hallTicketNumber} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-3.5 py-2.5 text-center font-extrabold font-mono text-blue-700">
                            #{seat.seatNumber}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-600">
                            Col {seat.columnNumber} • {seat.benchNumber}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-blue-900 font-mono">
                            {seat.hallTicketNumber}
                          </td>
                          <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                            {seat.studentName}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">
                            {seat.academicYear || "1st Year"}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {seat.branch}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500 max-w-xs truncate" title={Array.isArray(seat.subject) ? seat.subject.join(", ") : seat.subject}>
                            {Array.isArray(seat.subject) ? seat.subject.join(", ") : seat.subject || "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <button
                              onClick={() => onViewStudent(seat)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold border border-blue-200 transition-all inline-flex items-center gap-1"
                              title="View / Print Hall Ticket"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Slip</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <DoorClosed className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h4 className="font-bold text-slate-700 text-base">No Rooms Available</h4>
          <p className="text-xs text-slate-500 mt-1">
            Please upload rooms or seed the dataset in the Manage Rooms or Upload tab.
          </p>
        </div>
      )}

      {/* Multi-Year Room Download Modal */}
      {showMultiYearModal && (
        <MultiYearRoomDownloadModal
          rooms={rooms}
          onClose={() => setShowMultiYearModal(false)}
        />
      )}
    </div>
  );
}
