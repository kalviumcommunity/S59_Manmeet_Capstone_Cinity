import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      console.log('Response status:', response.status);
      console.log('Response:', response);
  
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        // You can store the token if needed, e.g., in localStorage or context
        // localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        const errorData = await response.json();
        console.log('Login failed:', errorData);
        alert(`Login failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during login attempt:', error);
      alert('An error occurred during login. Please try again.');
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
