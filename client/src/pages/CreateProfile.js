import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import './CreateProfile.css';

function CreateProfile({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    age: '',
    city: '',
    state: '',
    country: '',
    interests: '',
    lookingFor: 'any',
    // Single fields
    name: '',
    gender: 'male',
    // Couple fields
    coupleName: '',
    partner1Name: '',
    partner1Age: '',
    partner1Gender: 'male',
    partner2Name: '',
    partner2Age: '',
    partner2Gender: 'female',
    relationshipStatus: 'dating'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await profileAPI.getMyProfile();
      const profile = response.data.profile;
      
      if (profile) {
        setIsEditing(true);
        setFormData({
          bio: profile.bio || '',
          age: profile.age || '',
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          country: profile.location?.country || '',
          interests: profile.interests?.join(', ') || '',
          lookingFor: profile.lookingFor || 'any',
          // Single fields
          name: profile.name || '',
          gender: profile.gender || 'male',
          // Couple fields
          coupleName: profile.coupleName || '',
          partner1Name: profile.partner1?.name || '',
          partner1Age: profile.partner1?.age || '',
          partner1Gender: profile.partner1?.gender || 'male',
          partner2Name: profile.partner2?.name || '',
          partner2Age: profile.partner2?.age || '',
          partner2Gender: profile.partner2?.gender || 'female',
          relationshipStatus: profile.relationshipStatus || 'dating'
        });
      }
    } catch (err) {
      // Profile doesn't exist yet, that's okay
      if (err.response?.status !== 404) {
        console.error('Error loading profile:', err);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profileData = {
        accountType: user.accountType,
        bio: formData.bio,
        age: parseInt(formData.age),
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        interests: formData.interests.split(',').map(i => i.trim()),
        lookingFor: formData.lookingFor,
        isComplete: true
      };

      if (user.accountType === 'single') {
        profileData.name = formData.name;
        profileData.gender = formData.gender;
      } else {
        profileData.coupleName = formData.coupleName;
        profileData.partner1 = {
          name: formData.partner1Name,
          age: parseInt(formData.partner1Age),
          gender: formData.partner1Gender
        };
        profileData.partner2 = {
          name: formData.partner2Name,
          age: parseInt(formData.partner2Age),
          gender: formData.partner2Gender
        };
        profileData.relationshipStatus = formData.relationshipStatus;
      }

      await profileAPI.createProfile(profileData);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="create-profile-page">
        <div className="container">
          <div className="profile-card">
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading profile data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-profile-page">
      <div className="container">
        <div className="profile-card">
          <h2 className="profile-title">
            {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
          </h2>
          <p className="profile-subtitle">
            {user.accountType === 'couple' 
              ? 'Tell us about your relationship' 
              : 'Tell us about yourself'}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            {user.accountType === 'single' ? (
              <>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="18"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="coupleName">Couple Name</label>
                  <input
                    type="text"
                    id="coupleName"
                    name="coupleName"
                    value={formData.coupleName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., John & Jane"
                  />
                </div>

                <h3 className="section-title">Partner 1</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="partner1Name">Name</label>
                    <input
                      type="text"
                      id="partner1Name"
                      name="partner1Name"
                      value={formData.partner1Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="partner1Age">Age</label>
                    <input
                      type="number"
                      id="partner1Age"
                      name="partner1Age"
                      value={formData.partner1Age}
                      onChange={handleChange}
                      required
                      min="18"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="partner1Gender">Gender</label>
                    <select
                      id="partner1Gender"
                      name="partner1Gender"
                      value={formData.partner1Gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <h3 className="section-title">Partner 2</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="partner2Name">Name</label>
                    <input
                      type="text"
                      id="partner2Name"
                      name="partner2Name"
                      value={formData.partner2Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="partner2Age">Age</label>
                    <input
                      type="number"
                      id="partner2Age"
                      name="partner2Age"
                      value={formData.partner2Age}
                      onChange={handleChange}
                      required
                      min="18"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="partner2Gender">Gender</label>
                    <select
                      id="partner2Gender"
                      name="partner2Gender"
                      value={formData.partner2Gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="relationshipStatus">Relationship Status</label>
                  <select
                    id="relationshipStatus"
                    name="relationshipStatus"
                    value={formData.relationshipStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="dating">Dating</option>
                    <option value="engaged">Engaged</option>
                    <option value="married">Married</option>
                    <option value="open_relationship">Open Relationship</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Tell others about yourself..."
                maxLength="500"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="interests">Interests (comma-separated)</label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g., Travel, Music, Sports"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lookingFor">Looking For</label>
              <select
                id="lookingFor"
                name="lookingFor"
                value={formData.lookingFor}
                onChange={handleChange}
                required
              >
                <option value="any">Anyone</option>
                <option value="couple">Couples</option>
                <option value="single_male">Single Males</option>
                <option value="single_female">Single Females</option>
              </select>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading 
                ? (isEditing ? 'Updating Profile...' : 'Creating Profile...') 
                : (isEditing ? 'Update Profile' : 'Create Profile')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;
