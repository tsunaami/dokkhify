import React from "react";

function Navbar({ goHome, goCourses, goLogin, goSignup, goTuition }) {
  return (
    <nav className="navbar">
      <h2 className="logo" onClick={goHome}>Dokkhify</h2>
      <ul className="nav-links">
        <li onClick={goHome}>Home</li>
        <li onClick={goCourses}>Courses</li>
        <li onClick={goTuition}>Tuition</li>
        <li onClick={goLogin}>Login</li>
        <li><button className="signup" onClick={goSignup}>Sign Up</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;