import React from "react";
import { AlertTriangle, Trash2, RefreshCw, X, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function UploadConfirmModal({
  isOpen,
  type = "students", // "students" | "rooms"
  targetName = "1st Year",
  existingCount = 0,
  onConfirmReplace,
  onConfirmMerge,
  onCancel,
}) {
  if (!isOpen) return null;

  const isStudent = type === "students";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in space-y-5">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Duplicate Upload Protection
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 leading-snug">
              {isStudent
                ? `Data for "${targetName}" is Already Uploaded!`
                : "Examination Rooms Already Exist in Database!"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The database already contains{" "}
              <strong className="text-slate-800 font-bold">{existingCount}</strong>{" "}
              {isStudent ? `student records for ${targetName}` : "configured examination rooms"}.
            </p>
          </div>
        </div>

        {/* Explanation Warning Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Recommended Procedure:</span>
          </div>
          <p>
            {isStudent
              ? "To prevent duplicate students, mismatched seating, or overwriting partial batches, you should delete the existing year's records first before uploading the new file."
              : "To change room seating plans or column capacities, delete existing rooms first or choose to replace all rooms with the new spreadsheet."}
          </p>
        </div>

        {/* Action Choices */}
        <div className="space-y-2.5 pt-1">
          {/* Option 1: Delete Existing & Upload Fresh (Primary) */}
          <button
            onClick={onConfirmReplace}
            className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="block font-black text-sm">Delete Existing & Upload Fresh</span>
                <span className="block text-[11px] text-rose-100 font-medium">
                  {isStudent
                    ? `Wipes existing ${existingCount} students for ${targetName} and allocates new file`
                    : `Removes existing ${existingCount} rooms and imports fresh room layout`}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white text-rose-700 shrink-0">
              Recommended
            </span>
          </button>

          {/* Option 2: Merge / Update */}
          <button
            onClick={onConfirmMerge}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between border border-slate-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <div>
                <span className="block font-bold">Merge / Update Matching Records</span>
                <span className="block text-[10px] text-slate-500 font-normal">
                  Updates matching Hall Tickets without wiping other records
                </span>
              </div>
            </div>
          </button>

          {/* Option 3: Cancel */}
          <button
            onClick={onCancel}
            className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel Upload
          </button>
        </div>
      </div>
    </div>
  );
}
