"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Check, X, MessageCircle, Loader2, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/server/api"

export default function TripRequestsManager({ tripId, isOpen, onClose, onAccept }) {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [expandedItineraries, setExpandedItineraries] = useState({}) // Track which request's itineraries are expanded
  const { success, error } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadRequests()
      // Reset expanded state when modal opens
      setExpandedItineraries({})
    }
  }, [isOpen, tripId])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && Object.keys(expandedItineraries).length > 0) {
        const target = event.target
        // Check if click is outside the dropdown
        if (!target.closest('[data-itinerary-dropdown]')) {
          setExpandedItineraries({})
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, expandedItineraries])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await api.getMyTripRequestsAsOwner()
      if (response.status === 'success') {
        // Filter requests for the specific trip if tripId is provided
        const allRequests = response.requests || []
        const filteredRequests = tripId 
          ? allRequests.filter(req => req.tripId?._id === tripId)
          : allRequests
        // Log for debugging
        console.log('Loaded requests:', filteredRequests.map(r => ({
          id: r._id,
          name: r.requesterId?.name,
          hasSelectedItineraries: !!r.selectedItineraries,
          itineraryCount: r.selectedItineraries?.length || 0
        })))
        setRequests(filteredRequests)
      }
    } catch (err) {
      console.error('Failed to load requests:', err)
      error('Failed to Load', 'Could not load join requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }))
      const response = await api.acceptTripJoinRequest(requestId)
      
      if (response.status === 'success') {
        success('Request Accepted', 'User has been added to the trip chat!')
        setRequests(prev => prev.filter(req => req._id !== requestId))
        onAccept?.(response.chatRoom)
      } else {
        throw new Error(response.message || 'Failed to accept request')
      }
    } catch (err) {
      console.error('Failed to accept request:', err)
      error('Action Failed', err.message || 'Failed to accept request')
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleReject = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }))
      const response = await api.rejectTripJoinRequest(requestId)
      
      if (response.status === 'success') {
        success('Request Rejected', 'Join request has been rejected')
        setRequests(prev => prev.filter(req => req._id !== requestId))
      } else {
        throw new Error(response.message || 'Failed to reject request')
      }
    } catch (err) {
      console.error('Failed to reject request:', err)
      error('Action Failed', err.message || 'Failed to reject request')
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl mx-2 lg:mx-4 max-h-[85vh] lg:max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 lg:p-6 border-b border-border">
            <div className="flex items-center gap-2 lg:gap-3">
              <Users size={24} className="text-primary" />
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Join Requests</h2>
                <p className="text-xs lg:text-sm text-muted-foreground">Manage requests to join your trip</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 lg:p-6 overflow-y-auto max-h-[65vh] lg:max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Requests Yet</h3>
                <p className="text-muted-foreground">Join requests will appear here when users want to join your trip.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request, idx) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Privacy-first: Show only initials + spells */}
                      <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {request.requester?.initials || 
                           (request.requesterId?.name 
                             ? request.requesterId.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                             : 'U')}
                        </span>
                      </div>
                      {/* Request Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {request.requester?.initials || 
                             (request.requesterId?.name 
                               ? request.requesterId.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                               : 'U')}
                          </h4>
                          {request.requester?.exoraSpells !== undefined && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              ✨ {request.requester.exoraSpells} spells
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Wants to join your trip
                        </p>
                        {request.message && (
                          <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 mb-3">
                            "{request.message}"
                          </p>
                        )}
                        {request.selectedItineraries && request.selectedItineraries.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-foreground mb-2">
                              Selected Itineraries: {request.selectedItineraries.length}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Itineraries Dropdown - Always show if there are selected itineraries */}
                        {request.selectedItineraries && request.selectedItineraries.length > 0 ? (
                          <div className="relative" data-itinerary-dropdown>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedItineraries(prev => ({
                                  ...prev,
                                  [request._id]: !prev[request._id]
                                }))
                              }}
                              className="text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-1.5 px-2"
                            >
                              <span className="text-xs font-medium">Itineraries</span>
                              {expandedItineraries[request._id] ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </Button>
                            
                            {/* Dropdown Content */}
                            <AnimatePresence>
                              {expandedItineraries[request._id] && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-xl z-50 p-3 max-h-[300px] overflow-y-auto"
                                >
                                  <p className="text-xs font-semibold text-foreground mb-3">
                                    Selected Itineraries ({request.selectedItineraries.length})
                                  </p>
                                  <div className="space-y-2">
                                    {request.selectedItineraries.map((itinerary, idx) => {
                                      const formatTime = (hour) => {
                                        if (hour === undefined || hour === null) return ''
                                        const h = Math.floor(hour)
                                        const m = Math.round((hour - h) * 60)
                                        const period = h >= 12 ? "PM" : "AM"
                                        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
                                        return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
                                      }
                                      
                                      return (
                                        <div key={idx} className="bg-muted/30 rounded-md p-2 border border-border/50">
                                          <p className="text-xs font-medium text-foreground mb-1.5">
                                            {itinerary.experienceName || `Itinerary ${idx + 1}`}
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {itinerary.day && (
                                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar size={10} />
                                                <span>{new Date(itinerary.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                              </div>
                                            )}
                                            {itinerary.startTime !== undefined && (
                                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock size={10} />
                                                <span>
                                                  {formatTime(itinerary.startTime)}
                                                  {itinerary.endTime && ` - ${formatTime(itinerary.endTime)}`}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : null}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request._id)}
                          disabled={actionLoading[request._id]}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          {actionLoading[request._id] ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request._id)}
                          disabled={actionLoading[request._id]}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {actionLoading[request._id] ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
