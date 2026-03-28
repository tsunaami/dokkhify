import React, { useState } from "react";

function SignupPage({ goHome, goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = () => {
    const user = { name, email, password, role };
    const users = JSON.parse(localStorage.getItem("dokkhifyUsers")) || [];

    if (users.find(u => u.email === email)) {
      return alert("Email already exists!");
    }

    users.push(user);
    localStorage.setItem("dokkhifyUsers", JSON.stringify(users));
    alert("Signup successful!");
    goLogin(); // go to login after signup
  };

  return (
    <section className="login-hero">
      <form className="signup-form" onSubmit={e => { e.preventDefault(); handleSignup(); }}>
        <h2 className="form-title">Sign Up</h2>

        <label>Name</label>
        <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />

        <label>Select Role</label>
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>

        <button className="btn-login" type="submit">Sign Up</button>
      </form>
    </section>
  );
}

export default SignupPage;