import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { discoverAPI, connectionsAPI } from '../utils/api';
import './Discover.css';

function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await discoverAPI.getProfiles(filters);
      console.log('Discover API Response:', response.data);
      const fetchedProfiles = response.data.profiles || [];
      setProfiles(fetchedProfiles);
      
      // Fetch connection status for each profile
      if (fetchedProfiles.length > 0) {
        fetchConnectionStatuses(fetchedProfiles);
      }
    } catch (err) {
      console.error('Discover API Error:', err);
      setError(err.response?.data?.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatuses = async (profiles) => {
    const statuses = {};
    for (const profile of profiles) {
      if (profile.userId && profile.userId._id) {
        try {
          const response = await connectionsAPI.getStatus(profile.userId._id);
          statuses[profile.userId._id] = response.data;
        } catch (err) {
          console.error(`Error fetching status for ${profile.userId._id}:`, err);
          statuses[profile.userId._id] = { status: 'none' };
        }
      }
    }
    setConnectionStatuses(statuses);
  };

  const handleConnect = async (e, userId) => {
    e.preventDefault();
    try {
      await connectionsAPI.sendRequest(userId);
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: { status: 'pending', isSender: true }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send connection request');
    }
  };

  const handleAccept = async (e, connectionId, userId) => {
    e.preventDefault();
    try {
      await connectionsAPI.acceptRequest(connectionId);
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: { status: 'accepted' }
      }));
      alert('Connection accepted! You can now message this user.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept connection');
    }
  };

  const handleMessage = (e, userId) => {
    e.preventDefault();
    navigate('/messages', { state: { selectedUserId: userId } });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    fetchProfiles();
  };

  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      location: ''
    });
  };

  return (
    <div className="discover-page">
      <div className="container">
        <h1 className="page-title">Discover Profiles</h1>

        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Min Age</label>
              <input
                type="number"
                name="minAge"
                value={filters.minAge}
                onChange={handleFilterChange}
                placeholder="18"
                min="18"
                max="100"
              />
            </div>

            <div className="filter-group">
              <label>Max Age</label>
              <input
                type="number"
                name="maxAge"
                value={filters.maxAge}
                onChange={handleFilterChange}
                placeholder="100"
                min="18"
                max="100"
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City"
              />
            </div>
          </div>

          <div className="filter-buttons">
            <button onClick={applyFilters} className="btn-apply">Apply Filters</button>
            <button onClick={clearFilters} className="btn-clear">Clear</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-message">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="no-profiles">
            <p>No profiles found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map((profile) => (
              <Link
                to={`/profile/${profile._id}`}
                key={profile._id}
                className="profile-card-link"
              >
                <div className={`profile-card-discover ${profile.accountType === 'couple' ? 'card-couple' : profile.gender === 'male' ? 'card-male' : 'card-female'}`}>
                  <div className="card-header">
                    <div className="profile-badge">
                      {profile.accountType === 'couple' ? '👫 Couple' : profile.gender === 'male' ? '👨 Boy' : '👩 Girl'}
                    </div>
                    {profile.profilePicture && (
                      <div className="profile-image" style={{backgroundImage: `url(${profile.profilePicture})`}}>
                        {profile.profilePictureBlur && <div className="image-blur"></div>}
                      </div>
                    )}
                    {!profile.profilePicture && (
                      <div className="profile-image-placeholder">
                        {profile.accountType === 'couple' ? '👫' : profile.gender === 'male' ? '👨' : '👩'}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <h3 className="profile-name">
                      {profile.accountType === 'couple'
                        ? profile.coupleName
                        : profile.name}
                    </h3>
                    
                    {profile.accountType === 'single' && (
                      <p className="profile-age-gender">
                        {profile.age} years • {profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Other'}
                      </p>
                    )}
                    
                    {profile.accountType === 'couple' && (
                      <div className="couple-info">
                        <p className="partner-names">
                          {profile.partner1?.name} & {profile.partner2?.name}
                        </p>
                        <p className="partner-ages">
                          {profile.partner1?.age} & {profile.partner2?.age} years
                        </p>
                      </div>
                    )}
                    
                    <div className="info-row">
                      <span className="info-icon">📍</span>
                      <span>{profile.location?.city}, {profile.location?.country}</span>
                    </div>
                    
                    {profile.userId && (
                      <>
                        <div className="info-row">
                          <span className="info-icon">✉️</span>
                          <span>{profile.userId.email}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-icon">📅</span>
                          <span>Joined {new Date(profile.userId.createdAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                    
                    {profile.bio && (
                      <p className="profile-bio">
                        {profile.bio?.substring(0, 100)}
                        {profile.bio?.length > 100 ? '...' : ''}
                      </p>
                    )}
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="profile-interests">
                        {profile.interests.slice(0, 3).map((interest, index) => (
                          <span key={index} className="interest-tag">
                            {interest}
                          </span>
                        ))}
                        {profile.interests.length > 3 && (
                          <span className="interest-tag more">+{profile.interests.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {profile.userId && (
                      <div className="connection-actions">
                        {connectionStatuses[profile.userId._id]?.status === 'none' && (
                          <button 
                            className="btn-connect"
                            onClick={(e) => handleConnect(e, profile.userId._id)}
                          >
                            Connect
                          </button>
                        )}
                        
                        {connectionStatuses[profile.userId._id]?.status === 'pending' && 
                         connectionStatuses[profile.userId._id]?.isSender && (
                          <button className="btn-pending" disabled>
                            Request Sent
                          </button>
                        )}
                        
                        {connectionStatuses[profile.userId._id]?.status === 'pending' && 
                         !connectionStatuses[profile.userId._id]?.isSender && (
                          <button 
                            className="btn-accept"
                            onClick={(e) => handleAccept(e, connectionStatuses[profile.userId._id].connection._id, profile.userId._id)}
                          >
                            Accept Request
                          </button>
                        )}
                        
                        {connectionStatuses[profile.userId._id]?.status === 'accepted' && (
                          <button 
                            className="btn-message"
                            onClick={(e) => handleMessage(e, profile.userId._id)}
                          >
                            💬 Message
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Discover;
