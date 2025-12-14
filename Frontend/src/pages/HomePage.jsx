import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './HomePage.css'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Transform Your Fitness Journey</h1>
            <p className="hero-subtitle">
              Connect with certified trainers, follow personalized plans, and achieve your fitness goals.
            </p>
            {!user ? (
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Login
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/landing" className="btn btn-primary btn-lg">
                  Browse Plans
                </Link>
                {user.role === 'user' && (
                  <Link to="/feed" className="btn btn-secondary btn-lg">
                    My Feed
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose FitPlanHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Expert Trainers</h3>
              <p>Access certified trainers with proven track records in fitness coaching.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Personalized Plans</h3>
              <p>Get custom fitness plans tailored to your goals and experience level.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Support</h3>
              <p>Join a community of fitness enthusiasts and share your journey.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Flexible Access</h3>
              <p>Access your plans anytime, anywhere with our mobile-friendly platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account as a user or certified trainer.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse Plans</h3>
              <p>Explore fitness plans created by expert trainers.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Subscribe</h3>
              <p>Choose a plan that fits your goals and subscribe to it.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Achieve Goals</h3>
              <p>Follow your plan and track your progress towards fitness success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Start Your Fitness Journey?</h2>
          <p>Join thousands of users who have transformed their lives with FitPlanHub.</p>
          <Link to={user ? "/landing" : "/signup"} className="btn btn-primary btn-lg">
            {user ? "Browse Plans" : "Start Free Trial"}
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage