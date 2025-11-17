import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home({ user }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Connect with Couples & Singles</h1>
            <p className="hero-subtitle">
              CoupleDelight is the premier dating platform for couples seeking singles 
              and singles seeking couples. Find your perfect match today!
            </p>
            {!user && (
              <div className="hero-buttons">
                <Link to="/register" className="btn-hero-primary">Get Started</Link>
                <Link to="/login" className="btn-hero-secondary">Sign In</Link>
              </div>
            )}
            {user && (
              <div className="hero-buttons">
                <Link to="/discover" className="btn-hero-primary">Start Browsing</Link>
                <Link to="/profile" className="btn-hero-secondary">My Profile</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose CoupleDelight?</h2>
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">👫</div>
              <h3>Couple Profiles</h3>
              <p>Create a joint profile with your partner and explore together</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">💑</div>
              <h3>Single Profiles</h3>
              <p>Connect with couples or other singles based on your preferences</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Matching</h3>
              <p>Advanced filters to find exactly what you're looking for</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Safe & Secure</h3>
              <p>Your privacy and security are our top priorities</p>
            </article>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <article className="step-card">
              <div className="step-number">1</div>
              <div className="step-image">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" alt="Create your profile on CoupleDelight" loading="lazy" />
              </div>
              <h3>Create Your Profile</h3>
              <p>Sign up in minutes and create an authentic profile that represents you or your relationship</p>
            </article>
            <article className="step-card">
              <div className="step-number">2</div>
              <div className="step-image">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop" alt="Browse and discover matches" loading="lazy" />
              </div>
              <h3>Browse & Discover</h3>
              <p>Use our smart filters to discover profiles that match your preferences and interests</p>
            </article>
            <article className="step-card">
              <div className="step-number">3</div>
              <div className="step-image">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop" alt="Connect and chat with matches" loading="lazy" />
              </div>
              <h3>Connect & Chat</h3>
              <p>Start meaningful conversations with your matches in a safe and secure environment</p>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Members Say</h2>
          <div className="testimonials-grid">
            <article className="testimonial-card">
              <div className="testimonial-icon">💑</div>
              <p className="testimonial-text">
                "CoupleDelight made it so easy for us to find like-minded people. The platform is intuitive and the community is amazing!"
              </p>
              <p className="testimonial-author">- Priya & Rajesh</p>
            </article>
            <article className="testimonial-card">
              <div className="testimonial-icon">👫</div>
              <p className="testimonial-text">
                "Finally, a dating platform that understands what couples are looking for. Highly recommend!"
              </p>
              <p className="testimonial-author">- Neha & Amit</p>
            </article>
            <article className="testimonial-card">
              <div className="testimonial-icon">💕</div>
              <p className="testimonial-text">
                "I love how safe and secure this platform is. Great features and even better connections!"
              </p>
              <p className="testimonial-author">- Kavya & Rohan</p>
            </article>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">Trusted by Thousands</h2>
          <div className="trust-stats">
            <div className="trust-stat">
              <span className="trust-number">10,000+</span>
              <span className="trust-label">Active Members</span>
            </div>
            <div className="trust-stat">
              <span className="trust-number">5,000+</span>
              <span className="trust-label">Successful Matches</span>
            </div>
            <div className="trust-stat">
              <span className="trust-number">50+</span>
              <span className="trust-label">Countries</span>
            </div>
            <div className="trust-stat">
              <span className="trust-number">24/7</span>
              <span className="trust-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Match?</h2>
            <p>Join thousands of couples and singles who have found meaningful connections on CoupleDelight</p>
            {!user && (
              <Link to="/register" className="btn-cta">Create Free Account</Link>
            )}
            {user && (
              <Link to="/discover" className="btn-cta">Start Exploring Now</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
