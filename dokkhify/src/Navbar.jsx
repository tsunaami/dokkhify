import React from "react";

function Navbar({ goHome, goCourses, goLogin, goSignup, goTuition, goDashboard }) {
  // Get logged-in user
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={goHome}>Dokkhify</h2>
      <ul className="nav-links">
        <li onClick={goHome}>Home</li>

        {/* Show Courses only for students */}
        {loggedUser?.role === "student" && <li onClick={goCourses}>Courses</li>}

        {/* Show Dashboard only for instructors */}
        {loggedUser?.role === "instructor" && <li onClick={goDashboard}>Dashboard</li>}

        <li onClick={goTuition}>Tuition</li>

        {/* Always show Login / Sign Up */}
        <li onClick={goLogin}>Login</li>
        <li>
          <button className="signup" onClick={goSignup}>Sign Up</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;