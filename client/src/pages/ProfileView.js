import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import './ProfileView.css';

function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfileById(id);
      setProfile(response.data.profile);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="container">
        <div className="error-box">
          <h2>Profile Not Found</h2>
          <p>{error || 'This profile does not exist or is not visible.'}</p>
          <button onClick={() => navigate('/discover')} className="btn-back">
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view-page">
      <div className="container">
        <button onClick={() => navigate('/discover')} className="btn-back-nav">
          ← Back to Discover
        </button>

        <div className="profile-view-content">
          <div className="profile-view-header">
            <div className="profile-view-badge">
              {profile.accountType === 'couple' ? '👫 Couple' : '💑 Single'}
            </div>
            
            <h1 className="profile-view-name">
              {profile.accountType === 'couple' ? profile.coupleName : profile.name}
            </h1>

            {profile.accountType === 'single' && (
              <p className="profile-view-meta">
                {profile.age} years • {profile.gender}
              </p>
            )}

            {profile.accountType === 'couple' && (
              <div className="couple-info">
                <div className="partner-info">
                  <h4>Partner 1</h4>
                  <p>{profile.partner1?.name}, {profile.partner1?.age}, {profile.partner1?.gender}</p>
                </div>
                <div className="partner-info">
                  <h4>Partner 2</h4>
                  <p>{profile.partner2?.name}, {profile.partner2?.age}, {profile.partner2?.gender}</p>
                </div>
                <p className="relationship-status">
                  <strong>Status:</strong> {profile.relationshipStatus?.replace('_', ' ')}
                </p>
              </div>
            )}

            <p className="profile-view-location">
              📍 {profile.location?.city}{profile.location?.state && `, ${profile.location.state}`}, {profile.location?.country}
            </p>
          </div>

          <div className="profile-view-section">
            <h3>About</h3>
            <p>{profile.bio}</p>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="profile-view-section">
              <h3>Interests</h3>
              <div className="interests-display">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="interest-item">{interest}</span>
                ))}
              </div>
            </div>
          )}

          <div className="profile-view-section">
            <h3>Looking For</h3>
            <p className="looking-for-text">
              {profile.lookingFor === 'any' ? 'Anyone' : profile.lookingFor?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
