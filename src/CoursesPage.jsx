import React, { useState, useEffect } from "react";

function CoursesPage({ goStudentDashboard }) {
  const [courses, setCourses] = useState([]);
  const [quizMode, setQuizMode] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // Load courses from localStorage
  useEffect(() => {
    let storedCourses = JSON.parse(localStorage.getItem("courses")) || [];

    // Ensure Web Development has a quiz
    storedCourses = storedCourses.map(course => {
      if (course.title === "Web Development" && !course.quiz) {
        course.quiz = [
          {
            question: "What does HTML stand for?",
            options: [
              "Hyper Text Markup Language",
              "Home Tool Markup Language",
              "Hyperlinks Text Mark Language",
            ],
            answer: "Hyper Text Markup Language",
          },
          {
            question: "Which tag is used for headings?",
            options: ["<h1>", "<p>", "<div>"],
            answer: "<h1>",
          },
        ];
      }
      return course;
    });

    localStorage.setItem("courses", JSON.stringify(storedCourses));
    setCourses(storedCourses);
  }, []);

  // Download course files
  const downloadFiles = (course) => {
    if (!course.files) return;
    course.files.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.content;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // Purchase course
  const purchaseCourse = (course) => {
    if (!loggedUser) return alert("Login first to purchase!");

    if (!window.confirm(`Purchase "${course.title}" for ${course.price === "Free" ? "Free" : `৳${course.price}`}?`))
      return;

    // Update student count
    const updatedCourses = courses.map((c) =>
      c.title === course.title ? { ...c, students: (c.students || 0) + 1 } : c
    );
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    // Save purchased course
    const myCourses = JSON.parse(localStorage.getItem("myCourses")) || [];
    if (!myCourses.find(c => c.courseTitle === course.title && c.student === loggedUser.email)) {
      myCourses.push({
        courseTitle: course.title,
        student: loggedUser.email,
        certificate: false,
      });
      localStorage.setItem("myCourses", JSON.stringify(myCourses));
    }

    downloadFiles(course);
    alert("Purchase successful! Files are downloading.");
  };

  // Start quiz
  const startQuiz = (course) => {
    if (!course.quiz || course.quiz.length === 0) {
      return alert("No quiz available for this course.");
    }
    setQuizMode(course);
    setCurrentQuestion(0);
    setSelectedOption("");
    setScore(0);
  };

  // Submit quiz answer
  const submitAnswer = () => {
    if (selectedOption === "") return alert("Select an option!");
    const question = quizMode.quiz[currentQuestion];
    let newScore = score;
    if (selectedOption === question.answer) newScore += 1;

    if (currentQuestion + 1 < quizMode.quiz.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption("");
      setScore(newScore);
    } else {
      alert(`Quiz completed! Score: ${newScore} / ${quizMode.quiz.length}`);

      // Update certificate in myCourses
      const myCourses = JSON.parse(localStorage.getItem("myCourses")) || [];
      const courseIndex = myCourses.findIndex(
        (c) => c.courseTitle === quizMode.title && c.student === loggedUser.email
      );
      if (courseIndex !== -1) {
        myCourses[courseIndex].certificate = true;
        localStorage.setItem("myCourses", JSON.stringify(myCourses));
      }

      // Reset quiz
      setQuizMode(null);
      setCurrentQuestion(0);
      setSelectedOption("");
      setScore(0);
    }
  };

  // Render quiz screen
  if (quizMode) {
    const question = quizMode.quiz[currentQuestion];
    return (
      <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
        <h2>Quiz: {quizMode.title}</h2>
        <p>Question {currentQuestion + 1} / {quizMode.quiz.length}</p>
        <h3>{question.question}</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {question.options.map((opt, idx) => (
            <li key={idx} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="radio"
                  name="option"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={(e) => setSelectedOption(e.target.value)}
                /> {opt}
              </label>
            </li>
          ))}
        </ul>
        <button style={purchaseBtn} onClick={submitAnswer}>
          {currentQuestion + 1 === quizMode.quiz.length ? "Submit Quiz" : "Next"}
        </button>
      </div>
    );
  }

  // Render courses list
  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2>Available Courses</h2>

      {loggedUser?.role === "student" && (
        <button style={dashboardBtn} onClick={goStudentDashboard}>
          My Courses
        </button>
      )}

      {courses.length === 0 && <p>No courses available.</p>}

      {courses.map((course, index) => {
        const myCourses = JSON.parse(localStorage.getItem("myCourses")) || [];
        const purchased = myCourses.find(
          (c) => c.courseTitle === course.title && c.student === loggedUser?.email
        );

        return (
          <div key={index} style={courseCard}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p><b>Price:</b> {course.price === "Free" ? "Free" : `৳${course.price}`}</p>

            {!purchased ? (
              course.price === "Free" ? (
                <button style={purchaseBtn} onClick={() => downloadFiles(course)}>
                  Download
                </button>
              ) : (
                <button style={purchaseBtn} onClick={() => purchaseCourse(course)}>
                  Purchase
                </button>
              )
            ) : (
              <>
                {course.quiz?.length > 0 && (
                  <button
                    style={{ ...purchaseBtn, background: "#1976d2", marginLeft: "10px" }}
                    onClick={() => startQuiz(course)}
                  >
                    Take Quiz
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Styles
const courseCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
  marginTop: "20px",
};

const purchaseBtn = {
  marginTop: "10px",
  padding: "8px 16px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const dashboardBtn = {
  marginBottom: "20px",
  padding: "8px 16px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default CoursesPage;