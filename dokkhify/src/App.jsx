import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomePage from "./HomePage";
import CoursesPage from "./CoursesPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import TuitionPage from "./TuitionPage";
import InstructorDashboard from "./InstructorDashboard";
import AboutPage from "./AboutPage";
import PrivacyPage from "./PrivacyPage";

function App() {
  const [page, setPage] = useState("home");
  const [prevPage, setPrevPage] = useState(null); // track previous page for back
  const [loggedUser, setLoggedUser] = useState(null);

  // Load logged user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    setLoggedUser(user);
  }, []);

  // Generic navigation: stores previous page
  const goPage = (newPage) => {
    setPrevPage(page);
    setPage(newPage);
  };

  // Back button navigation
  const goBack = () => {
    if (prevPage) setPage(prevPage);
  };

  // Navigation helpers
  const goCourses = () => {
    if (loggedUser?.role === "student") goPage("courses");
    else if (loggedUser?.role === "instructor") goPage("dashboard");
  };

  const goDashboard = () => {
    if (loggedUser?.role === "instructor") goPage("dashboard");
  };

  return (
    <div>
      <Navbar
        goHome={() => goPage("home")}
        goCourses={goCourses}
        goLogin={() => goPage("login")}
        goSignup={() => goPage("signup")}
        goTuition={() => goPage("tuition")}
        goDashboard={goDashboard}
        goAbout={() => goPage("about")}
        goPrivacy={() => goPage("privacy")}
      />

      {/* Pages */}
      {page === "home" && <HomePage goCourses={goCourses} />}

      {/* Courses page only for students */}
      {page === "courses" && loggedUser?.role === "student" && <CoursesPage />}

      {/* Instructor dashboard */}
      {page === "dashboard" && loggedUser?.role === "instructor" && <InstructorDashboard />}

      {/* Login/Signup always accessible */}
      {page === "login" && (
        <LoginPage
          goHome={() => goPage("home")}
          goSignup={() => goPage("signup")}
          setLoggedUser={setLoggedUser} // update App state after login
        />
      )}
      {page === "signup" && (
        <SignupPage
          goHome={() => goPage("home")}
          goLogin={() => goPage("login")}
          setLoggedUser={setLoggedUser} // update App state after signup
        />
      )}

      {page === "tuition" && <TuitionPage />}

      {/* About/Privacy pages accessible anytime */}
      {page === "about" && <AboutPage goBack={goBack} />}
      {page === "privacy" && <PrivacyPage goBack={goBack} />}

      <Footer goAbout={() => goPage("about")} goPrivacy={() => goPage("privacy")} />
    </div>
  );
}

export default App;