import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomePage from "./HomePage";
import CoursesPage from "./CoursesPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import TuitionPage from "./TuitionPage";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      <Navbar
        goHome={() => setPage("home")}
        goCourses={() => setPage("courses")}
        goLogin={() => setPage("login")}
        goSignup={() => setPage("signup")}
        goTuition={() => setPage("tuition")}
      />

      {page === "home" && <HomePage goCourses={() => setPage("courses")} />}
      {page === "courses" && <CoursesPage />}
      {page === "login" && <LoginPage goHome={() => setPage("home")} goSignup={() => setPage("signup")} />}
      {page === "signup" && <SignupPage goHome={() => setPage("home")} goLogin={() => setPage("login")} />}
      {page === "tuition" && <TuitionPage />}

      <Footer />
    </div>
  );
}

export default App;