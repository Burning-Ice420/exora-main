"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to feed page
    router.push("/feed")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto">
          <div className="text-2xl">🏠</div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">exora</h2>
          <p className="text-muted-foreground">Redirecting to feed...</p>
        </div>
      </div>
    </div>
  )
}
