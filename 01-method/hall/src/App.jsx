import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, {
        type: "array",
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json(sheet);

      setStudents(data);
      setStudent(null);
      setSearch("");
      setMessage(`${data.length} student records uploaded successfully.`);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSearch = () => {
    if (!search.trim()) {
      setStudent(null);
      setMessage("Please enter a hall ticket number.");
      return;
    }

    const result = students.find(
      (item) =>
        String(item.hall_ticket_number).trim().toLowerCase() ===
        search.trim().toLowerCase(),
    );

    if (result) {
      setStudent(result);
      setMessage("");
    } else {
      setStudent(null);
      setMessage("Student not found. Please check the hall ticket number.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>College Hall Ticket Search</h1>
        <p>Search student details and examination room allocation</p>
      </header>

      <main className="container">
        <section className="upload-section">
          <h2>Upload Student Excel File</h2>

          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

          {students.length > 0 && (
            <p className="success">Total Students: {students.length}</p>
          )}
        </section>

        <section className="search-section">
          <h2>Search Student</h2>

          <div className="search-box">
            <input
              type="text"
              placeholder="Enter Hall Ticket Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <button onClick={handleSearch}>Search</button>
          </div>
        </section>

        {message && (
          <p className={student ? "success" : "message"}>{message}</p>
        )}

        {student && (
          <section className="student-card">
            <h2>Student Details</h2>

            <div className="details-grid">
              <p>
                <strong>Hall Ticket:</strong> {student.hall_ticket_number}
              </p>

              <p>
                <strong>Student Name:</strong> {student.student_name}
              </p>

              <p>
                <strong>Academic Year:</strong> {student.academic_year}
              </p>

              <p>
                <strong>Branch:</strong> {student.branch}
              </p>

              <p>
                <strong>Room Number:</strong> {student.room_number}
              </p>

              <p>
                <strong>Block:</strong> {student.block}
              </p>

              <p>
                <strong>Floor:</strong> {student.floor}
              </p>

              <p>
                <strong>Subject Codes:</strong> {student.subject_codes}
              </p>

              <p>
                <strong>Subjects:</strong> {student.subject_names}
              </p>

              <p>
                <strong>Exam Session:</strong> {student.exam_session}
              </p>
            </div>
          </section>
        )}

        {students.length > 0 && (
          <section className="table-section">
            <h2>All Student Records</h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Hall Ticket</th>
                    <th>Student Name</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Room</th>
                    <th>Block</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((item, index) => (
                    <tr key={item.hall_ticket_number || index}>
                      <td>{item.hall_ticket_number}</td>
                      <td>{item.student_name}</td>
                      <td>{item.academic_year}</td>
                      <td>{item.branch}</td>
                      <td>{item.room_number}</td>
                      <td>{item.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
