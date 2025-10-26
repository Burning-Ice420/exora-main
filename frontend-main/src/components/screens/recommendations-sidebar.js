"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MapPin, Users, Star, Plus, Calendar, Clock } from "lucide-react"

export default function RecommendationsSidebar() {
  const router = useRouter()
  

  const trendingExperiences = [
    { name: "Sunset Beach Bonfire", location: "Goa", price: "Free", participants: 12 },
    { name: "Street Food Tour", location: "Delhi", price: "₹500", participants: 8 },
    { name: "Photography Walk", location: "Mumbai", price: "₹300", participants: 15 },
    { name: "Yoga by the Lake", location: "Bangalore", price: "₹200", participants: 20 },
  ]

  const upcomingEvents = [
    { 
      name: "Mumbai Food Festival", 
      location: "Mumbai", 
      date: "Dec 15, 2024", 
      time: "6:00 PM", 
      participants: 45,
      price: "₹300"
    },
    { 
      name: "Goa Beach Cleanup", 
      location: "Goa", 
      date: "Dec 20, 2024", 
      time: "8:00 AM", 
      participants: 28,
      price: "Free"
    },
    { 
      name: "Delhi Heritage Walk", 
      location: "Delhi", 
      date: "Dec 22, 2024", 
      time: "10:00 AM", 
      participants: 15,
      price: "₹150"
    },
    { 
      name: "Bangalore Tech Meetup", 
      location: "Bangalore", 
      date: "Dec 25, 2024", 
      time: "2:00 PM", 
      participants: 60,
      price: "₹200"
    },
  ]

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
          {trendingExperiences.map((experience, idx) => (
            <motion.div
              key={experience.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="glass-effect rounded-lg p-3 hover:bg-white/10 smooth-transition cursor-pointer"
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
                <Button size="sm" variant="ghost" className="text-xs px-2 py-1 h-auto">
                  Join
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event, idx) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="glass-effect rounded-lg p-3 hover:bg-white/10 smooth-transition cursor-pointer"
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
                <Button size="sm" variant="ghost" className="text-xs px-2 py-1 h-auto">
                  Join
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start text-sm py-2">
            <MapPin size={14} className="mr-2" />
            Find Nearby Events
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm py-2">
            <Users size={14} className="mr-2" />
            Create Group Trip
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm py-2">
            <Star size={14} className="mr-2" />
            Share Experience
          </Button>
        </div>
      </div>
    </div>
  )
}
