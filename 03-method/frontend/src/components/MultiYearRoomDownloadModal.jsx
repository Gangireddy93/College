import React, { useState } from "react";
import {
  Download,
  X,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Check,
} from "lucide-react";
import {
  downloadMultiYearRoomsCSV,
  downloadMultiYearRoomsPDF,
} from "../utils/exportUtils";

export default function MultiYearRoomDownloadModal({
  rooms = [],
  onClose,
  collegeSettings,
}) {
  const [selectedYears, setSelectedYears] = useState(["1st Year", "2nd Year"]);
  const [format, setFormat] = useState("csv"); // "csv" | "pdf"
  const [downloading, setDownloading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const allYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const toggleYear = (yr) => {
    if (selectedYears.includes(yr)) {
      if (selectedYears.length === 1) return; // Keep at least one
      setSelectedYears(selectedYears.filter((y) => y !== yr));
    } else {
      setSelectedYears([...selectedYears, yr]);
    }
  };

  const applyPreset = (preset) => {
    if (preset === "all") setSelectedYears(["1st Year", "2nd Year", "3rd Year", "4th Year"]);
    if (preset === "1_2") setSelectedYears(["1st Year", "2nd Year"]);
    if (preset === "3_4") setSelectedYears(["3rd Year", "4th Year"]);
    if (preset === "1") setSelectedYears(["1st Year"]);
    if (preset === "2") setSelectedYears(["2nd Year"]);
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      if (format === "csv") {
        downloadMultiYearRoomsCSV(rooms, selectedYears);
      } else {
        downloadMultiYearRoomsPDF(rooms, selectedYears);
      }
      setSuccessMsg(
        `Generated ${format.toUpperCase()} report for ${selectedYears.join(", ")} successfully!`
      );
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to export: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Compute student count for selected years across rooms
  let totalCandidates = 0;
  for (const r of rooms) {
    if (r.rows) {
      for (const row of r.rows) {
        if (row.seats) {
          for (const s of row.seats) {
            if (s && s.hallTicketNumber && selectedYears.includes(s.academicYear)) {
              totalCandidates++;
            }
          }
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-2xs">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Download Rooms Seating Report
            </h3>
            <p className="text-xs text-slate-500">
              Export consolidated room charts across multiple academic years at once
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Quick Academic Year Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("1_2")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYears.length === 2 &&
                selectedYears.includes("1st Year") &&
                selectedYears.includes("2nd Year")
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              1st & 2nd Year Combined
            </button>
            <button
              type="button"
              onClick={() => applyPreset("3_4")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYears.length === 2 &&
                selectedYears.includes("3rd Year") &&
                selectedYears.includes("4th Year")
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              3rd & 4th Year Combined
            </button>
            <button
              type="button"
              onClick={() => applyPreset("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYears.length === 4
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All 4 Years (Full College)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("1")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYears.length === 1 && selectedYears.includes("1st Year")
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              1st Year Only
            </button>
            <button
              type="button"
              onClick={() => applyPreset("2")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYears.length === 1 && selectedYears.includes("2nd Year")
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              2nd Year Only
            </button>
          </div>
        </div>

        {/* Custom Year Checkboxes */}
        <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            Select Academic Years to Include:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {allYears.map((yr) => {
              const checked = selectedYears.includes(yr);
              return (
                <label
                  key={yr}
                  onClick={() => toggleYear(yr)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    checked
                      ? "bg-blue-50/80 border-blue-400 text-blue-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      checked
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{yr}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Format Selector */}
        <div className="mb-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select File Export Format:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                format === "csv"
                  ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <FileSpreadsheet
                className={`w-5 h-5 mb-1 ${
                  format === "csv" ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <span className="text-xs font-bold text-slate-900 block">
                Excel / CSV Spreadsheet
              </span>
              <span className="text-[10px] text-slate-500 block">
                Single file with all room desks & candidate details
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                format === "pdf"
                  ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <Printer
                className={`w-5 h-5 mb-1 ${
                  format === "pdf" ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <span className="text-xs font-bold text-slate-900 block">
                Printable PDF / HTML Notice
              </span>
              <span className="text-[10px] text-slate-500 block">
                Official 2D room layouts formatted for notice boards
              </span>
            </button>
          </div>
        </div>

        {/* Scope Summary */}
        <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Rooms to export: <strong className="text-slate-900">{rooms.length} Halls</strong>
            </span>
          </div>
          <div className="text-blue-600 font-bold">
            {totalCandidates} Candidates Seated
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || selectedYears.length === 0}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading
                ? "Exporting Report..."
                : `Download for ${selectedYears.join(" & ")}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
