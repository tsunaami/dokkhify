import React, { useState } from "react";

function TuitionPage() {
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Class 9-10");
  const [message, setMessage] = useState("");

  const handleBooking = () => {
    alert(`Student: ${studentName}\nSubject: ${subject}\nLevel: ${level}\nMessage: ${message}`);
  };

  return (
    <section className="login-hero">
      <div className="login-form">
        <h2 className="form-title">Book a Tuition</h2>

        <label>Name</label>
        <input
          className="tuition-box"
          type="text"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          placeholder="Enter your full name"
        />

        <label>Subject</label>
        <input
          className="tuition-box"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Math, Physics, Programming..."
        />

        <label>Level</label>
        <select
          className="tuition-box"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          <option>Class 9-10</option>
          <option>Class 11-12</option>
          <option>Admission</option>
        </select>

        <label>Message / Notes</label>
        <textarea
          className="notes-box"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Additional info"
          rows={4}
        />

        <button className="btn-login" onClick={handleBooking}>
          Book Tuition
        </button>
      </div>
    </section>
  );
}

export default TuitionPage;