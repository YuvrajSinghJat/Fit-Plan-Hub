import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanCard from '../components/Plans/PlanCard'
import './LandingPage.css'

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [subscribedPlans, setSubscribedPlans] = useState([])
  const [followedTrainers, setFollowedTrainers] = useState([])

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login')
      return
    }

    // Mock data - In real app, this would be an API call
    const mockPlans = [
      {
        id: '1',
        title: 'Fat Loss Beginner Plan',
        description: 'A comprehensive 30-day plan designed for beginners looking to lose fat and build healthy habits. Includes daily workouts, meal plans, and progress tracking.',
        price: 49.99,
        duration: 30,
        trainerId: 'trainer1',
        trainerName: 'John Fitness',
        subscribers: 125,
        category: 'weight-loss'
      },
      {
        id: '2',
        title: 'Muscle Building Advanced',
        description: '12-week intensive muscle building program for advanced athletes. Focus on progressive overload and proper nutrition.',
        price: 89.99,
        duration: 84,
        trainerId: 'trainer2',
        trainerName: 'Sarah Strong',
        subscribers: 89,
        category: 'muscle-building'
      },
      {
        id: '3',
        title: 'Yoga & Flexibility',
        description: 'Daily yoga routines to improve flexibility, reduce stress, and enhance overall well-being. Suitable for all levels.',
        price: 29.99,
        duration: 21,
        trainerId: 'trainer3',
        trainerName: 'Michael Zen',
        subscribers: 156,
        category: 'flexibility'
      },
      {
        id: '4',
        title: 'Cardio Endurance',
        description: 'Build cardiovascular endurance with this 6-week running and cycling program. Perfect for marathon training.',
        price: 39.99,
        duration: 42,
        trainerId: 'trainer4',
        trainerName: 'Alex Runner',
        subscribers: 78,
        category: 'cardio'
      }
    ]

    // Mock subscribed plans (in real app, this would come from user data)
    const mockSubscribedPlans = ['1', '3']
    const mockFollowedTrainers = ['trainer1', 'trainer3']

    setPlans(mockPlans)
    setSubscribedPlans(mockSubscribedPlans)
    setFollowedTrainers(mockFollowedTrainers)
    setLoading(false)
  }, [user, navigate])

  const handleSubscribe = (planId) => {
    // Mock subscription - In real app, this would be an API call
    alert(`Simulating payment for plan ${planId}. Payment successful!`)
    setSubscribedPlans([...subscribedPlans, planId])
    
    // Update plan subscribers count
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, subscribers: plan.subscribers + 1 }
        : plan
    ))
  }

  const handleFollowTrainer = (trainerId) => {
    if (followedTrainers.includes(trainerId)) {
      setFollowedTrainers(followedTrainers.filter(id => id !== trainerId))
      alert('Unfollowed trainer')
    } else {
      setFollowedTrainers([...followedTrainers, trainerId])
      alert('Now following trainer')
    }
  }

  const categories = [
    { id: 'all', name: 'All Plans' },
    { id: 'weight-loss', name: 'Weight Loss' },
    { id: 'muscle-building', name: 'Muscle Building' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'cardio', name: 'Cardio' }
  ]

  const filteredPlans = selectedCategory === 'all' 
    ? plans 
    : plans.filter(plan => plan.category === selectedCategory)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading plans...</p>
      </div>
    )
  }

  return (
    <div className="landing-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Fitness Plans</h1>
          <p>Choose from a variety of expert-curated fitness plans</p>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{plans.length}</h3>
            <p>Available Plans</p>
          </div>
          <div className="stat-card">
            <h3>{subscribedPlans.length}</h3>
            <p>Your Subscriptions</p>
          </div>
          <div className="stat-card">
            <h3>{followedTrainers.length}</h3>
            <p>Trainers Following</p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {filteredPlans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              onFollow={handleFollowTrainer}
              isSubscribed={subscribedPlans.includes(plan.id)}
              isFollowing={followedTrainers.includes(plan.trainerId)}
            />
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="no-results">
            <h3>No plans found in this category</h3>
            <p>Try selecting a different category or check back later for new plans.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage