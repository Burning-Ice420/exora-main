"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loader from '@/components/ui/loader'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}
