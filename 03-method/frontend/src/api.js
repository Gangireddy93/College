import axios from "axios";

const API_BASE = "/api";

// Create configured axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
});

// Request interceptor: automatically attach JWT token for Admin / Student requests
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("admin_token");
    const studentToken = localStorage.getItem("student_token");
    const token = adminToken || studentToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login") &&
      !error.config.url.includes("/auth/student-login") &&
      !error.config.url.includes("/search/")
    ) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth & Colleges
  getColleges: async () => {
    const res = await apiClient.get("/auth/colleges");
    return res.data;
  },

  loginAdmin: async (username, password, collegeCode = "GIT") => {
    const res = await apiClient.post("/auth/login", { username, password, collegeCode });
    return res.data;
  },

  loginStudent: async (hallTicketNumber, dob = "", collegeCode = "GIT") => {
    const res = await apiClient.post("/auth/student-login", { hallTicketNumber, dob, collegeCode });
    return res.data;
  },

  verifyAdminSession: async () => {
    const res = await apiClient.get("/auth/verify");
    return res.data;
  },

  // Stats
  getStats: async (academicYear = "", collegeCode = "GIT") => {
    const params = { collegeCode };
    if (academicYear && academicYear !== "All Years") {
      params.academicYear = academicYear;
    }
    const res = await apiClient.get("/students/stats", { params });
    return res.data;
  },

  // Duplicate Check Endpoints (For Upload Warning Modals)
  checkYearStatus: async (year) => {
    const res = await apiClient.get(`/students/check-year/${encodeURIComponent(year)}`);
    return res.data;
  },

  checkRoomsStatus: async () => {
    const res = await apiClient.get("/rooms/check-rooms");
    return res.data;
  },

  // Rooms
  getRooms: async (academicYear = "", collegeCode = "GIT") => {
    const params = { collegeCode };
    if (academicYear && academicYear !== "All Years") {
      params.academicYear = academicYear;
    }
    const res = await apiClient.get("/rooms", { params });
    return res.data;
  },

  addRoom: async (roomData) => {
    const res = await apiClient.post("/rooms", roomData);
    return res.data;
  },

  deleteRoom: async (roomId) => {
    const res = await apiClient.delete(`/rooms/${roomId}`);
    return res.data;
  },

  deleteRoomsByYear: async (year) => {
    const res = await apiClient.delete(`/rooms/by-year/${encodeURIComponent(year)}`);
    return res.data;
  },

  uploadRoomsExcel: async (file, academicYear = "All Years", replaceExisting = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicYear", academicYear);
    if (replaceExisting) {
      formData.append("replaceExisting", "true");
    }
    const res = await apiClient.post("/rooms/upload-excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  autoExpandRooms: async (targetSeats = 0, academicYear = "All Years") => {
    const res = await apiClient.post("/rooms/auto-expand", { targetSeats, academicYear });
    return res.data;
  },

  seedUnlimitedRooms: async () => {
    const res = await apiClient.post("/rooms/seed-unlimited");
    return res.data;
  },

  // Students
  getStudents: async ({ academicYear, room, branch, search, page = 1, limit = 10, collegeCode = "GIT" }) => {
    const res = await apiClient.get("/students", {
      params: { academicYear, room, branch, search, page, limit, collegeCode },
    });
    return res.data;
  },

  searchStudent: async (hallTicketNumber) => {
    const res = await apiClient.get(`/students/search/${encodeURIComponent(hallTicketNumber)}`);
    return res.data;
  },

  addStudent: async (studentData) => {
    const res = await apiClient.post("/students", studentData);
    return res.data;
  },

  deleteStudent: async (studentId) => {
    const res = await apiClient.delete(`/students/${studentId}`);
    return res.data;
  },

  deleteStudentsByYear: async (year) => {
    const res = await apiClient.delete(`/students/by-year/${encodeURIComponent(year)}`);
    return res.data;
  },

  uploadStudentsExcel: async (file, academicYear = "All Years", replaceExisting = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicYear", academicYear);
    if (replaceExisting) {
      formData.append("replaceExisting", "true");
    }
    const res = await apiClient.post("/students/upload-excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  runAllocation: async (academicYear = "All Years") => {
    const res = await apiClient.post("/students/allocate", { academicYear });
    return res.data;
  },

  resetAllocation: async (academicYear = "All Years") => {
    const res = await apiClient.post("/students/reset-allocation", { academicYear });
    return res.data;
  },

  cleanEmptyDataAndRooms: async () => {
    const res = await apiClient.post("/students/clean-empty");
    return res.data;
  },

  clearAllData: async () => {
    const res = await apiClient.post("/students/clear-all");
    return res.data;
  },

  seedAll4Years: async () => {
    const res = await apiClient.post("/students/seed-all-years");
    return res.data;
  },

  seed680Dataset: async () => {
    const res = await apiClient.post("/students/seed-680");
    return res.data;
  },

  seed40Rooms: async () => {
    const res = await apiClient.post("/rooms/seed-40");
    return res.data;
  },

  // Study Materials (All 4 Years & 8 Semesters)
  getStudyMaterials: async ({ academicYear, semester, branch, materialType, search, collegeCode = "GIT" } = {}) => {
    const res = await apiClient.get("/study-materials", {
      params: { academicYear, semester, branch, materialType, search, collegeCode },
    });
    return res.data;
  },

  addStudyMaterial: async (materialData) => {
    const res = await apiClient.post("/study-materials", materialData);
    return res.data;
  },

  deleteStudyMaterial: async (id) => {
    const res = await apiClient.delete(`/study-materials/${id}`);
    return res.data;
  },

  downloadStudyMaterial: async (id) => {
    const res = await apiClient.post(`/study-materials/${id}/download`);
    return res.data;
  },

  // Campus Life (Placements, Sports, Clubs, Events, Gallery)
  getCampusData: async () => {
    const res = await apiClient.get("/campus");
    return res.data;
  },

  // Download links & templates
  downloadStudentsTemplateUrl: `${API_BASE}/students/template`,
  downloadRoomsTemplateUrl: `${API_BASE}/rooms/template`,
  getSampleCsvUrl: (year = "1st Year", type = "students") =>
    `${API_BASE}/students/download-sample?year=${encodeURIComponent(year)}&type=${encodeURIComponent(type)}`,
};
