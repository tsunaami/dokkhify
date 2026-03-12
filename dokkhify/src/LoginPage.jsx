import React, { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert(`Email: ${email}\nPassword: ${password}`);
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
        <p className="forgot">Forgot Password?</p>
      </form>
    </section>
  );
}

export default LoginPage;