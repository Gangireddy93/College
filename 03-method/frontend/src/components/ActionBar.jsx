import React, { useState } from "react";
import { Sparkles, RotateCcw, Trash2, Database, ShieldCheck, Filter } from "lucide-react";

export default function ActionBar({
  selectedYear,
  setSelectedYear,
  onRunAllocation,
  onResetAllocation,
  onDeleteByYear,
  onSeedDemo,
  loading,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [yearToDelete, setYearToDelete] = useState("1st Year");

  const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Year Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Year:
        </span>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedYear === y
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Anti-cheat allocate button */}
        <button
          onClick={onRunAllocation}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          title="Allocates seats column-wise starting with AI and ECE with zero adjacent conflicts (front, back, left, right)"
        >
          <ShieldCheck className="w-4 h-4 text-blue-200" />
          <span>Run Anti-Cheat Allocation</span>
        </button>

        {/* Clear allocations */}
        <button
          onClick={onResetAllocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Allocations</span>
        </button>

        {/* Delete by year */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Delete by Year</span>
        </button>

        {/* Load demo data */}
        <button
          onClick={onSeedDemo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Load Demo Data</span>
        </button>
      </div>

      {/* Delete Year Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Students by Year</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select the academic year to remove all corresponding students and free their room seats.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Academic Year:
              </label>
              <select
                value={yearToDelete}
                onChange={(e) => setYearToDelete(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteByYear(yearToDelete);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
