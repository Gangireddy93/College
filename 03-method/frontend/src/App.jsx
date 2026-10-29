import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import StatsCards from "./components/StatsCards";
import UploadAndAddSection from "./components/UploadAndAddSection";
import RoomCards from "./components/RoomCards";
import StudentRecordsTable from "./components/StudentRecordsTable";
import RoomLayoutVisualizer from "./components/RoomLayoutVisualizer";
import RoomAllocationSection from "./components/RoomAllocationSection";
import ManageRoomsSection from "./components/ManageRoomsSection";
import DeleteOptionsSection from "./components/DeleteOptionsSection";
import StudentPortal from "./components/StudentPortal";
import HallTicketModal from "./components/HallTicketModal";
import CollegeSettingsModal from "./components/CollegeSettingsModal";
import AdminStudyMaterialSection from "./components/AdminStudyMaterialSection";
import { getCollegeSettings } from "./utils/collegeSettings";
import { api } from "./api";

export default function App() {
  const [activeView, setActiveView] = useState("home"); // "home" | "dashboard" | "student"
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "records" | "allocation" | "rooms" | "upload" | "delete_options" | "materials"
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [studentTicket, setStudentTicket] = useState("HT2026CSE001");

  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [loading, setLoading] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // College Branding & Customization
  const [collegeSettings, setCollegeSettings] = useState(() => getCollegeSettings());
  const [showCollegeModal, setShowCollegeModal] = useState(false);

  // Load dashboard stats and rooms
  const loadData = async () => {
    // Only fetch admin stats if logged in as admin
    if (!adminUser && !localStorage.getItem("admin_token")) return;
    try {
      const statsRes = await api.getStats(selectedYear, collegeSettings?.code || "GIT");
      if (statsRes.success) {
        setStats(statsRes.stats);
        setRooms(statsRes.rooms || []);
        if (statsRes.rooms && statsRes.rooms.length > 0) {
          setSelectedRoom((prev) => {
            if (!prev) return statsRes.rooms[0];
            const updated = statsRes.rooms.find((r) => r._id === prev._id);
            return updated || statsRes.rooms[0];
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    if (adminUser || localStorage.getItem("admin_token")) {
      loadData();
    }
  }, [refreshTrigger, selectedYear, activeView, adminUser, collegeSettings?.code]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Student login action from Home
  const handleStudentLogin = (ticket) => {
    setStudentTicket(ticket);
    setActiveView("student");
  };

  // Admin login action from Home
  const handleAdminLogin = (user) => {
    setAdminUser(user);
    setActiveView("dashboard");
    setActiveTab("dashboard");
  };

  // Logout action
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdminUser(null);
    setActiveView("home");
  };

  // Switch to dashboard with auth check
  const handleSwitchToDashboard = () => {
    if (!adminUser && !localStorage.getItem("admin_token")) {
      alert("Admin sign in required to access the examination dashboard.");
      setActiveView("home");
    } else {
      setActiveView("dashboard");
    }
  };

  // Delete students year-wise
  const handleDeleteStudentsByYear = async (year) => {
    const confirmMsg =
      year === "All Years"
        ? "Permanently delete ALL students in the database?"
        : `Permanently delete all students belonging to "${year}"?`;
    if (confirm(confirmMsg)) {
      setLoading(true);
      try {
        const res = await api.deleteStudentsByYear(year);
        alert(res.message);
        handleRefresh();
      } catch (err) {
        alert("Failed to delete students: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete rooms year-wise
  const handleDeleteRoomsByYear = async (year) => {
    if (confirm(`Permanently delete all examination rooms assigned to "${year}"?`)) {
      setLoading(true);
      try {
        const res = await api.deleteRoomsByYear(year);
        alert(res.message);
        handleRefresh();
      } catch (err) {
        alert("Failed to delete rooms: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete a room
  const handleDeleteRoom = async (roomId) => {
    try {
      const res = await api.deleteRoom(roomId);
      alert(res.message);
      handleRefresh();
    } catch (err) {
      alert("Failed to delete room: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Home Landing Page */}
      {activeView === "home" ? (
        <HomePage
          onStudentLogin={handleStudentLogin}
          onAdminLogin={handleAdminLogin}
          collegeSettings={collegeSettings}
          onCollegeChange={(col) => {
            setCollegeSettings(col);
          }}
        />
      ) : (
        <>
          {/* Top Header Navbar */}
          <Navbar
            activeView={activeView}
            setActiveView={(view) => {
              if (view === "dashboard") {
                handleSwitchToDashboard();
              } else {
                setActiveView(view);
              }
            }}
            stats={stats}
            totalStudents={stats?.totalStudents || 0}
            adminUser={adminUser}
            onLogout={handleLogout}
            collegeSettings={collegeSettings}
            onOpenCollegeSettings={() => setShowCollegeModal(true)}
          />

          {/* Student Portal View */}
          {activeView === "student" ? (
            <StudentPortal
              initialTicket={studentTicket}
              onBackToDashboard={() => setActiveView("home")}
              collegeSettings={collegeSettings}
            />
          ) : (
            /* Admin Dashboard View */
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar */}
              <div className="hidden md:block">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  setActiveView={setActiveView}
                  onLogout={handleLogout}
                  onOpenCollegeSettings={() => setShowCollegeModal(true)}
                />
              </div>

              {/* Main Dashboard Workspace */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                {/* Admin Dashboard Title Header matching Screenshot */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Admin Dashboard
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage colleges, students, rooms, and examination seat allocation
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCollegeModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>+ Add College</span>
                  </button>
                </div>

                {/* Top 6 Metric Cards */}
                <StatsCards stats={stats} />

                {/* Tab: Study Materials (8 Semesters) */}
                {activeTab === "materials" && (
                  <AdminStudyMaterialSection
                    onRefresh={handleRefresh}
                  />
                )}

                {/* Tab: Delete Options */}
                {activeTab === "delete_options" && (
                  <DeleteOptionsSection
                    onRefresh={handleRefresh}
                    onDeleteStudentsByYear={handleDeleteStudentsByYear}
                    onDeleteRoomsByYear={handleDeleteRoomsByYear}
                  />
                )}

                {/* Tab: Student Records */}
                {activeTab === "records" && (
                  <StudentRecordsTable
                    onViewStudent={setModalStudent}
                    onRefresh={handleRefresh}
                    selectedYearFilter={selectedYear}
                    roomsList={rooms}
                  />
                )}

                {/* Tab: Room Allocation */}
                {activeTab === "allocation" && (
                  <RoomAllocationSection
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    onViewStudent={setModalStudent}
                    stats={stats}
                  />
                )}

                {/* Tab: Manage Rooms */}
                {activeTab === "rooms" && (
                  <ManageRoomsSection
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    onDeleteRoom={handleDeleteRoom}
                    onDeleteRoomsByYear={handleDeleteRoomsByYear}
                    onRefresh={handleRefresh}
                    onViewStudent={setModalStudent}
                    stats={stats}
                  />
                )}

                {/* Tab: Upload & Files */}
                {activeTab === "upload" && (
                  <UploadAndAddSection
                    onRefresh={handleRefresh}
                    selectedYear={selectedYear}
                    onDeleteRoomsByYear={handleDeleteRoomsByYear}
                    onDeleteStudentsByYear={handleDeleteStudentsByYear}
                    rooms={rooms}
                    stats={stats}
                  />
                )}

                {/* Tab: Dashboard (Full Integrated View) */}
                {activeTab === "dashboard" && (
                  <>
                    <UploadAndAddSection
                      onRefresh={handleRefresh}
                      selectedYear={selectedYear}
                      onDeleteRoomsByYear={handleDeleteRoomsByYear}
                      onDeleteStudentsByYear={handleDeleteStudentsByYear}
                      rooms={rooms}
                      stats={stats}
                    />

                    <RoomCards
                      rooms={rooms}
                      selectedRoomId={selectedRoom?._id}
                      onSelectRoom={setSelectedRoom}
                      onDeleteRoom={handleDeleteRoom}
                    />

                    <StudentRecordsTable
                      onViewStudent={setModalStudent}
                      onRefresh={handleRefresh}
                      selectedYearFilter={selectedYear}
                      roomsList={rooms}
                    />

                    <div id="dashboard-room-layout" className="scroll-mt-6">
                      <RoomLayoutVisualizer
                        room={selectedRoom}
                        roomsList={rooms}
                        onSelectRoom={setSelectedRoom}
                        selectedYear={selectedYear}
                        onSeatClick={(seat) => {
                          if (seat.hallTicketNumber) {
                            setModalStudent(seat);
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </main>
            </div>
          )}
        </>
      )}

      {/* Hall Ticket Admit Card Modal */}
      {modalStudent && (
        <HallTicketModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
        />
      )}

      {/* College Settings & Multi-College Customization Modal */}
      {showCollegeModal && (
        <CollegeSettingsModal
          onClose={() => setShowCollegeModal(false)}
          onSettingsUpdated={(updated) => setCollegeSettings(updated)}
        />
      )}
    </div>
  );
}
