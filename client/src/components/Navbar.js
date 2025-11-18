import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connectionsAPI } from '../utils/api';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAcceptedCount();
      // Poll for new connections every 30 seconds
      const interval = setInterval(fetchAcceptedCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAcceptedCount = async () => {
    try {
      const response = await connectionsAPI.getAccepted();
      setAcceptedCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching accepted count:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <span className="logo-icon">💕</span>
            <span className="logo-text">CoupleDelight</span>
          </Link>
          
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/discover" className="nav-link">Discover</Link>
                <Link to="/horney" className="nav-link">
                  Playmates
                  {acceptedCount > 0 && (
                    <span className="unread-badge">{acceptedCount}</span>
                  )}
                </Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={onLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
