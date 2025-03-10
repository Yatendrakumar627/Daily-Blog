import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    fetch('https://your-backend-url.onrender.com/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname, username, password, email }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => { throw new Error(data.error); });
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('userId', decodedToken.userId);
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message);
      });
  };

  return (
    <form onSubmit={handleRegister}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Full Name"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
