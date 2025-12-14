import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="logo">FitPlanHub</Link>
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/landing" className="nav-link">Plans</Link>
              <Link to="/feed" className="nav-link">My Feed</Link>
              
              {user.role === 'trainer' ? (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              ) : (
                <Link to="/profile" className="nav-link">Profile</Link>
              )}
              
              <span className="user-greeting">Hi, {user.name.split(' ')[0]}!</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar