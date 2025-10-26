"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Check, X, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import api from "@/server/api"

export default function TripRequestsManager({ tripId, isOpen, onClose, onAccept }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const { success, error } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadRequests()
    }
  }, [isOpen, tripId])

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
          className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Join Requests</h2>
                <p className="text-sm text-muted-foreground">Manage requests to join your trip</p>
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
          <div className="p-6 overflow-y-auto max-h-[60vh]">
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
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-lg overflow-hidden">
                        {request.requesterId.profileImage?.secureUrl || request.requesterId.profileImage?.url ? (
                          <img
                            src={request.requesterId.profileImage.secureUrl || request.requesterId.profileImage.url}
                            alt={request.requesterId.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "👤"
                        )}
                      </div>

                      {/* Request Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{request.requesterId.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Wants to join your trip
                        </p>
                        {request.message && (
                          <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 mb-3">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
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
