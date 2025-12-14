import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// API base URL - should match your backend
const API_BASE_URL = 'http://localhost:5000/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Initialize - check for stored user
  useEffect(() => {
    const storedUser = localStorage.getItem('fitplanhub_user')
    const storedToken = localStorage.getItem('fitplanhub_token')
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setAuthToken(storedToken)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('fitplanhub_user')
        localStorage.removeItem('fitplanhub_token')
      }
    }
    
    setLoading(false)
  }, [])

  // Set auth token for API calls
  const setAuthToken = (token) => {
    localStorage.setItem('fitplanhub_token', token)
  }

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('fitplanhub_token')
  }

  // API call helper
  const apiCall = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (requiresAuth) {
        const token = getAuthToken()
        if (!token) {
          throw new Error('No authentication token found')
        }
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const config = {
        method,
        headers,
      }
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data)
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || `API request failed with status ${response.status}`)
      }
      
      return { success: true, data: result }
    } catch (error) {
      console.error('API call error:', error)
      return { 
        success: false, 
        message: error.message || 'Network error occurred' 
      }
    }
  }

  // Authentication functions
  const login = async (email, password, role) => {
    try {
      setError(null)
      const result = await apiCall('/auth/login', 'POST', { email, password, role })
      
      if (result.success) {
        const { token, user } = result.data
        
        // Store user and token
        setUser(user)
        setAuthToken(token)
        localStorage.setItem('fitplanhub_user', JSON.stringify(user))
        
        return { success: true, user }
      } else {
        setError(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message)
      return { success: false, message: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      setError(null)
      const result = await apiCall('/auth/register', 'POST', userData)
      
      if (result.success) {
        const { token, user } = result.data
        
        // Store user and token
        setUser(user)
        setAuthToken(token)
        localStorage.setItem('fitplanhub_user', JSON.stringify(user))
        
        return { success: true, user }
      } else {
        setError(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message)
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem('fitplanhub_user')
    localStorage.removeItem('fitplanhub_token')
    navigate('/')
  }

  const updateProfile = async (updatedData) => {
    try {
      const result = await apiCall('/auth/profile', 'PUT', updatedData, true)
      
      if (result.success) {
        const updatedUser = { ...user, ...updatedData }
        setUser(updatedUser)
        localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
        return { success: true, user: updatedUser }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Failed to update profile' }
    }
  }

  // Plan functions
  const getPlans = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()
      
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category)
      }
      
      if (filters.difficulty && filters.difficulty !== 'all') {
        queryParams.append('difficulty', filters.difficulty)
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search)
      }
      
      if (filters.page) {
        queryParams.append('page', filters.page)
      }
      
      if (filters.limit) {
        queryParams.append('limit', filters.limit)
      }
      
      if (filters.minPrice) {
        queryParams.append('minPrice', filters.minPrice)
      }
      
      if (filters.maxPrice) {
        queryParams.append('maxPrice', filters.maxPrice)
      }
      
      const queryString = queryParams.toString()
      const endpoint = `/plans${queryString ? `?${queryString}` : ''}`
      
      const result = await apiCall(endpoint, 'GET')
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get plans error:', error)
      return { success: false, message: error.message }
    }
  }

  const getPlanById = async (planId) => {
    try {
      const result = await apiCall(`/plans/${planId}`, 'GET')
      
      if (result.success) {
        return { success: true, plan: result.data.plan }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get plan error:', error)
      return { success: false, message: error.message }
    }
  }

  const createPlan = async (planData) => {
    try {
      const result = await apiCall('/plans', 'POST', planData, true)
      
      if (result.success) {
        return { success: true, plan: result.data.plan }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Create plan error:', error)
      return { success: false, message: error.message }
    }
  }

  // Subscription functions
  const subscribeToPlan = async (planId) => {
    try {
      const result = await apiCall(`/subscriptions/subscribe/${planId}`, 'POST', null, true)
      
      if (result.success) {
        // Update user's subscription count locally
        const updatedUser = {
          ...user,
          subscribedPlans: [...(user.subscribedPlans || []), planId]
        }
        setUser(updatedUser)
        localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
        
        return { success: true, message: result.data.message, subscription: result.data.subscription }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      return { success: false, message: error.message }
    }
  }

  const unsubscribeFromPlan = async (subscriptionId) => {
    try {
      const result = await apiCall(`/subscriptions/unsubscribe/${subscriptionId}`, 'DELETE', null, true)
      
      if (result.success) {
        return { success: true, message: result.data.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      return { success: false, message: error.message }
    }
  }

  const getMySubscriptions = async () => {
    try {
      const result = await apiCall('/subscriptions/my-subscriptions', 'GET', null, true)
      
      if (result.success) {
        return { success: true, subscriptions: result.data.subscriptions }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get subscriptions error:', error)
      return { success: false, message: error.message }
    }
  }

  // User functions
  const getTrainers = async () => {
    try {
      const result = await apiCall('/users/trainers', 'GET')
      
      if (result.success) {
        return { success: true, trainers: result.data.trainers }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get trainers error:', error)
      return { success: false, message: error.message }
    }
  }

  const getUserById = async (userId) => {
    try {
      const result = await apiCall(`/users/${userId}`, 'GET')
      
      if (result.success) {
        return { success: true, user: result.data.user }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, message: error.message }
    }
  }

  // Follow functions
  const followTrainer = async (trainerId) => {
    try {
      const result = await apiCall(`/follow/${trainerId}`, 'POST', null, true)
      
      if (result.success) {
        // Update user's following list locally
        const updatedUser = {
          ...user,
          followedTrainers: [...(user.followedTrainers || []), trainerId]
        }
        setUser(updatedUser)
        localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
        
        return { success: true, message: result.data.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Follow error:', error)
      return { success: false, message: error.message }
    }
  }

  const unfollowTrainer = async (trainerId) => {
    try {
      // Note: This endpoint needs to be created in backend
      // For now, we'll handle it locally
      const updatedUser = {
        ...user,
        followedTrainers: (user.followedTrainers || []).filter(id => id !== trainerId)
      }
      setUser(updatedUser)
      localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
      
      return { success: true, message: 'Unfollowed trainer' }
    } catch (error) {
      console.error('Unfollow error:', error)
      return { success: false, message: error.message }
    }
  }

  // Feed functions
  const getUserFeed = async () => {
    try {
      const result = await apiCall('/feed', 'GET', null, true)
      
      if (result.success) {
        return { success: true, plans: result.data.plans }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get feed error:', error)
      return { success: false, message: error.message }
    }
  }

  // Dashboard functions
  const getDashboardStats = async () => {
    try {
      const result = await apiCall('/dashboard/stats', 'GET', null, true)
      
      if (result.success) {
        return { success: true, stats: result.data.stats }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return { success: false, message: error.message }
    }
  }

  // Check if user is subscribed to a plan
  const isSubscribed = async (planId) => {
    try {
      const result = await getMySubscriptions()
      if (result.success) {
        return result.subscriptions.some(sub => sub.plan._id === planId)
      }
      return false
    } catch (error) {
      console.error('Check subscription error:', error)
      return false
    }
  }

  const isFollowing = (trainerId) => {
    if (!user || !user.followedTrainers) return false
    return user.followedTrainers.includes(trainerId)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    
    login,
    signup,
    logout,
    updateProfile,
    
    getPlans,
    getPlanById,
    createPlan,
    
    subscribeToPlan,
    unsubscribeFromPlan,
    getMySubscriptions,
    isSubscribed,

    getTrainers,
    getUserById,
    followTrainer,
    unfollowTrainer,
    isFollowing,
    
    getUserFeed,
    
    getDashboardStats,
    
    clearError,
    isAuthenticated: !!user,
    isUser: user?.role === 'user',
    isTrainer: user?.role === 'trainer'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}