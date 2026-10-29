import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Download,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { api } from "../api";

export default function AdminStudyMaterialSection({ onRefresh }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [searchTerm, setSearchTerm] = useState("");

  // Add material form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    academicYear: "1st Year",
    semester: "Semester 1",
    branch: "Computer Science & Engineering (CSE)",
    subject: "",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/sample_document.pdf",
    description: "",
    fileSize: "4.5 MB",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = [
    "All Semesters",
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  const branches = [
    "Computer Science & Engineering (CSE)",
    "Computer Science & Artificial Intelligence (CSE-AI)",
    "Cyber Security",
    "Data Sciences",
    "Electronics & Communication Engineering (ECE)",
    "Electrical & Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "All Branches",
  ];

  const materialTypes = [
    "Lecture Notes",
    "Question Bank",
    "Lab Manual",
    "Previous Question Papers (PYQ)",
    "Syllabus & Curriculum",
  ];

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.getStudyMaterials({
        academicYear: selectedYear !== "All Years" ? selectedYear : "",
        semester: selectedSemester !== "All Semesters" ? selectedSemester : "",
        search: searchTerm,
      });
      if (res.success) {
        setMaterials(res.materials || []);
      }
    } catch (err) {
      console.error("Error loading study materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedYear, selectedSemester, searchTerm]);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) {
      alert("Please provide Title and Subject name");
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await api.addStudyMaterial(formData);
      setStatusMsg({
        type: "success",
        text: res.message || "Material added successfully!",
      });
      alert(res.message || "Study material uploaded successfully!");
      setShowAddForm(false);
      setFormData({
        title: "",
        academicYear: "1st Year",
        semester: "Semester 1",
        branch: "Computer Science & Engineering (CSE)",
        subject: "",
        materialType: "Lecture Notes",
        fileUrl: "https://example.com/materials/sample_document.pdf",
        description: "",
        fileSize: "4.5 MB",
      });
      loadMaterials();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to add material",
      });
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await api.deleteStudyMaterial(id);
      alert(res.message || "Material deleted");
      loadMaterials();
    } catch (err) {
      alert("Error deleting material: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Study Materials & Question Banks Manager
            </h2>
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              8 Semesters
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Upload and manage lecture notes, question banks, previous examination papers, and lab manuals across all 4 years and 8 semesters.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Hide Form" : "Add New Material"}</span>
        </button>
      </div>

      {/* Add Material Modal / Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-md animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Upload New Study Material or Question Bank
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">All fields are editable</span>
          </div>

          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  1. Academic Year:
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => {
                    const y = e.target.value;
                    let defaultSem = "Semester 1";
                    if (y === "2nd Year") defaultSem = "Semester 3";
                    if (y === "3rd Year") defaultSem = "Semester 5";
                    if (y === "4th Year") defaultSem = "Semester 7";
                    setFormData({ ...formData, academicYear: y, semester: defaultSem });
                  }}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="All Years">All Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  2. Semester (8 Sems):
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-purple-500"
                >
                  {semesters.filter((s) => s !== "All Semesters").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  3. Department / Branch:
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-purple-500"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  4. Material Type:
                </label>
                <select
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-purple-500"
                >
                  {materialTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Document / Material Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms Comprehensive Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures or Engineering Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Download Link / File URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/materials/notes.pdf"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Estimated File Size:
                </label>
                <input
                  type="text"
                  placeholder="4.5 MB"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Description / Topics Covered:
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of units, question bank solutions, or previous exam trends..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? "Uploading..." : "Save & Publish Material"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Year Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter by Academic Year:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === year
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Semester Filter Pills & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedSemester === sem
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {sem}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Materials List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
            Loading materials...
          </div>
        ) : materials.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              No study materials found for the selected year and semester. Click "Add New Material" to upload one!
            </p>
          </div>
        ) : (
          materials.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {m.semester}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {m.academicYear}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {m.title}
                </h4>
                <p className="text-xs font-bold text-purple-800 mb-2">
                  {m.subject}
                </p>

                {m.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                    {m.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {m.materialType}
                  </span>
                  <span>•</span>
                  <span>{m.fileSize}</span>
                  <span>•</span>
                  <span>{m.downloads} downloads</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={m.fileUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Material</span>
                </a>

                <button
                  onClick={() => handleDelete(m._id, m.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete study material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
