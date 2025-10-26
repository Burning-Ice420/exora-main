"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import api from "@/server/api"

export default function TripJoinModal({ isOpen, onClose, trip, onSuccess }) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trip) return

    try {
      setLoading(true)
      const response = await api.sendTripJoinRequest(trip._id, message)
      
      if (response.status === 'success') {
        success('Join Request Sent', `Your request to join "${trip.name}" has been sent!`)
        setMessage("")
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
          className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4"
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
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
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

            {/* Actions */}
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
                disabled={loading}
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
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
