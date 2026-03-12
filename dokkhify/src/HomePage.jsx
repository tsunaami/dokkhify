import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function HomePage({ goCourses, goLogin, goSignup, goTuition }) {
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