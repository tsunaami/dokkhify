import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";

function StudentDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // ✅ LOAD ONLY USER COURSES
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("myCourses")) || [];

    const userCourses = stored.filter(
      (c) => c.student === loggedUser?.email
    );

    setMyCourses(userCourses);
  }, []);

  // ================= DOWNLOAD FILES =================
  const downloadFiles = (course) => {
    course.files?.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.url || file.content;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // ================= CERTIFICATE =================
  const downloadCertificate = (course) => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(28);
    doc.text("Certificate of Completion", 148, 50, {
      align: "center",
    });

    doc.setFontSize(18);
    doc.text("This certifies that", 148, 80, {
      align: "center",
    });

    doc.setFontSize(24);
    doc.text(loggedUser?.name || "Student", 148, 105, {
      align: "center",
    });

    doc.setFontSize(18);
    doc.text("has completed", 148, 125, {
      align: "center",
    });

    doc.setFontSize(24);
    doc.text(course.title, 148, 145, {
      align: "center",
    });

    doc.save(`${course.title}-certificate.pdf`);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2>Student Dashboard</h2>
      <h3>Welcome, {loggedUser?.name}</h3>

      <h3>My Courses</h3>

      {myCourses.length === 0 && <p>No courses yet</p>}

      {myCourses.map((course) => (
        <div key={course._id} style={card}>
          <h4>{course.title}</h4>
          <p>{course.description}</p>

          {/* DOWNLOAD */}
          <button onClick={() => downloadFiles(course)}>
            Download Files
          </button>

          {/* STATUS */}
          <p>
            Status:{" "}
            {course.completed ? "✅ Completed" : "⏳ In Progress"}
          </p>

          {/* CERTIFICATE */}
          {course.completed && (
            <button onClick={() => downloadCertificate(course)}>
              🎓 Download Certificate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "white",
  padding: "20px",
  marginTop: "20px",
  borderRadius: "10px",
};

export default StudentDashboard;