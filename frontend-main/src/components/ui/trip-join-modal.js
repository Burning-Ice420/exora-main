"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Loader2, Check, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import api from "@/server/api"

export default function TripJoinModal({ isOpen, onClose, trip, onSuccess }) {
  const [message, setMessage] = useState("")
  const [selectedItineraries, setSelectedItineraries] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkingRequest, setCheckingRequest] = useState(false)
  const [existingRequest, setExistingRequest] = useState(null)
  const { success, error } = useToast()

  // Reset selections when modal opens/closes or trip changes
  useEffect(() => {
    if (isOpen && trip) {
      setSelectedItineraries([])
      setMessage("")
      setExistingRequest(null)
      
      // Check for existing request
      const checkExistingRequest = async () => {
        try {
          setCheckingRequest(true)
          const response = await api.checkUserRequest(trip._id)
          if (response.status === 'success' && response.hasRequest) {
            setExistingRequest(response.request)
          }
        } catch (err) {
          console.error('Failed to check request:', err)
        } finally {
          setCheckingRequest(false)
        }
      }
      
      checkExistingRequest()
    }
  }, [isOpen, trip])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trip) return

    // Validate at least one itinerary is selected
    if (selectedItineraries.length === 0) {
      error('Selection Required', 'Please select at least one itinerary to join')
      return
    }

    try {
      setLoading(true)
      const response = await api.sendTripJoinRequest(trip._id, message, selectedItineraries)
      
      if (response.status === 'success') {
        success('Join Request Sent', `Your request to join "${trip.name}" has been sent!`)
        setMessage("")
        setSelectedItineraries([])
        onSuccess?.(response.request)
        onClose()
      } else {
        throw new Error(response.message || 'Failed to send join request')
      }
    } catch (err) {
      console.error('Failed to send join request:', err)
      error('Request Failed', err.message || 'Failed to send join request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleItinerary = (itineraryId) => {
    setSelectedItineraries(prev => {
      if (prev.includes(itineraryId)) {
        return prev.filter(id => id !== itineraryId)
      } else {
        return [...prev, itineraryId]
      }
    })
  }

  const formatTime = (hour) => {
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    const period = h >= 12 ? "PM" : "AM"
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
  }

  if (!isOpen || !trip) return null

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
          className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Join Trip</h2>
              <p className="text-sm text-muted-foreground mt-1">{trip.name}</p>
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
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            {checkingRequest ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : existingRequest ? (
              <div className="space-y-4">
                <div className="bg-primary/20 border border-primary rounded-lg py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm mb-2">
                    <Check size={16} />
                    Request Already Sent!
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Status: <span className="font-medium capitalize">{existingRequest.status}</span>
                  </p>
                  {existingRequest.selectedItineraries && existingRequest.selectedItineraries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <p className="text-xs font-medium text-foreground mb-2">
                        Selected Itineraries ({existingRequest.selectedItineraries.length}):
                      </p>
                      <div className="space-y-1">
                        {existingRequest.selectedItineraries.map((itinerary, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {itinerary.experienceName || `Itinerary ${idx + 1}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {existingRequest.status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Waiting for trip owner's response...
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Itinerary Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Select Itineraries to Join <span className="text-red-500">*</span>
                </label>
                {trip.itinerary && trip.itinerary.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {trip.itinerary.map((item, index) => {
                      const itineraryId = item.id || item._id || index.toString()
                      const isSelected = selectedItineraries.includes(itineraryId)
                      return (
                        <motion.div
                          key={itineraryId}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleItinerary(itineraryId)}
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
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                    No itineraries available for this trip
                  </div>
                )}
                {selectedItineraries.length > 0 && (
                  <p className="text-xs text-primary mt-2">
                    {selectedItineraries.length} itinerary{selectedItineraries.length !== 1 ? 'ies' : ''} selected
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message to Trip Owner (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the trip owner why you'd like to join..."
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-foreground mb-2">Trip Details</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium">Location:</span> {trip.location}</p>
                  <p><span className="font-medium">Start Date:</span> {new Date(trip.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">End Date:</span> {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            )}

            {/* Actions */}
            {!existingRequest && (
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || selectedItineraries.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
