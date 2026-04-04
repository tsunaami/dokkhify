import React from "react";

function Footer({ goAbout, goPrivacy }) {
  return (
    <div className="footer">
      <div className="footer-links" style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        <a href="tel:+8801329264893" style={{ cursor: "pointer", textDecoration: "none", color: "#F8C1B8" }}>Call</a>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=mojumdernamira@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ cursor: "pointer", textDecoration: "none", color: "#F8C1B8" }}
        >
          Email
        </a>
        <a
          href="https://wa.me/8801329264893"
          target="_blank"
          rel="noreferrer"
          style={{ cursor: "pointer", textDecoration: "none", color: "#F8C1B8" }}
        >
          WhatsApp
        </a>
        <span
          style={{ cursor: "pointer", color: "#F8C1B8", textDecoration: "underline" }}
          onClick={goAbout}
        >
          About
        </span>
        <span
          style={{ cursor: "pointer", color: "#F8C1B8", textDecoration: "underline" }}
          onClick={goPrivacy}
        >
          Privacy
        </span>
      </div>
      <p style={{ textAlign: "center", marginTop: "15px", color: "#F8C1B8" }}>© 2026 Dokkhify</p>
    </div>
  );
}

export default Footer;