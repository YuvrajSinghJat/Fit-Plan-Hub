import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './PlanDetails.css'

const PlanDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Mock data - In real app, this would be an API call
    const mockPlan = {
      id: id,
      title: 'Fat Loss Beginner Plan',
      description: 'A comprehensive 30-day plan designed for beginners looking to lose fat and build healthy habits.',
      fullDescription: `This 30-day fat loss program is specifically designed for beginners who are new to fitness or returning after a break. The program focuses on:
      
      1. **Daily Workouts**: 5 days per week, 30-45 minutes each
      2. **Nutrition Guide**: Complete meal plans and recipes
      3. **Progress Tracking**: Weekly check-ins and measurements
      4. **Community Support**: Access to private group
      
      What you'll get:
      - Customized workout videos
      - Printable workout sheets
      - Grocery shopping lists
      - Recipe book with 50+ healthy recipes
      - 24/7 trainer support
      
      Requirements:
      - No equipment needed (bodyweight exercises)
      - Basic fitness level
      - Commitment to 30 days`,
      price: 49.99,
      duration: 30,
      trainerId: 'trainer1',
      trainerName: 'John Fitness',
      trainerBio: 'Certified personal trainer with 10+ years of experience specializing in weight loss and beginner fitness.',
      category: 'weight-loss',
      subscribers: 125,
      createdAt: '2024-01-15',
      difficulty: 'Beginner',
      weeklyWorkouts: 5,
      dailyTime: '30-45 mins'
    }

    // Mock subscription check
    const mockSubscribed = ['1', '3'].includes(id)
    const mockFollowing = ['trainer1'].includes(mockPlan.trainerId)

    setPlan(mockPlan)
    setIsSubscribed(mockSubscribed)
    setIsFollowing(mockFollowing)
    setLoading(false)
  }, [id, user, navigate])

  const handleSubscribe = () => {
    // Mock payment simulation
    if (window.confirm(`Confirm subscription to "${plan.title}" for $${plan.price}?`)) {
      alert('Payment simulated successfully! You now have access to this plan.')
      setIsSubscribed(true)
      // In real app, this would update backend
    }
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    alert(isFollowing ? 'Unfollowed trainer' : 'Now following trainer')
  }

  const handleBack = () => {
    navigate('/landing')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading plan details...</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Plan not found</h2>
          <p>The requested fitness plan does not exist or has been removed.</p>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="plan-details">
      <div className="container">
        <button onClick={handleBack} className="btn btn-secondary back-btn">
          ← Back to Plans
        </button>

        <div className="plan-header">
          <div className="plan-title-section">
            <h1>{plan.title}</h1>
            <div className="plan-meta">
              <span className="meta-badge difficulty">{plan.difficulty}</span>
              <span className="meta-badge duration">{plan.duration} days</span>
              <span className="meta-badge price">${plan.price}</span>
            </div>
          </div>
          
          {!isSubscribed && user?.role === 'user' && (
            <button onClick={handleSubscribe} className="btn btn-success btn-lg">
              Subscribe Now - ${plan.price}
            </button>
          )}
        </div>

        <div className="plan-content">
          <div className="plan-info">
            <div className="trainer-card">
              <div className="trainer-header">
                <h3>Trainer</h3>
                <button 
                  onClick={handleFollow}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <div className="trainer-info">
                <h4>{plan.trainerName}</h4>
                <p>{plan.trainerBio}</p>
                <div className="trainer-stats">
                  <span>🔥 {plan.subscribers} subscribers</span>
                  <span>⭐ 4.8 rating</span>
                </div>
              </div>
            </div>

            <div className="plan-highlights card">
              <h3>Plan Highlights</h3>
              <ul>
                <li>📅 Duration: {plan.duration} days</li>
                <li>💪 Workouts per week: {plan.weeklyWorkouts}</li>
                <li>⏱️ Daily time: {plan.dailyTime}</li>
                <li>🎯 Difficulty: {plan.difficulty}</li>
                <li>👥 Subscribers: {plan.subscribers}</li>
              </ul>
            </div>
          </div>

          <div className="plan-description-section">
            <div className="card">
              <h2>About This Plan</h2>
              <p className="short-description">{plan.description}</p>
              
              {isSubscribed || user?.role === 'trainer' ? (
                <div className="full-access">
                  <div className="full-description">
                    {plan.fullDescription.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  
                  <div className="access-granted">
                    <div className="access-badge">✅ ACCESS GRANTED</div>
                    <p>You have full access to this plan's content.</p>
                  </div>
                </div>
              ) : (
                <div className="preview-mode">
                  <div className="preview-notice">
                    <div className="lock-icon">🔒</div>
                    <h3>Full Content Locked</h3>
                    <p>Subscribe to unlock complete plan details including:</p>
                    <ul>
                      <li>Complete workout schedules</li>
                      <li>Detailed exercise videos</li>
                      <li>Nutrition plans and recipes</li>
                      <li>Progress tracking tools</li>
                    </ul>
                    <button onClick={handleSubscribe} className="btn btn-success btn-lg">
                      Subscribe to Unlock - ${plan.price}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanDetails