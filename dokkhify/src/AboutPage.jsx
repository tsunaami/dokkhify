// AboutPage.jsx
import React from "react";

function AboutPage({ goBack }) {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={goBack} style={{ padding: "10px 20px", marginBottom: "20px" }}>
        ← Back
      </button>
      <h2>About Dokkhify</h2>
      <p>
        Dokkhify is a secure, skill-based e-learning platform offering structured courses in Bangla and English, guided by verified instructors. Our platform provides quizzes, assignments, tuition support, and certificates to help learners gain practical skills and improve employability. Students can choose self-paced courses or book mentorship sessions. Instructors can manage courses, track student progress, and earn revenue. Our mission is to make high-quality, practical education accessible and affordable, bridging the gap between academia and industry requirements.
      </p>
    </div>
  );
}

export default AboutPage;