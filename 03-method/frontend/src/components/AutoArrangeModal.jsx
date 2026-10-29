import React, { useState } from "react";
import {
  Zap,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  RefreshCw,
  Layers,
  Trash2,
} from "lucide-react";
import { api } from "../api";

export default function AutoArrangeModal({
  stats,
  rooms = [],
  onClose,
  onSuccess,
}) {
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [cleanPrevious, setCleanPrevious] = useState(true);
  const [autoExpand, setAutoExpand] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Compute student count for selected year
  const studentCountForYear =
    selectedYear === "All Years"
      ? stats?.totalStudents || 0
      : stats?.yearCounts?.[selectedYear] || 0;

  const totalSeats = stats?.totalSeats || 0;

  const handleExecute = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessResult(null);

    try {
      // Step 1: If autoExpand is on and available seats < students, expand rooms automatically
      if (autoExpand && totalSeats < studentCountForYear) {
        await api.autoExpandRooms(studentCountForYear - totalSeats, selectedYear);
      }

      // Step 2: If cleanPrevious is selected, reset previous allocations for clean arrangement
      if (cleanPrevious) {
        await api.resetAllocation(selectedYear);
      }

      // Step 3: Run anti-cheat column-wise allocation
      const res = await api.runAllocation(selectedYear);
      if (res.success) {
        setSuccessResult({
          allocated: res.allocatedCount,
          pending: res.pendingCount,
          roomsUsed: res.totalRoomsUsed || rooms.length,
          message: res.message,
        });

        if (onSuccess) onSuccess();

        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.message || "Failed to execute seating arrangement.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Allocation failed. Check room capacities."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-2xs">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              1-Click Auto-Arrange Seating
            </h3>
            <p className="text-xs text-slate-500">
              Select academic year and instantly arrange anti-cheat column-wise seats
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            1. Select Academic Year to Arrange:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {years.map((y) => {
              const isSelected = selectedYear === y;
              const count =
                y === "All Years"
                  ? stats?.totalStudents || 0
                  : stats?.yearCounts?.[y] || 0;

              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-bold block">{y}</span>
                  <span
                    className={`text-[10px] block font-mono ${
                      isSelected ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {count} Students
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Capacity Audit Banner */}
        <div className="mb-5 bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-blue-600" />
              Eligible Candidates ({selectedYear}):
            </span>
            <strong className="text-slate-900 font-bold font-mono">
              {studentCountForYear} Students
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Total Examination Capacity:
            </span>
            <strong className="text-slate-900 font-bold font-mono">
              {totalSeats} Desks across {rooms.length} Halls
            </strong>
          </div>
          <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Capacity Balance:
            </span>
            <span className="text-emerald-700 font-bold">
              {totalSeats >= studentCountForYear
                ? `100% Seats Covered (+${totalSeats - studentCountForYear} Extra)`
                : `Shortage of ${studentCountForYear - totalSeats} seats (Auto-expand will fix)`}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="mb-5 space-y-2.5">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={cleanPrevious}
              onChange={(e) => setCleanPrevious(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-bold text-slate-800 block">
                Remove previous seating data for {selectedYear}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Guarantees clean fresh arranging without duplicate seat collisions or ghost records.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={autoExpand}
              onChange={(e) => setAutoExpand(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-bold text-slate-800 block">
                Auto-expand unlimited rooms (Total Seats == Total Students)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Automatically creates extra 25-seat halls if candidate count exceeds current desks.
              </span>
            </div>
          </label>
        </div>

        {/* Errors & Success */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successResult && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="block font-bold">Seating Arranged Successfully!</span>
              <span className="block text-[11px]">
                {successResult.allocated} candidates assigned into examination halls with zero conflicts.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
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
            onClick={handleExecute}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Arranging Seating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Arrange Seating Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
