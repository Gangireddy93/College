import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Trash2,
  Table,
  UserPlus,
  Building2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  DoorClosed,
  Users,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "../api";
import UploadConfirmModal from "./UploadConfirmModal";
import AutoArrangeModal from "./AutoArrangeModal";
import MultiYearRoomDownloadModal from "./MultiYearRoomDownloadModal";

export default function UploadAndAddSection({
  onRefresh,
  selectedYear,
  onDeleteRoomsByYear,
  onDeleteStudentsByYear,
  rooms = [],
  stats,
}) {
  // Modal triggers
  const [showAutoArrangeModal, setShowAutoArrangeModal] = useState(false);
  const [showMultiYearDownloadModal, setShowMultiYearDownloadModal] = useState(false);

  // Student upload state
  const [studentFile, setStudentFile] = useState(null);
  const [studentYearType, setStudentYearType] = useState("1st Year");
  const [studentUploading, setStudentUploading] = useState(false);
  const [studentUploadSuccess, setStudentUploadSuccess] = useState(null);
  const studentFileRef = useRef(null);

  // Room upload state
  const [roomFile, setRoomFile] = useState(null);
  const [roomYearType, setRoomYearType] = useState("All Years");
  const [roomUploading, setRoomUploading] = useState(false);
  const [roomUploadSuccess, setRoomUploadSuccess] = useState(null);
  const roomFileRef = useRef(null);

  // Duplicate Check Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "students", // "students" | "rooms"
    targetName: "1st Year",
    existingCount: 0,
    file: null,
    academicYear: "1st Year",
  });

  // Manual room state
  const [manualRoom, setManualRoom] = useState({
    roomNumber: "",
    block: "A Block",
    floor: "Ground Floor",
    academicYear: "All Years",
    rowCount: 5,
    columns: 5,
    columnCapacitiesStr: "5,5,5,5,5",
  });
  const [addingRoom, setAddingRoom] = useState(false);
  const [roomAddMsg, setRoomAddMsg] = useState(null);

  // Manual student state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [manualStudent, setManualStudent] = useState({
    hallTicketNumber: "",
    studentName: "",
    academicYear: "1st Year",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Data Structures, Operating Systems",
    examSession: "FN (Forenoon)",
  });
  const [addingStudent, setAddingStudent] = useState(false);

  // Allocation & Management states
  const [allocating, setAllocating] = useState(false);
  const [allocationMsg, setAllocationMsg] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [deleteYearSelect, setDeleteYearSelect] = useState("1st Year");
  const [deletingYear, setDeletingYear] = useState(false);
  const [deletingRooms, setDeletingRooms] = useState(false);
  const [seedingAllYears, setSeedingAllYears] = useState(false);
  const [expandingRooms, setExpandingRooms] = useState(false);

  // 1-Click Execute Seat Allocation
  const handleExecuteAllocation = async () => {
    setAllocating(true);
    setAllocationMsg(null);
    try {
      const res = await api.runAllocation(selectedYear || "All Years");
      setAllocationMsg({
        type: "success",
        text: res.message || `Seats allocated successfully! (${res.allocatedCount} students placed)`,
      });
      alert(res.message || "Seats allocated successfully!");
      onRefresh();
    } catch (err) {
      setAllocationMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to execute seat allocation",
      });
      alert(err.response?.data?.message || err.message || "Failed to execute seat allocation");
    } finally {
      setAllocating(false);
    }
  };

  // 1-Click Seed All 4 Years (2,720 Students & 110 Rooms)
  const handleSeedAll4Years = async () => {
    if (
      !confirm(
        "Seed full 4 years dummy dataset? This will configure 2,720 students (680 students x 4 years, 8 branches x 85) and 110 examination halls (2,750 seats) with 100% column-wise anti-cheat allocation!"
      )
    ) {
      return;
    }
    setSeedingAllYears(true);
    try {
      const res = await api.seedAll4Years();
      alert(res.message || "Successfully seeded all 4 years and 110 examination halls!");
      onRefresh();
    } catch (err) {
      alert("Error seeding all 4 years: " + (err.response?.data?.message || err.message));
    } finally {
      setSeedingAllYears(false);
    }
  };

  // 1-Click Auto-Expand Rooms to match student capacity
  const handleAutoExpandRooms = async () => {
    setExpandingRooms(true);
    try {
      const res = await api.autoExpandRooms(0, selectedYear || "All Years");
      alert(res.message || "Rooms auto-expanded successfully!");
      onRefresh();
    } catch (err) {
      alert("Error expanding rooms: " + (err.response?.data?.message || err.message));
    } finally {
      setExpandingRooms(false);
    }
  };

  // Reset / Clear Allocation (Deallocate seats)
  const handleResetAllocation = async () => {
    if (!confirm("Are you sure you want to clear current seat allocations? Students will return to Pending status.")) return;
    try {
      const res = await api.resetAllocation(selectedYear || "All Years");
      alert(res.message || "Allocation reset successfully.");
      onRefresh();
    } catch (err) {
      alert("Error resetting allocation: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete students of specific year
  const handleDeleteYear = async () => {
    if (!confirm(`Permanently delete all "${deleteYearSelect}" students from database?`)) return;
    setDeletingYear(true);
    try {
      const res = await api.deleteStudentsByYear(deleteYearSelect);
      alert(res.message || `Deleted students for ${deleteYearSelect}`);
      onRefresh();
    } catch (err) {
      alert("Error deleting: " + (err.response?.data?.message || err.message));
    } finally {
      setDeletingYear(false);
    }
  };

  // Delete all rooms
  const handleDeleteAllRooms = async () => {
    if (!confirm("Permanently delete ALL examination rooms? Assigned students will be reset to Pending.")) return;
    setDeletingRooms(true);
    try {
      const res = await api.deleteRoomsByYear("All Years");
      alert(res.message || "All rooms deleted successfully");
      onRefresh();
    } catch (err) {
      alert("Error deleting rooms: " + (err.response?.data?.message || err.message));
    } finally {
      setDeletingRooms(false);
    }
  };

  // 1-Click Wipe All Data (Empty Database)
  const handleClearAll = async () => {
    if (
      !confirm(
        "Permanently wipe ALL student records and examination rooms from MongoDB? This will leave the database completely empty."
      )
    )
      return;
    setClearingAll(true);
    try {
      const res = await api.clearAllData();
      alert(res.message || "Database wiped successfully. Ready for fresh uploads.");
      onRefresh();
    } catch (err) {
      alert("Failed to clear data: " + (err.response?.data?.message || err.message));
    } finally {
      setClearingAll(false);
    }
  };

  // Handle student file upload - Checks for existing year data first!
  const handleStudentUpload = async () => {
    if (!studentFile) {
      alert("Please select a student Excel or CSV file first");
      return;
    }

    try {
      // Check if data for this year already exists
      const checkRes = await api.checkYearStatus(studentYearType);
      if (checkRes.success && checkRes.exists && checkRes.count > 0) {
        // Open confirmation popup modal!
        setConfirmModal({
          isOpen: true,
          type: "students",
          targetName: studentYearType,
          existingCount: checkRes.count,
          file: studentFile,
          academicYear: studentYearType,
        });
        return;
      }
    } catch {
      // Proceed if check endpoint is unavailable
    }

    // Direct upload if no duplicate detected
    executeStudentUpload(studentFile, studentYearType, false);
  };

  const executeStudentUpload = async (file, year, replaceExisting = false) => {
    setStudentUploading(true);
    setStudentUploadSuccess(null);
    try {
      const res = await api.uploadStudentsExcel(file, year, replaceExisting);
      setStudentUploadSuccess({
        message: res.message || "Students uploaded successfully!",
        details: `Academic Year: ${year} | Total Uploaded: ${res.uploadedCount || 0}`,
      });
      setStudentFile(null);
      if (studentFileRef.current) studentFileRef.current.value = "";
      setConfirmModal({ isOpen: false, type: "students", targetName: "", existingCount: 0, file: null, academicYear: "" });
      alert(res.message || `Uploaded students for ${year}!`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to upload student file");
    } finally {
      setStudentUploading(false);
    }
  };

  // Handle room file upload - Checks for existing rooms first!
  const handleRoomUpload = async () => {
    if (!roomFile) {
      alert("Please select a rooms Excel or CSV file first");
      return;
    }

    try {
      const checkRes = await api.checkRoomsStatus();
      if (checkRes.success && checkRes.exists && checkRes.count > 0) {
        setConfirmModal({
          isOpen: true,
          type: "rooms",
          targetName: "Examination Halls",
          existingCount: checkRes.count,
          file: roomFile,
          academicYear: roomYearType,
        });
        return;
      }
    } catch {
      // proceed
    }

    executeRoomUpload(roomFile, roomYearType, false);
  };

  const executeRoomUpload = async (file, year, replaceExisting = false) => {
    setRoomUploading(true);
    setRoomUploadSuccess(null);
    try {
      const res = await api.uploadRoomsExcel(file, year, replaceExisting);
      setRoomUploadSuccess({
        message: res.message || "Rooms uploaded successfully!",
        details: `Type: ${year} | Total Rooms: ${res.totalRooms || 0}`,
      });
      setRoomFile(null);
      if (roomFileRef.current) roomFileRef.current.value = "";
      setConfirmModal({ isOpen: false, type: "rooms", targetName: "", existingCount: 0, file: null, academicYear: "" });
      alert(res.message || "Rooms uploaded successfully!");
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to upload room file");
    } finally {
      setRoomUploading(false);
    }
  };

  // Handle manual room addition
  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!manualRoom.roomNumber.trim()) {
      alert("Please enter a room number (e.g. 101 or Room 5)");
      return;
    }
    setAddingRoom(true);
    setRoomAddMsg(null);
    try {
      let colCaps = [];
      if (manualRoom.columnCapacitiesStr.trim()) {
        colCaps = manualRoom.columnCapacitiesStr
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);
      }
      if (colCaps.length === 0) {
        colCaps = Array(Number(manualRoom.columns) || 5).fill(Number(manualRoom.rowCount) || 5);
      }

      await api.addRoom({
        roomNumber: manualRoom.roomNumber,
        block: manualRoom.block,
        floor: manualRoom.floor,
        academicYear: manualRoom.academicYear,
        rowCount: Number(manualRoom.rowCount) || Math.max(...colCaps, 5),
        columnCapacities: colCaps,
      });

      setRoomAddMsg({
        type: "success",
        text: `Room "${manualRoom.roomNumber}" created with ${colCaps.reduce((a, b) => a + b, 0)} column-wise seats!`,
      });
      setManualRoom({
        roomNumber: "",
        block: "A Block",
        floor: "Ground Floor",
        academicYear: "All Years",
        rowCount: 5,
        columns: 5,
        columnCapacitiesStr: "5,5,5,5,5",
      });
      onRefresh();
    } catch (err) {
      setRoomAddMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to add room",
      });
    } finally {
      setAddingRoom(false);
    }
  };

  // Handle manual student creation
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!manualStudent.hallTicketNumber.trim() || !manualStudent.studentName.trim()) {
      alert("Please provide Hall Ticket Number and Student Name");
      return;
    }
    setAddingStudent(true);
    try {
      await api.addStudent(manualStudent);
      alert(`Student ${manualStudent.hallTicketNumber} created and allocated!`);
      setShowAddStudentModal(false);
      setManualStudent({
        hallTicketNumber: "",
        studentName: "",
        academicYear: "1st Year",
        branch: "Computer Science & Engineering (CSE)",
        subject: "Data Structures, Operating Systems",
        examSession: "FN (Forenoon)",
      });
      onRefresh();
    } catch (err) {
      alert("Error adding student: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingStudent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Information Header Banner */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-white">
            Unlimited Data Engine: Anti-Cheat Column-Wise Seating
          </p>
          <p className="text-blue-200 text-[11px] leading-relaxed">
            Upload unlimited student batches and examination rooms. Rooms are allocated <strong>column by column</strong> with paired alternating streams so adjacent neighbors never share the same department or subject.
          </p>
        </div>
      </div>

      {/* Central Execution Action Hub */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dataset Management & Allocation Hub</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Dataset Management
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Upload your data files to configure students and rooms. You can also auto-arrange seating, download multi-year room charts, or seed all 4 years demo data.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => setShowAutoArrangeModal(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            title="1-Click Auto-Arrange Seating with Year Selection & Unlimited Room Expansion"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>⚡ 1-Click Auto-Arrange Seating</span>
          </button>

          <button
            onClick={() => setShowMultiYearDownloadModal(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            title="Download Room Seating Charts for 1st Year, 2nd Year, or All Years"
          >
            <Download className="w-4 h-4 text-blue-200" />
            <span>📥 Download Rooms Report (By Year)</span>
          </button>

          <button
            onClick={handleSeedAll4Years}
            disabled={seedingAllYears}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Seed all 4 years x 680 students (2,720 total) + 110 examination halls"
          >
            <Users className="w-4 h-4 text-purple-200" />
            <span>{seedingAllYears ? "Seeding..." : "Load Demo Data (2,720 Students)"}</span>
          </button>

          <button
            onClick={handleAutoExpandRooms}
            disabled={expandingRooms}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Automatically expand rooms so total seats >= total students"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>{expandingRooms ? "Expanding..." : "🏢 Auto-Expand Rooms"}</span>
          </button>

          <button
            onClick={handleResetAllocation}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset student seat allocations"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Allocation</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={clearingAll}
            className="px-4 py-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Wipe database completely"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>{clearingAll ? "Wiping..." : "Reset Database"}</span>
          </button>
        </div>
      </div>

      {allocationMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
            allocationMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {allocationMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{allocationMsg.text}</span>
        </div>
      )}

      {/* 3 Main Action Cards: Students, Rooms, Manual Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Upload Students Excel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">1. Upload Students (Year-Wise)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Upload student records. If records for this year already exist, a confirmation popup warns you to delete or overwrite.
            </p>

            {/* Year Selector Tabs */}
            <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-600" /> Select Academic Year to Upload:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setStudentYearType(yr)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      studentYearType === yr
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStudentYearType("All Years")}
                className={`w-full py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border transition-all cursor-pointer ${
                  studentYearType === "All Years"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Years (Auto Detect)
              </button>
            </div>

            {/* File Upload Input */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={studentFileRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setStudentFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-xl p-1"
                />
                <button
                  onClick={handleStudentUpload}
                  disabled={studentUploading || !studentFile}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{studentUploading ? "..." : "Upload"}</span>
                </button>
              </div>

              {/* Template Download Link */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Excel/CSV with Hall Ticket & Name</span>
                <a
                  href={api.downloadStudentsTemplateUrl}
                  download="students_template.xlsx"
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Template</span>
                </a>
              </div>
            </div>
          </div>

          {studentUploadSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{studentUploadSuccess.message}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{studentUploadSuccess.details}</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Upload Rooms Excel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">2. Upload Rooms (Variable Columns)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Upload room spreadsheets with rows and column capacities (e.g. C1=5, C2=5). Supports unlimited rooms without any 40-room cap!
            </p>

            <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-600" /> Academic Year Scope:
              </label>
              <select
                value={roomYearType}
                onChange={(e) => setRoomYearType(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All Years">All Years (Shared Examination Halls)</option>
                <option value="1st Year">1st Year Rooms Only</option>
                <option value="2nd Year">2nd Year Rooms Only</option>
                <option value="3rd Year">3rd Year Rooms Only</option>
                <option value="4th Year">4th Year Rooms Only</option>
              </select>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={roomFileRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setRoomFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-xl p-1"
                />
                <button
                  onClick={handleRoomUpload}
                  disabled={roomUploading || !roomFile}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{roomUploading ? "..." : "Upload"}</span>
                </button>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Room Number, Rows, C1..C6</span>
                <a
                  href={api.downloadRoomsTemplateUrl}
                  download="rooms_template.xlsx"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Template</span>
                </a>
              </div>
            </div>
          </div>

          {roomUploadSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{roomUploadSuccess.message}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{roomUploadSuccess.details}</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Add Room Manually */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">3. Add Room Manually</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Quickly create a single examination hall with custom column capacities.
            </p>

            <form onSubmit={handleAddRoom} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={manualRoom.roomNumber}
                    onChange={(e) => setManualRoom({ ...manualRoom, roomNumber: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Block</label>
                  <input
                    type="text"
                    value={manualRoom.block}
                    onChange={(e) => setManualRoom({ ...manualRoom, block: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Floor</label>
                  <input
                    type="text"
                    value={manualRoom.floor}
                    onChange={(e) => setManualRoom({ ...manualRoom, floor: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Max Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={manualRoom.rowCount}
                    onChange={(e) => setManualRoom({ ...manualRoom, rowCount: parseInt(e.target.value) || 5 })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                  Column Capacities (e.g. 5,5,5,5,5)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5,5,5,5,5 or 4,4,4,4,4,5"
                  value={manualRoom.columnCapacitiesStr}
                  onChange={(e) => setManualRoom({ ...manualRoom, columnCapacitiesStr: e.target.value })}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-emerald-700">
                  {manualRoom.columnCapacitiesStr
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => !isNaN(n) && n > 0)
                    .reduce((a, b) => a + b, 0)}{" "}
                  Seats
                </span>
                <button
                  type="submit"
                  disabled={addingRoom}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{addingRoom ? "..." : "+ Add Room"}</span>
                </button>
              </div>

              {roomAddMsg && (
                <p
                  className={`text-[11px] mt-1 font-semibold ${
                    roomAddMsg.type === "success" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {roomAddMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Card 4: Download Ready-to-Use 4 Years & Unlimited Rooms Sample CSV Datasets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Download Ready-to-Upload 4 Years Sample CSV Datasets
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">8 branches x 85 students (680 per year)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <a
            href={api.getSampleCsvUrl("1st Year", "students")}
            download="students_1st_year_680.csv"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 block">1st Year CSV</span>
            <span className="text-[10px] text-slate-500 block">680 Students</span>
          </a>

          <a
            href={api.getSampleCsvUrl("2nd Year", "students")}
            download="students_2nd_year_680.csv"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 block">2nd Year CSV</span>
            <span className="text-[10px] text-slate-500 block">680 Students</span>
          </a>

          <a
            href={api.getSampleCsvUrl("3rd Year", "students")}
            download="students_3rd_year_680.csv"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 block">3rd Year CSV</span>
            <span className="text-[10px] text-slate-500 block">680 Students</span>
          </a>

          <a
            href={api.getSampleCsvUrl("4th Year", "students")}
            download="students_4th_year_680.csv"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 block">4th Year CSV</span>
            <span className="text-[10px] text-slate-500 block">680 Students</span>
          </a>

          <a
            href={api.getSampleCsvUrl("All Years", "students")}
            download="students_all_4_years_2720.csv"
            className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-purple-900 block">All 4 Years CSV</span>
            <span className="text-[10px] text-purple-600 block">2,720 Students</span>
          </a>

          <a
            href={api.getSampleCsvUrl("All Years", "rooms")}
            download="rooms_unlimited_sample.csv"
            className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-center transition-all group"
          >
            <span className="text-[11px] font-bold text-indigo-900 block">Unlimited Rooms</span>
            <span className="text-[10px] text-indigo-600 block">CSV Blueprint</span>
          </a>
        </div>
      </div>

      {/* Card 5: Delete & Clean Records (Year-Wise) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete & Clean Records (Year-Wise)</span>
          </h4>
          <span className="text-[11px] text-slate-400">Safely clear batches or rooms</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Select Year to Delete:</span>
            <select
              value={deleteYearSelect}
              onChange={(e) => setDeleteYearSelect(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            >
              <option value="1st Year">1st Year Students</option>
              <option value="2nd Year">2nd Year Students</option>
              <option value="3rd Year">3rd Year Students</option>
              <option value="4th Year">4th Year Students</option>
              <option value="All Years">All Academic Years</option>
            </select>

            <button
              onClick={handleDeleteYear}
              disabled={deletingYear}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deletingYear ? "Deleting..." : `Delete ${deleteYearSelect} Students`}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDeleteAllRooms}
              disabled={deletingRooms}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <DoorClosed className="w-3.5 h-3.5 text-slate-600" />
              <span>Delete All Rooms</span>
            </button>

            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Student Create Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Create Student Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hall Ticket Number</label>
                <input
                  type="text"
                  placeholder="e.g. HT2026CSE001"
                  value={manualStudent.hallTicketNumber}
                  onChange={(e) => setManualStudent({ ...manualStudent, hallTicketNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sen"
                  value={manualStudent.studentName}
                  onChange={(e) => setManualStudent({ ...manualStudent, studentName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                  <select
                    value={manualStudent.academicYear}
                    onChange={(e) => setManualStudent({ ...manualStudent, academicYear: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Session</label>
                  <select
                    value={manualStudent.examSession}
                    onChange={(e) => setManualStudent({ ...manualStudent, examSession: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="FN (Forenoon)">FN (10:00 AM - 1:00 PM)</option>
                    <option value="AN (Afternoon)">AN (2:00 PM - 5:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department / Branch</label>
                <select
                  value={manualStudent.branch}
                  onChange={(e) => setManualStudent({ ...manualStudent, branch: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Computer Science & Artificial Intelligence (CSE-AI)">CSE-AI</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Data Sciences">Data Sciences</option>
                  <option value="Electronics & Communication Engineering (ECE)">ECE</option>
                  <option value="Electrical & Electronics Engineering (EEE)">EEE</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Examination Subject(s)</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures, Operating Systems"
                  value={manualStudent.subject}
                  onChange={(e) => setManualStudent({ ...manualStudent, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {addingStudent ? "Saving..." : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Upload Warning Confirmation Modal */}
      <UploadConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        targetName={confirmModal.targetName}
        existingCount={confirmModal.existingCount}
        onConfirmReplace={() => {
          if (confirmModal.type === "students") {
            executeStudentUpload(confirmModal.file, confirmModal.academicYear, true);
          } else {
            executeRoomUpload(confirmModal.file, confirmModal.academicYear, true);
          }
        }}
        onConfirmMerge={() => {
          if (confirmModal.type === "students") {
            executeStudentUpload(confirmModal.file, confirmModal.academicYear, false);
          } else {
            executeRoomUpload(confirmModal.file, confirmModal.academicYear, false);
          }
        }}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            type: "students",
            targetName: "",
            existingCount: 0,
            file: null,
            academicYear: "",
          })
        }
      />

      {/* 1-Click Auto-Arrange Modal */}
      {showAutoArrangeModal && (
        <AutoArrangeModal
          stats={stats}
          rooms={rooms}
          onClose={() => setShowAutoArrangeModal(false)}
          onSuccess={() => onRefresh()}
        />
      )}

      {/* Multi-Year Rooms Download Modal */}
      {showMultiYearDownloadModal && (
        <MultiYearRoomDownloadModal
          rooms={rooms}
          onClose={() => setShowMultiYearDownloadModal(false)}
        />
      )}
    </div>
  );
}
