import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import BlogPage from './BlogPage';
import Register from './Register';
import Login from './Login';

function App() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <>
      <h1>Daily Conversation Blog (Jo batein keh nhi sakte)</h1>
      <nav>
        <div>
          <Link to="/" className="home">Home</Link>
          <Link to="/register" className="register">Register</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout">Logout</button>
          ) : (
            <Link to="/login" className="login">Login</Link>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<BlogPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
