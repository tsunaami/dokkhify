import React, { useEffect, useState } from "react";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState("free");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);

  // ✅ MULTI-QUESTION QUIZ
  const [quiz, setQuiz] = useState([
    { question: "", a: "", b: "", answer: "" },
  ]);

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // Fetch courses
  const fetchCourses = () => {
    fetch("http://localhost:5000/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add course
  const addCourse = async () => {
    if (!title || !description || files.length === 0) {
      alert("Please fill all fields and upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", priceType === "free" ? "Free" : price);
    formData.append("uploadedBy", loggedUser?.email);

    // send quiz
    formData.append("quiz", JSON.stringify(quiz));

    // send files
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("http://localhost:5000/courses", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Uploaded:", data);

      fetchCourses();
    } catch (err) {
      console.error(err);
    }

    // reset form
    setTitle("");
    setDescription("");
    setPriceType("free");
    setPrice("");
    setFiles([]);
    setQuiz([{ question: "", a: "", b: "", answer: "" }]);
  };

  // Delete course
  const deleteCourse = async (id) => {
    await fetch(`http://localhost:5000/courses/${id}`, {
      method: "DELETE",
    });

    fetchCourses();
  };

  return (
    <div style={{ background: "#f5f7fb", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <h2 style={{ textAlign: "center" }}>Instructor Dashboard</h2>

        {/* Upload Form */}
        <div style={uploadBox}>
          <h3>Upload New Course</h3>

          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />

          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            style={inputStyle}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          {priceType === "paid" && (
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          )}

          {/* Files */}
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            style={{ marginTop: "10px" }}
          />

          {/* Quiz Section */}
          <div style={{ marginTop: "15px" }}>
            <h4>Quiz</h4>

            {quiz.map((q, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <h5>Question {index + 1}</h5>

                <input
                  type="text"
                  placeholder="Question"
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...quiz];
                    updated[index].question = e.target.value;
                    setQuiz(updated);
                  }}
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Option A"
                  value={q.a}
                  onChange={(e) => {
                    const updated = [...quiz];
                    updated[index].a = e.target.value;
                    setQuiz(updated);
                  }}
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Option B"
                  value={q.b}
                  onChange={(e) => {
                    const updated = [...quiz];
                    updated[index].b = e.target.value;
                    setQuiz(updated);
                  }}
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={q.answer}
                  onChange={(e) => {
                    const updated = [...quiz];
                    updated[index].answer = e.target.value;
                    setQuiz(updated);
                  }}
                  style={inputStyle}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setQuiz([...quiz, { question: "", a: "", b: "", answer: "" }])
              }
              style={{ padding: "8px", marginTop: "10px" }}
            >
              + Add Question
            </button>
          </div>

          <button style={uploadBtn} onClick={addCourse}>
            Upload Course
          </button>
        </div>

        {/* Courses List */}
        <h3>Your Courses</h3>

        {courses.length === 0 && <p>No courses found.</p>}

        {courses.map((course) => (
          <div key={course._id} style={courseCard}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>

            <p>
              <b>Price:</b>{" "}
              {course.price === "Free" ? "Free" : `৳${course.price}`}
            </p>

            {/* Files */}
            <div>
              <b>Files:</b>
              {course.files?.map((file, i) => (
                <div key={i}>
                  <a href={file.url} target="_blank" rel="noreferrer">
                    {file.originalName}
                  </a>
                </div>
              ))}
            </div>

            <button
              style={deleteBtn}
              onClick={() => deleteCourse(course._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Styles */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
};

const uploadBox = {
  background: "white",
  padding: "20px",
  marginBottom: "30px",
};

const uploadBtn = {
  marginTop: "10px",
  padding: "10px",
  background: "green",
  color: "white",
};

const deleteBtn = {
  marginTop: "10px",
  padding: "8px",
  background: "red",
  color: "white",
};

const courseCard = {
  background: "white",
  padding: "15px",
  marginTop: "15px",
};

export default InstructorDashboard;