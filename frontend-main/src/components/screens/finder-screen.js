"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { MapPin, Users, Clock, Filter, X, Check, Loader2, UserPlus, MessageCircle, Send, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import api from "@/server/api"
import Map from "@/components/ui/map"
import BottomSheet from "@/components/ui/bottom-sheet"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import TripRequestsManager from "@/components/ui/trip-requests-manager"
import FirebaseChat from "@/components/ui/firebase-chat"
import ItineraryParticipantsView from "@/components/ui/itinerary-participants-view"
import { useToast } from "@/components/ui/toast"

export default function FinderScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [requestSent, setRequestSent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
  })
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showItineraryParticipants, setShowItineraryParticipants] = useState(false)
  const [currentChatRoom, setCurrentChatRoom] = useState(null)
  const [joinMessage, setJoinMessage] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const [userRequestStatus, setUserRequestStatus] = useState({}) // Track request status per trip
  const [selectedItineraries, setSelectedItineraries] = useState([]) // Track selected itineraries for join request

  // Load public trips on component mount
  useEffect(() => {
    const loadPublicTrips = async () => {
      try {
        setLoading(true)
        const response = await api.getPublicTrips()
        // Extract trips from response
        const tripsData = response?.trips || response || []
        setTrips(Array.isArray(tripsData) ? tripsData : [])
      } catch (error) {
        console.error('Failed to load public trips:', error)
        setTrips([
          {
            _id: "1",
            name: "Sunset Beach Bonfire",
            host: "Sarah",
            hostAvatar: "👩",
            participants: 4,
            time: "Today, 6 PM",
            distance: "2.3 km away",
            category: "Beach",
            price: 0,
            description: "Join us for an unforgettable sunset bonfire on the beach. Bring your favorite snacks and stories!",
            image: "🔥",
          },
          {
            _id: "2",
            name: "Goa Food Tour",
            host: "Marco",
            hostAvatar: "👨",
            participants: 6,
            time: "Tomorrow, 10 AM",
            distance: "1.8 km away",
            category: "Food",
            price: 500,
            description: "Explore the best street food spots in Goa. Taste authentic Goan cuisine with a local guide.",
            image: "🍜",
          },
          {
            _id: "3",
            name: "Water Sports Adventure",
            host: "Raj",
            hostAvatar: "👨",
            participants: 3,
            time: "This weekend",
            distance: "3.1 km away",
            category: "Adventure",
            price: 1500,
            description: "Jet skiing, parasailing, and paddleboarding. All equipment provided. Beginner-friendly!",
            image: "🏄",
          },
          {
            _id: "4",
            name: "Yoga & Meditation",
            host: "Priya",
            hostAvatar: "👩",
            participants: 8,
            time: "Daily, 6 AM",
            distance: "0.5 km away",
            category: "Wellness",
            price: 200,
            description: "Start your day with sunrise yoga and meditation. Perfect for relaxation and connection.",
            image: "🧘",
          },
          {
            _id: "5",
            name: "Night Market Exploration",
            host: "Alex",
            hostAvatar: "👨",
            participants: 5,
            time: "Tonight, 8 PM",
            distance: "2.1 km away",
            category: "Culture",
            price: 300,
            description: "Discover local crafts, street art, and hidden gems at the night market.",
            image: "🎨",
          },
          {
            _id: "6",
            name: "Hiking Trail Adventure",
            host: "Nina",
            hostAvatar: "👩",
            participants: 7,
            time: "Sunday, 7 AM",
            distance: "4.2 km away",
            category: "Adventure",
            price: 0,
            description: "Scenic hiking trail with breathtaking views. Moderate difficulty. Bring water and snacks.",
            image: "⛰️",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadPublicTrips()
  }, [])

  // Handle tripId query parameter to open modal
  useEffect(() => {
    const tripId = searchParams.get('tripId')
    if (tripId && trips.length > 0 && !selectedTrip) {
      const trip = trips.find(t => t._id === tripId)
      if (trip) {
        setSelectedTrip(trip)
        // Clean up URL without reloading
        router.replace('/finder', { scroll: false })
      }
    }
  }, [searchParams, trips, selectedTrip, router])

  const isTripOwner = useCallback((trip) => {
    return trip.createdBy?._id === user?._id
  }, [user])

  // Check if user has already sent a request when trip is selected
  useEffect(() => {
    if (selectedTrip && user && !isTripOwner(selectedTrip)) {
      const checkRequest = async () => {
        try {
          const response = await api.checkUserRequest(selectedTrip._id)
          if (response.status === 'success') {
            setUserRequestStatus(prev => ({
              ...prev,
              [selectedTrip._id]: response.hasRequest ? response.request : null
            }))
          }
        } catch (err) {
          console.error('Failed to check request status:', err)
          // If error, assume no request exists
          setUserRequestStatus(prev => ({
            ...prev,
            [selectedTrip._id]: null
          }))
        }
      }
      checkRequest()
    } else if (selectedTrip && isTripOwner(selectedTrip)) {
      // Clear request status for owned trips
      setUserRequestStatus(prev => ({
        ...prev,
        [selectedTrip._id]: null
      }))
    }
    
    // Reset selected itineraries when trip changes
    if (selectedTrip) {
      setSelectedItineraries([])
      setJoinMessage("")
    }
  }, [selectedTrip, user, isTripOwner])

  const handleRequestToJoin = async (experienceId) => {
    try {
      setRequestSent(experienceId)
      await api.joinExperience(experienceId)
      setTimeout(() => {
        setRequestSent(null)
        setSelectedTrip(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to join experience:', error)
      setRequestSent(null)
    }
  }

  const { success, error } = useToast()

  const handleJoinRequest = async (trip) => {
    if (!trip) return

    // Validate at least one itinerary is selected
    if (selectedItineraries.length === 0) {
      error('Selection Required', 'Please select at least one itinerary to join')
      return
    }

    try {
      setSendingRequest(true)
      const response = await api.sendTripJoinRequest(trip._id, joinMessage, selectedItineraries)
      
      if (response.status === 'success') {
        success('Join Request Sent', `Your request to join "${trip.name}" has been sent!`)
        setJoinMessage("")
        setRequestSent(trip._id)
        
        // Update request status
        setUserRequestStatus(prev => ({
          ...prev,
          [trip._id]: {
            status: 'pending',
            message: joinMessage,
            selectedItineraries: selectedItineraries.map(id => {
              const item = trip.itinerary?.find(it => {
                const itemId = it.id || it._id?.toString()
                return itemId === id
              })
              return item ? {
                itineraryId: id,
                experienceName: item.experienceName || item.name,
                day: item.day,
                startTime: item.startTime,
                endTime: item.endTime
              } : null
            }).filter(Boolean),
            createdAt: new Date()
          }
        }))
        
        // Reset selections
        setSelectedItineraries([])
        setJoinMessage("")
        
        setTimeout(() => setRequestSent(null), 3000)
      } else {
        throw new Error(response.message || 'Failed to send join request')
      }
    } catch (err) {
      console.error('Failed to send join request:', err)
      error('Request Failed', err.message || 'Failed to send join request. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }


  const handleManageRequests = (trip) => {
    setSelectedTrip(trip)
    setShowRequestsModal(true)
  }

  const handleAcceptRequest = (chatRoom) => {
    setCurrentChatRoom(chatRoom)
    setShowRequestsModal(false)
    setShowChat(true)
  }

  // Memoize filtered trips to prevent unnecessary map re-renders
  const filteredTrips = useMemo(() => {
    return (trips || []).filter((trip) => {
      if (filters.category !== "all" && trip.category !== filters.category) return false
      if (filters.priceRange === "free" && trip.budget !== 0) return false
      if (filters.priceRange === "paid" && trip.budget === 0) return false
      return true
    })
  }, [trips, filters.category, filters.priceRange])

  // Memoize callback functions to prevent map re-renders
  const handleMarkerClick = useCallback((trip) => {
    setSelectedTrip(trip)
  }, [])

  const handleMarkerHover = useCallback((trip) => {
    // Optional: Add hover preview logic here if needed
  }, [])

  return (
    <div className="w-full h-full relative">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0 bg-background">
        <Map 
          experiences={filteredTrips}
          center={[15.2993, 74.1240]} // Goa, India coordinates
          zoom={13}
          className="w-full h-full"
          onMarkerClick={handleMarkerClick}
          onMarkerHover={handleMarkerHover}
        />
      </div>

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="px-3 lg:px-4 py-2 lg:py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-foreground">exora Finder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Discover experiences near you</p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Filter size={18} />
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-border"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Category</p>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "Beach", "Food", "Adventure", "Wellness", "Culture"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilters({ ...filters, category: cat })}
                        className={`px-3 py-1 rounded-full text-xs font-medium smooth-transition ${
                          filters.category === cat
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Sheet with Trips */}
      <BottomSheet>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-3 lg:px-4 py-3 lg:py-4 space-y-2 lg:space-y-3">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <p className="text-xs lg:text-sm text-muted-foreground">No trips found</p>
              </div>
            ) : (
              filteredTrips.map((trip, idx) => (
                <motion.div
                  key={trip._id || trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => setSelectedTrip(trip)}
                  className="glass-effect rounded-xl p-4 space-y-3 hover:bg-primary/5 hover:shadow-md smooth-transition cursor-pointer group border border-border/50"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">🗺️</div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm group-hover:text-primary smooth-transition line-clamp-1">
                            {trip.name}
                          </h3>
                          <p 
                            className="text-xs text-muted-foreground hover:text-primary cursor-pointer smooth-transition"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (trip.createdBy?._id) {
                                if (trip.createdBy._id === user?._id) {
                                  router.push('/profile')
                                } else {
                                  router.push(`/user/${trip.createdBy._id}`)
                                }
                              }
                            }}
                          >
                            by {trip.createdBy?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary font-medium">{trip.location}</p>
                      {trip.budget > 0 && <p className="text-xs text-muted-foreground">₹{trip.budget}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-primary" />
                      <span>{trip.membersInvolved?.length || 0} {trip.membersInvolved?.length === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-primary" />
                      <span className="line-clamp-1">{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
                  )}

                  <div className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {trip.visibility}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </BottomSheet>

      {/* Trip Detail Modal */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrip(null)}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-md z-[100] flex items-center justify-center p-2 lg:p-6 md:p-8"
            style={{ zIndex: 100 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-xl lg:rounded-2xl p-4 lg:p-8 md:p-10 space-y-4 lg:space-y-5 max-h-[95vh] lg:max-h-[90vh] overflow-y-auto scrollbar-hide relative z-[101] shadow-xl border border-border/50"
              style={{ zIndex: 101 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTrip(null)}
                className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-full smooth-transition"
              >
                <X size={16} className="text-muted-foreground" />
              </button>

              {/* Trip Header */}
              <div className="flex items-start gap-3 pt-1">
                <div className="text-3xl">🗺️</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-1">{selectedTrip.name}</h2>
                  <p className="text-xs text-muted-foreground mb-2">{selectedTrip.location}</p>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 smooth-transition"
                    onClick={() => {
                      if (selectedTrip.createdBy?._id) {
                        // If it's the current user's own trip, redirect to profile page
                        if (selectedTrip.createdBy._id === user?._id) {
                          router.push('/profile')
                        } else {
                          router.push(`/user/${selectedTrip.createdBy._id}`)
                        }
                        setSelectedTrip(null)
                      }
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary flex items-center justify-center text-xs">
                      {selectedTrip.createdBy?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-medium text-foreground hover:text-primary smooth-transition">Created by {selectedTrip.createdBy?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-effect rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="text-xs font-semibold text-foreground">{new Date(selectedTrip.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="glass-effect rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="text-xs font-semibold text-foreground">{new Date(selectedTrip.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="glass-effect rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Members</p>
                    <p className="text-xs font-semibold text-foreground">
                      {selectedTrip.membersInvolved?.length || 0} {selectedTrip.membersInvolved?.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <div className="glass-effect rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="text-xs font-semibold text-foreground">
                      {selectedTrip.budget === 0 ? "Free" : `₹${selectedTrip.budget}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">About</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTrip.description || `Trip with ${selectedTrip.itinerary?.length || 0} activities`}
                </p>
              </div>

              {/* Itinerary Selection - Only show for non-owners */}
              {selectedTrip.itinerary && selectedTrip.itinerary.length > 0 && !isTripOwner(selectedTrip) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Select Itineraries to Join <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {selectedTrip.itinerary.map((item, index) => {
                      const itineraryId = item.id || item._id || index.toString()
                      const isSelected = selectedItineraries.includes(itineraryId)
                      
                      const formatTime = (hour) => {
                        if (hour === undefined || hour === null) return ''
                        const h = Math.floor(hour)
                        const m = Math.round((hour - h) * 60)
                        const period = h >= 12 ? "PM" : "AM"
                        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
                        return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
                      }
                      
                      return (
                        <motion.div
                          key={itineraryId}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedItineraries(prev => {
                              if (prev.includes(itineraryId)) {
                                return prev.filter(id => id !== itineraryId)
                              } else {
                                return [...prev, itineraryId]
                              }
                            })
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm">
                                {item.experienceName || item.name || `Activity ${index + 1}`}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                {item.day && (
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                )}
                                {item.startTime !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{formatTime(item.startTime)}</span>
                                    {item.endTime && <span> - {formatTime(item.endTime)}</span>}
                                  </div>
                                )}
                                {item.timeSlot && (
                                  <span className="text-primary capitalize">{item.timeSlot}</span>
                                )}
                                {item.price > 0 && (
                                  <span className="text-primary font-medium">₹{item.price}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  {selectedItineraries.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      {selectedItineraries.length} itinerary{selectedItineraries.length !== 1 ? 'ies' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Itinerary - Show as read-only for trip owners */}
              {selectedTrip.itinerary && selectedTrip.itinerary.length > 0 && isTripOwner(selectedTrip) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Itinerary ({selectedTrip.itinerary.length} activities)</h3>
                  <div className="space-y-2">
                    {selectedTrip.itinerary.map((item, index) => (
                      <div key={index} className="glass-effect rounded-lg p-3 border border-border/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">
                              {item.experienceName || item.name}
                            </span>
                            {item.timeSlot && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={12} className="text-primary" />
                                <span className="text-xs text-primary capitalize">{item.timeSlot}</span>
                              </div>
                            )}
                          </div>
                          {item.price && item.price > 0 && (
                            <div className="text-xs text-muted-foreground">
                              ₹{item.price}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {isTripOwner(selectedTrip) ? (
                <div className="space-y-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleManageRequests(selectedTrip)
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg smooth-transition silver-glow text-sm"
                  >
                    <Users size={16} className="mr-2" />
                    Manage Join Requests
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowItineraryParticipants(true)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Users size={16} className="mr-2" />
                    View Itinerary Participants
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJoinRequest(selectedTrip)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Open Trip Chat
                  </Button>
                </div>
              ) : (requestSent === (selectedTrip._id || selectedTrip.id)) || 
                   (userRequestStatus[selectedTrip._id] && userRequestStatus[selectedTrip._id].status === 'pending') ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full bg-primary/20 border border-primary rounded-lg py-3 px-4 space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
                    <Check size={16} />
                    Request Sent!
                  </div>
                  {userRequestStatus[selectedTrip._id]?.selectedItineraries && 
                   userRequestStatus[selectedTrip._id].selectedItineraries.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs font-medium text-foreground mb-1">
                        Selected Itineraries ({userRequestStatus[selectedTrip._id].selectedItineraries.length}):
                      </p>
                      <div className="space-y-1">
                        {userRequestStatus[selectedTrip._id].selectedItineraries.map((itinerary, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {itinerary.experienceName || `Itinerary ${idx + 1}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {userRequestStatus[selectedTrip._id]?.status === 'pending' && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Waiting for trip owner's response...
                    </p>
                  )}
                </motion.div>
              ) : userRequestStatus[selectedTrip._id]?.status === 'accepted' ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full bg-green-500/20 border border-green-500 rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm"
                >
                  <Check size={16} />
                  Request Accepted! You're part of this trip.
                </motion.div>
              ) : userRequestStatus[selectedTrip._id]?.status === 'rejected' ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full bg-red-500/20 border border-red-500 rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm"
                >
                  <X size={16} />
                  Request Rejected
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {/* Join Request Form */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Message to Trip Owner (Optional)
                    </label>
                    <textarea
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      placeholder="Tell the trip owner why you'd like to join..."
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {joinMessage.length}/500 characters
                    </p>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJoinRequest(selectedTrip)
                    }}
                    disabled={sendingRequest || selectedItineraries.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg smooth-transition silver-glow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingRequest ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        Request to Join Trip
                      </>
                    )}
                  </Button>
                  {selectedItineraries.length === 0 && (
                    <p className="text-xs text-red-500 text-center">
                      Please select at least one itinerary
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Requests Manager */}
      <TripRequestsManager
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        tripId={selectedTrip?._id}
        onAccept={handleAcceptRequest}
      />

      {/* Firebase Chat */}
      <FirebaseChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        chatRoom={currentChatRoom}
        currentUser={user}
      />

      {/* Itinerary Participants View */}
      <ItineraryParticipantsView
        tripId={selectedTrip?._id}
        isOpen={showItineraryParticipants}
        onClose={() => setShowItineraryParticipants(false)}
      />
    </div>
  )
}
