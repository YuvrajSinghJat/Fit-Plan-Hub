import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanCard from '../components/Plans/PlanCard'
import './TrainerProfile.css'

const TrainerProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trainer, setTrainer] = useState(null)
  const [plans, setPlans] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Mock data - In real app, this would be an API call
    const mockTrainer = {
      id: id,
      name: 'John Fitness',
      bio: 'Certified personal trainer with 10+ years of experience specializing in weight loss and beginner fitness. Passionate about helping people achieve their fitness goals through sustainable methods.',
      rating: 4.8,
      totalSubscribers: 1250,
      totalPlans: 5,
      followers: 2400,
      specialties: ['Weight Loss', 'Beginner Training', 'Nutrition'],
      certification: 'ACE Certified Personal Trainer',
      experience: '10+ years'
    }

    const mockPlans = [
      {
        id: '1',
        title: 'Fat Loss Beginner Plan',
        description: 'A comprehensive 30-day plan designed for beginners looking to lose fat and build healthy habits.',
        price: 49.99,
        duration: 30,
        trainerId: id,
        trainerName: 'John Fitness',
        subscribers: 125,
        category: 'weight-loss'
      },
      {
        id: '2',
        title: 'Advanced Strength Training',
        description: '8-week advanced strength program for experienced lifters.',
        price: 79.99,
        duration: 56,
        trainerId: id,
        trainerName: 'John Fitness',
        subscribers: 89,
        category: 'muscle-building'
      }
    ]

    // Mock follow status
    const mockFollowing = ['trainer1'].includes(id)

    setTrainer(mockTrainer)
    setPlans(mockPlans)
    setIsFollowing(mockFollowing)
    setLoading(false)
  }, [id, user, navigate])

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
        <p>Loading trainer profile...</p>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Trainer not found</h2>
          <p>The requested trainer does not exist or has been removed.</p>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === trainer.id

  return (
    <div className="trainer-profile-page">
      <div className="container">
        <button onClick={handleBack} className="btn btn-secondary back-btn">
          ← Back to Plans
        </button>

        {/* Trainer Header */}
        <div className="trainer-header card">
          <div className="trainer-avatar">
            <div className="avatar-placeholder">👤</div>
          </div>
          
          <div className="trainer-info">
            <h1>{trainer.name}</h1>
            <p className="trainer-certification">{trainer.certification}</p>
            <p className="trainer-experience">{trainer.experience} experience</p>
            
            <div className="trainer-rating">
              <span className="rating-stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-value">{trainer.rating}/5</span>
              <span className="rating-count">({trainer.followers.toLocaleString()} followers)</span>
            </div>
            
            {!isOwnProfile && user?.role === 'user' && (
              <button 
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-lg`}
              >
                {isFollowing ? '✓ Following' : '+ Follow Trainer'}
              </button>
            )}
          </div>
        </div>

        {/* Trainer Bio */}
        <div className="trainer-bio card">
          <h2>About {trainer.name}</h2>
          <p>{trainer.bio}</p>
        </div>

        {/* Stats */}
        <div className="trainer-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{trainer.totalSubscribers.toLocaleString()}</h3>
              <p>Total Subscribers</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{trainer.totalPlans}</h3>
              <p>Published Plans</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{trainer.rating}</h3>
              <p>Average Rating</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{trainer.followers.toLocaleString()}</h3>
              <p>Followers</p>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="trainer-specialties card">
          <h2>Specialties</h2>
          <div className="specialties-list">
            {trainer.specialties.map((specialty, index) => (
              <span key={index} className="specialty-badge">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Trainer's Plans */}
        <div className="trainer-plans">
          <h2>Plans by {trainer.name}</h2>
          <p className="section-subtitle">Browse and subscribe to plans created by this trainer</p>
          
          {plans.length > 0 ? (
            <div className="plans-grid">
              {plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={() => {
                    if (window.confirm(`Subscribe to "${plan.title}" for $${plan.price}?`)) {
                      alert('Payment simulated successfully!')
                    }
                  }}
                  onFollow={handleFollow}
                  isFollowing={isFollowing}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>This trainer hasn't created any plans yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile