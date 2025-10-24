"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus } from "lucide-react"

const SUGGESTED_EXPERIENCES = [
  { id: "exp_1", name: "Windsurfing at Baga Beach", duration: "2 hours", price: 1200, category: "Adventure" },
  { id: "exp_2", name: "Cafe La Plage Sunset", duration: "1.5 hours", price: 500, category: "Dining" },
  { id: "exp_3", name: "Spice Plantation Tour", duration: "3 hours", price: 800, category: "Culture" },
  { id: "exp_4", name: "Yoga & Meditation", duration: "1 hour", price: 300, category: "Wellness" },
  { id: "exp_5", name: "Night Market Walk", duration: "2 hours", price: 0, category: "Culture" },
  { id: "exp_6", name: "Beach Bonfire", duration: "2 hours", price: 400, category: "Social" },
  { id: "exp_7", name: "Water Sports Package", duration: "4 hours", price: 2000, category: "Adventure" },
  { id: "exp_8", name: "Photography Tour", duration: "3 hours", price: 600, category: "Creative" },
]

export default function ExperienceSidebar({ onAddExperience, trip }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = Array.from(new Set(SUGGESTED_EXPERIENCES.map((exp) => exp.category)))

  const filteredExperiences = SUGGESTED_EXPERIENCES.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || exp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddExperience = (experience) => {
    const newItem = {
      id: Date.now().toString(),
      day: trip.startDate,
      timeSlot: "morning",
      experienceId: experience.id,
      experienceName: experience.name,
      price: experience.price,
      duration: experience.duration,
    }
    onAddExperience(newItem)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground mb-4">Suggested for Goa</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium smooth-transition ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium smooth-transition ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Experiences List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence>
          {filteredExperiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-sm text-muted-foreground">No experiences found</p>
            </motion.div>
          ) : (
            filteredExperiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                draggable
                onDragStart={(e) => {
                  const newItem = {
                    id: Date.now().toString(),
                    day: trip.startDate,
                    timeSlot: "morning",
                    experienceId: exp.id,
                    experienceName: exp.name,
                    price: exp.price,
                    duration: exp.duration,
                    category: exp.category
                  }
                  e.dataTransfer.setData("application/json", JSON.stringify(newItem))
                  e.dataTransfer.effectAllowed = "move"
                }}
                className="glass-effect rounded-lg p-4 space-y-2 hover:bg-white/10 smooth-transition group cursor-grab active:cursor-grabbing border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{exp.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddExperience(exp)}
                    className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 smooth-transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white/10 text-muted-foreground px-2 py-1 rounded">{exp.category}</span>
                  {exp.price > 0 && <span className="text-xs font-semibold text-primary">₹{exp.price}</span>}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Custom Experience */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="m-6 glass-effect rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-white/10 smooth-transition text-primary font-semibold border border-border"
      >
        <Plus size={18} />
        Add Custom
      </motion.button>
    </div>
  )
}