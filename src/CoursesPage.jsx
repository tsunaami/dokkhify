import React, { useState, useEffect } from "react";

function CoursesPage({ goStudentDashboard }) {
  const [courses, setCourses] = useState([]);
  const [quizMode, setQuizMode] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // ========================= LOAD COURSES =========================
  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((res) => res.json())
      .then((data) => {
        const fixed = data.map((course) => ({
          ...course,
          quiz: typeof course.quiz === "string"
            ? JSON.parse(course.quiz)
            : course.quiz || [],
        }));
        setCourses(fixed);
      })
      .catch((err) => console.error(err));
  }, []);

  // ========================= DOWNLOAD =========================
  const downloadFiles = (course) => {
    course.files?.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.url || file.content;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // ========================= PURCHASE =========================
  const purchaseCourse = (course) => {
    if (!loggedUser) return alert("Login first!");

    if (!window.confirm(`Purchase "${course.title}"?`)) return;

    let myCourses = JSON.parse(localStorage.getItem("myCourses")) || [];

    if (
      !myCourses.find(
        (c) => c._id === course._id && c.student === loggedUser.email
      )
    ) {
      myCourses.push({
        _id: course._id,
        title: course.title,
        description: course.description,
        files: course.files,
        quiz: course.quiz,
        student: loggedUser.email,
        completed: false,
      });

      localStorage.setItem("myCourses", JSON.stringify(myCourses));
    }

    downloadFiles(course);
    alert("Purchased!");
  };

  // ========================= START QUIZ =========================
  const startQuiz = (course) => {
    if (!course.quiz || course.quiz.length === 0) {
      return alert("No quiz available");
    }

    setQuizMode(course);
    setCurrentQuestion(0);
    setSelectedOption("");
    setScore(0);
  };

  // ========================= SUBMIT ANSWER =========================
  const submitAnswer = () => {
    if (!selectedOption) return alert("Select answer");

    const question = quizMode.quiz[currentQuestion];

    let newScore = score;

    if (selectedOption === question.answer) {
      newScore++;
    }

    if (currentQuestion + 1 < quizMode.quiz.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption("");
      setScore(newScore);
    } else {
      alert(`Quiz finished! Score: ${newScore}`);

      let myCourses =
        JSON.parse(localStorage.getItem("myCourses")) || [];

      myCourses = myCourses.map((c) => {
        if (
          c._id === quizMode._id &&
          c.student === loggedUser.email
        ) {
          return { ...c, completed: true };
        }
        return c;
      });

      localStorage.setItem("myCourses", JSON.stringify(myCourses));

      setQuizMode(null);
      setCurrentQuestion(0);
      setSelectedOption("");
      setScore(0);
    }
  };

  // ========================= QUIZ UI =========================
  if (quizMode) {
    const q = quizMode.quiz[currentQuestion];

    if (!q) return <p>Loading quiz...</p>;

    // ✅ FIX: support both formats
    const options = q.options || [q.a, q.b];

    return (
      <div style={{ padding: "40px" }}>
        <h2>{quizMode.title} Quiz</h2>

        <h3>
          Q{currentQuestion + 1}: {q.question}
        </h3>

        {options.map((opt, i) => (
          <div key={i}>
            <label>
              <input
                type="radio"
                value={opt}
                checked={selectedOption === opt}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              {opt}
            </label>
          </div>
        ))}

        <button onClick={submitAnswer}>
          {currentQuestion + 1 === quizMode.quiz.length
            ? "Submit"
            : "Next"}
        </button>
      </div>
    );
  }

  // ========================= COURSES UI =========================
  return (
    <div style={{ padding: "40px" }}>
      <h2>Courses</h2>

      <button onClick={goStudentDashboard}>
        My Courses
      </button>

      {courses.map((course) => {
        const myCourses =
          JSON.parse(localStorage.getItem("myCourses")) || [];

        const purchased = myCourses.find(
          (c) =>
            c._id === course._id &&
            c.student === loggedUser?.email
        );

        return (
          <div key={course._id} style={card}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>

            {!purchased ? (
              <button onClick={() => purchaseCourse(course)}>
                Purchase
              </button>
            ) : (
              <>
                <button onClick={() => downloadFiles(course)}>
                  Download
                </button>

                {course.quiz?.length > 0 && (
                  <button onClick={() => startQuiz(course)}>
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

const card = {
  background: "#fff",
  padding: "20px",
  marginTop: "20px",
  borderRadius: "10px",
};

export default CoursesPage;