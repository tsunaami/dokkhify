import React, { useState } from "react";

function LoginPage({ goHome, goSignup, setLoggedUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("dokkhifyUsers")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return alert("Invalid login");

    localStorage.setItem("loggedUser", JSON.stringify(user));
    setLoggedUser(user);
    alert(`Login successful! Welcome ${user.name}`);
    goHome();
  };

  return (
    <section className="login-hero">
      <form className="login-form" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
        <h2 className="form-title">Login</h2>

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        <button className="btn-login" type="submit">Login</button>
        <p>Don't have an account? <span onClick={goSignup} style={{cursor:"pointer", color:"blue"}}>Sign Up</span></p>
      </form>
    </section>
  );
}

export default LoginPage;