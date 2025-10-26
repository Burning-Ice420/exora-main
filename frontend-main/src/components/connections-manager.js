"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, UserPlus, Check, X, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/server/api"
import { useRouter } from "next/navigation"

export default function ConnectionsManager() {
  const { user } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [tripRequests, setTripRequests] = useState([])
  const [allConnections, setAllConnections] = useState([])
  const [allTripRequests, setAllTripRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const dropdownRef = useRef(null)

  // Load all connection requests and trip requests
  useEffect(() => {
    if (user) {
      loadAllConnections()
      loadAllTripRequests()
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const loadAllConnections = async () => {
    try {
      setLoading(true)
      const response = await api.getConnections()

      // Handle API response structure
      const connections = response.connections || response.data || []
      
      // Filter connections where user is the recipient
      const userConnections = connections.filter(conn =>
        (conn.connectedUserId._id || conn.connectedUserId) === user?._id
      )
      
      setAllConnections(userConnections)
      
      // Set pending requests for badge count
      const pending = userConnections.filter(conn => conn.status === 'pending')
      setPendingRequests(pending)
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllTripRequests = async () => {
    try {
      const response = await api.getMyTripRequestsAsOwner()
      
      if (response.status === 'success') {
        const allRequests = response.requests || []
        setAllTripRequests(allRequests)
        
        // Set pending trip requests for badge count
        const pendingTripRequests = allRequests.filter(req => req.status === 'pending')
        setTripRequests(pendingTripRequests)
      }
    } catch (error) {
      console.error('Failed to load trip requests:', error)
    }
  }

  const handleAcceptRequest = async (connectionId) => {
    try {
      setActionLoading(connectionId)
      await api.acceptConnectionRequest(connectionId)
      // Refresh all data
      loadAllConnections()
    } catch (error) {
      console.error('Failed to accept connection request:', error)
      alert('Failed to accept connection request. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectRequest = async (connectionId) => {
    try {
      setActionLoading(connectionId)
      await api.rejectConnectionRequest(connectionId)
      // Refresh all data
      loadAllConnections()
    } catch (error) {
      console.error('Failed to reject connection request:', error)
      alert('Failed to reject connection request. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewProfile = (userId) => {
    router.push(`/user/${userId}`)
    setShowDropdown(false)
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative w-14 h-14 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 smooth-transition"
      >
        <Bell size={22} />
        {(pendingRequests.length + tripRequests.length) > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {pendingRequests.length + tripRequests.length}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-[250px] top-[-100px] mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-lg z-[9999] max-h-96 overflow-hidden transform -translate-x-1/2"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {(pendingRequests.length + tripRequests.length) > 0 && (
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                    {pendingRequests.length + tripRequests.length}
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
                {/* Pending Trip Requests Section */}
                {tripRequests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus size={14} className="text-orange-500" />
                      <h4 className="text-sm font-medium text-foreground">Pending Trip Requests</h4>
                      <span className="bg-orange-500/20 text-orange-500 text-xs px-2 py-1 rounded-full">
                        {tripRequests.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {tripRequests.slice(0, 3).map((request) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/40 to-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-sm overflow-hidden">
                            {request.requesterId?.profileImage?.secureUrl || request.requesterId?.profileImage?.url ? (
                              <img 
                                src={request.requesterId.profileImage.secureUrl || request.requesterId.profileImage.url} 
                                alt={request.requesterId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {request.requesterId?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Wants to join "{request.tripId?.name || 'Trip'}"
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              router.push('/profile')
                              setShowDropdown(false)
                            }}
                            className="p-1 h-6 w-6 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                            title="Manage"
                          >
                            <Users size={12} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Connection Requests Section */}
                {pendingRequests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-primary" />
                      <h4 className="text-sm font-medium text-foreground">Pending Connection Requests</h4>
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        {pendingRequests.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pendingRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 bg-background/50 rounded-lg border border-border/50"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-sm overflow-hidden">
                            {request.userId?.profileImage?.secureUrl || request.userId?.profileImage?.url ? (
                              <img 
                                src={request.userId.profileImage.secureUrl || request.userId.profileImage.url} 
                                alt={request.userId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {request.userId?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Wants to connect with you
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={actionLoading === request.id}
                              className="p-1 h-6 w-6 bg-green-500 hover:bg-green-600 text-white"
                              title="Accept"
                            >
                              {actionLoading === request.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Check size={12} />
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={actionLoading === request.id}
                              className="p-1 h-6 w-6 border-red-500/30 text-red-500 hover:bg-red-500/10"
                              title="Reject"
                            >
                              {actionLoading === request.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                              ) : (
                                <X size={12} />
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Trip Requests Section */}
                {allTripRequests.filter(req => req.status !== 'pending').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus size={14} className="text-muted-foreground" />
                      <h4 className="text-sm font-medium text-foreground">Previous Trip Requests</h4>
                      <span className="bg-muted/20 text-muted-foreground text-xs px-2 py-1 rounded-full">
                        {allTripRequests.filter(req => req.status !== 'pending').length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {allTripRequests.filter(req => req.status !== 'pending').slice(0, 3).map((request) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-muted/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-muted flex items-center justify-center text-sm overflow-hidden">
                            {request.requesterId?.profileImage?.secureUrl || request.requesterId?.profileImage?.url ? (
                              <img 
                                src={request.requesterId.profileImage.secureUrl || request.requesterId.profileImage.url} 
                                alt={request.requesterId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {request.requesterId?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {request.status === 'accepted' ? 'Joined' : 'Rejected'} "{request.tripId?.name || 'Trip'}"
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              request.status === 'accepted' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Connection Requests Section */}
                {allConnections.filter(conn => conn.status !== 'pending').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-muted-foreground" />
                      <h4 className="text-sm font-medium text-foreground">Previous Connection Requests</h4>
                      <span className="bg-muted/20 text-muted-foreground text-xs px-2 py-1 rounded-full">
                        {allConnections.filter(conn => conn.status !== 'pending').length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {allConnections.filter(conn => conn.status !== 'pending').slice(0, 3).map((request) => (
                        <motion.div
                          key={request._id || request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-muted/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-muted flex items-center justify-center text-sm overflow-hidden">
                            {request.userId?.profileImage?.secureUrl || request.userId?.profileImage?.url ? (
                              <img 
                                src={request.userId.profileImage.secureUrl || request.userId.profileImage.url} 
                                alt={request.userId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {request.userId?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.status === 'accepted' ? 'Connected' : 'Rejected'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              request.status === 'accepted' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Connections Section */}
                {allConnections.filter(conn => conn.status === 'accepted').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-green-500" />
                      <h4 className="text-sm font-medium text-foreground">Your Connections</h4>
                      <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                        {allConnections.filter(conn => conn.status === 'accepted').length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {allConnections.filter(conn => conn.status === 'accepted').slice(0, 5).map((connection) => (
                        <motion.div
                          key={connection._id || connection.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20 hover:bg-green-500/20 cursor-pointer"
                          onClick={() => handleViewProfile(connection.userId._id || connection.userId)}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/40 to-green-500/20 border-2 border-green-500 flex items-center justify-center text-sm overflow-hidden">
                            {connection.userId?.profileImage?.secureUrl || connection.userId?.profileImage?.url ? (
                              <img 
                                src={connection.userId.profileImage.secureUrl || connection.userId.profileImage.url} 
                                alt={connection.userId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-xs truncate">
                              {connection.userId?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Connected {new Date(connection.acceptedAt || connection.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                              Connected
                            </span>
                            <Eye size={12} className="text-muted-foreground" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {allConnections.length === 0 && allTripRequests.length === 0 && (
                  <div className="text-center py-8">
                    <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
