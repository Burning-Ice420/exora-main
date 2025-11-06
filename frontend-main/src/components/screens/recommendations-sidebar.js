"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MapPin, Users, Star, Calendar, Clock } from "lucide-react"
import api from "@/server/api"

export default function RecommendationsSidebar() {
  const router = useRouter()
  const [trendingExperiences, setTrendingExperiences] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true)
        const response = await api.getPublicTrips()
        const tripsData = response?.trips || response || []
        const trips = Array.isArray(tripsData) ? tripsData : []

        // Get 4 popular experiences (take first 4)
        const popular = trips.slice(0, 4).map(trip => ({
          _id: trip._id,
          name: trip.name,
          location: trip.location,
          price: trip.budget === 0 ? "Free" : `₹${trip.budget}`,
          participants: trip.membersInvolved?.length || 0,
          trip: trip
        }))

        // Get 4 upcoming events (filter by startDate, exclude already used popular ones, take next 4)
        const now = new Date()
        const popularIds = new Set(popular.map(p => p._id))
        
        // First try to find trips with future startDate
        let upcoming = trips
          .filter(trip => {
            if (!trip.startDate || popularIds.has(trip._id)) return false
            try {
              const startDate = new Date(trip.startDate)
              return !isNaN(startDate.getTime()) && startDate > now
            } catch {
              return false
            }
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 4)
        
        // If we don't have 4 upcoming events, fallback to any trips not in popular section
        if (upcoming.length < 4) {
          const remainingTrips = trips
            .filter(trip => !popularIds.has(trip._id))
            .slice(0, 4 - upcoming.length)
          upcoming = [...upcoming, ...remainingTrips]
        }
        
        // Map to the format needed for display
        const upcomingEvents = upcoming.slice(0, 4).map(trip => ({
          _id: trip._id,
          name: trip.name,
          location: trip.location,
          date: trip.startDate 
            ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : "TBD",
          time: trip.startTime || "TBD",
          participants: trip.membersInvolved?.length || 0,
          price: trip.budget === 0 ? "Free" : `₹${trip.budget}`,
          trip: trip
        }))

        setTrendingExperiences(popular)
        setUpcomingEvents(upcomingEvents)
      } catch (error) {
        console.error('Failed to load trips:', error)
        // Set empty arrays on error
        setTrendingExperiences([])
        setUpcomingEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  const handleExperienceClick = (experience) => {
    if (experience.trip) {
      // Navigate to finder with trip ID in query params
      router.push(`/finder?tripId=${experience.trip._id}`)
    }
  }

  const handleEventClick = (event) => {
    if (event.trip) {
      // Navigate to finder with trip ID in query params
      router.push(`/finder?tripId=${event.trip._id}`)
    }
  }

  return (
    <div className="w-80 bg-background border-r border-border h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Discover</h2>
        <p className="text-xs text-muted-foreground mt-1">Find your next adventure</p>
      </div>


      {/* Trending Experiences */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Popular Experiences</h3>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
          ) : trendingExperiences.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">No experiences available</div>
          ) : (
            trendingExperiences.map((experience, idx) => (
              <motion.div
                key={experience._id || experience.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => handleExperienceClick(experience)}
                className="glass-effect rounded-lg p-3 hover:bg-primary/5 hover:shadow-md smooth-transition cursor-pointer"
              >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{experience.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{experience.location}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">{experience.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{experience.participants} going</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs px-2 py-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExperienceClick(experience)
                  }}
                >
                  View
                </Button>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">No upcoming events</div>
          ) : (
            upcomingEvents.map((event, idx) => (
              <motion.div
                key={event._id || event.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => handleEventClick(event)}
                className="glass-effect rounded-lg p-3 hover:bg-primary/5 hover:shadow-md smooth-transition cursor-pointer"
              >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">{event.price}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{event.participants} going</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs px-2 py-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(event)
                  }}
                >
                  View
                </Button>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
