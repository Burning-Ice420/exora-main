"use client"

import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="flex h-screen scrollbar-hide">
          {/* Navigation Sidebar */}
          <Navigation />
          
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
