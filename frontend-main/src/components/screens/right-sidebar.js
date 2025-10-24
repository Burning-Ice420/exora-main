"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Calendar, MapPin, Star, Plus } from "lucide-react"

export default function RightSidebar() {
  const trendingNews = [
    { title: "Goa Tourism Sees 40% Growth", time: "2h", readers: "1.2k" },
    { title: "New Adventure Trails Open", time: "4h", readers: "856" },
    { title: "Travel Safety Guidelines Updated", time: "6h", readers: "2.1k" },
    { title: "Sustainable Tourism Initiative", time: "8h", readers: "1.5k" },
  ]

  const upcomingEvents = [
    { name: "Beach Cleanup Drive", date: "Tomorrow", location: "Goa", participants: 25 },
    { name: "Photography Workshop", date: "This Weekend", location: "Mumbai", participants: 12 },
    { name: "Food Tour", date: "Next Week", location: "Delhi", participants: 18 },
  ]

  const quickActions = [
    { icon: Plus, label: "Create Post", color: "text-primary" },
    { icon: Calendar, label: "Plan Trip", color: "text-blue-500" },
    { icon: MapPin, label: "Find Events", color: "text-green-500" },
    { icon: Users, label: "Create Group", color: "text-purple-500" },
  ]

  return (
    <div className="w-80 bg-background border-l border-border h-full overflow-y-auto scrollbar-hide">
      {/* Trending News */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Travel News</h3>
        </div>
        <div className="space-y-3">
          {trendingNews.map((news, idx) => (
            <motion.div
              key={news.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="p-3 rounded-lg hover:bg-white/5 smooth-transition cursor-pointer"
            >
              <p className="text-sm font-medium text-foreground mb-1">{news.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{news.time}</span>
                <span>•</span>
                <span>{news.readers} readers</span>
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
              initial={{ opacity: 0, x: 20 }}
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
                <span className="text-xs font-semibold text-primary">{event.date}</span>
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
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 smooth-transition border border-border"
            >
              <action.icon size={20} className={action.color} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-xs">☀️</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">Weather</h3>
        </div>
        <div className="glass-effect rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">Goa, India</p>
              <p className="text-xs text-muted-foreground">Perfect for beach activities</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">28°C</p>
              <p className="text-xs text-muted-foreground">Sunny</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Humidity: 65%</span>
            <span>Wind: 12 km/h</span>
          </div>
        </div>
      </div>

      {/* Travel Tips */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Travel Tips</h3>
        </div>
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium text-primary">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground mt-1">
              Book accommodations 2-3 weeks in advance for better rates
            </p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs font-medium text-green-500">🌱 Eco-Friendly</p>
            <p className="text-xs text-muted-foreground mt-1">
              Carry a reusable water bottle to reduce plastic waste
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
