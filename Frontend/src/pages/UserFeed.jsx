import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanCard from '../components/Plans/PlanCard'
import './Feed.css'

const UserFeed = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [feedPlans, setFeedPlans] = useState([])
  const [subscribedPlans, setSubscribedPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Mock data - In real app, these would be API calls
    const mockFollowedTrainers = [
      { id: 'trainer1', name: 'John Fitness' },
      { id: 'trainer3', name: 'Michael Zen' }
    ]

    const mockPlans = [
      {
        id: '1',
        title: 'Fat Loss Beginner Plan',
        description: 'A comprehensive 30-day plan designed for beginners looking to lose fat and build healthy habits.',
        price: 49.99,
        duration: 30,
        trainerId: 'trainer1',
        trainerName: 'John Fitness',
        subscribers: 125,
        category: 'weight-loss',
        isNew: true,
        createdAt: '2024-02-15'
      },
      {
        id: '3',
        title: 'Yoga & Flexibility',
        description: 'Daily yoga routines to improve flexibility, reduce stress, and enhance overall well-being.',
        price: 29.99,
        duration: 21,
        trainerId: 'trainer3',
        trainerName: 'Michael Zen',
        subscribers: 156,
        category: 'flexibility',
        isNew: false,
        createdAt: '2024-02-10'
      },
      {
        id: '5',
        title: 'Morning Mobility Routine',
        description: 'Quick 15-minute mobility exercises to start your day right.',
        price: 19.99,
        duration: 14,
        trainerId: 'trainer1',
        trainerName: 'John Fitness',
        subscribers: 45,
        category: 'flexibility',
        isNew: true,
        createdAt: '2024-02-18'
      }
    ]

    // Mock subscribed plans
    const mockSubscribedPlans = ['1', '3']

    // Filter plans from followed trainers
    const followedTrainerIds = mockFollowedTrainers.map(trainer => trainer.id)
    const filteredPlans = mockPlans.filter(plan => 
      followedTrainerIds.includes(plan.trainerId)
    )

    setFeedPlans(filteredPlans)
    setSubscribedPlans(mockSubscribedPlans)
    setLoading(false)
  }, [user, navigate])

  const handleSubscribe = (planId) => {
    if (window.confirm('Confirm subscription to this plan?')) {
      alert('Payment simulated successfully!')
      setSubscribedPlans([...subscribedPlans, planId])
    }
  }

  const handleFollow = (trainerId) => {
    alert(trainerId === 'trainer1' ? 'Already following John Fitness' : 'Already following Michael Zen')
  }

  const newPlans = feedPlans.filter(plan => plan.isNew)
  const olderPlans = feedPlans.filter(plan => !plan.isNew)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your feed...</p>
      </div>
    )
  }

  return (
    <div className="user-feed">
      <div className="container">
        <div className="feed-header">
          <h1>Your Personalized Feed</h1>
          <p>Plans from trainers you follow and your subscriptions</p>
        </div>

        {/* Stats */}
        <div className="feed-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>2</h3>
              <p>Trainers Following</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{subscribedPlans.length}</h3>
              <p>Active Subscriptions</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <h3>{newPlans.length}</h3>
              <p>New Plans</p>
            </div>
          </div>
        </div>

        {/* Recommended Section */}
        {newPlans.length > 0 && (
          <div className="feed-section">
            <div className="section-header">
              <h2>🔥 New from Trainers You Follow</h2>
              <p>Latest plans published by your trainers</p>
            </div>
            
            <div className="plans-grid">
              {newPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  onFollow={handleFollow}
                  isSubscribed={subscribedPlans.includes(plan.id)}
                  isFollowing={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Your Subscriptions */}
        <div className="feed-section">
          <div className="section-header">
            <h2>✅ Your Subscriptions</h2>
            <p>Plans you're currently subscribed to</p>
          </div>
          
          {subscribedPlans.length > 0 ? (
            <div className="plans-grid">
              {feedPlans
                .filter(plan => subscribedPlans.includes(plan.id))
                .map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSubscribe={handleSubscribe}
                    onFollow={handleFollow}
                    isSubscribed={true}
                    isFollowing={true}
                  />
                ))
              }
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't subscribed to any plans from trainers you follow.</p>
              <Link to="/landing" className="btn btn-primary">
                Browse All Plans
              </Link>
            </div>
          )}
        </div>

        {/* Other Plans from Followed Trainers */}
        {olderPlans.length > 0 && (
          <div className="feed-section">
            <div className="section-header">
              <h2>📚 More from Your Trainers</h2>
              <p>Other plans created by trainers you follow</p>
            </div>
            
            <div className="plans-grid">
              {olderPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  onFollow={handleFollow}
                  isSubscribed={subscribedPlans.includes(plan.id)}
                  isFollowing={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {feedPlans.length === 0 && (
          <div className="empty-state card">
            <div className="empty-state-icon">👥</div>
            <h2>Your feed is empty</h2>
            <p>Start following trainers to see their plans here.</p>
            <div className="empty-state-actions">
              <Link to="/landing" className="btn btn-primary">
                Discover Trainers
              </Link>
              <Link to="/profile" className="btn btn-secondary">
                View Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserFeed