import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanCard from '../components/Plans/PlanCard'
import './Dashboard.css'

const TrainerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'weight-loss'
  })

  useEffect(() => {
    // Check if user is logged in and is a trainer
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'trainer') {
      navigate('/landing')
      return
    }

    // Mock data - In real app, these would be API calls
    const mockPlans = [
      {
        id: '1',
        title: 'Fat Loss Beginner Plan',
        description: '30-day beginner fat loss program',
        price: 49.99,
        duration: 30,
        trainerId: user.id,
        trainerName: user.name,
        subscribers: 125,
        revenue: 6248.75,
        category: 'weight-loss'
      },
      {
        id: '2',
        title: 'Advanced Strength Training',
        description: '8-week advanced strength program',
        price: 79.99,
        duration: 56,
        trainerId: user.id,
        trainerName: user.name,
        subscribers: 47,
        revenue: 3759.53,
        category: 'muscle-building'
      }
    ]

    const mockSubscribers = [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', planId: '1', joined: '2024-01-15' },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', planId: '1', joined: '2024-01-20' },
      { id: '3', name: 'Carol Davis', email: 'carol@example.com', planId: '2', joined: '2024-02-01' }
    ]

    setPlans(mockPlans)
    setSubscribers(mockSubscribers)
    setLoading(false)
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPlan({
      ...newPlan,
      [name]: value
    })
  }

  const handleCreatePlan = (e) => {
    e.preventDefault()
    
    const planId = Math.random().toString(36).substr(2, 9)
    const createdPlan = {
      id: planId,
      ...newPlan,
      price: parseFloat(newPlan.price),
      duration: parseInt(newPlan.duration),
      trainerId: user.id,
      trainerName: user.name,
      subscribers: 0,
      revenue: 0
    }

    setPlans([createdPlan, ...plans])
    setNewPlan({
      title: '',
      description: '',
      price: '',
      duration: '',
      category: 'weight-loss'
    })
    setShowPlanForm(false)
    
    alert('Plan created successfully!')
  }

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      setPlans(plans.filter(plan => plan.id !== planId))
      alert('Plan deleted successfully')
    }
  }

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0)
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="trainer-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Trainer Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your fitness plans and track your progress.</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{totalSubscribers}</h3>
              <p>Total Subscribers</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{plans.length}</h3>
              <p>Active Plans</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>4.8</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        {/* Create Plan Button */}
        <div className="create-plan-section">
          <button 
            onClick={() => setShowPlanForm(!showPlanForm)}
            className="btn btn-primary btn-lg"
          >
            {showPlanForm ? 'Cancel' : '➕ Create New Plan'}
          </button>
        </div>

        {/* Create Plan Form */}
        {showPlanForm && (
          <div className="plan-form card">
            <h2>Create New Fitness Plan</h2>
            <form onSubmit={handleCreatePlan}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Plan Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newPlan.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 'Fat Loss Beginner Plan'"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={newPlan.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-building">Muscle Building</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="cardio">Cardio</option>
                    <option value="general">General Fitness</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newPlan.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="49.99"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration">Duration (days)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={newPlan.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Plan Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newPlan.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your fitness plan in detail..."
                  rows="4"
                />
              </div>
              
              <button type="submit" className="btn btn-success btn-block">
                Create Plan
              </button>
            </form>
          </div>
        )}

        {/* Plans List */}
        <div className="dashboard-section">
          <h2>Your Plans ({plans.length})</h2>
          <div className="plans-list">
            {plans.map(plan => (
              <div key={plan.id} className="plan-item card">
                <div className="plan-item-header">
                  <h3>{plan.title}</h3>
                  <div className="plan-item-actions">
                    <button className="btn btn-secondary">Edit</button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="plan-item-description">{plan.description}</p>
                
                <div className="plan-item-stats">
                  <span>💰 Revenue: ${plan.revenue.toFixed(2)}</span>
                  <span>👥 Subscribers: {plan.subscribers}</span>
                  <span>📅 Duration: {plan.duration} days</span>
                  <span>💵 Price: ${plan.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribers List */}
        <div className="dashboard-section">
          <h2>Recent Subscribers ({subscribers.length})</h2>
          <div className="subscribers-table card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(subscriber => {
                  const plan = plans.find(p => p.id === subscriber.planId)
                  return (
                    <tr key={subscriber.id}>
                      <td>{subscriber.name}</td>
                      <td>{subscriber.email}</td>
                      <td>{plan?.title || 'Unknown Plan'}</td>
                      <td>{subscriber.joined}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerDashboard