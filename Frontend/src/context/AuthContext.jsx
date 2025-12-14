import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Mock database for demonstration
const mockUsersDB = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    bio: 'Fitness enthusiast passionate about health and wellness.',
    fitnessGoals: 'Lose weight, build muscle, improve flexibility',
    experience: 'intermediate',
    subscribedPlans: ['1', '3'],
    followedTrainers: ['trainer1', 'trainer3'],
    createdAt: '2024-01-01'
  },
  {
    id: 'trainer1',
    name: 'John Fitness',
    email: 'trainer@example.com',
    password: 'password123',
    role: 'trainer',
    bio: 'Certified personal trainer with 10+ years of experience specializing in weight loss and beginner fitness.',
    certification: 'ACE Certified Personal Trainer',
    experience: '10+ years',
    specialties: ['Weight Loss', 'Beginner Training', 'Nutrition'],
    rating: 4.8,
    followers: 2400,
    totalSubscribers: 1250,
    totalPlans: 5,
    createdAt: '2023-12-01'
  },
  {
    id: 'trainer2',
    name: 'Sarah Strong',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'trainer',
    bio: 'Strength and conditioning coach specializing in muscle building.',
    certification: 'NASM Certified Trainer',
    experience: '8 years',
    specialties: ['Muscle Building', 'Strength Training'],
    rating: 4.7,
    followers: 1800,
    totalSubscribers: 890,
    totalPlans: 3,
    createdAt: '2023-11-15'
  }
]

// Mock fitness plans database
const mockPlansDB = [
  {
    id: '1',
    title: 'Fat Loss Beginner Plan',
    description: 'A comprehensive 30-day plan designed for beginners looking to lose fat and build healthy habits.',
    fullDescription: `This 30-day fat loss program is specifically designed for beginners who are new to fitness or returning after a break. The program focuses on:
    
    1. **Daily Workouts**: 5 days per week, 30-45 minutes each
    2. **Nutrition Guide**: Complete meal plans and recipes
    3. **Progress Tracking**: Weekly check-ins and measurements
    4. **Community Support**: Access to private group
    
    What you'll get:
    - Customized workout videos
    - Printable workout sheets
    - Grocery shopping lists
    - Recipe book with 50+ healthy recipes
    - 24/7 trainer support
    
    Requirements:
    - No equipment needed (bodyweight exercises)
    - Basic fitness level
    - Commitment to 30 days`,
    price: 49.99,
    duration: 30,
    trainerId: 'trainer1',
    trainerName: 'John Fitness',
    category: 'weight-loss',
    difficulty: 'Beginner',
    weeklyWorkouts: 5,
    dailyTime: '30-45 mins',
    subscribers: 125,
    subscribersList: ['1'],
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    title: 'Muscle Building Advanced',
    description: '12-week intensive muscle building program for advanced athletes. Focus on progressive overload and proper nutrition.',
    fullDescription: 'Advanced muscle building program...',
    price: 89.99,
    duration: 84,
    trainerId: 'trainer2',
    trainerName: 'Sarah Strong',
    category: 'muscle-building',
    difficulty: 'Advanced',
    weeklyWorkouts: 6,
    dailyTime: '60-90 mins',
    subscribers: 89,
    subscribersList: [],
    createdAt: '2024-01-10',
    isActive: true
  },
  {
    id: '3',
    title: 'Yoga & Flexibility',
    description: 'Daily yoga routines to improve flexibility, reduce stress, and enhance overall well-being. Suitable for all levels.',
    fullDescription: 'Yoga and flexibility program...',
    price: 29.99,
    duration: 21,
    trainerId: 'trainer1',
    trainerName: 'John Fitness',
    category: 'flexibility',
    difficulty: 'All Levels',
    weeklyWorkouts: 7,
    dailyTime: '20-30 mins',
    subscribers: 156,
    subscribersList: ['1'],
    createdAt: '2024-02-01',
    isActive: true
  }
]

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const navigate = useNavigate()

  // Initialize mock data
  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('fitplanhub_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Initialize mock databases
    setPlans(mockPlansDB)
    setAllUsers(mockUsersDB)
    setLoading(false)
  }, [])

  // User authentication functions
  const login = async (email, password, role) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user in mock database
      const foundUser = mockUsersDB.find(
        user => user.email === email && 
        user.password === password && 
        user.role === role
      )
      
      if (!foundUser) {
        return { 
          success: false, 
          message: 'Invalid credentials or role mismatch' 
        }
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser
      
      // Generate mock token
      const userWithToken = {
        ...userWithoutPassword,
        token: `mock-jwt-token-${Date.now()}`
      }
      
      setUser(userWithToken)
      localStorage.setItem('fitplanhub_user', JSON.stringify(userWithToken))
      
      return { success: true, user: userWithToken }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const signup = async (userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if email already exists
      const existingUser = mockUsersDB.find(user => user.email === userData.email)
      if (existingUser) {
        return { success: false, message: 'Email already registered' }
      }
      
      // Generate unique ID
      const userId = Math.random().toString(36).substr(2, 9)
      
      // Create new user object
      const newUser = {
        id: userData.role === 'trainer' ? `trainer_${userId}` : userId,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        bio: userData.role === 'trainer' 
          ? 'Certified personal trainer passionate about helping clients achieve their fitness goals.'
          : 'Fitness enthusiast passionate about health and wellness.',
        ...(userData.role === 'trainer' ? {
          certification: 'Certified Personal Trainer',
          experience: '5+ years',
          specialties: ['General Fitness'],
          rating: 0,
          followers: 0,
          totalSubscribers: 0,
          totalPlans: 0
        } : {
          fitnessGoals: 'Improve overall fitness',
          experience: 'beginner',
          subscribedPlans: [],
          followedTrainers: []
        }),
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      // Add to mock database (in real app, this would be API call)
      mockUsersDB.push(newUser)
      setAllUsers([...mockUsersDB])
      
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = newUser
      
      const userWithToken = {
        ...userWithoutPassword,
        token: `mock-jwt-token-new-${Date.now()}`
      }
      
      setUser(userWithToken)
      localStorage.setItem('fitplanhub_user', JSON.stringify(userWithToken))
      
      return { success: true, user: userWithToken }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Signup failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fitplanhub_user')
    navigate('/')
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    
    // Update in localStorage
    localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
    
    // Update in mock database
    const userIndex = mockUsersDB.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      mockUsersDB[userIndex] = { ...mockUsersDB[userIndex], ...updatedData }
      setAllUsers([...mockUsersDB])
    }
    
    return { success: true, user: updatedUser }
  }

  // Plan management functions
  const createPlan = (planData) => {
    try {
      const newPlan = {
        id: Math.random().toString(36).substr(2, 9),
        ...planData,
        trainerId: user.id,
        trainerName: user.name,
        subscribers: 0,
        subscribersList: [],
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      }
      
      // Add to plans
      const updatedPlans = [newPlan, ...plans]
      setPlans(updatedPlans)
      
      // Update trainer's total plans count
      if (user.role === 'trainer') {
        updateUser({ 
          totalPlans: (user.totalPlans || 0) + 1 
        })
      }
      
      return { success: true, plan: newPlan }
    } catch (error) {
      console.error('Create plan error:', error)
      return { success: false, message: 'Failed to create plan' }
    }
  }

  const updatePlan = (planId, updatedData) => {
    try {
      const planIndex = plans.findIndex(plan => plan.id === planId)
      if (planIndex === -1) {
        return { success: false, message: 'Plan not found' }
      }
      
      // Check if user is the owner of the plan
      if (plans[planIndex].trainerId !== user.id) {
        return { success: false, message: 'Not authorized to update this plan' }
      }
      
      const updatedPlan = { ...plans[planIndex], ...updatedData }
      const updatedPlans = [...plans]
      updatedPlans[planIndex] = updatedPlan
      setPlans(updatedPlans)
      
      return { success: true, plan: updatedPlan }
    } catch (error) {
      console.error('Update plan error:', error)
      return { success: false, message: 'Failed to update plan' }
    }
  }

  const deletePlan = (planId) => {
    try {
      const planIndex = plans.findIndex(plan => plan.id === planId)
      if (planIndex === -1) {
        return { success: false, message: 'Plan not found' }
      }
      
      // Check if user is the owner of the plan
      if (plans[planIndex].trainerId !== user.id) {
        return { success: false, message: 'Not authorized to delete this plan' }
      }
      
      const updatedPlans = plans.filter(plan => plan.id !== planId)
      setPlans(updatedPlans)
      
      // Update trainer's total plans count
      if (user.role === 'trainer') {
        updateUser({ 
          totalPlans: Math.max(0, (user.totalPlans || 1) - 1) 
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('Delete plan error:', error)
      return { success: false, message: 'Failed to delete plan' }
    }
  }

  // Subscription functions
  const subscribeToPlan = (planId) => {
    try {
      const planIndex = plans.findIndex(plan => plan.id === planId)
      if (planIndex === -1) {
        return { success: false, message: 'Plan not found' }
      }
      
      // Check if already subscribed
      if (plans[planIndex].subscribersList.includes(user.id)) {
        return { success: false, message: 'Already subscribed to this plan' }
      }
      
      // Update plan subscribers
      const updatedPlan = {
        ...plans[planIndex],
        subscribers: plans[planIndex].subscribers + 1,
        subscribersList: [...plans[planIndex].subscribersList, user.id]
      }
      
      const updatedPlans = [...plans]
      updatedPlans[planIndex] = updatedPlan
      setPlans(updatedPlans)
      
      // Update user's subscribed plans
      const updatedUser = {
        ...user,
        subscribedPlans: [...(user.subscribedPlans || []), planId]
      }
      setUser(updatedUser)
      localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
      
      // Update in mock database
      const userIndex = mockUsersDB.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        mockUsersDB[userIndex].subscribedPlans = updatedUser.subscribedPlans
      }
      
      // Update trainer's total subscribers count
      const trainer = mockUsersDB.find(u => u.id === updatedPlan.trainerId)
      if (trainer) {
        const trainerIndex = mockUsersDB.findIndex(u => u.id === trainer.id)
        mockUsersDB[trainerIndex].totalSubscribers = (trainer.totalSubscribers || 0) + 1
      }
      
      return { 
        success: true, 
        message: 'Successfully subscribed to plan!',
        plan: updatedPlan,
        user: updatedUser
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      return { success: false, message: 'Failed to subscribe to plan' }
    }
  }

  const unsubscribeFromPlan = (planId) => {
    try {
      const planIndex = plans.findIndex(plan => plan.id === planId)
      if (planIndex === -1) {
        return { success: false, message: 'Plan not found' }
      }
      
      // Check if subscribed
      if (!plans[planIndex].subscribersList.includes(user.id)) {
        return { success: false, message: 'Not subscribed to this plan' }
      }
      
      // Update plan subscribers
      const updatedPlan = {
        ...plans[planIndex],
        subscribers: Math.max(0, plans[planIndex].subscribers - 1),
        subscribersList: plans[planIndex].subscribersList.filter(id => id !== user.id)
      }
      
      const updatedPlans = [...plans]
      updatedPlans[planIndex] = updatedPlan
      setPlans(updatedPlans)
      
      // Update user's subscribed plans
      const updatedUser = {
        ...user,
        subscribedPlans: (user.subscribedPlans || []).filter(id => id !== planId)
      }
      setUser(updatedUser)
      localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
      
      // Update in mock database
      const userIndex = mockUsersDB.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        mockUsersDB[userIndex].subscribedPlans = updatedUser.subscribedPlans
      }
      
      return { 
        success: true, 
        message: 'Successfully unsubscribed from plan',
        user: updatedUser
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      return { success: false, message: 'Failed to unsubscribe from plan' }
    }
  }

  // Trainer following functions
  const followTrainer = (trainerId) => {
    try {
      const trainer = mockUsersDB.find(user => user.id === trainerId && user.role === 'trainer')
      if (!trainer) {
        return { success: false, message: 'Trainer not found' }
      }
      
      // Check if already following
      if ((user.followedTrainers || []).includes(trainerId)) {
        return { success: false, message: 'Already following this trainer' }
      }
      
      // Update user's followed trainers
      const updatedUser = {
        ...user,
        followedTrainers: [...(user.followedTrainers || []), trainerId]
      }
      setUser(updatedUser)
      localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
      
      // Update trainer's follower count in mock database
      const trainerIndex = mockUsersDB.findIndex(u => u.id === trainerId)
      if (trainerIndex !== -1) {
        mockUsersDB[trainerIndex].followers = (trainer.followers || 0) + 1
        setAllUsers([...mockUsersDB])
      }
      
      // Update in mock database for current user
      const userIndex = mockUsersDB.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        mockUsersDB[userIndex].followedTrainers = updatedUser.followedTrainers
      }
      
      return { 
        success: true, 
        message: `Now following ${trainer.name}`,
        user: updatedUser
      }
    } catch (error) {
      console.error('Follow trainer error:', error)
      return { success: false, message: 'Failed to follow trainer' }
    }
  }

  const unfollowTrainer = (trainerId) => {
    try {
      const trainer = mockUsersDB.find(user => user.id === trainerId && user.role === 'trainer')
      if (!trainer) {
        return { success: false, message: 'Trainer not found' }
      }
      
      // Check if following
      if (!(user.followedTrainers || []).includes(trainerId)) {
        return { success: false, message: 'Not following this trainer' }
      }
      
      // Update user's followed trainers
      const updatedUser = {
        ...user,
        followedTrainers: (user.followedTrainers || []).filter(id => id !== trainerId)
      }
      setUser(updatedUser)
      localStorage.setItem('fitplanhub_user', JSON.stringify(updatedUser))
      
      // Update trainer's follower count in mock database
      const trainerIndex = mockUsersDB.findIndex(u => u.id === trainerId)
      if (trainerIndex !== -1) {
        mockUsersDB[trainerIndex].followers = Math.max(0, (trainer.followers || 1) - 1)
        setAllUsers([...mockUsersDB])
      }
      
      // Update in mock database for current user
      const userIndex = mockUsersDB.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        mockUsersDB[userIndex].followedTrainers = updatedUser.followedTrainers
      }
      
      return { 
        success: true, 
        message: `Unfollowed ${trainer.name}`,
        user: updatedUser
      }
    } catch (error) {
      console.error('Unfollow trainer error:', error)
      return { success: false, message: 'Failed to unfollow trainer' }
    }
  }

  // Data fetching functions
  const getPlans = (filters = {}) => {
    let filteredPlans = [...plans]
    
    // Apply filters
    if (filters.category && filters.category !== 'all') {
      filteredPlans = filteredPlans.filter(plan => plan.category === filters.category)
    }
    
    if (filters.trainerId) {
      filteredPlans = filteredPlans.filter(plan => plan.trainerId === filters.trainerId)
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredPlans = filteredPlans.filter(plan => 
        plan.title.toLowerCase().includes(searchTerm) ||
        plan.description.toLowerCase().includes(searchTerm)
      )
    }
    
    return filteredPlans
  }

  const getPlanById = (planId) => {
    return plans.find(plan => plan.id === planId)
  }

  const getUserById = (userId) => {
    return mockUsersDB.find(user => user.id === userId)
  }

  const getTrainerById = (trainerId) => {
    const trainer = mockUsersDB.find(user => user.id === trainerId && user.role === 'trainer')
    if (!trainer) return null
    
    // Get trainer's plans
    const trainerPlans = plans.filter(plan => plan.trainerId === trainerId)
    
    return {
      ...trainer,
      plans: trainerPlans
    }
  }

  const getTrainers = () => {
    return mockUsersDB.filter(user => user.role === 'trainer')
  }

  const getUsers = () => {
    return mockUsersDB.filter(user => user.role === 'user')
  }

  const getUserSubscribedPlans = () => {
    if (!user || !user.subscribedPlans) return []
    return plans.filter(plan => user.subscribedPlans.includes(plan.id))
  }

  const getUserFeedPlans = () => {
    if (!user || !user.followedTrainers) return []
    
    // Get plans from followed trainers
    const followedTrainerIds = user.followedTrainers || []
    return plans.filter(plan => followedTrainerIds.includes(plan.trainerId))
  }

  const isSubscribed = (planId) => {
    if (!user || !user.subscribedPlans) return false
    return user.subscribedPlans.includes(planId)
  }

  const isFollowing = (trainerId) => {
    if (!user || !user.followedTrainers) return false
    return user.followedTrainers.includes(trainerId)
  }

  // Dashboard statistics
  const getDashboardStats = () => {
    if (!user) return null
    
    if (user.role === 'trainer') {
      const trainerPlans = plans.filter(plan => plan.trainerId === user.id)
      const totalRevenue = trainerPlans.reduce((sum, plan) => 
        sum + (plan.price * plan.subscribers), 0
      )
      const totalSubscribers = trainerPlans.reduce((sum, plan) => 
        sum + plan.subscribers, 0
      )
      
      return {
        totalPlans: trainerPlans.length,
        totalSubscribers,
        totalRevenue,
        averageRating: user.rating || 0,
        followers: user.followers || 0
      }
    }
    
    // User stats
    return {
      subscribedPlans: user.subscribedPlans?.length || 0,
      following: user.followedTrainers?.length || 0,
      totalSpent: getUserSubscribedPlans().reduce((sum, plan) => sum + plan.price, 0)
    }
  }

  // Value object for context
  const value = {
    // User state
    user,
    loading,
    
    // Authentication functions
    login,
    signup,
    logout,
    updateUser,
    
    // Plan management
    plans,
    createPlan,
    updatePlan,
    deletePlan,
    getPlans,
    getPlanById,
    
    // Subscription functions
    subscribeToPlan,
    unsubscribeFromPlan,
    isSubscribed,
    getUserSubscribedPlans,
    
    // Trainer following
    followTrainer,
    unfollowTrainer,
    isFollowing,
    
    // Data fetching
    getUserById,
    getTrainerById,
    getTrainers,
    getUsers,
    
    // Feed and personalized data
    getUserFeedPlans,
    
    // Dashboard
    getDashboardStats,
    
    // Helper functions
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

// Custom hook for using auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}