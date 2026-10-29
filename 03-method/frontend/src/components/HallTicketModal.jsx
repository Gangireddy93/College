import React, { useMemo } from "react";
import {
  X,
  Printer,
  Download,
  GraduationCap,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Clock,
  QrCode,
  Sparkles,
  Building,
  Layers,
  Armchair,
} from "lucide-react";
import { downloadHallTicketPDF } from "../utils/exportUtils";
import { getCollegeSettings } from "../utils/collegeSettings";

export default function HallTicketModal({ student, onClose }) {
  if (!student) return null;

  const collegeSettings = useMemo(() => getCollegeSettings(), []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadHallTicketPDF(student);
  };

  const roomNum = student.roomNumber || student.room?.roomNumber || "101";
  const blockName = student.block || student.room?.block || "A Block";
  const floorName = student.floor || student.room?.floor || "Ground Floor";
  const seatNum = student.seatNumber || 14;
  const rowNum = student.rowNumber || 3;
  const colNum = student.columnNumber || 2;
  const benchNum = student.benchNumber || `B${String(rowNum).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 print-area">
        {/* Close button (hidden in print) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors no-print cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* College Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              {collegeSettings.collegeName || "Gates Institute of Technology"}
            </h2>
          </div>
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
            {collegeSettings.affiliation || "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade by NAAC"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-blue-900 uppercase bg-blue-50 py-1 px-4 rounded-full border border-blue-200 shadow-2xs">
              {collegeSettings.examTitle || "Autonomous Theory End Semester Examinations 2026"}
            </span>
            <span className="text-[11px] font-bold uppercase px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Official Admit Card
            </span>
          </div>
        </div>

        {/* Student Details & Visual Seating Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-slate-700">
          {/* Left: Candidate Information */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Candidate Profile
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">
                {student.academicYear}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <strong className="text-slate-900 text-sm font-black">{student.studentName}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">Hall Ticket No:</span>
                <strong className="text-blue-700 font-mono text-sm font-black tracking-wide">
                  {student.hallTicketNumber}
                </strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">Branch / Stream:</span>
                <strong className="text-slate-900 text-right max-w-[200px] truncate">{student.branch}</strong>
              </p>
              {student.examDate && (
                <p className="flex justify-between">
                  <span className="text-slate-500 font-medium">Exam Date:</span>
                  <strong className="text-blue-800 font-bold">{student.examDate}</strong>
                </p>
              )}
              <p className="flex justify-between">
                <span className="text-slate-500 font-medium">Session / Timings:</span>
                <strong className="text-emerald-700 font-bold">
                  {student.examSession || "FN (10:00 AM - 01:00 PM)"}
                </strong>
              </p>
            </div>
          </div>

          {/* Right: Desk & Exact Seating Highlights (Row, Column, Seat #, Bench) */}
          <div className="space-y-2 p-4 rounded-2xl bg-linear-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-700" /> Allocated Exam Hall & Desk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase shadow-2xs">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Room / Hall</span>
                <span className="text-base font-black text-blue-950 block">Room {roomNum}</span>
                <span className="text-[10px] text-slate-500 font-medium">{blockName} • {floorName}</span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Seat Number</span>
                <span className="text-base font-black text-emerald-600 block">Seat #{seatNum}</span>
                <span className="text-[10px] text-slate-500 font-medium">Sequential Desk</span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Desk Row</span>
                <span className="text-sm font-black text-slate-800 block">Row {rowNum}</span>
                <span className="text-[10px] text-slate-500 font-medium">Bench {benchNum}</span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Desk Column</span>
                <span className="text-sm font-black text-indigo-700 block">Column {colNum}</span>
                <span className="text-[10px] text-slate-500 font-medium">Matrix Col {colNum}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Room Layout Schematic / Diagram (Chalkboard, Rows, Columns, Highlighted Seat) */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Examination Room Schematic Layout — Room {roomNum} ({blockName})
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
                <strong className="text-emerald-300 font-bold">Your Designated Desk</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-700" />
                Other Desks (Anti-Cheat Paired)
              </span>
            </div>
          </div>

          {/* Front Blackboard representation */}
          <div className="w-full py-1 mb-3 bg-slate-800 rounded-lg text-center border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span>[ FRONT CHALKBOARD / INVIGILATOR PODIUM ]</span>
          </div>

          {/* 5x5 Grid representation with highlighted student desk */}
          <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto py-1">
            {[1, 2, 3, 4, 5].map((c) => (
              <div key={c} className="space-y-1.5 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block pb-0.5">
                  Col {c}
                </span>
                {[1, 2, 3, 4, 5].map((r) => {
                  const isThisSeat = r === rowNum && c === colNum;
                  const calculatedSeatNum = (c - 1) * 5 + r;

                  return (
                    <div
                      key={r}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center ${
                        isThisSeat
                          ? "bg-emerald-500 text-slate-950 ring-3 ring-emerald-300 shadow-lg scale-105"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                      }`}
                    >
                      <span>{isThisSeat ? "YOU" : `S${calculatedSeatNum}`}</span>
                      <span className="text-[8px] opacity-80">R{r}-C{c}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-[10px] text-slate-400 italic">
            * Entrance door is located at Column 1 side. Please locate your bench ({benchNum}) in Column {colNum}, Row {rowNum}.
          </div>
        </div>

        {/* Registered Examination Papers Table */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Registered Examination Papers</h4>
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-bold">
              <tr>
                <th className="p-2.5 border-b border-slate-200">#</th>
                <th className="p-2.5 border-b border-slate-200">Subject Name</th>
                <th className="p-2.5 border-b border-slate-200">Session</th>
                <th className="p-2.5 border-b border-slate-200">Invigilator Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(student.subject || ["Engineering Mathematics", "Communicative English"]).map((sub, i) => (
                <tr key={i}>
                  <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                  <td className="p-2 font-bold text-slate-800">{sub}</td>
                  <td className="p-2 text-slate-500 font-medium">FN (Forenoon)</td>
                  <td className="p-2 text-slate-300 font-mono">_________________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Anti-Cheating & Exam Instructions */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Official Anti-Cheating Protocols:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
            <li>Seats are allocated strictly column-wise with alternating branch neighbors to ensure total examination integrity.</li>
            <li>Candidates must occupy their designated seat strictly 20 minutes before exam commencement.</li>
            <li>Possession of mobile phones, smartwatches, programmable calculators, or loose notes is severe malpractice.</li>
          </ul>
        </div>

        {/* Signatures & Barcode */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-center">
            <div className="w-32 h-8 flex items-center justify-center font-mono text-[10px] tracking-widest text-slate-400 bg-slate-100 rounded border border-slate-200 mb-1">
              ||| | |||| | ||||| | |||
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{student.hallTicketNumber}</span>
          </div>

          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
            <span className="text-[11px] font-semibold text-slate-600">Candidate Signature</span>
          </div>

          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
            <span className="text-[11px] font-bold text-slate-900">Controller of Examinations</span>
          </div>
        </div>

        {/* Actions Bar (hidden in print) */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Admit Card PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Hall Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
