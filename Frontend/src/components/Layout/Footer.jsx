import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FitPlanHub</h3>
            <p>Connecting fitness enthusiasts with certified trainers worldwide.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/landing">Browse Plans</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/signup">Sign Up</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@fitplanhub.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FitPlanHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer