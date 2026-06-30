import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, MessageSquare, Calendar, User, Compass, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const isLightTheme = document.body.classList.contains('light-theme');
    setIsLight(isLightTheme);
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    setIsLight(!isLight);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span style={{ color: 'var(--primary)' }}>🎓</span>
        <span className="gradient-text">MentorConnect</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/mentors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Compass size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          Explore Mentors
        </NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Dashboard
            </NavLink>

            <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Messages
            </NavLink>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                {user.role === 'admin' && <Shield size={14} style={{ marginRight: '2px' }} />}
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Join Free
            </Link>
          </div>
        )}

        <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
