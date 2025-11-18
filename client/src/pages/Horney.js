import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionsAPI } from '../utils/api';
import './Horney.css';

function Horney({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' or 'declined'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      // Fetch accepted connections
      const acceptedRes = await connectionsAPI.getAccepted();
      setAcceptedConnections(acceptedRes.data.connections || []);
      
      // Fetch pending connections (received requests)
      const pendingRes = await connectionsAPI.getPending();
      setPendingConnections(pendingRes.data.connections || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      setError('');
      await connectionsAPI.acceptRequest(connectionId);
      setSuccess('Connection request accepted!');
      await fetchConnections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      setError('');
      await connectionsAPI.rejectRequest(connectionId);
      setSuccess('Connection request declined');
      await fetchConnections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline request');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your playmates...</p>
      </div>
    );
  }

  return (
    <div className="horney-page">
      <div className="container-wide">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Header */}
        <div className="horney-header">
          <div className="header-content">
            <div className="header-icon">🔥</div>
            <div>
              <h1 className="horney-title">Your Playmates</h1>
              <p className="horney-subtitle">Manage your intimate connections and pending requests</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="horney-tabs">
          <button
            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            <span className="tab-icon">✅</span>
            Accepted ({acceptedConnections.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'declined' ? 'active' : ''}`}
            onClick={() => setActiveTab('declined')}
          >
            <span className="tab-icon">⏳</span>
            Pending Requests ({pendingConnections.length})
          </button>
        </div>

        {/* Content */}
        <div className="horney-content">
          {activeTab === 'accepted' ? (
            <div className="connections-section">
              <h2 className="section-title">
                <span className="section-icon">💕</span>
                Accepted Playmates
              </h2>
              {acceptedConnections.length > 0 ? (
                <div className="connections-grid">
                  {acceptedConnections.map((connection) => {
                    const otherUser = connection.sender._id === user._id 
                      ? connection.receiver 
                      : connection.sender;
                    
                    return (
                      <div key={connection._id} className="connection-card">
                        <div className="card-header-section">
                          <div className="user-avatar">
                            {otherUser.accountType === 'couple' ? '💑' : '👤'}
                          </div>
                          <div className="user-info">
                            <h3 className="user-email">{otherUser.email}</h3>
                            <span className="user-badge">
                              {otherUser.accountType === 'couple' ? 'Couple' : 'Single'}
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="card-actions-simple">
                            <button
                              onClick={() => navigate('/messages', { state: { recipientEmail: otherUser.email, recipientId: otherUser._id } })}
                              className="message-btn-simple"
                            >
                              💬 Send Message
                            </button>
                            <button
                              onClick={() => navigate(`/profile/${otherUser._id}`)}
                              className="view-profile-btn-simple"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">😔</div>
                  <h3>No Accepted Playmates Yet</h3>
                  <p>Start discovering and connecting with playmates for intimate fun!</p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="discover-btn"
                  >
                    Discover Playmates
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="connections-section">
              <h2 className="section-title">
                <span className="section-icon">⏳</span>
                Pending Connection Requests
              </h2>
              {pendingConnections.length > 0 ? (
                <div className="connections-grid">
                  {pendingConnections.map((connection) => {
                    const sender = connection.sender;
                    
                    return (
                      <div key={connection._id} className="connection-card pending">
                        <div className="card-header-section">
                          <div className="user-avatar">
                            {sender.accountType === 'couple' ? '💑' : '👤'}
                          </div>
                          <div className="user-info">
                            <h3 className="user-email">{sender.email}</h3>
                            <span className="user-badge">
                              {sender.accountType === 'couple' ? 'Couple' : 'Single'}
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="connection-meta">
                            <span className="meta-item">
                              <span className="meta-icon">📅</span>
                              Received: {new Date(connection.createdAt).toLocaleDateString()}
                            </span>
                            <span className="meta-item pending-badge">
                              <span className="meta-icon">⏳</span>
                              Awaiting Response
                            </span>
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => navigate(`/profile/${sender._id}`)}
                              className="view-btn"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(connection._id)}
                              className="accept-btn"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(connection._id)}
                              className="decline-btn"
                            >
                              ✕ Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Pending Requests</h3>
                  <p>You don't have any pending connection requests at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Horney;
