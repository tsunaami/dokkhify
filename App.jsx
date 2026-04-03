import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import TuitionPage from './TuitionPage';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard'; // <-- new
import AboutPage from './AboutPage';
import PrivacyPage from './PrivacyPage';

function App() {
  const [page, setPage] = useState('home');
  const [prevPage, setPrevPage] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem('authUser') || localStorage.getItem('loggedUser')
    );
    setLoggedUser(user);
  }, []);

  const goPage = (newPage) => {
    setPrevPage(page);
    setPage(newPage);
  };

  const goBack = () => {
    if (prevPage) setPage(prevPage);
  };

  const goCourses = () => {
    if (loggedUser?.role === 'student') goPage('courses');
    else if (loggedUser?.role === 'instructor') goPage('dashboard');
  };

  const goDashboard = () => {
    if (loggedUser?.role === 'instructor') goPage('dashboard');
  };

  const goStudentDashboard = () => {
    if (loggedUser?.role === 'student') goPage('student-dashboard');
  };

  return (
    <div style={appShell}>
      <Navbar
        goHome={() => goPage('home')}
        goCourses={goCourses}
        goDashboard={goDashboard}
        goStudentDashboard={goStudentDashboard} // <-- added
        goLogin={() => goPage('login')}
        goSignup={() => goPage('signup')}
        goTuition={() => goPage('tuition')}
        goAbout={() => goPage('about')}
        goPrivacy={() => goPage('privacy')}
      />

      <main style={pageShell}>
        {page === 'home' && (
          <HomePage
            goCourses={goCourses}
            goStudentDashboard={goStudentDashboard}
            loggedUser={loggedUser}
          />
        )}
        {page === 'courses' && loggedUser?.role === 'student' && (
          <CoursesPage goStudentDashboard={goStudentDashboard} />
        )}
        {page === 'student-dashboard' && loggedUser?.role === 'student' && (
          <StudentDashboard />
        )}
        {page === 'dashboard' && loggedUser?.role === 'instructor' && (
          <InstructorDashboard />
        )}
        {page === 'login' && (
          <LoginPage
            goHome={() => goPage('home')}
            goSignup={() => goPage('signup')}
            setLoggedUser={setLoggedUser}
          />
        )}
        {page === 'signup' && (
          <SignupPage
            goHome={() => goPage('home')}
            goLogin={() => goPage('login')}
            setLoggedUser={setLoggedUser}
          />
        )}
        {page === 'tuition' && <TuitionPage />}
        {page === 'about' && <AboutPage goBack={goBack} />}
        {page === 'privacy' && <PrivacyPage goBack={goBack} />}
      </main>

      <Footer
        goAbout={() => goPage('about')}
        goPrivacy={() => goPage('privacy')}
      />
    </div>
  );
}

const appShell = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const pageShell = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

export default App;
