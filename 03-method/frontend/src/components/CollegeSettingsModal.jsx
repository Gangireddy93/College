import React, { useState } from "react";
import { School, CheckCircle2, X, Sparkles, Building2, ShieldAlert } from "lucide-react";
import { getCollegeSettings, saveCollegeSettings } from "../utils/collegeSettings";

export default function CollegeSettingsModal({ onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(getCollegeSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    {
      name: "Gates Institute of Technology",
      code: "GIT",
      affiliation: "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade by NAAC",
      title: "Autonomous Theory End Semester Examinations 2026",
    },
    {
      name: "Apex Institute of Science & Technology",
      code: "AIST",
      affiliation: "Premier Autonomous Engineering Campus • Approved by AICTE & UGC",
      title: "Autonomous B.Tech Regular & Supplementary Examinations 2026",
    },
    {
      name: "National College of Engineering",
      code: "NCE",
      affiliation: "Centrally Funded Autonomous Institution • NBA Accredited Programs",
      title: "Annual Theory & Practical Seating Examination 2026",
    },
    {
      name: "Oxford Global University",
      code: "OGU",
      affiliation: "Deemed to be University • World-Class Research & Innovation Hub",
      title: "University End Term Examinations 2026",
    },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    const updated = saveCollegeSettings(settings);
    setSavedSuccess(true);
    if (onSettingsUpdated) onSettingsUpdated(updated);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleApplyPreset = (p) => {
    setSettings({
      collegeName: p.name,
      collegeCode: p.code,
      affiliation: p.affiliation,
      examTitle: p.title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Customize College Branding
            </h3>
            <p className="text-xs text-slate-500">
              Set your college name & affiliations to apply across all hall tickets, seating layouts, and printouts.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick College Presets:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-[11px] font-medium transition-all"
              >
                <strong className="block text-slate-800 text-[11px] truncate">
                  {p.code}
                </strong>
                <span className="text-slate-500 text-[10px] block truncate">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">College / University Name</label>
            <input
              type="text"
              value={settings.collegeName}
              onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="font-bold text-slate-700 block mb-1">Code / Acronym</label>
              <input
                type="text"
                value={settings.collegeCode}
                onChange={(e) => setSettings({ ...settings, collegeCode: e.target.value })}
                className="w-full text-xs font-bold font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Examination Title</label>
              <input
                type="text"
                value={settings.examTitle}
                onChange={(e) => setSettings({ ...settings, examTitle: e.target.value })}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Affiliation & Accreditation Line</label>
            <textarea
              rows={2}
              value={settings.affiliation}
              onChange={(e) => setSettings({ ...settings, affiliation: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>College branding updated successfully! All printouts and layouts will use these details.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
            >
              Apply Branding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
