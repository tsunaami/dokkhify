// CoursesPage.jsx
import React from 'react';

function CoursesPage() {
  return (
    <div>
      <section className="courses-list">
        <h2 className="courses-title">Free Courses</h2>
        <div className="courses">
          <div className="card">
            <h3>Web Development</h3>
            <p>Instructor: John Doe</p>
            <p>Level: Beginner</p>
            <button className="btn">View Course</button>
          </div>
          <div className="card">
            <h3>Graphic Design</h3>
            <p>Instructor: Jane Doe</p>
            <p>Level: Beginner</p>
            <button className="btn">View Course</button>
          </div>
          <div className="card">
            <h3>C++ Programming</h3>
            <p>Instructor: Sam Smith</p>
            <p>Level: Beginner</p>
            <button className="btn">View Course</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CoursesPage; // <-- export after defining