import React, { useEffect, useState } from "react";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState("free");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Upload new course
  const addCourse = async () => {
    if (!title || !description || files.length === 0) {
      alert("Please fill all fields and upload files.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", priceType === "free" ? "Free" : price);
      formData.append("uploadedBy", loggedUser?.email || "unknown");

      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await fetch("http://localhost:5000/courses", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Reset fields
      setTitle("");
      setDescription("");
      setPriceType("free");
      setPrice("");
      setFiles([]);
      document.querySelector('input[type="file"]').value = "";

      fetchCourses(); // Refresh courses list
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎬";
    if (type.includes("zip")) return "🗜️";
    if (type.includes("presentation")) return "📊";
    return "📁";
  };

  return (
    <div style={{ background: "#f5f7fb", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Instructor Dashboard</h2>

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

          <button style={uploadBtn} onClick={addCourse} disabled={loading}>
            {loading ? "Uploading..." : "Upload Course"}
          </button>
        </div>

        <h3>Your Uploaded Courses</h3>
        {courses.length === 0 && <p>No courses uploaded yet.</p>}

        {courses.map((course) => (
          <div key={course._id} style={courseCard}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <p><b>Price:</b> {course.price === "Free" ? "Free" : `৳${course.price}`}</p>
            <p><b>Students Accessed:</b> {course.students}</p>

            <div style={{ marginTop: "10px" }}>
              <b>Files:</b>
              {course.files?.map((file, i) => (
                <div key={i} style={fileRow}>
                  <span>{getFileIcon(file.type)} {file.originalName}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "10px" }}
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>

            <button style={deleteBtn} onClick={() => deleteCourse(course._id)}>
              Delete Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Styles */
const inputStyle = { width: "100%", padding: "10px", marginTop: "10px", borderRadius: "6px", border: "1px solid #ccc" };
const uploadBox = { background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "40px" };
const uploadBtn = { marginTop: "15px", padding: "10px 18px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const deleteBtn = { marginTop: "15px", padding: "8px 14px", background: "#e53935", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const courseCard = { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 3px 8px rgba(0,0,0,0.08)", marginTop: "20px" };
const fileRow = { display: "flex", justifyContent: "space-between", marginTop: "8px", alignItems: "center" };

export default InstructorDashboard;