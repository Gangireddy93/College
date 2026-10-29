import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Building2,
  Layers,
  FileText,
  Clock,
  AlertCircle,
  Download,
  School,
  Shield,
  EyeOff,
  Zap,
} from "lucide-react";
import { api } from "../api";
import { saveCollegeSettings } from "../utils/collegeSettings";

const COLLEGES_LIST = [
  {
    code: "GIT",
    name: "Gates Institute of Technology",
    shortName: "Gates Tech",
    tagline: "Autonomous Institution • Approved by AICTE • Accredited with 'A+' Grade by NAAC",
    affiliation: "Autonomous Institution • Affiliated to JNTUA • Anantapur",
    location: "NH-44, Gooty Road, Anantapur, AP",
    examTitle: "Autonomous Theory End Semester Examinations 2026",
    primaryColor: "blue",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    adminUsername: "admin_gates",
    adminPassword: "admin@gates2026",
    adminName: "Dr. P. Ramesh Kumar (Controller of Exams)",
    sampleTickets: [
      { label: "1st Year", ticket: "HT2026CSE001", branch: "CSE" },
      { label: "2nd Year", ticket: "HT2025ECE001", branch: "ECE" },
      { label: "3rd Year", ticket: "HT2024AI001", branch: "AI" },
      { label: "4th Year", ticket: "HT2023MEC001", branch: "MEC" },
    ],
  },
  {
    code: "AIST",
    name: "Apex Institute of Science & Technology",
    shortName: "Apex Tech",
    tagline: "Premier Autonomous Engineering Campus • Approved by AICTE & UGC",
    affiliation: "Affiliated to VTU • NAAC Grade A++ Autonomous Campus",
    location: "Electronic City Phase 1, Bengaluru, KA",
    examTitle: "Autonomous B.Tech Regular & Supplementary Examinations 2026",
    primaryColor: "emerald",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    adminUsername: "admin_apex",
    adminPassword: "admin@apex2026",
    adminName: "Dr. Arvind Hegde (Dean of Examinations)",
    sampleTickets: [
      { label: "1st Year", ticket: "HT2026CSE002", branch: "CSE" },
      { label: "2nd Year", ticket: "HT2025ECE002", branch: "ECE" },
      { label: "3rd Year", ticket: "HT2024AI002", branch: "AI" },
      { label: "4th Year", ticket: "HT2023MEC002", branch: "MEC" },
    ],
  },
  {
    code: "NCE",
    name: "National College of Engineering",
    shortName: "National Engg",
    tagline: "Centrally Funded Autonomous Institution • NBA Accredited Programs",
    affiliation: "Autonomous Campus • Affiliated to JNTUH • Hyderabad",
    location: "Kukatpally Housing Board, Hyderabad, TS",
    examTitle: "Annual Theory & Practical Seating Examination 2026",
    primaryColor: "purple",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    adminUsername: "admin_nce",
    adminPassword: "admin@nce2026",
    adminName: "Dr. S. K. Murthy (Chief Superintendent)",
    sampleTickets: [
      { label: "1st Year", ticket: "HT2026CSE003", branch: "CSE" },
      { label: "2nd Year", ticket: "HT2025ECE003", branch: "ECE" },
      { label: "3rd Year", ticket: "HT2024AI003", branch: "AI" },
      { label: "4th Year", ticket: "HT2023MEC003", branch: "MEC" },
    ],
  },
  {
    code: "OGU",
    name: "Oxford Global University",
    shortName: "Oxford Global",
    tagline: "Deemed to be University • World-Class Research & Innovation Hub",
    affiliation: "Approved by UGC & AICTE • International Accreditation Board",
    location: "IT Corridor, OMR, Chennai, TN",
    examTitle: "University End Term Examinations 2026",
    primaryColor: "rose",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    adminUsername: "admin_oxford",
    adminPassword: "admin@oxford2026",
    adminName: "Prof. E. Henderson (Registrar & Controller)",
    sampleTickets: [
      { label: "1st Year", ticket: "HT2026CSE004", branch: "CSE" },
      { label: "2nd Year", ticket: "HT2025ECE004", branch: "ECE" },
      { label: "3rd Year", ticket: "HT2024AI004", branch: "AI" },
      { label: "4th Year", ticket: "HT2023MEC004", branch: "MEC" },
    ],
  },
];

export default function HomePage({
  onStudentLogin,
  onAdminLogin,
  collegeSettings,
  onCollegeChange,
}) {
  const [activeTab, setActiveTab] = useState("student"); // "student" or "admin"

  // Selected College
  const [selectedCollege, setSelectedCollege] = useState(() => {
    if (collegeSettings?.code) {
      const match = COLLEGES_LIST.find((c) => c.code === collegeSettings.code);
      if (match) return match;
    }
    return COLLEGES_LIST[0];
  });

  // Student login form
  const [hallTicket, setHallTicket] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [studentError, setStudentError] = useState("");

  // Admin login form
  const [adminUsername, setAdminUsername] = useState(selectedCollege.adminUsername);
  const [adminPassword, setAdminPassword] = useState(selectedCollege.adminPassword);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Switch college handler
  const handleSelectCollege = (col) => {
    setSelectedCollege(col);
    setAdminUsername(col.adminUsername);
    setAdminPassword(col.adminPassword);
    setAdminError("");
    setStudentError("");

    const updatedSettings = saveCollegeSettings({
      collegeName: col.name,
      collegeCode: col.code,
      affiliation: col.affiliation,
      examTitle: col.examTitle,
      code: col.code,
      name: col.name,
    });

    if (onCollegeChange) {
      onCollegeChange(updatedSettings);
    }
  };

  // Handle student login
  const handleStudentSubmit = (e) => {
    if (e) e.preventDefault();
    if (!hallTicket.trim()) {
      setStudentError("Please enter your examination hall ticket number");
      return;
    }
    setStudentError("");
    onStudentLogin(hallTicket.trim());
  };

  // Quick fill student ticket
  const handleQuickStudentTicket = (ticket) => {
    setHallTicket(ticket);
    setStudentError("");
    onStudentLogin(ticket);
  };

  // Handle admin login
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    try {
      const res = await api.loginAdmin(adminUsername, adminPassword, selectedCollege.code);
      if (res.success) {
        localStorage.setItem("admin_token", res.token);
        localStorage.setItem("admin_user", JSON.stringify(res.user));

        // Save active college settings
        const updated = saveCollegeSettings({
          collegeName: selectedCollege.name,
          collegeCode: selectedCollege.code,
          affiliation: selectedCollege.affiliation,
          examTitle: selectedCollege.examTitle,
          code: selectedCollege.code,
          name: selectedCollege.name,
        });
        if (onCollegeChange) onCollegeChange(updated);

        onAdminLogin(res.user);
      }
    } catch (err) {
      setAdminError(
        err.response?.data?.message ||
          `Invalid credentials for ${selectedCollege.shortName}. Use: ${selectedCollege.adminUsername} / ${selectedCollege.adminPassword} or universal admin / admin@college2026`
      );
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
                {selectedCollege.shortName} Examination Portal
              </h1>
              <p className="text-[11px] text-blue-300 font-medium">
                Autonomous Seating & Admit Card Verification Network
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Admin Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Dual Login Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-center">
        {/* Title & Badge */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Multi-Tenant Institutional Examination Platform 2026
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous Examination <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Seat Allocation</span> & Hall Tickets
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Multi-college enterprise platform with strict institutional tenancy isolation, unlimited automated examination rooms, and real-time anti-cheat seating.
          </p>
        </div>

        {/* Multi-College Selector Banner */}
        <div className="mb-8 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <School className="w-4 h-4 text-blue-400" />
              <span>Select Institution / College Campus:</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 w-fit">
              <Shield className="w-3 h-3" />
              <span>Institutional Tenancy Security Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {COLLEGES_LIST.map((col) => {
              const isSelected = selectedCollege.code === col.code;
              return (
                <button
                  key={col.code}
                  type="button"
                  onClick={() => handleSelectCollege(col)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-slate-700/90 border-blue-500 ring-2 ring-blue-500/40 shadow-lg"
                      : "bg-slate-900/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {col.code}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{col.shortName}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{col.location}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Single-Portal Active Switcher */}
        <div className="flex items-center justify-center p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700 max-w-md mx-auto mb-6 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "student"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Display Only The Selected Portal */}
        <div className="max-w-xl mx-auto w-full">
          {activeTab === "student" ? (
            /* Student Portal View */
            <div className="rounded-3xl p-6 sm:p-8 border bg-slate-800/95 border-blue-500/60 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${selectedCollege.badgeColor}`}>
                    {selectedCollege.code} Student Portal
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                  Student Examination Portal
                </h3>
                <p className="text-xs text-blue-300 font-semibold mb-2">
                  {selectedCollege.name}
                </p>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Enter your hall ticket number to view your allocated examination room, row, column, bench number, interactive floor plan, and download your official admit card slip.
                </p>

                {/* Quick Sample Tickets for All 4 Years */}
                <div className="mb-5 bg-slate-900/60 border border-slate-700/70 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Quick Test Hall Tickets (All 4 Years):
                    </span>
                    <span className="text-[10px] text-slate-400">Click to test</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedCollege.sampleTickets.map((st) => (
                      <button
                        key={st.ticket}
                        type="button"
                        onClick={() => handleQuickStudentTicket(st.ticket)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] text-blue-400 block font-semibold">{st.label}</span>
                        <span className="text-xs font-mono font-bold text-white group-hover:text-blue-300 block truncate">
                          {st.ticket}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  {/* Academic Year Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Academic Year:
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="All Years">All Years (Auto Detect)</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hall Ticket Number:
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Enter your hall ticket number (e.g. HT2026CSE001)"
                        value={hallTicket}
                        onChange={(e) => {
                          setHallTicket(e.target.value);
                          setStudentError("");
                        }}
                        className="w-full text-sm font-mono font-bold pl-9 pr-3 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {studentError && (
                      <p className="text-xs text-rose-400 mt-1.5 font-medium">{studentError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <span>Find My Examination Seat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Official Admit Card Slip & Floor Map</span>
                <span className="text-blue-400 font-semibold">Print & PDF Download</span>
              </div>
            </div>
          ) : (
            /* Admin Portal Login */
            <div className="rounded-3xl p-6 sm:p-8 border bg-slate-800/95 border-indigo-500/60 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/40">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${selectedCollege.badgeColor}`}>
                  {selectedCollege.code} Admin Portal
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                Examination Administrator Sign In
              </h3>
              <p className="text-xs text-indigo-300 font-semibold mb-1">
                {selectedCollege.name}
              </p>
              <p className="text-[11px] text-slate-400 mb-4">
                Officer: <span className="text-slate-300 font-medium">{selectedCollege.adminName}</span>
              </p>

              {/* Multi-Tenant Security Notice */}
              <div className="mb-5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Strict Tenancy Isolation:</span> Logging into{" "}
                  <strong className="text-indigo-300">{selectedCollege.shortName}</strong> will strictly restrict all room allocations, student records, and admit cards to this campus. Other colleges cannot access your database records.
                </div>
              </div>

              {/* Quick Fill Credentials Buttons */}
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername(selectedCollege.adminUsername);
                    setAdminPassword(selectedCollege.adminPassword);
                    setAdminError("");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-700/80 hover:bg-slate-700 text-indigo-300 rounded-lg border border-indigo-500/30 cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Fill {selectedCollege.code} Admin ({selectedCollege.adminUsername})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername("admin");
                    setAdminPassword("admin@college2026");
                    setAdminError("");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 cursor-pointer"
                >
                  Fill Super Admin (admin)
                </button>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                {adminError && (
                  <p className="text-xs text-rose-400 font-medium">{adminError}</p>
                )}

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{adminLoading ? "Authenticating & Isolating Tenant..." : `Sign In to ${selectedCollege.shortName} Admin`}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Feature Cards matching Image */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-5xl mx-auto w-full">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">Anti-Cheat Algorithm</h4>
            <p className="text-[10px] text-slate-400">Zero adjacent neighbor conflicts</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <Building2 className="w-5 h-5 text-blue-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">Unlimited Rooms</h4>
            <p className="text-[10px] text-slate-400">Auto-expand capacity per student</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <Layers className="w-5 h-5 text-indigo-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">Column-Wise Seating</h4>
            <p className="text-[10px] text-slate-400">Sequential top-to-bottom seats</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <GraduationCap className="w-5 h-5 text-purple-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">All 4 Academic Years</h4>
            <p className="text-[10px] text-slate-400">1st, 2nd, 3rd & 4th Year support</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-[11px] text-slate-500">
        {selectedCollege.name} • Autonomous Examination Branch • Multi-College Isolation Engine
      </footer>
    </div>
  );
}
