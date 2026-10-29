import React from "react";
import { Users, DoorClosed, Armchair, BookOpen, GraduationCap, Building2 } from "lucide-react";

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Colleges",
      value: stats?.totalColleges ?? 4,
      subtext: "Active Colleges",
      icon: Building2,
      bg: "bg-blue-50/70 border-blue-100/80 text-blue-700",
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 2720,
      subtext: "All Years",
      icon: Users,
      bg: "bg-indigo-50/70 border-indigo-100/80 text-indigo-700",
      iconBg: "bg-indigo-600 text-white",
    },
    {
      title: "Total Rooms",
      value: stats?.totalRooms ?? 110,
      subtext: "Unlimited Halls",
      icon: DoorClosed,
      bg: "bg-emerald-50/70 border-emerald-100/80 text-emerald-700",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      title: "Total Seats",
      value: stats?.totalSeats ?? 2750,
      subtext: `Allocated: ${stats?.totalAllocatedSeats ?? 2720} | Avail: ${stats?.totalAvailableSeats ?? 30}`,
      icon: Armchair,
      bg: "bg-amber-50/70 border-amber-100/80 text-amber-700",
      iconBg: "bg-amber-500 text-white",
    },
    {
      title: "Total Subjects",
      value: stats?.totalSubjects ?? 96,
      subtext: "All Semesters",
      icon: BookOpen,
      bg: "bg-rose-50/70 border-rose-100/80 text-rose-700",
      iconBg: "bg-rose-500 text-white",
    },
    {
      title: "Academic Years",
      value: stats?.academicYearsCount ?? 4,
      subtext: "1st, 2nd, 3rd, 4th Year",
      icon: GraduationCap,
      bg: "bg-purple-50/70 border-purple-100/80 text-purple-700",
      iconBg: "bg-purple-600 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${card.bg} bg-white shadow-xs transition-all hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
