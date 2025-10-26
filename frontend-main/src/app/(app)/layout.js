"use client"

import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ToastProvider } from "@/components/ui/toast"
import { ChatProvider } from "@/contexts/ChatContext"

export default function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <ChatProvider>
          <div className="min-h-screen bg-background">
            {/* Main Content */}
            <div className="flex h-screen scrollbar-hide">
              {/* Navigation Sidebar */}
              <Navigation />
              
              {/* Content Area */}
              <div className="flex-1 overflow-x-hidden overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </ChatProvider>
      </ToastProvider>
    </ProtectedRoute>
  )
}
