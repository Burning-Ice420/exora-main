"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Loader2, Calendar, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/server/api"
import { useToast } from "@/components/ui/toast"

export default function ItineraryParticipantsView({ tripId, isOpen, onClose }) {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(false)
  const { error } = useToast()

  useEffect(() => {
    if (isOpen && tripId) {
      loadParticipants()
    }
  }, [isOpen, tripId])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      const response = await api.getItineraryParticipants(tripId)
      if (response.status === 'success') {
        setItineraries(response.itineraries || [])
      }
    } catch (err) {
      console.error('Failed to load itinerary participants:', err)
      error('Failed to Load', 'Could not load itinerary participants')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (hour) => {
    if (hour === undefined || hour === null) return ''
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    const period = h >= 12 ? "PM" : "AM"
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Users size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Itinerary Participants</h2>
                  <p className="text-sm text-muted-foreground">See who's joining each activity</p>
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
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Itineraries Yet</h3>
              <p className="text-muted-foreground">Add itineraries to your trip to see participants here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itineraries.map((itinerary, idx) => {
                const participants = itinerary.participants || []
                const itineraryId = itinerary.id || itinerary._id || idx.toString()
                
                return (
                  <motion.div
                    key={itineraryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    {/* Itinerary Header */}
                    <div className="mb-3">
                      <div className="flex items-start gap-3 mb-2">
                        {/* Experience Image */}
                        {(itinerary.image || (itinerary.images && itinerary.images.length > 0)) && (
                          <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border border-border/20">
                            <img
                              src={itinerary.image || itinerary.images[0]}
                              alt={itinerary.experienceName || itinerary.name || 'Experience'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg">
                            {itinerary.experienceName || itinerary.name || `Activity ${idx + 1}`}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {itinerary.day && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(itinerary.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                        {itinerary.startTime !== undefined && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {formatTime(itinerary.startTime)}
                              {itinerary.endTime && ` - ${formatTime(itinerary.endTime)}`}
                            </span>
                          </div>
                        )}
                        {itinerary.price > 0 && (
                          <span className="text-primary font-medium">₹{itinerary.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Participants ({participants.length})
                        </span>
                      </div>
                      {participants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {participants.map((participant, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                                {participant.profileImage?.secureUrl || participant.profileImage?.url ? (
                                  <img
                                    src={participant.profileImage.secureUrl || participant.profileImage.url}
                                    alt={participant.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  participant.name?.charAt(0) || '👤'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {participant.name}
                                </p>
                                {participant.joinedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Joined {new Date(participant.joinedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
                          No participants yet
                        </div>
                      )}
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
  )
}

