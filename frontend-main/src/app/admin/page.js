"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLogin from "@/components/admin/AdminLogin"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken === 'admin-secure-token-2024') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}

