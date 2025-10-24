"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin, Users, TrendingUp, Star, Plus } from "lucide-react"

export default function RecommendationsSidebar() {
  const trendingLocations = [
    { name: "Goa Beaches", posts: 124, emoji: "🏖️" },
    { name: "Himalayan Trek", posts: 89, emoji: "⛰️" },
    { name: "Kerala Backwaters", posts: 67, emoji: "🌴" },
    { name: "Rajasthan Desert", posts: 45, emoji: "🏜️" },
  ]

  const suggestedUsers = [
    { name: "Sarah Chen", location: "Mumbai", avatar: "👩", followers: "2.1k" },
    { name: "Marco Silva", location: "Delhi", avatar: "👨", followers: "1.8k" },
    { name: "Priya Sharma", location: "Bangalore", avatar: "👩", followers: "3.2k" },
    { name: "Alex Johnson", location: "Goa", avatar: "👨", followers: "1.5k" },
  ]

  const trendingExperiences = [
    { name: "Sunset Beach Bonfire", location: "Goa", price: "Free", participants: 12 },
    { name: "Street Food Tour", location: "Delhi", price: "₹500", participants: 8 },
    { name: "Photography Walk", location: "Mumbai", price: "₹300", participants: 15 },
    { name: "Yoga by the Lake", location: "Bangalore", price: "₹200", participants: 20 },
  ]

  return (
    <div className="w-80 bg-background border-r border-border h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Discover</h2>
        <p className="text-xs text-muted-foreground mt-1">Find your next adventure</p>
      </div>

      {/* Trending Locations */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Trending Locations</h3>
        </div>
        <div className="space-y-2">
          {trendingLocations.map((location, idx) => (
            <motion.div
              key={location.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 smooth-transition cursor-pointer"
            >
              <div className="text-2xl">{location.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{location.name}</p>
                <p className="text-xs text-muted-foreground">{location.posts} posts</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Suggested for You</h3>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((user, idx) => (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.location} • {user.followers} followers</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto">
                Follow
              </Button>
            </motion.div>
          ))}
        </div>
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
