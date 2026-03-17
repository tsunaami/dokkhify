import React, { useState } from "react";

function InstructorDashboard() {
  const [courses, setCourses] = useState(
    JSON.parse(localStorage.getItem("courses")) || []
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState("free");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const addCourse = () => {
    if (!title || !description || files.length === 0) {
      alert("Please fill all fields and upload files.");
      return;
    }

    // Save only file name and type (not content)
    const uploadedFiles = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
    }));

    const newCourse = {
      title,
      description,
      price: priceType === "free" ? "Free" : price,
      files: uploadedFiles,
      students: 0,
      uploadedBy: loggedUser?.email,
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    // Reset form
    setTitle("");
    setDescription("");
    setPriceType("free");
    setPrice("");
    setFiles([]);
    document.querySelector('input[type="file"]').value = "";
  };

  const deleteCourse = (index) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
  };

  return (
    <div style={{ background: "#f5f7fb", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          Instructor Dashboard
        </h2>

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

          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.zip,.mp4,.ppt,.pptx"
            onChange={(e) => setFiles(e.target.files)}
            style={{ marginTop: "10px" }}
          />

          <button style={uploadBtn} onClick={addCourse}>
            Upload Course
          </button>
        </div>

        {/* Uploaded Courses */}
        <h3>Your Uploaded Courses</h3>

        {courses.length === 0 && <p>No courses uploaded yet.</p>}

        {courses.map((course, index) => (
          <div key={index} style={courseCard}>
            <h4>{course.title}</h4>

            <p>{course.description}</p>

            <p>
              <b>Price:</b>{" "}
              {course.price === "Free" ? "Free" : `৳${course.price}`}
            </p>

            <p>
              <b>Students Accessed:</b> {course.students}
            </p>

            <div style={{ marginTop: "10px" }}>
              <b>Files:</b>

              {course.files.map((file, i) => (
                <div key={i} style={fileRow}>
                  <span>{file.name}</span>
                </div>
              ))}
            </div>

            <button style={deleteBtn} onClick={() => deleteCourse(index)}>
              Delete Course
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
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const uploadBox = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginBottom: "40px",
};

const uploadBtn = {
  marginTop: "15px",
  padding: "10px 18px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  marginTop: "15px",
  padding: "8px 14px",
  background: "#e53935",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const courseCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
  marginTop: "20px",
};

const fileRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "8px",
  alignItems: "center",
};

export default InstructorDashboard;
