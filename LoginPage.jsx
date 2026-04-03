import React, { useState } from 'react';

function LoginPage({ goHome, goSignup, setLoggedUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || 'Login failed');
        return;
      }

      const normalizedUser = {
        ...data.user,
        role: data.user?.role || 'student',
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedUser', JSON.stringify(normalizedUser));
      localStorage.setItem('authUser', JSON.stringify(normalizedUser));
      setLoggedUser(normalizedUser);
      alert(`Login successful! Welcome ${normalizedUser.name}`);
      goHome();
    } catch {
      alert('Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-hero">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <h2 className="form-title">Login</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-login" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>
          Don't have an account?{' '}
          <span onClick={goSignup} style={{ cursor: 'pointer', color: 'blue' }}>
            Sign Up
          </span>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
