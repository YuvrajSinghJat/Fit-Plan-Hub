import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import PlanDetails from './pages/PlanDetails'
import TrainerDashboard from './pages/TrainerDashboard'
import UserProfile from './pages/UserProfile'
import TrainerProfile from './pages/TrainerProfile'
import UserFeed from './pages/UserFeed'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/plan/:id" element={<PlanDetails />} />
              <Route path="/dashboard" element={<TrainerDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/trainer/:id" element={<TrainerProfile />} />
              <Route path="/feed" element={<UserFeed />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App