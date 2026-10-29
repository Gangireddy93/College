import React, { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle2, RotateCcw, Building2, Users } from "lucide-react";
import { api } from "../api";

export default function DeleteOptionsSection({ onRefresh, onDeleteStudentsByYear, onDeleteRoomsByYear }) {
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Clean empty data and empty rooms
  const handleCleanEmpty = async () => {
    if (confirm("Delete any student records with missing data and delete any rooms with 0 allocated students?")) {
      setLoading(true);
      setActionMessage(null);
      try {
        const res = await api.cleanEmptyDataAndRooms();
        setActionMessage({
          type: "success",
          text: res.message || "Cleaned empty records and empty rooms successfully!",
        });
        onRefresh();
      } catch (err) {
        setActionMessage({
          type: "error",
          text: err.response?.data?.message || err.message || "Failed to clean database",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear all data (fresh start)
  const handleClearAll = async () => {
    if (confirm("WARNING: This will permanently delete ALL students and ALL rooms in the system so you can start completely fresh. Are you sure?")) {
      setLoading(true);
      setActionMessage(null);
      try {
        const res = await api.clearAllData();
        setActionMessage({
          type: "success",
          text: res.message || "All student records and rooms cleared successfully. Ready for fresh uploads.",
        });
        onRefresh();
      } catch (err) {
        setActionMessage({
          type: "error",
          text: err.response?.data?.message || err.message || "Failed to clear database",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database & Delete Management</h2>
            <p className="text-xs text-slate-500">
              Clean empty records, delete students and rooms year-wise, or wipe database for fresh uploads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanEmpty}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 border border-slate-300"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Clean Empty Records & Rooms</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={loading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Clear All Data (Fresh Start)</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Grid of 2 Categories: Delete Students Year-Wise vs Delete Rooms Year-Wise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category 1: Students Year-Wise Deletion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Delete Students Year-Wise</h3>
              <p className="text-[11px] text-slate-500">
                Removes all student records for a specific academic year and frees their room seats.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => onDeleteStudentsByYear(year)}
                disabled={loading}
                className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all text-left flex items-center justify-between group"
              >
                <span>Delete {year} Students</span>
                <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600" />
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onDeleteStudentsByYear("All Years")}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Delete All Students (Wipe Student Records)</span>
            </button>
          </div>
        </div>

        {/* Category 2: Rooms Year-Wise Deletion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Delete Rooms Year-Wise</h3>
              <p className="text-[11px] text-slate-500">
                Removes examination rooms assigned to a specific year and deallocates candidates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => onDeleteRoomsByYear(year)}
                disabled={loading}
                className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all text-left flex items-center justify-between group"
              >
                <span>Delete {year} Rooms</span>
                <Trash2 className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-700" />
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleCleanEmpty}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Delete Empty Examination Rooms (0 Occupancy)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
