import React from "react";
import { DoorClosed, Eye, Trash2, Users, Layers } from "lucide-react";

export default function RoomCards({ rooms, onSelectRoom, selectedRoomId, onDeleteRoom }) {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <DoorClosed className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">No Examination Rooms Available</h4>
        <p className="text-xs text-slate-500 mt-1">
          Upload a rooms Excel file or add a room manually to get started.
        </p>
      </div>
    );
  }

  // Color schemes for room cards matching screenshot palette
  const colors = [
    { bg: "bg-blue-50/70 border-blue-200", iconBg: "bg-blue-600 text-white", progress: "bg-blue-600", text: "text-blue-900" },
    { bg: "bg-emerald-50/70 border-emerald-200", iconBg: "bg-emerald-600 text-white", progress: "bg-emerald-600", text: "text-emerald-900" },
    { bg: "bg-amber-50/70 border-amber-200", iconBg: "bg-amber-600 text-white", progress: "bg-amber-500", text: "text-amber-900" },
    { bg: "bg-rose-50/70 border-rose-200", iconBg: "bg-rose-600 text-white", progress: "bg-rose-600", text: "text-rose-900" },
    { bg: "bg-purple-50/70 border-purple-200", iconBg: "bg-purple-600 text-white", progress: "bg-purple-600", text: "text-purple-900" },
    { bg: "bg-teal-50/70 border-teal-200", iconBg: "bg-teal-600 text-white", progress: "bg-teal-600", text: "text-teal-900" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Room-wise Student Count</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {rooms.length} Examination Halls Registered
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {rooms.map((room, idx) => {
          const color = colors[idx % colors.length];
          const isSelected = selectedRoomId === room._id;
          const numRows = room.rows.length;
          const numCols = room.rows[0]?.columns || 5;
          const percentage = room.totalSeats > 0 ? Math.round((room.allocatedSeats / room.totalSeats) * 100) : 0;

          return (
            <div
              key={room._id}
              className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${
                color.bg
              } ${isSelected ? "ring-2 ring-blue-600 shadow-md scale-[1.02]" : "hover:shadow-sm"}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color.iconBg}`}>
                      <DoorClosed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{room.roomNumber}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {room.block} - {room.floor}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${room.roomNumber}? Any allocated students will be deallocated.`)) {
                        onDeleteRoom(room._id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-white/80 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 mb-2 font-medium">
                  Rows: {numRows} | Columns: {numCols}
                </div>

                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">{room.totalSeats} Seats</span>
                  <span className="font-bold text-slate-900">{room.allocatedSeats} Students</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${color.progress}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={`${percentage === 100 ? "text-emerald-700" : "text-slate-500"}`}>
                    {percentage}% Filled
                  </span>
                  <span className="text-slate-500 font-medium">
                    {room.availableSeats} Available
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                <button
                  onClick={() => {
                    onSelectRoom(room);
                    setTimeout(() => {
                      const el =
                        document.getElementById("room-layout-visualizer") ||
                        document.getElementById("dashboard-room-layout");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }, 50);
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isSelected ? "Viewing Layout" : "View Layout"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
