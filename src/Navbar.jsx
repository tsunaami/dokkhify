import React from "react";

function Navbar({
  goHome,
  goCourses,
  goLogin,
  goSignup,
  goTuition,
  goDashboard,
  goStudentDashboard
}) {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={goHome}>Dokkhify</h2>
      <ul className="nav-links">
        <li onClick={goHome}>Home</li>

        {/* Show Courses only for students */}
        {loggedUser?.role === "student" && <li onClick={goCourses}>Courses</li>}

        {/* Student dashboard link */}
        {loggedUser?.role === "student" && <li onClick={goStudentDashboard}>My Courses</li>}

        {/* Instructor dashboard link */}
        {loggedUser?.role === "instructor" && <li onClick={goDashboard}>Dashboard</li>}

        <li onClick={goTuition}>Tuition</li>

        {/* Login / Signup if not logged in */}
        {!loggedUser ? (
          <>
            <li onClick={goLogin}>Login</li>
            <li>
              <button className="signup" onClick={goSignup}>Sign Up</button>
            </li>
          </>
        ) : (
          <li
            onClick={() => {
              localStorage.removeItem("loggedUser");
              goHome();
            }}
          >
            Logout
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;