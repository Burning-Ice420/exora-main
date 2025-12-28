"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Users, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/server/api"
import { useToast } from "@/components/ui/toast"

export default function AttendanceScreen({ tripId, tripName, isOpen, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    if (isOpen && tripId) {
      loadAttendance()
    }
  }, [isOpen, tripId])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await api.getTripAttendance(tripId)
      if (response.status === 'success') {
        const participantsData = response.participants || []
        // Ensure all fields are properly set
        const formattedParticipants = participantsData.map(p => ({
          ...p,
          attendanceStatus: p.attendanceStatus || 'pending',
          markedAt: p.markedAt || null
        }))
        setParticipants(formattedParticipants)
      }
    } catch (err) {
      console.error('Failed to load attendance:', err)
      error('Failed to Load', 'Could not load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (userId, status) => {
    // Show confirmation for no-show (penalizing action)
    if (status === 'no_show' && showConfirm !== userId) {
      setShowConfirm(userId)
      return
    }

    try {
      setMarking(userId)
      const response = await api.markAttendance(tripId, userId, status)
      
      if (response.status === 'success') {
        // Update local state immediately for better UX
        setParticipants(prev => 
          prev.map(p => 
            p.userId === userId 
              ? { 
                  ...p, 
                  attendanceStatus: status, 
                  markedAt: response.participant?.markedAt || new Date().toISOString()
                }
              : p
          )
        )
        // Also reload to ensure we have the latest data
        await loadAttendance()
        success(
          'Attendance Updated',
          status === 'showed_up' 
            ? 'Marked as Present' 
            : 'Marked as Absent'
        )
        setShowConfirm(null)
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      const errorMessage = err.message || 'Could not update attendance'
      // Check if it's a duplicate marking error
      if (errorMessage.includes('already been marked')) {
        error('Already Marked', 'This attendance has already been marked. Cannot mark again.')
      } else {
        error('Failed to Update', errorMessage)
      }
    } finally {
      setMarking(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'showed_up':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'no_show':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-muted-foreground bg-muted/10 border-border'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'showed_up':
        return <Check size={16} />
      case 'no_show':
        return <X size={16} />
      default:
        return null
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
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Attendance</h2>
              <p className="text-sm text-muted-foreground mt-1">{tripName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading attendance...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No participants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant, idx) => (
                  <motion.div
                    key={participant.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Initials Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {participant.initials}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-foreground">
                              {participant.initials}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>✨</span>
                              <span className="font-medium">{participant.exoraSpells}</span>
                              <span className="text-muted-foreground/70">spells</span>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(participant.attendanceStatus)}`}>
                            {getStatusIcon(participant.attendanceStatus)}
                            <span>
                              {participant.attendanceStatus === 'showed_up' 
                                ? 'Present' 
                                : participant.attendanceStatus === 'no_show'
                                ? 'Absent'
                                : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {(participant.attendanceStatus === 'showed_up' || participant.attendanceStatus === 'no_show') ? (
                          // Already marked - show read-only status with badge
                          <div className="flex flex-col items-end gap-1">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(participant.attendanceStatus)}`}>
                              {getStatusIcon(participant.attendanceStatus)}
                              <span>
                                {participant.attendanceStatus === 'showed_up' ? 'Present' : 'Absent'}
                              </span>
                            </div>
                            {participant.markedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(participant.markedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : showConfirm === participant.userId ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                              <AlertCircle size={14} />
                              <span>Confirm?</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowConfirm(null)}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleMarkAttendance(participant.userId, 'no_show')}
                              disabled={marking === participant.userId}
                              className="text-xs"
                            >
                              {marking === participant.userId ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                'Confirm'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(participant.userId, 'showed_up')}
                              disabled={marking === participant.userId}
                              className="text-xs"
                            >
                              {marking === participant.userId ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Check size={14} className="mr-1" />
                                  Present
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Show confirmation for absent
                                setShowConfirm(participant.userId)
                              }}
                              disabled={marking === participant.userId}
                              className="text-xs"
                            >
                              <X size={14} className="mr-1" />
                              Absent
                            </Button>
                          </>
                        )}
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

