import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messagesAPI } from '../utils/api';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
                <Link to="/messages" className="nav-link">
                  Messages
                  {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
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
