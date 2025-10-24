"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/server/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const token = api.getToken()
      if (!token) {
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      const response = await api.getCurrentUser()
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        api.removeToken()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      api.removeToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await api.login(email, password)
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.register(userData)
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      api.removeToken()
      router.push('/login')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData)
      console.log('Update profile response:', response)
      
      // Extract user data from response - backend returns { status: 'success', user: userData }
      const updatedUser = response.user
      console.log('Updated user data:', updatedUser)
      
      if (updatedUser) {
        // Update the user state with the complete user data from backend
        setUser(updatedUser)
        console.log('User state updated with:', updatedUser)
        return { success: true, user: updatedUser }
      } else {
        console.error('No user data in response:', response)
        return { success: false, error: 'No user data received' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  const updatePreferences = async (preferences) => {
    try {
      const updatedUser = await api.updatePreferences(preferences)
      setUser(updatedUser)
      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
