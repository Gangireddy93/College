import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  MapPin,
  Building2,
  Layers,
  Armchair,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  FileText,
  HelpCircle,
  QrCode,
  Sparkles,
  Info,
  LogOut,
  LogIn,
  Briefcase,
  Trophy,
  Users,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
  Zap,
} from "lucide-react";
import { api } from "../api";
import { downloadHallTicketPDF } from "../utils/exportUtils";
import HallTicketModal from "./HallTicketModal";
import StudentChatbot from "./StudentChatbot";

export default function StudentPortal({ onBackToDashboard, initialTicket, collegeSettings }) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "materials" | "placement" | "events" | "ai"

  // Student auth & lookup
  const [selectedCollege, setSelectedCollege] = useState(
    collegeSettings?.collegeName || collegeSettings?.name || "Gates Institute of Technology"
  );
  const [selectedYear, setSelectedYear] = useState("1st Year");
  const [hallTicketInput, setHallTicketInput] = useState(initialTicket || "HT2026CSE001");
  const [studentData, setStudentData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdmitCard, setShowAdmitCard] = useState(false);

  // AI Assistant Chat state in Student Portal
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your AI Study Assistant. Ask me anything about your subjects, exam preparation, or study materials.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Study Materials state
  const [materials, setMaterials] = useState([]);
  const [matYear, setMatYear] = useState("1st Year");
  const [matSem, setMatSem] = useState("Semester 1");
  const [matLoading, setMatLoading] = useState(false);

  // Campus Data state
  const [campusData, setCampusData] = useState(null);

  // Load initial ticket on mount
  useEffect(() => {
    handleSearch(hallTicketInput || "HT2026CSE001");
    loadCampusData();
    loadStudyMaterials();
  }, []);

  const loadCampusData = async () => {
    try {
      const res = await api.getCampusData();
      if (res.success) {
        setCampusData(res.campus);
      }
    } catch (err) {
      console.error("Failed to load campus data:", err);
    }
  };

  const loadStudyMaterials = async () => {
    setMatLoading(true);
    try {
      const res = await api.getStudyMaterials({
        academicYear: matYear,
        semester: matSem,
      });
      if (res.success) {
        setMaterials(res.materials || []);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setMatLoading(false);
    }
  };

  const handleSearch = async (ticketToSearch) => {
    const ticket = (ticketToSearch || hallTicketInput).trim();
    if (!ticket) {
      setError("Please enter your examination hall ticket number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchStudent(ticket);
      if (res.success && res.student) {
        setStudentData(res.student);
        setRoomData(res.roomDetails);
        if (res.student.academicYear) {
          setSelectedYear(res.student.academicYear);
        }
      } else {
        setError(`No student record found with Hall Ticket Number: "${ticket}".`);
        setStudentData(null);
        setRoomData(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No student record found with Hall Ticket Number: "${ticket}". Please check the number.`
      );
      setStudentData(null);
      setRoomData(null);
    } finally {
      setLoading(false);
    }
  };

  // AI Assistant Quick Send
  const handleSendChat = (messageText) => {
    const text = messageText || chatInput;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Here is a quick concept breakdown: In Database Management Systems (DBMS), data is stored in structured tables with primary keys, ensuring ACID properties (Atomicity, Consistency, Isolation, Durability) for fault tolerance!";
      if (text.toLowerCase().includes("math") || text.toLowerCase().includes("calculus")) {
        reply = "Engineering Mathematics focuses on Linear Algebra, Eigenvalues, Differential Equations, and Laplace Transforms. Make sure to practice matrix diagonalisation!";
      } else if (text.toLowerCase().includes("exam") || text.toLowerCase().includes("seat")) {
        reply = `Your examination seat is allocated in ${studentData?.roomNumber ? `Room ${studentData.roomNumber}` : "Room 101"}, Seat #${studentData?.seatNumber || 1}. Please arrive 30 minutes before the FN session (10:00 AM)!`;
      }
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  // Quick ticket search helper
  const handleQuickTicket = (ticket) => {
    setHallTicketInput(ticket);
    handleSearch(ticket);
  };

  const currentSeatNum = studentData?.seatNumber || 1;
  const currentRoomNum = studentData?.roomNumber || "1";
  const currentBlock = studentData?.block || "A Block";
  const currentFloor = studentData?.floor || "Ground Floor";
  const currentBench = studentData?.benchNumber || "Bench 01";

  const collegesList = [
    "Gates Institute of Technology",
    "Apex Institute of Science & Technology",
    "National College of Engineering",
    "Oxford Global University",
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 py-6 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP PANEL: Find Your Examination Seat Hero & 2D Layout matching Screenshot */}
        <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Text matching Screenshot */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Examination Seat Allocation Portal
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Examination Seat</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                Enter your hall ticket number to view your complete exam details and seat location with interactive 2D layout.
              </p>

              {/* 4 Feature Badges matching Screenshot */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Quick & Accurate Seat Allocation</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-semibold">All Academic Years</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-200 flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold">Interactive Room Layout</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold">Multi-College Support</span>
                </div>
              </div>
            </div>

            {/* Right: Search Inputs Form matching Screenshot */}
            <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Select College */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Select College
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {collegesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="All Years">All Years</option>
                    </select>
                  </div>

                  {/* Hall Ticket Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Hall Ticket Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={hallTicketInput}
                        onChange={(e) => {
                          setHallTicketInput(e.target.value);
                          setError(null);
                        }}
                        placeholder="e.g. HT2026CSE001"
                        className="w-full text-xs font-mono font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Test Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400">Quick Test:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickTicket("HT2026CSE001")}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 cursor-pointer"
                  >
                    1st Yr: HT2026CSE001
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTicket("HT2025ECE001")}
                    className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 cursor-pointer"
                  >
                    2nd Yr: HT2025ECE001
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTicket("HT2024AI001")}
                    className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 cursor-pointer"
                  >
                    3rd Yr: HT2024AI001
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTicket("HT2023MEC001")}
                    className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 cursor-pointer"
                  >
                    4th Yr: HT2023MEC001
                  </button>
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? "Searching Hall Ticket..." : "Search Hall Ticket"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Section: Hall Ticket Found Banner + 3 Cards matching Screenshot */}
          {studentData && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              {/* Green Success Banner matching Screenshot */}
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hall Ticket Found! Here are your exam details and seat location.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdmitCard(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Print Admit Card Slip</span>
                </button>
              </div>

              {/* 3 Columns matching Screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 1. Candidate Information Card */}
                <div className="md:col-span-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    {/* Student Photo Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 border border-blue-400/30 shadow-md">
                      {studentData.studentName ? studentData.studentName.charAt(0) : "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-black text-white truncate">
                          {studentData.studentName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-blue-400 font-bold">
                        {studentData.hallTicketNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Academic Year
                      </span>
                      <strong className="text-white text-xs">{studentData.academicYear}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Branch
                      </span>
                      <strong className="text-white text-xs block truncate">{studentData.branch}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Exam Session
                      </span>
                      <strong className="text-emerald-400 text-xs font-bold">
                        {studentData.examSession || "FN (Forenoon: 10:00 AM - 01:00 PM)"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Registered Subjects
                      </span>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed truncate">
                        {Array.isArray(studentData.subject)
                          ? studentData.subject.join(", ")
                          : studentData.subject || "All Core Semester Subjects"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Seat Allocation Details Card matching Screenshot */}
                <div className="md:col-span-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>Seat Allocation Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        Room Number
                      </span>
                      <strong className="text-white font-bold font-mono text-sm">
                        Room {currentRoomNum}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Block
                      </span>
                      <strong className="text-white font-bold">{currentBlock}</strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        Floor
                      </span>
                      <strong className="text-white font-bold">{currentFloor}</strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-purple-400" />
                        Bench Number
                      </span>
                      <strong className="text-purple-300 font-bold font-mono">
                        {currentBench}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/40">
                      <span className="text-blue-200 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Seat Number
                      </span>
                      <strong className="text-white font-black font-mono text-base">
                        Seat #{currentSeatNum}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Room 1 - Floor Map (5 x 5) matching Screenshot */}
                <div className="md:col-span-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-white">
                        Room {currentRoomNum} — Floor Map (5 x 5)
                      </h4>
                    </div>

                    {/* Legend matching Screenshot */}
                    <div className="flex items-center gap-3 text-[10px] pb-2 mb-2 border-b border-slate-800 text-slate-300">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-blue-600 ring-1 ring-blue-400" />
                        <span>Your Seat</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-slate-700" />
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-700" />
                        <span>Empty</span>
                      </div>
                    </div>

                    {/* 5x5 Grid matching Screenshot with R1... R25 */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {Array.from({ length: 25 }, (_, idx) => {
                        const seatIndex = idx + 1;
                        const isYourSeat = seatIndex === currentSeatNum;
                        const isOccupied = !isYourSeat && seatIndex <= 24;

                        return (
                          <div
                            key={seatIndex}
                            className={`p-1.5 rounded-lg text-center flex flex-col items-center justify-center transition-all ${
                              isYourSeat
                                ? "bg-blue-600 text-white font-black ring-2 ring-blue-300 shadow-lg scale-105"
                                : isOccupied
                                ? "bg-slate-800 text-slate-300 border border-slate-700/60"
                                : "bg-slate-900/60 text-slate-500 border border-slate-800"
                            }`}
                          >
                            <Armchair
                              className={`w-3.5 h-3.5 mb-0.5 ${
                                isYourSeat ? "text-white" : "text-slate-400"
                              }`}
                            />
                            <span className="text-[9px] font-mono font-bold leading-none">
                              R{seatIndex}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center pt-2 mt-2 border-t border-slate-800">
                    Front Invigilator Podium / Chalkboard is at Top
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM PANEL: Student Portal Growth & Resource Hub matching Screenshot */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Student Portal
              </h2>
              <p className="text-xs text-slate-500">
                Your complete academic and career growth hub
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Logged In: <strong className="text-slate-800">{studentData?.studentName || "Aarav Kumar"}</strong>
              </span>
            </div>
          </div>

          {/* 4 Cards Grid matching Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Study Materials Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Study Materials</h3>
                    <p className="text-xs text-slate-500">
                      Access lecture notes, question papers, syllabus and important study materials.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Engineering Mathematics - Notes.pdf
                        </span>
                        <span className="text-[10px] text-slate-400">1st Year • Semester 1 • 4.2 MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Downloading Engineering Mathematics - Notes.pdf")}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Communication English - Unit 1.pdf
                        </span>
                        <span className="text-[10px] text-slate-400">1st Year • Semester 1 • 2.8 MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Downloading Communication English - Unit 1.pdf")}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Previous Year Question Papers.pdf
                        </span>
                        <span className="text-[10px] text-slate-400">All Semesters • 2021-2025 PYQs • 8.5 MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Downloading Previous Year Question Papers.pdf")}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("materials")}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Materials</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Placement & Career Support Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Placement & Career Support
                    </h3>
                    <p className="text-xs text-slate-500">
                      Get ready for your future with curated resources and opportunities.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-purple-50/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Resume Builder
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Create a professional ATS-friendly resume
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-purple-50/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Interview Preparation
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Practice common interview questions & coding rounds
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-purple-50/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Job & Internship Listings
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Explore latest on-campus and off-campus drives (₹44.5 LPA Highest)
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Career portal: Active recruitment drives by Google, Microsoft, Amazon, TCS & Infosys.")}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Latest Opportunities</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Sports & Events Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Sports & Events</h3>
                    <p className="text-xs text-slate-500">
                      Stay updated with college sports, cultural events and technical festivals.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Annual Sports Meet 2026
                      </span>
                      <span className="text-[10px] text-slate-400">Jan 15, 2026 • Cricket, Football & Athletics</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Upcoming
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Tech Fest - Innovate 2026
                      </span>
                      <span className="text-[10px] text-slate-400">Feb 20, 2026 • 24hr Hackathon & Robotics</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Upcoming
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Cultural Fest
                      </span>
                      <span className="text-[10px] text-slate-400">Mar 10, 2026 • Music, Dance & Drama</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Upcoming campus events schedule has been synced.")}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Events</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4. AI Study Assistant Card matching Screenshot */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">AI Study Assistant</h3>
                      <p className="text-xs text-slate-500">
                        Ask quick questions about your subjects, exam preparation or study materials.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setChatMessages([
                        {
                          sender: "bot",
                          text: "Hi! I'm your AI Study Assistant. Ask me anything about your subjects, exam preparation, or study materials.",
                        },
                      ])
                    }
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Clear Chat
                  </button>
                </div>

                {/* Chat Messages Preview Box */}
                <div className="h-44 overflow-y-auto bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 mb-3 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-2.5 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-white text-slate-800 border border-slate-200 shadow-2xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="text-[11px] text-slate-400 italic">
                      AI is typing an explanation...
                    </div>
                  )}
                </div>

                {/* Quick prompt chip matching Screenshot */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => handleSendChat("Explain the basics of DBMS in simple words")}
                    className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                  >
                    "Explain the basics of DBMS in simple words"
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Type your question..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Admit Card View */}
        {showAdmitCard && studentData && (
          <HallTicketModal
            student={studentData}
            onClose={() => setShowAdmitCard(false)}
          />
        )}

        {/* Floating Student AI Chatbot Widget */}
        <StudentChatbot
          collegeSettings={collegeSettings}
          onSearchTicket={(ticket) => {
            setHallTicketInput(ticket);
            handleSearch(ticket);
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      </div>
    </div>
  );
}
