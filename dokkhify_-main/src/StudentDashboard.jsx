import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";

function StudentDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  useEffect(() => {
    const purchased = JSON.parse(localStorage.getItem("myCourses")) || [];
    const allCourses = JSON.parse(localStorage.getItem("courses")) || [];

    const userCourses = purchased
      .filter((c) => c.student === loggedUser?.email)
      .map((c) => {
        const course = allCourses.find((course) => course.title === c.courseTitle);
        return course ? { ...course, certificate: c.certificate || false } : null;
      })
      .filter(Boolean);

    setMyCourses(userCourses);
  }, []);

  const downloadFiles = (course) => {
    if (!course.files) return;
    course.files.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.content || "#";
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // ✅ NEW PROFESSIONAL PDF CERTIFICATE FUNCTION
  const downloadCertificate = (course) => {
    const doc = new jsPDF("landscape");

    // Border
    doc.setDrawColor(0);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Title
    doc.setFont("Times", "Bold");
    doc.setFontSize(36);
    doc.text("Certificate of Completion", 148, 50, { align: "center" });

    // Subtitle
    doc.setFontSize(18);
    doc.setFont("Times", "Normal");
    doc.text("This certifies that", 148, 80, { align: "center" });

    // Student name
    doc.setFontSize(28);
    doc.setFont("Times", "Bold");
    doc.text(loggedUser?.name || "Student", 148, 105, { align: "center" });

    // Course text
    doc.setFontSize(18);
    doc.setFont("Times", "Normal");
    doc.text("has successfully completed the course", 148, 125, { align: "center" });

    // Course name
    doc.setFontSize(24);
    doc.setFont("Times", "Bold");
    doc.text(course.title, 148, 145, { align: "center" });

    // Date
    doc.setFontSize(14);
    doc.setFont("Times", "Normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 148, 170, { align: "center" });

    doc.save(`${course.title}-certificate.pdf`);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2>Student Dashboard</h2>
      <h3>Welcome, {loggedUser?.name}</h3>

      <h3 style={{ marginTop: "30px" }}>My Courses</h3>
      {myCourses.length === 0 && <p>No courses enrolled yet.</p>}

      {myCourses.map((course, index) => (
        <div key={index} style={courseCard}>
          <h4>{course.title}</h4>
          <p>{course.description}</p>

          <div style={{ margin: "10px 0" }}>
            <div style={progressBarBackground}>
              <div style={{ ...progressBarFill, width: course.certificate ? "100%" : "30%" }}></div>
            </div>
            <small>Progress: {course.certificate ? "Completed" : "30%"}</small>
          </div>

          {course.files?.length > 0 && (
            <button style={downloadBtn} onClick={() => downloadFiles(course)}>
              Download Files
            </button>
          )}

          {course.certificate && (
            <button style={certificateBtn} onClick={() => downloadCertificate(course)}>
              Download Certificate
            </button>
          )}

          {!course.certificate && course.quiz?.length > 0 && (
            <p style={{ color: "red" }}>Complete the quiz to get certificate</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* Styles */
const courseCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
};

const progressBarBackground = {
  height: "12px",
  background: "#e0e0e0",
  borderRadius: "6px",
  overflow: "hidden",
};

const progressBarFill = {
  height: "12px",
  background: "#4caf50",
};

const downloadBtn = {
  marginTop: "10px",
  padding: "8px 16px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const certificateBtn = {
  marginTop: "10px",
  padding: "8px 16px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default StudentDashboard;