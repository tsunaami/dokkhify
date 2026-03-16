import React, { useState } from "react";

function HomePage({ goCourses, goLogin, goSignup, goTuition, loggedUser, goStudentDashboard }) {
  const [search, setSearch] = useState("");

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Learn Skills That Matter</h1>
          <p>Structured courses in Bangla & English guided by verified instructors.</p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="search-btn" onClick={() => goCourses(search)}>
              Start Learning
            </button>
          </div>

          {loggedUser?.role === "student" && (
            <button
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={goStudentDashboard}
            >
              My Dashboard
            </button>
          )}

          <p style={{ marginTop: "10px", fontSize: "14px", color: "#4B4B4B" }}>
            Optional tuition support available for students who want extra guidance.
          </p>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="popular">
        <h2>Popular Courses</h2>
        <div className="courses">
          <div className="card">
            <h3>Web Development</h3>
            <p>HTML, CSS, JavaScript</p>
            <button className="btn" onClick={() => goCourses("Web Development")}>
              View Course
            </button>
          </div>

          <div className="card">
            <h3>Graphic Design</h3>
            <p>Photoshop, Illustrator</p>
            <button className="btn" onClick={() => goCourses("Graphic Design")}>
              View Course
            </button>
          </div>

          <div className="card">
            <h3>C++ Programming</h3>
            <p>Programming Fundamentals</p>
            <button className="btn" onClick={() => goCourses("C++ Programming")}>
              View Course
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;