"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home as HomeIcon, Search, Compass, Users, User, Settings, MessageCircle, CheckCircle, X, MapPin, Clock, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ConnectionsManager from "./connections-manager"
import ChatSidebar from "./ui/chat-sidebar"
import AttendanceScreen from "./ui/attendance-screen"
import { useChat } from "@/contexts/ChatContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast"
import api from "@/server/api"

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showChatSidebar, setShowChatSidebar] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showTripSelector, setShowTripSelector] = useState(false)
  const [userTrips, setUserTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [selectedTripForAttendance, setSelectedTripForAttendance] = useState(null)
  const [startingTrip, setStartingTrip] = useState(null)
  const { unreadCount } = useChat()
  const { success, error } = useToast()

  // Load user trips when attendance modal opens
  useEffect(() => {
    if (showTripSelector && user) {
      loadUserTrips()
    }
  }, [showTripSelector, user])

  const loadUserTrips = async () => {
    try {
      setLoadingTrips(true)
      const response = await api.getTrips()
      const trips = response?.trips || response || []
      setUserTrips(Array.isArray(trips) ? trips : [])
    } catch (error) {
      console.error('Failed to load trips:', error)
      setUserTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }

  const handleStartTrip = async (trip) => {
    try {
      setStartingTrip(trip._id || trip.id)
      const response = await api.updateTrip(trip._id || trip.id, { status: 'confirmed' })
      if (response.status === 'success') {
        success('Trip Started', `"${trip.name}" has been started. You can now mark attendance.`)
        // Reload trips to get updated status
        await loadUserTrips()
        // Open attendance modal
        setSelectedTripForAttendance({ ...trip, status: 'confirmed' })
        setShowTripSelector(false)
        setShowAttendanceModal(true)
      }
    } catch (err) {
      console.error('Failed to start trip:', err)
      error('Failed to Start Trip', err.message || 'Could not start the trip. Please try again.')
    } finally {
      setStartingTrip(null)
    }
  }

  const handleSelectTrip = (trip) => {
    // Only allow selecting trips that are started (confirmed)
    if (trip.status === 'confirmed') {
      setSelectedTripForAttendance(trip)
      setShowTripSelector(false)
      setShowAttendanceModal(true)
    }
  }


  const tabs = [
    { id: "feed", label: "Feed", icon: HomeIcon, href: "/feed" },
    { id: "finder", label: "Finder", icon: Search, href: "/finder" },
    { id: "labs", label: "Labs", icon: Compass, href: "/labs" },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  const getActiveTab = () => {
    if (pathname === "/") return "feed"
    return pathname.split("/")[1] || "feed"
  }

  const activeTab = getActiveTab()

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block w-24 bg-card border-r border-border flex flex-col  items-center py-6 space-y-6"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link key={tab.id} href={tab.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-xl flex items-center ml-5 mt-2 justify-center smooth-transition ${
                  isActive
                    ? "bg-primary text-primary-foreground silver-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon size={22} />
              </motion.button>
            </Link>
          )
        })}
        
        {/* Connections Manager */}
        <div className="ml-5 mt-2">
          <ConnectionsManager />
        </div>

        {/* Attendees Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTripSelector(true)}
          className="w-14 h-14 rounded-xl flex items-center ml-5 mt-2 justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 smooth-transition"
          title="Mark Attendance"
        >
          <CheckCircle size={22} />
        </motion.button>

        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChatSidebar(true)}
          className="w-14 h-14 rounded-xl flex items-center ml-5 mt-2 justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 smooth-transition relative"
        >
          <MessageCircle size={22} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex justify-around">
          {tabs.slice(0, 3).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link key={tab.id} href={tab.href}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg smooth-transition ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              </Link>
            )
          })}
          
          {/* Mobile Attendees Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTripSelector(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg smooth-transition text-muted-foreground hover:text-foreground"
          >
            <CheckCircle size={20} />
            <span className="text-xs font-medium">Attendees</span>
          </motion.button>

          {/* Mobile Chat Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChatSidebar(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg smooth-transition text-muted-foreground hover:text-foreground relative"
          >
            <div className="relative">
              <MessageCircle size={20} />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.div>
              )}
            </div>
            <span className="text-xs font-medium">Chat</span>
          </motion.button>

          {/* Mobile Connections Manager */}
          <div className="flex flex-col items-center gap-1">
            <ConnectionsManager />
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={showChatSidebar}
        onClose={() => setShowChatSidebar(false)}
      />

      {/* Trip Selector Modal */}
      <AnimatePresence>
        {showTripSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTripSelector(false)}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" />
                  Select Trip to Mark Attendance
                </h3>
                <button
                  onClick={() => setShowTripSelector(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {loadingTrips ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading trips...</span>
                  </div>
                ) : userTrips.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">No trips found</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a trip in Labs to mark attendance</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userTrips.map((trip) => {
                      const isStarted = trip.status === 'confirmed'
                      const isStarting = startingTrip === (trip._id || trip.id)
                      
                      return (
                        <motion.div
                          key={trip._id || trip.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 smooth-transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {trip.name}
                                </h4>
                                {isStarted && (
                                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                                    Started
                                  </span>
                                )}
                                {!isStarted && (
                                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-medium">
                                    Planning
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <MapPin size={12} />
                                <span className="truncate">{trip.location || trip.destination}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock size={12} />
                                <span>
                                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                </span>
                              </div>
                              {trip.membersInvolved && trip.membersInvolved.length > 1 && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Users size={12} />
                                  <span>{trip.membersInvolved.length - 1} participant{trip.membersInvolved.length - 1 !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {isStarted ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectTrip(trip)}
                                  className="text-xs px-3 py-1 h-auto whitespace-nowrap"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Mark Attendance
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartTrip(trip)}
                                  disabled={isStarting}
                                  className="text-xs px-3 py-1 h-auto whitespace-nowrap"
                                >
                                  {isStarting ? (
                                    <>
                                      <Loader2 size={14} className="mr-1 animate-spin" />
                                      Starting...
                                    </>
                                  ) : (
                                    <>
                                      <Play size={14} className="mr-1" />
                                      Start Trip
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Screen */}
      <AttendanceScreen
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false)
          setSelectedTripForAttendance(null)
        }}
        tripId={selectedTripForAttendance?._id || selectedTripForAttendance?.id}
        tripName={selectedTripForAttendance?.name}
      />
    </>
  )
}
