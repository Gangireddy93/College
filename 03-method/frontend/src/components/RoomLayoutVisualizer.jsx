import React, { useState } from "react";
import { Grid, Printer, Download, FileSpreadsheet, CheckCircle2, User, Armchair, ShieldCheck } from "lucide-react";
import {
  downloadRoomLayoutPDF,
  downloadRoomAllocationCSV,
  generateRoomLayoutHtml,
  printHtmlDocument,
} from "../utils/exportUtils";

export default function RoomLayoutVisualizer({
  room,
  roomsList = [],
  onSelectRoom,
  onSeatClick,
  highlightTicket = null,
  selectedYear = "All Years",
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!room) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        <Grid className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-semibold">Select an examination room to view its seating layout</p>
      </div>
    );
  }

  const numRows = room.rows?.length || 5;
  const numCols =
    room.columnCapacities?.length ||
    (room.rows?.[0]?.seats?.length || room.rows?.[0]?.columns || 5);

  const handleSeatClick = (seat, rowNum, colNum) => {
    setSelectedSeat({ ...seat, rowNum, colNum });
    if (onSeatClick) {
      onSeatClick(seat);
    }
  };

  const handlePrint = () => {
    const html = generateRoomLayoutHtml(room, selectedYear);
    printHtmlDocument(html, `Room ${room.roomNumber} Seating Layout`);
  };

  // Branch badge color helper
  const getBranchColor = (branch) => {
    if (!branch) return "text-slate-400 bg-slate-100";
    if (branch.includes("AI")) return "text-purple-700 bg-purple-100 border-purple-200";
    if (branch.includes("ECE") || branch.includes("Electronics")) return "text-indigo-700 bg-indigo-100 border-indigo-200";
    if (branch.includes("Data")) return "text-sky-700 bg-sky-100 border-sky-200";
    if (branch.includes("Cyber")) return "text-rose-700 bg-rose-100 border-rose-200";
    if (branch.includes("EEE") || branch.includes("Electrical")) return "text-amber-700 bg-amber-100 border-amber-200";
    if (branch.includes("Mech")) return "text-orange-700 bg-orange-100 border-orange-200";
    if (branch.includes("Civil")) return "text-emerald-700 bg-emerald-100 border-emerald-200";
    return "text-blue-700 bg-blue-100 border-blue-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-area flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Room Seating Layout — Room {room.roomNumber}
              </h3>
              {roomsList.length > 1 && (
                <select
                  value={room._id}
                  onChange={(e) => {
                    const r = roomsList.find((x) => x._id === e.target.value);
                    if (r) onSelectRoom(r);
                  }}
                  className="text-xs border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 bg-slate-50 focus:outline-none no-print"
                >
                  {roomsList.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.block} - {r.floor})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {room.block} • {room.floor} | {numCols} Columns × {numRows} Rows ({room.totalSeats} Total Seats Capacity)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anti-Cheat Column-wise Allocation Verified</span>
          </div>

          <button
            onClick={() => downloadRoomAllocationCSV(room, selectedYear)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-all"
            title="Download CSV Allocation Roster"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => downloadRoomLayoutPDF(room, selectedYear)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-xs transition-all"
            title="Download PDF Room Layout Chart"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            title="Print Room Seating Layout"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* Seating Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full align-middle">
          {/* Column Headers */}
          <div
            className="grid gap-2 mb-2"
            style={{
              gridTemplateColumns: `70px repeat(${numCols}, minmax(115px, 1fr))`,
            }}
          >
            <div className="text-center text-[11px] font-bold text-slate-400 uppercase py-1">
              Benches
            </div>
            {Array.from({ length: numCols }, (_, i) => {
              const colCap = room.columnCapacities?.[i] || numRows;
              return (
                <div
                  key={i}
                  className="text-center text-[11px] font-bold text-slate-700 uppercase bg-slate-100 py-1.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center"
                >
                  <span>Col {i + 1}</span>
                  <span className="text-[9px] text-slate-400 font-normal">({colCap} seats)</span>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {room.rows.map((row, rIdx) => {
              const rowNum = row.rowNumber || rIdx + 1;
              return (
                <div
                  key={rIdx}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: `70px repeat(${numCols}, minmax(115px, 1fr))`,
                  }}
                >
                  {/* Row Label */}
                  <div className="text-center font-bold text-xs text-slate-500 bg-slate-50 border border-slate-200 py-3 rounded-xl flex flex-col justify-center">
                    <span>Row {rowNum}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      B{String(rowNum).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Seat Cells */}
                  {Array.from({ length: numCols }, (_, cIdx) => {
                    const seat = row.seats ? row.seats[cIdx] : null;
                    const isInactive = seat && seat.isActive === false;

                    if (isInactive) {
                      return (
                        <div
                          key={cIdx}
                          className="p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center min-h-[72px] text-slate-300 text-[10px] select-none"
                        >
                          <span className="italic">Aisle / No Desk</span>
                        </div>
                      );
                    }

                    const seatNum = seat?.seatNumber || cIdx * numRows + rowNum;
                    const colNum = seat?.columnNumber || cIdx + 1;
                    const isOccupied = seat && seat.hallTicketNumber;
                    const isHighlighted =
                      highlightTicket &&
                      seat?.hallTicketNumber?.toUpperCase() ===
                        highlightTicket?.toUpperCase();
                    const isSelected =
                      selectedSeat &&
                      selectedSeat.rowNum === rowNum &&
                      selectedSeat.colNum === colNum;

                    let seatStyle =
                      "bg-slate-50/70 border-slate-200 text-slate-400 border-dashed";
                    if (isHighlighted) {
                      seatStyle =
                        "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400";
                    } else if (isSelected) {
                      seatStyle =
                        "bg-amber-100 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-300";
                    } else if (isOccupied) {
                      seatStyle =
                        "bg-blue-50/90 border-blue-200 text-slate-800 hover:border-blue-400 hover:shadow-xs";
                    }

                    return (
                      <div
                        key={cIdx}
                        onClick={() => seat && handleSeatClick(seat, rowNum, colNum)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${seatStyle}`}
                        title={
                          isOccupied
                            ? `${seat.studentName} (${seat.branch})\nSubjects: ${
                                Array.isArray(seat.subject)
                                  ? seat.subject.join(", ")
                                  : seat.subject
                              }`
                            : `Seat #${seatNum} (Available)`
                        }
                      >
                        {/* Column-wise Seat Number Header */}
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span
                            className={
                              isHighlighted
                                ? "text-blue-100 font-extrabold"
                                : "text-blue-800 font-extrabold bg-blue-100/80 px-1 rounded"
                            }
                          >
                            Seat #{seatNum}
                          </span>
                          <span
                            className={
                              isHighlighted
                                ? "text-blue-200"
                                : "text-slate-400 font-semibold"
                            }
                          >
                            C{colNum}-B{String(rowNum).padStart(2, "0")}
                          </span>
                        </div>

                        {isOccupied ? (
                          <div className="my-0.5">
                            <p
                              className={`font-mono text-xs font-extrabold tracking-tight ${
                                isHighlighted ? "text-white" : "text-blue-900"
                              }`}
                            >
                              {seat.hallTicketNumber}
                            </p>
                            <p
                              className={`text-[10px] truncate font-medium ${
                                isHighlighted ? "text-blue-100" : "text-slate-600"
                              }`}
                            >
                              {seat.studentName}
                            </p>
                          </div>
                        ) : (
                          <div className="my-auto py-1">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Available
                            </span>
                          </div>
                        )}

                        {isOccupied && (
                          <div className="pt-0.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full truncate block border ${
                                isHighlighted
                                  ? "bg-blue-700/80 text-white border-blue-400"
                                  : getBranchColor(seat.branch)
                              }`}
                            >
                              {seat.branch
                                ? seat.branch.split(" ")[0].replace("Electronics", "ECE")
                                : "All"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-200"></div>
            <span>Allocated ({room.allocatedSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-300 border-dashed"></div>
            <span>Available ({room.availableSeats})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400"></div>
            <span>Selected Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-blue-600"></div>
            <span className="font-semibold text-blue-700">Searched Student</span>
          </div>
        </div>

        {selectedSeat && selectedSeat.hallTicketNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>
              <strong>{selectedSeat.hallTicketNumber}</strong>: {selectedSeat.studentName} ({selectedSeat.branch}) — Seat #{selectedSeat.seatNumber || selectedSeat.seatNum}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
