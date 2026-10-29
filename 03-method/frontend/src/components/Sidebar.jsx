import React from "react";
import {
  LayoutDashboard,
  FileText,
  Grid,
  Building2,
  Trash2,
  Search,
  LogOut,
  UploadCloud,
  BookOpen,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  setActiveView,
  onLogout,
  onOpenCollegeSettings,
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "allocation", label: "Room Allocation", icon: Grid },
    { id: "materials", label: "Study Materials (8 Sems)", icon: BookOpen },
    { id: "records", label: "Student Records", icon: FileText },
    { id: "rooms", label: "Manage Rooms", icon: Building2 },
    { id: "upload", label: "Upload & Files", icon: UploadCloud },
    { id: "colleges", label: "College Management", icon: Building2 },
    { id: "delete_options", label: "Delete Options", icon: Trash2 },
    { id: "search", label: "Student Portal View", icon: Search },
  ];

  const handleItemClick = (id) => {
    if (id === "search") {
      setActiveView("student");
    } else if (id === "colleges") {
      if (onOpenCollegeSettings) onOpenCollegeSettings();
    } else {
      setActiveTab(id);
      setActiveView("dashboard");
    }
  };

  return (
    <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800 shrink-0">
      <div className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
