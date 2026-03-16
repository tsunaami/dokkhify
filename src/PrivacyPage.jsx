// PrivacyPage.jsx
import React from "react";

function PrivacyPage({ goBack }) {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={goBack} style={{ padding: "10px 20px", marginBottom: "20px" }}>
        ← Back
      </button>
      <h2>Privacy Policy</h2>
      <p>
        Your privacy is very important to us. Dokkhify ensures that all your personal information, including name, email, and learning data, is stored securely and never shared with third parties without your consent. We use secure technologies to protect your data and maintain the confidentiality of your information. By using our platform, you agree to our privacy practices, which include safe handling of course enrollment, progress tracking, and payment information. We are committed to maintaining transparency and trust in protecting your digital privacy.
      </p>
    </div>
  );
}

export default PrivacyPage;