"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Users, Settings, Share2, UserPlus, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/server/api"
import { useToast } from "@/components/ui/toast"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { success, error } = useToast()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(null) // null, 'pending', 'accepted', 'not_connected', 'rejected'
  const [sendingRequest, setSendingRequest] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [stats, setStats] = useState({
    trips: 0,
    connections: 0,
    experiences: 0,
  })
  const [userConnections, setUserConnections] = useState([])

  const userId = params.userId

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true)
        console.log('Loading user profile for ID:', userId)
        const response = await api.getUserById(userId)
        console.log('API response:', response)
        if (response.status === 'success' && response.user) {
          console.log('User found:', response.user)
          setProfileUser(response.user)
          
          // Load user stats
          const [tripsData, connectionsData, experiencesData] = await Promise.all([
            api.getTrips(),
            api.getConnections(),
            api.getExperiences({ user: userId })
          ])
          
          setStats({
            trips: tripsData.length || 0,
            connections: connectionsData.length || 0,
            experiences: experiencesData.length || 0,
          })

          // Check connection status
          await checkConnectionStatus(response.user._id)
          
          // Load user's connections
          await loadUserConnections(response.user._id)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        console.error('Error details:', error.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  const checkConnectionStatus = async (targetUserId) => {
    try {
      const response = await api.getConnections()
      
      // Handle API response structure
      const connections = response.connections || response.data || []
      
      const existingConnection = connections.find(conn => 
        ((conn.userId._id || conn.userId) === currentUser?._id && (conn.connectedUserId._id || conn.connectedUserId) === targetUserId) ||
        ((conn.userId._id || conn.userId) === targetUserId && (conn.connectedUserId._id || conn.connectedUserId) === currentUser?._id)
      )
      
      if (existingConnection) {
        setConnectionStatus(existingConnection.status)
      } else {
        setConnectionStatus('not_connected')
      }

      // Check for pending requests from this user
      const pendingFromUser = connections.filter(conn => 
        (conn.userId._id || conn.userId) === targetUserId && 
        (conn.connectedUserId._id || conn.connectedUserId) === currentUser?._id && 
        conn.status === 'pending'
      )
      setPendingRequests(pendingFromUser)
    } catch (error) {
      console.error('Failed to check connection status:', error)
      setConnectionStatus('not_connected')
    }
  }

  const loadUserConnections = async (targetUserId) => {
    try {
      const response = await api.getConnections()
      
      // Handle API response structure
      const connections = response.connections || response.data || []
      
      // Get accepted connections for this user
      const userConnections = connections.filter(conn => 
        ((conn.userId._id || conn.userId) === targetUserId || (conn.connectedUserId._id || conn.connectedUserId) === targetUserId) && 
        conn.status === 'accepted'
      )
      setUserConnections(userConnections)
    } catch (error) {
      console.error('Failed to load user connections:', error)
    }
  }

  const handleSendConnectionRequest = async () => {
    if (!profileUser || sendingRequest) return

    try {
      setSendingRequest(true)
      const response = await api.sendConnectionRequest(profileUser._id)
      
      if (response.status === 'success') {
        setConnectionStatus('pending')
        success('Connection Request Sent', `Your connection request has been sent to ${profileUser.name}`)
      } else {
        throw new Error(response.message || 'Failed to send connection request')
      }
    } catch (err) {
      console.error('Failed to send connection request:', err)
      error('Connection Request Failed', err.message || 'Failed to send connection request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleAcceptConnectionRequest = async () => {
    if (!profileUser || sendingRequest || pendingRequests.length === 0) return

    try {
      setSendingRequest(true)
      const connection = pendingRequests[0] // Take the first pending request
      const response = await api.acceptConnectionRequest(connection._id || connection.id)
      
      if (response.status === 'success') {
        setConnectionStatus('accepted')
        setPendingRequests([])
        success('Connection Accepted', `You are now connected with ${profileUser.name}`)
      } else {
        throw new Error(response.message || 'Failed to accept connection request')
      }
    } catch (err) {
      console.error('Failed to accept connection request:', err)
      error('Connection Failed', err.message || 'Failed to accept connection request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleRejectConnectionRequest = async () => {
    if (!profileUser || sendingRequest || pendingRequests.length === 0) return

    try {
      setSendingRequest(true)
      const connection = pendingRequests[0] // Take the first pending request
      const response = await api.rejectConnectionRequest(connection._id || connection.id)
      
      if (response.status === 'success') {
        setConnectionStatus('rejected')
        setPendingRequests([])
        success('Connection Rejected', `Connection request from ${profileUser.name} has been rejected`)
      } else {
        throw new Error(response.message || 'Failed to reject connection request')
      }
    } catch (err) {
      console.error('Failed to reject connection request:', err)
      error('Connection Failed', err.message || 'Failed to reject connection request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?._id === profileUser._id
  const preferences = profileUser.travelPreferences || ["Adventure", "Solo Travel", "Foodie", "Beach Lover", "Photography", "Budget Travel"]

  return (
    <div className="w-full h-full bg-background overflow-y-auto pb-24 scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{profileUser.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Share2 size={18} />
            </Button>
            {!isOwnProfile && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Settings size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 border-2 border-primary flex items-center justify-center text-2xl lg:text-3xl shadow-lg shadow-primary/20 overflow-hidden"
            >
              {profileUser.profileImage?.secureUrl || profileUser.profileImage?.url ? (
                <img 
                  src={profileUser.profileImage.secureUrl || profileUser.profileImage.url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                "👤"
              )}
            </motion.div>
            <div className="text-center lg:text-left space-y-1 flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">{profileUser.name}</h2>
              <p className="text-muted-foreground text-sm">{profileUser.bio || 'Travel enthusiast'}</p>
              <p className="text-xs text-primary font-medium">
                Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
              </p>
              {profileUser.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  <span>{profileUser.location}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 lg:gap-3 w-full lg:w-auto">
              {[
                { label: "Trips", value: stats.trips },
                { label: "Connections", value: stats.connections },
                { label: "Experiences", value: stats.experiences },
              ].map((stat) => (
                <div key={stat.label} className="glass-effect rounded-lg p-2 text-center">
                  <p className="text-lg lg:text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2 lg:max-w-md">
              {connectionStatus === 'not_connected' && pendingRequests.length === 0 && (
                <Button
                  onClick={handleSendConnectionRequest}
                  disabled={sendingRequest}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg smooth-transition silver-glow text-sm"
                >
                  {sendingRequest ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} className="mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              )}
              
              {connectionStatus === 'pending' && pendingRequests.length === 0 && (
                <div className="flex-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-yellow-600 font-semibold text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Request Pending
                </div>
              )}
              
              {connectionStatus === 'accepted' && (
                <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
                  <Check size={14} />
                  Connected
                </div>
              )}

              {pendingRequests.length > 0 && (
                <div className="flex gap-2 flex-1">
                  <Button
                    onClick={handleAcceptConnectionRequest}
                    disabled={sendingRequest}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg smooth-transition text-sm"
                  >
                    {sendingRequest ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check size={14} className="mr-2" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRejectConnectionRequest}
                    disabled={sendingRequest}
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 font-semibold py-2 rounded-lg smooth-transition text-sm"
                  >
                    {sendingRequest ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X size={14} className="mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              )}

              {connectionStatus === 'rejected' && (
                <div className="flex-1 bg-red-500/20 border border-red-500/30 rounded-lg py-2 px-4 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm">
                  <X size={14} />
                  Connection Rejected
                </div>
              )}
            </div>
          )}

          {/* Travel Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-foreground">Travel Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((tag, idx) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="px-3 py-1.5 rounded-full bg-gradient-silver text-primary-foreground text-xs font-medium hover:shadow-lg hover:shadow-primary/30 smooth-transition cursor-pointer"
                >
                  {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users size={16} /> Connections ({userConnections.length})
              </h3>
            </div>
            
            {userConnections.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {userConnections.map((conn, idx) => {
                  const connectedUser = conn.userId._id === profileUser._id ? conn.connectedUserId : conn.userId
                  return (
                    <motion.div
                      key={conn._id || conn.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => router.push(`/user/${connectedUser._id}`)}
                      className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-border/50 hover:bg-white/5 smooth-transition cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-lg overflow-hidden">
                        {connectedUser.profileImage?.secureUrl || connectedUser.profileImage?.url ? (
                          <img 
                            src={connectedUser.profileImage.secureUrl || connectedUser.profileImage.url} 
                            alt={connectedUser.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary smooth-transition line-clamp-1">
                          {connectedUser.name}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No connections yet</p>
              </div>
            )}
          </motion.div>

          {/* Photos */}
          {profileUser.photos && profileUser.photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold text-foreground">Photos</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {profileUser.photos.map((photo, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="glass-effect rounded-xl overflow-hidden hover:bg-white/10 smooth-transition cursor-pointer group"
                  >
                    <div className="w-full h-24 lg:h-28 relative overflow-hidden">
                      <img 
                        src={photo.secureUrl || photo.url} 
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-effect rounded-xl p-3 lg:p-4 space-y-2"
          >
            <h3 className="text-sm font-semibold text-foreground">About</h3>
            <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
              {profileUser.bio || "Passionate about exploring hidden gems and meeting fellow travelers. Love good food, great conversations, and unforgettable adventures."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
