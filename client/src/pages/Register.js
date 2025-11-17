import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Auth.css';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'single',
    // Single fields
    name: '',
    age: '',
    gender: 'male',
    // Couple fields
    partner1Name: '',
    partner1Age: '',
    partner1Gender: 'male',
    partner2Name: '',
    partner2Age: '',
    partner2Gender: 'female',
    relationshipType: 'dating',
    accountHandler: 'both' // wife, husband, or both
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    if (step === 2) {
      if (formData.accountType === 'single') {
        if (!formData.name || !formData.age) {
          setError('Please provide your name and age');
          return false;
        }
        if (formData.age < 18 || formData.age > 100) {
          setError('Age must be between 18 and 100');
          return false;
        }
      } else {
        if (!formData.partner1Name || !formData.partner1Age || 
            !formData.partner2Name || !formData.partner2Age) {
          setError('Please provide both partners details');
          return false;
        }
        if (formData.partner1Age < 18 || formData.partner1Age > 100 || 
            formData.partner2Age < 18 || formData.partner2Age > 100) {
          setError('Both partners must be between 18 and 100 years old');
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      setSuccess(response.data.message);
      onLogin(response.data.user, response.data.token);
      
      setTimeout(() => {
        navigate('/discover');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="step-header">
              <h3>Step 1: Account Setup</h3>
              <p>Choose your account type and create credentials</p>
            </div>

            <div className="form-group">
              <label htmlFor="accountType">I am a</label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="single">Single Person</option>
                <option value="couple">Couple</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat your password"
                className="form-input"
              />
            </div>
          </>
        );

      case 2:
        return formData.accountType === 'single' ? (
          <>
            <div className="step-header">
              <h3>Step 2: Personal Details</h3>
              <p>Tell us about yourself</p>
            </div>

            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

            <div className="form-row-compact">
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
                  placeholder="18+"
                  className="form-input"
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
                  className="form-select"
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
            <div className="step-header">
              <h3>Step 2: Partners Details</h3>
              <p>Tell us about both of you</p>
            </div>

            <div className="partner-section">
              <h4>👨 Husband</h4>
              <div className="form-row-compact">
                <div className="form-group">
                  <label htmlFor="partner1Name">Name</label>
                  <input
                    type="text"
                    id="partner1Name"
                    name="partner1Name"
                    value={formData.partner1Name}
                    onChange={handleChange}
                    required
                    placeholder="Husband's name"
                    className="form-input"
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
                    max="100"
                    placeholder="Age"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="partner-section">
              <h4>👩 Wife</h4>
              <div className="form-row-compact">
                <div className="form-group">
                  <label htmlFor="partner2Name">Name</label>
                  <input
                    type="text"
                    id="partner2Name"
                    name="partner2Name"
                    value={formData.partner2Name}
                    onChange={handleChange}
                    required
                    placeholder="Wife's name"
                    className="form-input"
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
                    max="100"
                    placeholder="Age"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="relationshipType">Relationship Type</label>
              <select
                id="relationshipType"
                name="relationshipType"
                value={formData.relationshipType}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="dating">Dating</option>
                <option value="engaged">Engaged</option>
                <option value="married">Married</option>
                <option value="open_relationship">Open Relationship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="accountHandler">Who will handle this account?</label>
              <select
                id="accountHandler"
                name="accountHandler"
                value={formData.accountHandler}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="both">Both of us</option>
                <option value="husband">Husband</option>
                <option value="wife">Wife</option>
              </select>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="step-header">
              <h3>Step 3: Confirm Details</h3>
              <p>Review your information before submitting</p>
            </div>

            <div className="review-section">
              <div className="review-item">
                <strong>Account Type:</strong>
                <span>{formData.accountType === 'single' ? 'Single' : 'Couple'}</span>
              </div>

              <div className="review-item">
                <strong>Email:</strong>
                <span>{formData.email}</span>
              </div>

              {formData.accountType === 'single' ? (
                <>
                  <div className="review-item">
                    <strong>Name:</strong>
                    <span>{formData.name}</span>
                  </div>
                  <div className="review-item">
                    <strong>Age & Gender:</strong>
                    <span>{formData.age} years, {formData.gender}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="review-item">
                    <strong>Husband:</strong>
                    <span>{formData.partner1Name}, {formData.partner1Age} years</span>
                  </div>
                  <div className="review-item">
                    <strong>Wife:</strong>
                    <span>{formData.partner2Name}, {formData.partner2Age} years</span>
                  </div>
                  <div className="review-item">
                    <strong>Relationship:</strong>
                    <span>{formData.relationshipType.replace('_', ' ')}</span>
                  </div>
                </>
              )}
            </div>

            <p className="terms-text">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card-steps">
          <h2 className="auth-title">Join CoupleDelight</h2>
          
          {/* Progress Indicator */}
          <div className="progress-steps">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
                <div className="step-number">{s}</div>
                <div className="step-label">
                  {s === 1 ? 'Account' : s === 2 ? 'Details' : 'Confirm'}
                </div>
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form-steps">
            {renderStep()}

            <div className="form-navigation">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                  disabled={loading}
                >
                  ← Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account ✓'}
                </button>
              )}
            </div>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
