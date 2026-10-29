# College Hall Ticket & Anti-Cheat Exam Seating Allocation System

A complete full-stack web application for automated College Hall Ticket generation, Room Management, and Anti-Cheating Exam Seating Allocation connected to MongoDB (`mongodb://localhost:27017`).

---

## 🔑 Admin Login Credentials

| Role | Username | Password |
|---|---|---|
| **Chief Superintendent / Admin** | **`admin`** | **`admin@college2026`** |
| **Alternative Admin** | **`admin`** | **`admin123`** |
| **Controller of Examinations** | **`controller`** | **`exam@college2026`** |

> **Student Access:** Students can simply enter their **Hall Ticket Number** (e.g. `HT2026001`, `HT2026002`) on the Home page to instantly enter their portal, view their seat location on the 2D floor map, and print their official admit card.

---

## 🛡️ 2-Branch Per Room Seating Allocation Rule

In accordance with autonomous examination regulations, each room is **first filled with ONLY TWO BRANCHES until 100% full**, arranged column-wise in a checkerboard pattern:

1. **Room 1 (25 Seats - 100% Full)**: Dedicated to **Pair 1: CSE & ECE**
   - Column 1: Row 1 = CSE, Row 2 = ECE, Row 3 = CSE, Row 4 = ECE, Row 5 = CSE
   - Column 2: Row 1 = ECE, Row 2 = CSE, Row 3 = ECE, Row 4 = CSE, Row 5 = ECE
   - Column 3: Row 1 = CSE, Row 2 = ECE, Row 3 = CSE, Row 4 = ECE, Row 5 = CSE
   - Column 4: Row 1 = ECE, Row 2 = CSE, Row 3 = ECE, Row 4 = CSE, Row 5 = ECE
   - Column 5: Row 1 = CSE, Row 2 = ECE, Row 3 = CSE, Row 4 = ECE, Row 5 = CSE
2. **Room 2 (25 Seats - 100% Full)**: Dedicated to **Pair 2: CSE-AI & Data Sciences**
   - Alternating column-wise between AI and Data Sciences.
3. **Room 3 (25 Seats - 100% Full)**: Dedicated to **Pair 3: Cyber Security & EEE**
   - Alternating column-wise between Cyber Security and Electrical & Electronics.
4. **Room 4 (25 Seats - 100% Full)**: Dedicated to **Pair 4: Mechanical & Civil Engineering**
   - Alternating column-wise between Mechanical and Civil Engineering.

**Anti-Cheating Verification**:
- **Front & Back** neighbors strictly have **different branches & different subjects**.
- **Left & Right** neighbors strictly have **different branches & different subjects**.
- Zero adjacent branch conflicts, zero adjacent subject conflicts!

---

## 📁 Database Cleaning & Zero Empty Data

- **Clean 100 Students**: Exactly 100 real student records across all 8 branches and 4 academic years.
- **Delete Empty Data & Rooms**: 
  - Automatically deletes any student record with empty/missing hall ticket or name.
  - Automatically deletes any examination hall with 0 allocated students (empty rooms).
  - Can be triggered anytime via **Delete Options** tab in the Admin Dashboard.

---

## 🧭 Navigation & Admin Dashboard Tabs

The Admin Dashboard provides tabs for:
1. **Dashboard**: Summary metrics, quick action bar, upload cards, room cards, student records, and 2D seating layout.
2. **Student Records**: Filterable student table (search, year filter, room filter, branch filter) with View and Delete actions.
3. **Room Allocation**: Interactive 2D examination hall seating visualizer with anti-cheat verification badge and printable charts.
4. **Manage Rooms**: View room cards with occupancy progress bars, add custom rooms manually, and upload room sheets.
5. **Delete Options**: 
   - 1-Click "Delete Empty Data & Rooms"
   - 1-Click "Set Clean 100 Students (4 Full Rooms)"
   - Delete Students Year-Wise (1st, 2nd, 3rd, 4th Year, or All)
   - Delete Rooms Year-Wise (1st, 2nd, 3rd, 4th Year, or All)
6. **Logout**: Safely clears admin token and returns to the Home page.

---

## 🎓 Enhanced Student Portal Experience

- Search by Hall Ticket Number (`HT2026001`).
- **Student Profile Card**: Photo/Avatar, Name, Hall Ticket, Academic Year, Branch tag, Exam Session, Subjects list.
- **Your Examination Seat Card**: Room Number, Block, Floor, Bench Number (e.g. `B01`), Seat Number (e.g. `Seat 1`), and Seat Label (`B01-S1`).
- **Floor Map Mini Grid**: 5x5 chair grid highlighting the student's seat in royal blue (`Your Seat`).
- **Full Interactive Seating Layout**: 2D room layout with capacity and occupancy legend.
- **Printable Admit Card**: Official exam hall ticket with candidate details, subjects table, anti-cheating instructions, barcode, and signature boxes.

---

## 🚀 How to Run

1. Make sure MongoDB is running on port `27017`:
   `mongodb://localhost:27017/college_hall_ticket`
2. Open your browser and navigate to:
   👉 **`http://localhost:5000`**
3. On Windows, double-click [`start.bat`](file:///d:/college%20hall%20ticket/3%20method/start.bat) to launch the server automatically.
