import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './PlanCard.css'

const PlanCard = ({ plan, onSubscribe, onFollow, isSubscribed = false, isFollowing = false }) => {
  const { user } = useAuth()
  const isTrainer = user?.role === 'trainer'

  return (
    <div className="plan-card">
      <div className="plan-header">
        <h3>{plan.title}</h3>
        {plan.trainerName && (
          <span className="trainer-badge">By {plan.trainerName}</span>
        )}
      </div>
      
      <div className="plan-preview">
        <p className="plan-description">
          {plan.description?.length > 100 
            ? `${plan.description.substring(0, 100)}...` 
            : plan.description}
        </p>
        
        <div className="plan-stats">
          <span className="stat">
            <strong>Duration:</strong> {plan.duration} days
          </span>
          <span className="stat">
            <strong>Price:</strong> ${plan.price}
          </span>
          {plan.subscribers && (
            <span className="stat">
              <strong>Subscribers:</strong> {plan.subscribers}
            </span>
          )}
        </div>
      </div>
      
      <div className="plan-actions">
        {!isTrainer && user && (
          <>
            <Link 
              to={`/plan/${plan.id}`} 
              className="btn btn-primary"
            >
              {isSubscribed ? 'View Plan' : 'View Details'}
            </Link>
            
            {!isSubscribed && (
              <button 
                onClick={() => onSubscribe(plan.id)}
                className="btn btn-success"
              >
                Subscribe (${plan.price})
              </button>
            )}
            
            {plan.trainerId && (
              <button 
                onClick={() => onFollow(plan.trainerId)}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isFollowing ? 'Following' : 'Follow Trainer'}
              </button>
            )}
          </>
        )}
        
        {isTrainer && user?.id === plan.trainerId && (
          <div className="trainer-actions">
            <Link 
              to={`/plan/${plan.id}`}
              className="btn btn-secondary"
            >
              Edit Plan
            </Link>
            <button className="btn btn-danger">Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlanCard