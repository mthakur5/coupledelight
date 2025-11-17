import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, uploadAPI } from '../utils/api';
import './Profile.css';

function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // File input refs
  const profilePicInputRef = useRef(null);
  const photosInputRef = useRef(null);
  
  // Edit states for each section
  const [editMode, setEditMode] = useState({
    bio: false,
    interests: false,
    lookingFor: false,
    location: false
  });
  
  // Form data for editing
  const [formData, setFormData] = useState({
    bio: '',
    interests: '',
    lookingFor: '',
    city: '',
    state: '',
    country: ''
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getMyProfile();
      setProfile(response.data.profile);
      // Initialize form data
      setFormData({
        bio: response.data.profile.bio || '',
        interests: response.data.profile.interests?.join(', ') || '',
        lookingFor: response.data.profile.lookingFor || 'any',
        city: response.data.profile.location?.city || '',
        state: response.data.profile.location?.state || '',
        country: response.data.profile.location?.country || ''
      });
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/create-profile');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditMode({ ...editMode, [section]: true });
    setError('');
    setSuccess('');
  };

  const handleCancel = (section) => {
    setEditMode({ ...editMode, [section]: false });
    // Reset form data to profile data
    if (section === 'bio') {
      setFormData({ ...formData, bio: profile.bio || '' });
    } else if (section === 'interests') {
      setFormData({ ...formData, interests: profile.interests?.join(', ') || '' });
    } else if (section === 'lookingFor') {
      setFormData({ ...formData, lookingFor: profile.lookingFor || 'any' });
    } else if (section === 'location') {
      setFormData({
        ...formData,
        city: profile.location?.city || '',
        state: profile.location?.state || '',
        country: profile.location?.country || ''
      });
    }
  };

  const handleSave = async (section) => {
    try {
      setError('');
      let updateData = {};

      if (section === 'bio') {
        updateData = { bio: formData.bio };
      } else if (section === 'interests') {
        const interestsArray = formData.interests
          .split(',')
          .map(i => i.trim())
          .filter(i => i);
        updateData = { interests: interestsArray };
      } else if (section === 'lookingFor') {
        updateData = { lookingFor: formData.lookingFor };
      } else if (section === 'location') {
        updateData = {
          location: {
            city: formData.city,
            state: formData.state,
            country: formData.country
          }
        };
      }

      await profileAPI.updateProfile(updateData);
      setSuccess(`${section} updated successfully!`);
      setEditMode({ ...editMode, [section]: false });
      
      // Refresh profile
      await fetchProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to update ${section}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await uploadAPI.uploadProfilePicture(file);
      setSuccess('Profile picture uploaded successfully!');
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Handle additional photos upload
  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each file must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
    }

    try {
      setUploading(true);
      setError('');
      await uploadAPI.uploadPhotos(files);
      setSuccess(`${files.length} photo(s) uploaded successfully!`);
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = async (index) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      setError('');
      await uploadAPI.deletePhoto(index);
      setSuccess('Photo deleted successfully!');
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  // Handle blur toggle
  const handleBlurToggle = async () => {
    try {
      setError('');
      const newBlurValue = !profile.profilePictureBlur;
      await profileAPI.updateProfile({ profilePictureBlur: newBlurValue });
      setSuccess(newBlurValue ? 'Blur enabled' : 'Blur disabled');
      await fetchProfile();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update blur setting');
    }
  };

  // Handle profile picture removal
  const handleRemoveProfilePic = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    try {
      setError('');
      await uploadAPI.removeProfilePicture();
      setSuccess('Profile picture removed successfully!');
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove profile picture');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="no-profile-card">
          <div className="no-profile-icon">📝</div>
          <h2>No Profile Found</h2>
          <p>Create your profile to start connecting with others!</p>
          <button onClick={() => navigate('/create-profile')} className="btn-create-large">
            Create Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-modern">
      <div className="container-wide">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Header Section */}
        <div className="profile-header-modern">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              {profile.profilePicture ? (
                <div className="profile-avatar-with-pic">
                  <div className="avatar-image-container">
                    <img
                      src={`http://localhost:5001${profile.profilePicture}`}
                      alt="Profile"
                      className={`profile-avatar-img ${profile.profilePictureBlur ? 'blurred' : ''}`}
                    />
                    <button 
                      onClick={handleRemoveProfilePic}
                      className="avatar-remove-btn"
                      title="Remove profile picture"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="avatar-controls">
                    <button 
                      onClick={() => profilePicInputRef.current.click()}
                      className="avatar-control-btn replace-btn"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Replace'}
                    </button>
                    <button 
                      onClick={handleBlurToggle}
                      className="avatar-control-btn blur-btn"
                    >
                      {profile.profilePictureBlur ? 'Unblur' : 'Blur'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-avatar-large" onClick={() => profilePicInputRef.current.click()}>
                  {uploading ? '⏳' : 
                    profile.accountType === 'couple' ? '💑' :
                    profile.gender === 'male' ? '👨' :
                    profile.gender === 'female' ? '👩' : '👤'
                  }
                  <div className="avatar-upload-text">{uploading ? 'Uploading...' : 'Upload'}</div>
                </div>
              )}
              <input
                type="file"
                ref={profilePicInputRef}
                onChange={handleProfilePicUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-header-info">
              <h1 className="profile-name-large">
                {profile.accountType === 'couple' ? profile.coupleName : profile.name}
              </h1>
              
              {profile.accountType === 'single' && (
                <div className="profile-quick-info">
                  <span className="info-pill">🎂 {profile.age} years</span>
                  <span className="info-pill">⚧ {profile.gender}</span>
                  <span className="info-pill">📍 {profile.location?.city}</span>
                  <span className="info-pill badge-pill">Single</span>
                </div>
              )}

              {profile.accountType === 'couple' && (
                <div className="profile-quick-info">
                  <span className="info-pill">💑 {profile.relationshipStatus?.replace('_', ' ')}</span>
                  <span className="info-pill">📍 {profile.location?.city}</span>
                  <span className="info-pill badge-pill">Couple</span>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/create-profile')} className="btn-edit-modern">
              <span className="edit-icon">✏️</span> Full Edit
            </button>
          </div>
        </div>

        <div className="profile-grid-modern">
          {/* Left Column - Photos */}
          <div className="profile-left-column">
            {/* Additional Photos Section */}
            <div className="profile-card-modern">
              <div className="card-header-modern">
                <h3>📸 Photos</h3>
              </div>
              <div className="card-content-modern">
                {/* Additional Photos */}
                <div className="upload-section">
                  <h4 className="upload-section-title">
                    Additional Photos ({profile.photos?.length || 0}/5)
                  </h4>
                  <div className="photos-grid">
                    {profile.photos && profile.photos.length > 0 ? (
                      profile.photos.map((photo, index) => (
                        <div key={index} className="photo-item">
                          <img 
                            src={`http://localhost:5001${photo}`} 
                            alt={`Photo ${index + 1}`}
                            className="photo-thumbnail"
                          />
                          <button 
                            onClick={() => handleDeletePhoto(index)}
                            className="delete-photo-btn"
                            title="Delete photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-photos-text">No additional photos uploaded</p>
                    )}
                  </div>
                  {(!profile.photos || profile.photos.length < 5) && (
                    <button 
                      onClick={() => photosInputRef.current.click()}
                      className="upload-photos-btn"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : '📷 Upload Photos'}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={photosInputRef}
                    onChange={handlePhotosUpload}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <small className="upload-help-text">
                    Max 5 photos, 5MB each. JPG, PNG, GIF accepted.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - All Info Combined */}
          <div className="profile-right-column">
            <div className="profile-card-modern">
              <div className="card-header-modern">
                <h3>📋 Profile Information</h3>
              </div>
              <div className="card-content-modern">
                
                {/* About Section */}
                <div className="info-section">
                  <div className="section-title-row">
                    <h4 className="section-subtitle">💭 About Me</h4>
                    {!editMode.bio ? (
                      <button onClick={() => handleEdit('bio')} className="inline-edit-btn">✏️</button>
                    ) : (
                      <div className="inline-edit-actions">
                        <button onClick={() => handleSave('bio')} className="inline-save-btn">✓</button>
                        <button onClick={() => handleCancel('bio')} className="inline-cancel-btn">✕</button>
                      </div>
                    )}
                  </div>
                  {!editMode.bio ? (
                    <p className="bio-text">{profile.bio || 'No bio added yet.'}</p>
                  ) : (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="edit-textarea"
                      placeholder="Tell others about yourself..."
                      rows="4"
                    />
                  )}
                </div>

                <div className="section-divider"></div>

                {/* Interests & Sexual Desires */}
                <div className="info-section">
                  <div className="section-title-row">
                    <h4 className="section-subtitle">🎯 Interests & Sexual Desires</h4>
                    {!editMode.interests ? (
                      <button onClick={() => handleEdit('interests')} className="inline-edit-btn">✏️</button>
                    ) : (
                      <div className="inline-edit-actions">
                        <button onClick={() => handleSave('interests')} className="inline-save-btn">✓</button>
                        <button onClick={() => handleCancel('interests')} className="inline-cancel-btn">✕</button>
                      </div>
                    )}
                  </div>
                  {!editMode.interests ? (
                    profile.interests && profile.interests.length > 0 ? (
                      <div className="interests-grid-modern">
                        {profile.interests.map((interest, index) => (
                          <span key={index} className="interest-tag-modern">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data-text">No interests added yet.</p>
                    )
                  ) : (
                    <div>
                      <label className="form-label">Select Sexual Desires & Interests (Multiple)</label>
                      <select
                        multiple
                        className="edit-select-multiple"
                        value={formData.interests.split(',').map(i => i.trim()).filter(i => i)}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, interests: selected.join(', ') });
                        }}
                        size="10"
                      >
                        <optgroup label="Sexual Desires & Preferences">
                          <option value="Threesome (MMF)">Threesome (MMF)</option>
                          <option value="Threesome (MFF)">Threesome (MFF)</option>
                          <option value="Foursome">Foursome</option>
                          <option value="Group Sex">Group Sex</option>
                          <option value="Swinging">Swinging</option>
                          <option value="Soft Swap">Soft Swap</option>
                          <option value="Full Swap">Full Swap</option>
                          <option value="Cuckolding">Cuckolding</option>
                          <option value="Hotwife">Hotwife</option>
                          <option value="Stag & Vixen">Stag & Vixen</option>
                          <option value="BDSM">BDSM</option>
                          <option value="Role Play">Role Play</option>
                          <option value="Voyeurism">Voyeurism</option>
                          <option value="Exhibitionism">Exhibitionism</option>
                          <option value="Sensual Touch">Sensual Touch</option>
                          <option value="Massage">Massage</option>
                          <option value="Romantic">Romantic</option>
                          <option value="Adventurous">Adventurous</option>
                          <option value="Experimental">Experimental</option>
                          <option value="Kinky">Kinky</option>
                          <option value="Vanilla">Vanilla</option>
                        </optgroup>
                        <optgroup label="General Interests">
                          <option value="Travel">Travel</option>
                          <option value="Music">Music</option>
                          <option value="Movies">Movies</option>
                          <option value="Dining Out">Dining Out</option>
                          <option value="Fitness">Fitness</option>
                          <option value="Sports">Sports</option>
                          <option value="Reading">Reading</option>
                          <option value="Dancing">Dancing</option>
                          <option value="Photography">Photography</option>
                          <option value="Cooking">Cooking</option>
                        </optgroup>
                      </select>
                      <small className="help-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple options</small>
                    </div>
                  )}
                </div>

                <div className="section-divider"></div>

                {/* Looking For */}
                <div className="info-section">
                  <div className="section-title-row">
                    <h4 className="section-subtitle">🔍 Looking For</h4>
                    {!editMode.lookingFor ? (
                      <button onClick={() => handleEdit('lookingFor')} className="inline-edit-btn">✏️</button>
                    ) : (
                      <div className="inline-edit-actions">
                        <button onClick={() => handleSave('lookingFor')} className="inline-save-btn">✓</button>
                        <button onClick={() => handleCancel('lookingFor')} className="inline-cancel-btn">✕</button>
                      </div>
                    )}
                  </div>
                  {!editMode.lookingFor ? (
                    <p className="looking-for-text">
                      {profile.lookingFor === 'any' ? 'Open to anyone' : 
                       profile.lookingFor === 'couple' ? 'Couples' :
                       profile.lookingFor === 'single_male' ? 'Single Men' :
                       profile.lookingFor === 'single_female' ? 'Single Women' :
                       'Anyone'}
                    </p>
                  ) : (
                    <select
                      name="lookingFor"
                      value={formData.lookingFor}
                      onChange={handleChange}
                      className="edit-select"
                    >
                      <option value="any">Open to anyone</option>
                      <option value="couple">Couples</option>
                      <option value="single_male">Single Men</option>
                      <option value="single_female">Single Women</option>
                    </select>
                  )}
                </div>

                <div className="section-divider"></div>

                {/* Location */}
                <div className="info-section">
                  <div className="section-title-row">
                    <h4 className="section-subtitle">📍 Location</h4>
                    {!editMode.location ? (
                      <button onClick={() => handleEdit('location')} className="inline-edit-btn">✏️</button>
                    ) : (
                      <div className="inline-edit-actions">
                        <button onClick={() => handleSave('location')} className="inline-save-btn">✓</button>
                        <button onClick={() => handleCancel('location')} className="inline-cancel-btn">✕</button>
                      </div>
                    )}
                  </div>
                  {!editMode.location ? (
                    <div className="location-details">
                      <p className="location-main">
                        <span className="location-icon">🏙️</span>
                        <strong>{profile.location?.city || 'Not specified'}</strong>
                      </p>
                      {profile.location?.state && (
                        <p className="location-sub">
                          <span className="location-icon">🗺️</span>
                          {profile.location.state}
                        </p>
                      )}
                      <p className="location-sub">
                        <span className="location-icon">🌍</span>
                        {profile.location?.country || 'Not specified'}
                      </p>
                    </div>
                  ) : (
                    <div className="edit-form">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="State (optional)"
                      />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Country"
                      />
                    </div>
                  )}
                </div>

                <div className="section-divider"></div>

                {/* Profile Stats */}
                <div className="info-section">
                  <h4 className="section-subtitle">📊 Profile Stats</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon">
                        {profile.isComplete ? '✅' : '⚠️'}
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Status</p>
                        <p className="stat-value">
                          {profile.isComplete ? 'Complete' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        {profile.isVisible ? '👁️' : '🔒'}
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Visibility</p>
                        <p className="stat-value">
                          {profile.isVisible ? 'Public' : 'Private'}
                        </p>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <p className="stat-label">Member Since</p>
                        <p className="stat-value">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-divider"></div>

                {/* Quick Actions */}
                <div className="info-section">
                  <h4 className="section-subtitle">⚡ Quick Actions</h4>
                  <div className="actions-list">
                    <button 
                      onClick={() => navigate('/discover')} 
                      className="action-button discover"
                    >
                      <span className="action-icon">🔍</span>
                      <span>Discover Profiles</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/create-profile')} 
                      className="action-button edit"
                    >
                      <span className="action-icon">✏️</span>
                      <span>Full Edit</span>
                    </button>
                    
                    <button 
                      onClick={() => window.location.reload()} 
                      className="action-button refresh"
                    >
                      <span className="action-icon">🔄</span>
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
