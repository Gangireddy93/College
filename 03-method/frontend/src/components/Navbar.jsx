import React, { useState } from "react";
import {
  GraduationCap,
  Bell,
  Search,
  LayoutDashboard,
  Home,
  LogOut,
  Building2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Navbar({
  activeView,
  setActiveView,
  stats,
  totalStudents,
  adminUser,
  onLogout,
  onOpenCollegeSettings,
  collegeSettings,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const studentCount = stats?.totalStudents ?? totalStudents ?? 2720;
  const roomCount = stats?.totalRooms ?? 110;
  const allocatedCount = stats?.allocatedStudents ?? 2720;
  const collegeName = collegeSettings?.collegeName || collegeSettings?.name || "Gates Institute of Technology";

  return (
    <header className="bg-[#0b192c] text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo matching CampusOne Screenshot */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveView("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  Campus<span className="text-blue-400">One</span>
                </span>
              </div>
              <p className="text-[10px] text-blue-300/80 font-medium tracking-wide">
                College Exam & Student Hub
              </p>
            </div>
          </div>

          {/* Center Navigation Links matching Screenshot */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveView("home")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "home"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveView("student")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "student"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              Student Portal
            </button>

            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "dashboard"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              Dashboard
            </button>

            {onOpenCollegeSettings && (
              <button
                onClick={onOpenCollegeSettings}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                Colleges
              </button>
            )}

            <button
              onClick={() => {
                alert(
                  "CampusOne Examination Helpdesk:\n\n• For Exam Seating: Enter your hall ticket in Student Portal.\n• For Room Allocations: Admins can auto-arrange seating in Dashboard.\n• Anti-Cheat: Strictly separates adjacent branch students.\n• Helpline: +91 8554 222333 | exams@college.edu"
                );
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              Help
            </button>
          </nav>

          {/* Right Header Section: College Selector, Bell, User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* College Selection Pill matching Screenshot */}
            <button
              onClick={onOpenCollegeSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs text-white font-medium shadow-xs transition-all cursor-pointer max-w-[180px] sm:max-w-[240px]"
              title="Click to Switch College Campus"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{collegeName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-white">
                    <span>Examination Notices</span>
                    <span className="text-[10px] text-blue-400">Live Updates</span>
                  </div>
                  <div className="mt-2 space-y-2 text-slate-300">
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <span className="font-bold text-white block">Admit Cards Published</span>
                      <span className="text-[11px] text-slate-400">All 4 Years (2,720 candidates) seating arranged.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <span className="font-bold text-white block">Forenoon Shift Timings</span>
                      <span className="text-[11px] text-slate-400">10:00 AM – 01:00 PM (Reporting: 09:30 AM).</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill matching Screenshot */}
            {adminUser ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-700/80">
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 py-1 px-2.5 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                    A
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-none">
                      {adminUser.username || "Admin User"}
                    </span>
                    <span className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider block">
                      Administrator
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-700/80">
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 py-1 px-2.5 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-[11px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-none">
                      Aarav Kumar
                    </span>
                    <span className="text-[9px] text-blue-300 font-semibold uppercase tracking-wider block">
                      Student
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView("home")}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
