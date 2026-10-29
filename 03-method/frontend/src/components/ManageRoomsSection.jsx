import React, { useState, useMemo } from "react";
import {
  DoorClosed,
  PlusCircle,
  Trash2,
  Calendar,
  Layers,
  Building,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
} from "lucide-react";
import RoomLayoutVisualizer from "./RoomLayoutVisualizer";
import { api } from "../api";

export default function ManageRoomsSection({
  rooms = [],
  selectedRoom,
  onSelectRoom,
  onDeleteRoom,
  onDeleteRoomsByYear,
  onRefresh,
  onViewStudent,
  stats,
}) {
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [roomSearch, setRoomSearch] = useState("");
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);

  // Manual room form state
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    block: "A Block",
    floor: "Ground Floor",
    academicYear: "All Years",
    rowCount: 5,
    columns: 5,
    columnCapacitiesStr: "5,5,5,5,5",
  });

  const years = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Filter rooms by search
  const filteredRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    if (!roomSearch.trim()) return rooms;
    const q = roomSearch.toLowerCase();
    return rooms.filter(
      (r) =>
        r.roomNumber?.toLowerCase().includes(q) ||
        r.block?.toLowerCase().includes(q) ||
        r.floor?.toLowerCase().includes(q)
    );
  }, [rooms, roomSearch]);

  // Current active room
  const currentRoom = useMemo(() => {
    if (!selectedRoom && filteredRooms.length > 0) return filteredRooms[0];
    if (selectedRoom) {
      const match = rooms.find((r) => r._id === selectedRoom._id);
      return match || filteredRooms[0] || selectedRoom;
    }
    return null;
  }, [selectedRoom, filteredRooms, rooms]);

  // Compute room-wise student count for the selected year
  const getRoomStudentCount = (room) => {
    if (!room || !room.rows) return { count: 0, total: room?.allocatedSeats || 0 };
    let count = 0;
    let total = 0;
    for (const row of room.rows) {
      if (row.seats) {
        for (const seat of row.seats) {
          if (seat.isActive !== false && seat.hallTicketNumber) {
            total++;
            if (selectedYear === "All Years" || seat.academicYear === selectedYear) {
              count++;
            }
          }
        }
      }
    }
    return { count, total };
  };

  // Add room submission
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.roomNumber.trim()) {
      alert("Please enter a room number (e.g. 101 or Room 5)");
      return;
    }
    setAddingRoom(true);
    try {
      let colCaps = [];
      if (newRoom.columnCapacitiesStr.trim()) {
        colCaps = newRoom.columnCapacitiesStr
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);
      }
      if (colCaps.length === 0) {
        colCaps = Array(Number(newRoom.columns) || 5).fill(Number(newRoom.rowCount) || 5);
      }

      const res = await api.addRoom({
        roomNumber: newRoom.roomNumber.trim(),
        block: newRoom.block.trim(),
        floor: newRoom.floor.trim(),
        academicYear: newRoom.academicYear,
        rowCount: Number(newRoom.rowCount) || Math.max(...colCaps, 5),
        columnCapacities: colCaps,
      });

      alert(res.message || "Room added successfully!");
      setShowAddRoomModal(false);
      setNewRoom({
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
      alert("Failed to add room: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingRoom(false);
    }
  };

  // Delete current room
  const handleDeleteCurrentRoom = () => {
    if (!currentRoom) return;
    if (
      confirm(
        `Are you sure you want to delete Room "${currentRoom.roomNumber}"? All allocated students in this room will be returned to pending status.`
      )
    ) {
      onDeleteRoom(currentRoom._id);
    }
  };

  // Delete rooms for selected year
  const handleDeleteSelectedYearRooms = () => {
    if (selectedYear === "All Years") {
      if (confirm("Are you sure you want to delete ALL examination rooms across all years?")) {
        onDeleteRoomsByYear("All Years");
      }
    } else {
      if (
        confirm(
          `Are you sure you want to delete all examination rooms assigned to "${selectedYear}"?`
        )
      ) {
        onDeleteRoomsByYear(selectedYear);
      }
    }
  };

  const currentRoomStats = currentRoom ? getRoomStudentCount(currentRoom) : { count: 0, total: 0 };
  const fillPct =
    currentRoom && currentRoom.totalSeats > 0
      ? Math.round((currentRoomStats.count / currentRoom.totalSeats) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Manage Rooms & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <DoorClosed className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manage Examination Rooms
            </h2>
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Total Rooms: {rooms.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Select rooms and academic years to view live column-wise seating layouts, manage room-wise student counts, or delete rooms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Room</span>
          </button>

          {currentRoom && (
            <button
              onClick={handleDeleteCurrentRoom}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all"
              title="Delete currently selected room"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Room {currentRoom.roomNumber}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Panel: Year Select Buttons & Room Select Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        {/* Row 1: Year Select Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Academic Year:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Filtered student counts update instantly
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {years.map((year) => {
              const isSelected = selectedYear === year;
              const count =
                year === "All Years"
                  ? stats?.totalStudents || 0
                  : stats?.yearCounts?.[year] || 0;

              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>{year}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? "bg-blue-800 text-white" : "bg-white text-slate-700 shadow-2xs"
                    }`}
                  >
                    {count} Students
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Room Select Buttons */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Examination Room ({filteredRooms.length} Available):</span>
            </span>

            {/* Quick Room Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search room (e.g. 101)..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No rooms match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
              {filteredRooms.map((room) => {
                const isSelected = currentRoom?._id === room._id;
                const { count, total } = getRoomStudentCount(room);

                return (
                  <button
                    key={room._id}
                    onClick={() => onSelectRoom(room)}
                    className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300 scale-[1.02]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">
                        Room {room.roomNumber}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1 rounded ${
                          isSelected
                            ? "bg-blue-800 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {room.block?.split(" ")[0] || "A"}
                      </span>
                    </div>

                    <div className="text-[10px] flex items-center justify-between font-medium mt-1">
                      <span className={isSelected ? "text-blue-100" : "text-slate-500"}>
                        {selectedYear === "All Years" ? "All Years" : selectedYear.split(" ")[0]}:
                      </span>
                      <strong className={isSelected ? "text-white font-mono" : "text-blue-700 font-mono"}>
                        {count}/{room.totalSeats}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Room Metadata & Room-Wise Student Count Bar */}
      {currentRoom && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-lg">
                {currentRoom.roomNumber}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Room {currentRoom.roomNumber} Seating Layout</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {currentRoom.block} • {currentRoom.floor}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic Year Filter: <strong className="text-blue-700">{selectedYear}</strong> | Capacity: <strong>{currentRoom.totalSeats} Total Desks</strong>
                </p>
              </div>
            </div>

            {/* Room-wise Student Count Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Students ({selectedYear}):
                </span>
                <span className="text-sm font-extrabold text-blue-900 font-mono">
                  {currentRoomStats.count} Students
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Total Occupied in Room:
                </span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">
                  {currentRoomStats.total} / {currentRoom.totalSeats}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                  Available Desks:
                </span>
                <span className="text-sm font-extrabold text-emerald-800 font-mono">
                  {Math.max(0, currentRoom.totalSeats - currentRoomStats.total)} Free
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Seating Layout (Column-Wise with Print & Download Options) */}
      {currentRoom ? (
        <div id="room-layout-visualizer" className="scroll-mt-6">
          <RoomLayoutVisualizer
            room={currentRoom}
            roomsList={filteredRooms}
            onSelectRoom={onSelectRoom}
            selectedYear={selectedYear}
            onSeatClick={(seat) => {
              if (seat.hallTicketNumber && onViewStudent) {
                onViewStudent(seat);
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <DoorClosed className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h4 className="font-bold text-slate-700 text-base">No Room Selected</h4>
          <p className="text-xs text-slate-500 mt-1">
            Please click on a room button above to view its seating layout.
          </p>
        </div>
      )}

      {/* Quick Add Room Modal (Compact, Non-Intrusive) */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Examination Room</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 101 or Room 5"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Block</label>
                  <input
                    type="text"
                    placeholder="e.g. A Block"
                    value={newRoom.block}
                    onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor</label>
                  <input
                    type="text"
                    placeholder="e.g. Ground Floor"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                  <select
                    value={newRoom.academicYear}
                    onChange={(e) => setNewRoom({ ...newRoom, academicYear: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="All Years">All Years (Shared)</option>
                    <option value="1st Year">1st Year Only</option>
                    <option value="2nd Year">2nd Year Only</option>
                    <option value="3rd Year">3rd Year Only</option>
                    <option value="4th Year">4th Year Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Column Capacities (C1,C2,C3,C4,C5)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5,5,5,5,5 or 4,4,4,4,4"
                  value={newRoom.columnCapacitiesStr}
                  onChange={(e) => setNewRoom({ ...newRoom, columnCapacitiesStr: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Column-wise seats will be generated automatically.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingRoom}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {addingRoom ? "Creating..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
