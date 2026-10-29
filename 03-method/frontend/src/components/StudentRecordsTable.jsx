import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, UserCheck, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api";

export default function StudentRecordsTable({
  onViewStudent,
  onRefresh,
  selectedYearFilter,
  roomsList = [],
}) {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [roomFilter, setRoomFilter] = useState("All Rooms");
  const [branchFilter, setBranchFilter] = useState("All Branches");

  // Keep yearFilter synced if selectedYearFilter changes from top
  useEffect(() => {
    if (selectedYearFilter) {
      setYearFilter(selectedYearFilter);
      setPage(1);
    }
  }, [selectedYearFilter]);

  const branches = [
    "All Branches",
    "Computer Science & Engineering (CSE)",
    "Electronics & Communication Engineering (ECE)",
    "Computer Science & Artificial Intelligence (CSE-AI)",
    "Data Sciences",
    "Cyber Security",
    "Electrical & Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        academicYear: yearFilter,
        room: roomFilter,
        branch: branchFilter,
        search,
        page,
        limit: 8,
      });
      setStudents(res.students || []);
      setTotalStudents(res.totalStudents || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [yearFilter, roomFilter, branchFilter, page, search]);

  const handleDelete = async (student) => {
    if (confirm(`Are you sure you want to delete student ${student.hallTicketNumber} (${student.studentName})?`)) {
      try {
        await api.deleteStudent(student._id);
        fetchStudents();
        onRefresh();
      } catch (err) {
        alert("Failed to delete student: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Branch badge styling
  const getBranchBadge = (branch) => {
    const b = branch || "";
    if (b.includes("AI")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (b.includes("ECE") || b.includes("Electronics")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (b.includes("Data")) return "bg-sky-100 text-sky-700 border-sky-200";
    if (b.includes("Cyber")) return "bg-rose-100 text-rose-700 border-rose-200";
    if (b.includes("EEE") || b.includes("Electrical")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (b.includes("Mech")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (b.includes("Civil")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>Student Records</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {totalStudents}
              </span>
            </h3>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hall ticket or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Year Dropdown */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-medium"
          >
            <option value="All Years">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          {/* Room Dropdown */}
          <select
            value={roomFilter}
            onChange={(e) => {
              setRoomFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-medium"
          >
            <option value="All Rooms">All Rooms</option>
            {roomsList.map((r) => (
              <option key={r._id} value={r.roomNumber}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          {/* Branch Dropdown */}
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-medium max-w-[140px]"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-3.5 py-3 text-center">S.No</th>
              <th className="px-3.5 py-3">Hall Ticket Number</th>
              <th className="px-3.5 py-3">Student Name</th>
              <th className="px-3.5 py-3">Academic Year</th>
              <th className="px-3.5 py-3">Branch</th>
              <th className="px-3.5 py-3">Subject</th>
              <th className="px-3.5 py-3">Room</th>
              <th className="px-3.5 py-3">Bench</th>
              <th className="px-3.5 py-3">Seat</th>
              <th className="px-3.5 py-3 text-center">Status</th>
              <th className="px-3.5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center py-8 text-slate-400">
                  Loading student records...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-8 text-slate-400">
                  No student records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const sNo = (page - 1) * 8 + idx + 1;
                const isAllocated = student.allocationStatus === "Allocated";

                return (
                  <tr key={student._id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-center text-slate-400 font-normal">
                      {sNo}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-blue-700 font-mono">
                      {student.hallTicketNumber}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                      {student.studentName}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600">
                      {student.academicYear}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBranchBadge(student.branch)}`}>
                        {student.branch}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 max-w-xs truncate" title={Array.isArray(student.subject) ? student.subject.join(", ") : student.subject}>
                      {Array.isArray(student.subject) ? student.subject.join(", ") : student.subject || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                      {student.roomNumber || (student.room?.roomNumber) || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                      {student.columnNumber ? `Col ${student.columnNumber} • ${student.benchNumber || "B01"}` : student.benchNumber || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 font-extrabold text-blue-700 font-mono whitespace-nowrap">
                      {student.seatNumber ? `Seat #${student.seatNumber}` : "—"}
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isAllocated
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isAllocated ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Allocated</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewStudent(student)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold border border-blue-200 transition-all flex items-center gap-1"
                          title="View / Print Hall Ticket"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {students.length > 0 ? (page - 1) * 8 + 1 : 0} to{" "}
          {Math.min(page * 8, totalStudents)} of {totalStudents} students
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && page > 3) {
              pageNum = page - 2 + i;
              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  page === pageNum
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
