import React, { useState, useEffect } from "react";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);
  }, []);

  const downloadFiles = (course) => {
    course.files.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.content;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const purchaseCourse = (course) => {
    if (!loggedUser) return alert("Login first to purchase!");

    const confirmPurchase = window.confirm(`Purchase "${course.title}" for ৳${course.price}?`);
    if (!confirmPurchase) return;

    // Increment student count in course
    const updatedCourses = courses.map((c) =>
      c.title === course.title ? { ...c, students: c.students + 1 } : c
    );
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    // Auto-download
    downloadFiles(course);
    alert("Purchase successful! Files are downloading.");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2>Available Courses</h2>
      {courses.map((course, index) => (
        <div key={index} style={courseCard}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p><b>Price:</b> {course.price}</p>

          {course.price === "Free" ? (
            <button style={purchaseBtn} onClick={() => downloadFiles(course)}>
              Download
            </button>
          ) : (
            <button style={purchaseBtn} onClick={() => purchaseCourse(course)}>
              Purchase
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const courseCard = { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 3px 8px rgba(0,0,0,0.08)", marginTop: "20px" };
const purchaseBtn = { marginTop: "10px", padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };

export default CoursesPage;