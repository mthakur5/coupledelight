import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { discoverAPI } from '../utils/api';
import './Discover.css';

function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    location: ''
  });

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await discoverAPI.getProfiles(filters);
      setProfiles(response.data.profiles);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
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
                <div className="profile-card-discover">
                  <div className="profile-badge">
                    {profile.accountType === 'couple' ? '👫 Couple' : '💑 Single'}
                  </div>
                  <h3 className="profile-name">
                    {profile.accountType === 'couple'
                      ? profile.coupleName
                      : profile.name}
                  </h3>
                  {profile.accountType === 'single' && (
                    <p className="profile-age-gender">
                      {profile.age} • {profile.gender}
                    </p>
                  )}
                  {profile.accountType === 'couple' && (
                    <p className="profile-age-gender">
                      {profile.partner1?.name} & {profile.partner2?.name}
                    </p>
                  )}
                  <p className="profile-location">
                    📍 {profile.location?.city}, {profile.location?.country}
                  </p>
                  <p className="profile-bio">
                    {profile.bio?.substring(0, 100)}
                    {profile.bio?.length > 100 ? '...' : ''}
                  </p>
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="profile-interests">
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="interest-tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
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
