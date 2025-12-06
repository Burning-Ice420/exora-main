"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X, Calendar, Clock } from "lucide-react"

// Helper to format time
const formatTime = (hour) => {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
}

// Parse duration
const parseDuration = (duration) => {
  const match = duration.match(/([\d.]+)\s*hours?/)
  return match ? parseFloat(match[1]) : 2
}

export default function ExperienceSidebar({ onAddExperience, trip }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dragPreview, setDragPreview] = useState(null)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedHour, setSelectedHour] = useState(10)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customExperience, setCustomExperience] = useState({
    name: "",
    duration: "2 hours",
    price: 0,
    category: "Activity"
  })

  
  // Create custom drag image (transparent to hide browser default)
  const createDragImage = (experience) => {
    // Create a transparent 1x1 pixel image to hide the browser's default drag image
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 1, 1)
    
    // Create an invisible image element
    const img = new Image()
    img.src = canvas.toDataURL()
    return img
  }

  // Fetch experiences from API
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const token = document.cookie.split(';').find(c => c.trim().startsWith('authToken='))?.split('=')[1]
        
        const params = new URLSearchParams({
          limit: '50',
          page: '1',
          ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory })
        })

        const response = await fetch(`${API_BASE_URL}/api/experiences?${params}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Transform experiences to match expected format
          const transformedExperiences = (data.experiences || []).map(exp => ({
            id: exp.id,
            name: exp.name,
            duration: exp.duration || '2 hours',
            price: exp.price || 0,
            category: exp.category || 'Activity'
          }))
          setExperiences(transformedExperiences)
        } else {
          console.error('Failed to fetch experiences')
          setExperiences([])
        }
      } catch (error) {
        console.error('Error fetching experiences:', error)
        setExperiences([])
      } finally {
        setLoading(false)
      }
    }

    fetchExperiences()
  }, [selectedCategory])

  const categories = Array.from(new Set(experiences.map((exp) => exp.category)))

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || exp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Generate unique ID for experiences
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get available dates from trip
  const getAvailableDates = () => {
    if (!trip) return []
    const dates = []
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0])
    }
    return dates
  }

  const handleAddClick = (experience) => {
    setSelectedExperience(experience)
    const dates = getAvailableDates()
    if (dates.length > 0) {
      setSelectedDay(dates[0]) // Default to first day
    }
    setSelectedHour(10) // Default to 10 AM
    setSelectedMinute(0)
    setShowTimeModal(true)
  }

  const handleConfirmAdd = () => {
    if (!selectedExperience || !selectedDay) return

    const duration = parseDuration(selectedExperience.duration || "2 hours")
    const startTime = selectedHour + selectedMinute / 60
    const endTime = startTime + duration

    const newItem = {
      id: generateUniqueId(),
      day: selectedDay,
      startTime: startTime,
      endTime: endTime,
      timeSlot: startTime < 12 ? "morning" : startTime < 17 ? "afternoon" : startTime < 21 ? "evening" : "night",
      experienceId: selectedExperience.id,
      experienceName: selectedExperience.name,
      price: selectedExperience.price,
      duration: selectedExperience.duration,
      category: selectedExperience.category,
    }

    onAddExperience(newItem)
    setShowTimeModal(false)
    setSelectedExperience(null)
  }

  const handleAddExperience = (experience) => {
    const duration = parseDuration(experience.duration || "2 hours")
    const defaultStartTime = 10 // Default to 10 AM
    const newItem = {
      id: generateUniqueId(), // Use unique ID generator
      day: trip.startDate,
      startTime: defaultStartTime,
      endTime: defaultStartTime + duration,
      timeSlot: "morning", // Keep for backward compatibility
      experienceId: experience.id,
      experienceName: experience.name,
      price: experience.price,
      duration: experience.duration,
    }
    onAddExperience(newItem)
  }

  // Update drag preview position on mouse move
  useEffect(() => {
    if (!dragPreview) return
    
    const handleDragMove = (e) => {
      setDragPreview(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
    }
    
    document.addEventListener('dragover', handleDragMove)
    return () => {
      document.removeEventListener('dragover', handleDragMove)
    }
  }, [dragPreview])

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Drag Preview Overlay - Follows cursor */}
      {dragPreview && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-primary/15 border-2 border-primary rounded-md p-2.5 shadow-2xl backdrop-blur-sm min-w-[180px] max-w-[220px]">
            <div className="text-xs font-semibold text-foreground mb-1.5 truncate">
              {dragPreview.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {dragPreview.duration || '2 hours'}
            </div>
            {dragPreview.price > 0 && (
              <div className="text-[10px] text-primary font-medium mt-1">
                ₹{dragPreview.price}
              </div>
            )}
          </div>
        </div>
      )}

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
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading experiences...</p>
            </motion.div>
          ) : filteredExperiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No experiences match your search' : 'No experiences available. Check back later!'}
              </p>
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
                  const duration = parseDuration(exp.duration || "2 hours")
                  const defaultStartTime = 10 // Default to 10 AM
                  const newItem = {
                    id: generateUniqueId(), // Use unique ID generator
                    day: trip.startDate,
                    startTime: defaultStartTime,
                    endTime: defaultStartTime + duration,
                    timeSlot: "morning", // Keep for backward compatibility
                    experienceId: exp.id,
                    experienceName: exp.name,
                    price: exp.price,
                    duration: exp.duration,
                    category: exp.category
                  }
                  
                  // Create and set transparent drag image to hide browser default
                  const dragImage = createDragImage(exp)
                  e.dataTransfer.setDragImage(dragImage, 0, 0)
                  
                  e.dataTransfer.setData("application/json", JSON.stringify(newItem))
                  e.dataTransfer.effectAllowed = "move"
                  
                  // Set drag preview for visual feedback
                  setDragPreview({
                    ...exp,
                    x: e.clientX,
                    y: e.clientY
                  })
                }}
                onDragEnd={(e) => {
                  setDragPreview(null)
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddClick(exp)
                    }}
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
        onClick={() => setShowCustomModal(true)}
        className="m-6 glass-effect rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-white/10 smooth-transition text-primary font-semibold border border-border"
      >
        <Plus size={18} />
        Add Custom
      </motion.button>

      {/* Custom Experience Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl"
              style={{ width: "70%", left: "15%", maxHeight: "85vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Modal Content */}
              <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 20px)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Add Custom Experience</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create your own activity</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCustomModal(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 smooth-transition"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Experience Name *
                    </label>
                    <input
                      type="text"
                      value={customExperience.name}
                      onChange={(e) => setCustomExperience({ ...customExperience, name: e.target.value })}
                      placeholder="e.g., Private Beach Tour"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={customExperience.duration}
                      onChange={(e) => setCustomExperience({ ...customExperience, duration: e.target.value })}
                      placeholder="e.g., 2 hours, 3.5 hours"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={customExperience.price}
                      onChange={(e) => setCustomExperience({ ...customExperience, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Category
                    </label>
                    <select
                      value={customExperience.category}
                      onChange={(e) => setCustomExperience({ ...customExperience, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Activity">Activity</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Culture">Culture</option>
                      <option value="Food">Food</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Beach">Beach</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Entertainment">Entertainment</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCustomModal(false)
                        setCustomExperience({ name: "", duration: "2 hours", price: 0, category: "Activity" })
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-white/5 text-foreground hover:bg-white/10 smooth-transition"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!customExperience.name.trim()) {
                          alert("Please enter an experience name")
                          return
                        }
                        
                        const customExp = {
                          id: generateUniqueId(),
                          name: customExperience.name,
                          duration: customExperience.duration,
                          price: customExperience.price,
                          category: customExperience.category
                        }
                        
                        // Add to timeline with default time
                        const dates = getAvailableDates()
                        if (dates.length > 0) {
                          const duration = parseDuration(customExp.duration || "2 hours")
                          const defaultStartTime = 10
                          const newItem = {
                            id: generateUniqueId(),
                            day: dates[0],
                            startTime: defaultStartTime,
                            endTime: defaultStartTime + duration,
                            timeSlot: "morning",
                            experienceId: customExp.id,
                            experienceName: customExp.name,
                            price: customExp.price,
                            duration: customExp.duration,
                            category: customExp.category
                          }
                          onAddExperience(newItem)
                        } else {
                          // If no trip dates, just add with basic info
                          onAddExperience({
                            ...customExp,
                            day: trip?.startDate || new Date().toISOString().split('T')[0],
                            startTime: 10,
                            endTime: 12,
                            timeSlot: "morning"
                          })
                        }
                        
                        setShowCustomModal(false)
                        setCustomExperience({ name: "", duration: "2 hours", price: 0, category: "Activity" })
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition font-semibold"
                    >
                      Add to Timeline
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Time and Day Selection Modal - Draggable Bottom Sheet */}
      <AnimatePresence>
        {showTimeModal && selectedExperience && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimeModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Draggable Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                // If dragged down more than 100px, close the modal
                if (info.offset.y > 100) {
                  setShowTimeModal(false)
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl"
              style={{ width: "70%", left: "15%", maxHeight: "85vh" }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Modal Content */}
              <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 20px)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Schedule Experience</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedExperience.name}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTimeModal(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 smooth-transition"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Day Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Calendar size={14} />
                      Select Day
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {getAvailableDates().map((date, idx) => {
                        const dateObj = new Date(date)
                        const isSelected = selectedDay === date
                        return (
                          <motion.button
                            key={date}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDay(date)}
                            className={`p-3 rounded-lg border-2 smooth-transition text-sm ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border bg-white/5 text-foreground hover:border-primary/50"
                            }`}
                          >
                            <div className="text-xs text-muted-foreground mb-1">
                              Day {idx + 1}
                            </div>
                            <div className="font-medium">
                              {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Clock size={14} />
                      Select Time
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      {/* Hour */}
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Hour</label>
                        <select
                          value={selectedHour}
                          onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Array.from({ length: 18 }, (_, i) => {
                            const hour = i + 6
                            return (
                              <option key={hour} value={hour}>
                                {formatTime(hour)}
                              </option>
                            )
                          })}
                        </select>
                      </div>

                      {/* Minute */}
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Minute</label>
                        <select
                          value={selectedMinute}
                          onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {[0, 15, 30, 45].map((min) => (
                            <option key={min} value={min}>
                              {min.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Duration: {selectedExperience.duration || "2 hours"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTimeModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white/5 text-foreground hover:bg-white/10 smooth-transition font-medium text-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmAdd}
                      disabled={!selectedDay}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground smooth-transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Timeline
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}