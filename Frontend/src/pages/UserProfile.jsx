import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// import './Profile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    bio: 'Fitness enthusiast focused on strength training and nutrition.',
    weight: '75',
    height: '180',
    fitnessLevel: 'intermediate',
    goals: ['Weight Loss', 'Muscle Building']
  });

  const [subscribedPlans, setSubscribedPlans] = useState([
    { id: 1, title: 'Fat Loss Plan', trainer: 'John Fitness', startDate: '2024-01-15', progress: 65 },
    { id: 2, title: 'Yoga Beginner', trainer: 'Mike Zen', startDate: '2024-01-20', progress: 30 }
  ]);

  const [followedTrainers, setFollowedTrainers] = useState([
    { id: 1, name: 'John Fitness', specialty: 'Weight Loss' },
    { id: 2, name: 'Sarah Strong', specialty: 'Strength Training' }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Personal Info */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
          </div>
          
          <div className="profile-card">
            <div className="profile-avatar">
              {profile.name.charAt(0)}
            </div>
            
            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        value={profile.weight}
                        onChange={(e) => setProfile({...profile, weight: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        value={profile.height}
                        onChange={(e) => setProfile({...profile, height: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Fitness Level</label>
                    <select
                      value={profile.fitnessLevel}
                      onChange={(e) => setProfile({...profile, fitnessLevel: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="view-details">
                  <h3>{profile.name}</h3>
                  <p className="profile-email">{profile.email}</p>
                  <p className="profile-bio">{profile.bio}</p>
                  
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Weight</span>
                      <span className="stat-value">{profile.weight} kg</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Height</span>
                      <span className="stat-value">{profile.height} cm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Fitness Level</span>
                      <span className="stat-value">{profile.fitnessLevel}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <button 
                  className="btn btn-primary save-btn"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subscribed Plans */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Subscriptions</h2>
          </div>
          
          <div className="plans-grid">
            {subscribedPlans.map(plan => (
              <div key={plan.id} className="subscription-card">
                <div className="plan-header">
                  <h4>{plan.title}</h4>
                  <span className="trainer-name">by {plan.trainer}</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="plan-meta">
                  <span>Started: {plan.startDate}</span>
                  <button className="btn btn-outline btn-small">
                    Continue Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Followed Trainers */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Followed Trainers</h2>
          </div>
          
          <div className="trainers-grid">
            {followedTrainers.map(trainer => (
              <div key={trainer.id} className="trainer-card">
                <div className="trainer-avatar-small">
                  {trainer.name.charAt(0)}
                </div>
                <div className="trainer-info">
                  <h4>{trainer.name}</h4>
                  <p className="specialty">{trainer.specialty}</p>
                </div>
                <button className="btn btn-outline btn-small">
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;