"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Clock, GripVertical } from "lucide-react"

// Helper functions for time calculations
const parseDuration = (duration) => {
  // Parse duration string like "2 hours", "1.5 hours", "3 hours"
  const match = duration.match(/([\d.]+)\s*hours?/)
  return match ? parseFloat(match[1]) : 2 // Default to 2 hours
}

const formatTime = (hour) => {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
}

const timeToPosition = (hour, timelineHeight) => {
  // 6 AM = 6, 12 AM = 24 (midnight)
  const startHour = 6
  const endHour = 24
  const totalHours = endHour - startHour
  const normalizedHour = hour >= 6 ? hour : hour + 24 // Handle next day
  const relativeHour = normalizedHour - startHour
  return (relativeHour / totalHours) * timelineHeight
}

const positionToTime = (y, timelineHeight, dayStart = 6) => {
  const startHour = 6
  const endHour = 24
  const totalHours = endHour - startHour
  const relativeHour = (y / timelineHeight) * totalHours
  return Math.max(dayStart, Math.min(24, startHour + relativeHour))
}

// Generate unique ID for experiences
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function TimelineCanvas({ trip, onRemoveExperience, onSelectExperience, onAddExperience, onUpdateExperience }) {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverTime, setDragOverTime] = useState(null)
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null)
  const [dragPreview, setDragPreview] = useState(null)

  const getDatesInRange = () => {
    const dates = []
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0])
    }
    return dates
  }

  const dates = getDatesInRange()

  // Check if two time ranges overlap
  const doOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1
  }

  // Calculate horizontal lanes for overlapping activities
  const calculateLanes = (experiences) => {
    if (experiences.length === 0) return []

    const lanes = experiences.map((exp) => ({
      ...exp,
      lane: -1, // -1 means not assigned yet
    }))

    // Build overlap graph
    const overlaps = Array(lanes.length)
      .fill(null)
      .map(() => [])

    for (let i = 0; i < lanes.length; i++) {
      for (let j = i + 1; j < lanes.length; j++) {
        if (doOverlap(lanes[i].startTime, lanes[i].endTime, lanes[j].startTime, lanes[j].endTime)) {
          overlaps[i].push(j)
          overlaps[j].push(i)
        }
      }
    }

    // Assign lanes using greedy coloring
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].lane === -1) {
        // Find used lanes by overlapping activities
        const usedLanes = new Set()
        overlaps[i].forEach((overlapIdx) => {
          if (lanes[overlapIdx].lane !== -1) {
            usedLanes.add(lanes[overlapIdx].lane)
          }
        })

        // Find first available lane
        let availableLane = 0
        while (usedLanes.has(availableLane)) {
          availableLane++
        }
        lanes[i].lane = availableLane
      }
    }

    // Calculate total lanes needed for this day
    const maxLane = Math.max(0, ...lanes.map((exp) => exp.lane))
    const totalLanes = maxLane + 1

    lanes.forEach((exp) => {
      exp.totalLanes = totalLanes
    })

    return lanes
  }

  // Get unique ID for an experience item (handles both MongoDB _id and frontend id)
  const getExperienceId = (item) => {
    return item.id || item._id || generateUniqueId()
  }

  // Get experiences for a specific date, sorted by start time
  const getExperiencesForDate = (date) => {
    const experiences = trip.itinerary
      .filter((item) => item.day === date)
      .map((item) => {
        // Ensure each item has a unique ID
        const uniqueId = getExperienceId(item)
        
        // Convert old timeSlot to startTime if needed
        let startTime = item.startTime
        if (!startTime && item.timeSlot) {
          const timeSlotMap = {
            morning: 9,
            afternoon: 14,
            evening: 18,
            night: 21,
          }
          startTime = timeSlotMap[item.timeSlot] || 10
        }
        if (!startTime) startTime = 10 // Default to 10 AM

        const duration = parseDuration(item.duration || "2 hours")
        const endTime = startTime + duration

        return {
          ...item,
          id: uniqueId, // Normalize to always use 'id'
          startTime,
          endTime,
        }
      })
      .sort((a, b) => a.startTime - b.startTime)

    // Calculate lanes for overlapping activities
    return calculateLanes(experiences)
  }

  // Generate hour markers (6 AM to 12 AM)
  const hourMarkers = []
  for (let hour = 6; hour <= 24; hour++) {
    hourMarkers.push(hour)
  }

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

  const handleDragStart = (e, experience) => {
    setDraggedItem(experience)
    e.dataTransfer.effectAllowed = "move"
    
    // Set the data that will be transferred
    try {
      e.dataTransfer.setData("application/json", JSON.stringify(experience))
    } catch (error) {
      console.error("Error setting drag data:", error)
    }
    
    // Create and set transparent drag image to hide browser default
    const dragImage = createDragImage(experience)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    
    // Set drag preview state for visual feedback
    setDragPreview({
      ...experience,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleDragEnd = (e) => {
    setDraggedItem(null)
    setDragPreview(null)
    setDragOverTime(null)
    setHoveredTimeSlot(null)
  }
  
  // Update drag preview position on mouse move
  useEffect(() => {
    if (!dragPreview) return
    
    const handleMouseMove = (e) => {
      setDragPreview(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
    }
    
    document.addEventListener('dragover', handleMouseMove)
    return () => {
      document.removeEventListener('dragover', handleMouseMove)
    }
  }, [dragPreview])

  const handleDragOver = (e, date, time) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverTime({ date, time })
  }

  const handleDrop = (e, date, dropTime) => {
    e.preventDefault()
    setDragOverTime(null)

    // Try to get data from dataTransfer first
    let experienceData = null
    try {
      const data = e.dataTransfer.getData("application/json")
      if (data) {
        experienceData = JSON.parse(data)
      }
    } catch (error) {
      console.log("No dataTransfer data, using draggedItem")
    }

    // Fallback to draggedItem state
    const itemToAdd = experienceData || draggedItem

    if (itemToAdd) {
      const duration = parseDuration(itemToAdd.duration || "2 hours")
      const startTime = dropTime || 10 // Default to 10 AM if no time specified
      const endTime = startTime + duration

      // Normalize ID - check both id and _id
      const itemId = itemToAdd.id || itemToAdd._id
      
      // Check if this is an existing item being moved (has an ID that exists in itinerary)
      const isExistingItem = itemId && trip.itinerary.some(item => {
        const existingId = item.id || item._id
        return existingId === itemId
      })
      
      if (isExistingItem && onUpdateExperience) {
        // Update existing item using the normalized ID
        onUpdateExperience(itemId, {
          day: date,
          startTime: startTime,
          endTime: endTime,
          timeSlot: startTime < 12 ? "morning" : startTime < 17 ? "afternoon" : startTime < 21 ? "evening" : "night",
        })
      } else if (onAddExperience) {
        // Add new item with unique ID (only generate if doesn't already have one)
        const updatedItem = {
          ...itemToAdd,
          id: itemId || generateUniqueId(), // Use existing ID or generate new one
          _id: undefined, // Remove _id to avoid confusion
          day: date,
          startTime: startTime,
          endTime: endTime,
          // Keep timeSlot for backward compatibility but prioritize startTime
          timeSlot: startTime < 12 ? "morning" : startTime < 17 ? "afternoon" : startTime < 21 ? "evening" : "night",
          // Explicitly preserve image fields
          image: itemToAdd.image || null,
          images: Array.isArray(itemToAdd.images) ? itemToAdd.images.filter(img => img && typeof img === 'string') : (itemToAdd.images || [])
        }
        console.log('[Timeline Canvas] Adding item with images:', {
          hasImage: !!updatedItem.image,
          imagesCount: updatedItem.images?.length || 0
        })
        onAddExperience(updatedItem)
      }
      setDraggedItem(null)
    }
  }

  const handleDragLeave = () => {
    setDragOverTime(null)
  }


  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
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
              {dragPreview.experienceName || dragPreview.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {dragPreview.startTime ? 
                `${formatTime(dragPreview.startTime)} - ${formatTime(dragPreview.endTime || dragPreview.startTime + parseDuration(dragPreview.duration || "2 hours"))}` :
                dragPreview.duration || '2 hours'
              }
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
      <div className="px-6 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Trip Timeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{dates.length} days planned</p>
          </div>
        </div>
      </div>

      {/* Google Calendar Style Timeline */}
      <div className="flex-1 overflow-hidden flex">
        {/* Fixed Time Column (Google Calendar style) */}
        <div className="w-16 flex-shrink-0 border-r border-border/50 bg-background/50 flex flex-col">
          {/* Spacer for day headers - matches day header height */}
          <div className="h-12 border-b border-border/50 flex-shrink-0 bg-background/50"></div>
          {/* Time labels container - scrollable */}
          <div 
            className="time-column-scroll flex-1 overflow-y-auto overflow-x-hidden"
            style={{ height: 'calc(100% - 3rem)' }}
          >
            <div className="relative" style={{ height: '1080px' }}>
              {hourMarkers.map((hour) => {
                const hourHeight = 60 // 60px per hour
                const startHour = 6
                const normalizedHour = hour >= 6 ? hour : hour + 24
                const position = (normalizedHour - startHour) * hourHeight
                
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 flex items-start"
                    style={{ top: `${position}px` }}
                  >
                    <div className="w-full px-2 text-xs text-muted-foreground font-normal leading-none">
                      {hour === 24 ? '12 AM' : formatTime(hour)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Days Container */}
        <div 
          className="flex-1 overflow-x-auto overflow-y-auto"
          onScroll={(e) => {
            // Sync time column scroll with days container (vertical only)
            const timeColumn = e.currentTarget.parentElement?.querySelector('.time-column-scroll')
            if (timeColumn) {
              timeColumn.scrollTop = e.currentTarget.scrollTop
            }
          }}
        >
          <div className="inline-flex min-w-full">
            {dates.map((date, dateIdx) => {
              const experiences = getExperiencesForDate(date)
              const hourHeight = 60 // 60px per hour (Google Calendar style)
              const totalHours = 24 - 6 // 6 AM to 12 AM (18 hours)
              const timelineHeight = totalHours * hourHeight // 1080px
              const isOver = dragOverTime?.date === date

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: dateIdx * 0.03 }}
                  className="flex-shrink-0 w-64 flex flex-col border-r border-border/30"
                >
                  {/* Day Header (Google Calendar style) */}
                  <div className="h-12 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="h-full flex flex-col items-center justify-center px-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(date).getDate()}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Grid Container */}
                  <div
                    className={`relative flex-1 bg-background ${
                      isOver ? "bg-primary/5" : ""
                    }`}
                    style={{ height: `${timelineHeight}px`, minHeight: `${timelineHeight}px` }}
                    onDragOver={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const y = e.clientY - rect.top
                      // Convert pixel position to time (60px per hour)
                      const startHour = 6
                      const hoursFromStart = y / hourHeight
                      const time = startHour + hoursFromStart
                      handleDragOver(e, date, Math.max(6, Math.min(24, time)))
                      setHoveredTimeSlot(Math.max(6, Math.min(24, time)))
                    }}
                    onDragLeave={(e) => {
                      handleDragLeave()
                      setHoveredTimeSlot(null)
                    }}
                    onDrop={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const y = e.clientY - rect.top
                      // Convert pixel position to time (60px per hour)
                      const startHour = 6
                      const hoursFromStart = y / hourHeight
                      const time = startHour + hoursFromStart
                      handleDrop(e, date, Math.max(6, Math.min(24, time)))
                      setHoveredTimeSlot(null)
                    }}
                  >
                    {/* Hour Grid Lines (Google Calendar style) */}
                    <div className="absolute inset-0">
                      {hourMarkers.map((hour) => {
                        const startHour = 6
                        const normalizedHour = hour >= 6 ? hour : hour + 24
                        const position = (normalizedHour - startHour) * hourHeight

                        return (
                          <div
                            key={hour}
                            className="absolute left-0 right-0 border-t border-border/30"
                            style={{ top: `${position}px` }}
                          />
                        )
                      })}
                    </div>

                    {/* Activities positioned by time */}
                    <div className="absolute inset-0 px-1">
                      {experiences.map((exp) => {
                        const startHour = 6
                        const startNormalized = exp.startTime >= 6 ? exp.startTime : exp.startTime + 24
                        const endNormalized = exp.endTime >= 6 ? exp.endTime : exp.endTime + 24
                        const startPos = (startNormalized - startHour) * hourHeight
                        const endPos = (endNormalized - startHour) * hourHeight
                        const height = Math.max(endPos - startPos, 40) // Minimum height
                        
                        // Calculate width and position based on lanes
                        const totalLanes = exp.totalLanes || 1
                        const lane = exp.lane || 0
                        const gap = 2 // px gap between lanes
                        const availableWidth = 100 // percentage
                        const laneWidth = Math.max(25, (availableWidth - (gap * (totalLanes - 1))) / totalLanes)
                        const leftOffset = lane * (laneWidth + gap)

                        const isDragging = draggedItem?.id === exp.id
                        
                        return (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ 
                              opacity: isDragging ? 0.5 : 1, 
                              y: 0,
                              scale: isDragging ? 0.98 : 1,
                              zIndex: isDragging ? 50 : 1
                            }}
                            exit={{ opacity: 0, y: -5 }}
                            draggable={true}
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, exp)
                            }}
                            onDragEnd={(e) => {
                              e.stopPropagation()
                              handleDragEnd(e)
                            }}
                            onClick={(e) => {
                              // Don't select if clicking delete button
                              if (e.target.closest('button')) return
                              onSelectExperience(exp)
                            }}
                            className="absolute group cursor-grab active:cursor-grabbing select-none touch-none"
                            style={{
                              top: `${startPos}px`,
                              height: `${height}px`,
                              left: `${leftOffset}%`,
                              width: `${laneWidth}%`,
                              pointerEvents: isDragging ? 'none' : 'auto',
                            }}
                          >
                            {/* Google Calendar style event block */}
                            <div 
                              className="h-full bg-primary/10 hover:bg-primary/15 border-l-2 border-primary rounded-sm p-1.5 flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md"
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                            >
                              <div className="flex items-start justify-between gap-1 flex-1 min-h-0">
                                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                  {/* Experience Image */}
                                  {(exp.image || (exp.images && exp.images.length > 0)) && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden border border-border/20 pointer-events-none">
                                      <img
                                        src={exp.image || exp.images[0]}
                                        alt={exp.experienceName || 'Experience'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none'
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
                                    <GripVertical size={10} className="text-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0 cursor-grab active:cursor-grabbing pointer-events-none">
                                    <p className="text-xs font-medium text-foreground leading-tight truncate">
                                      {exp.experienceName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                      {formatTime(exp.startTime)} - {formatTime(exp.endTime)}
                                    </p>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onRemoveExperience(exp.id)
                                  }}
                                  onMouseDown={(e) => {
                                    // Prevent drag when clicking delete button
                                    e.stopPropagation()
                                  }}
                                  onDragStart={(e) => {
                                    // Prevent drag when clicking delete button
                                    e.stopPropagation()
                                    e.preventDefault()
                                  }}
                                  className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-opacity opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer z-10"
                                  style={{ pointerEvents: 'auto' }}
                                  draggable={false}
                                >
                                  <Trash2 size={10} />
                                </motion.button>
                              </div>
                              {exp.price > 0 && (
                                <p className="text-[10px] text-primary font-medium mt-0.5 pointer-events-none">₹{exp.price}</p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* Drop indicator (Google Calendar style) */}
                      {isOver && hoveredTimeSlot && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{
                            top: `${(hoveredTimeSlot - 6) * hourHeight}px`,
                          }}
                        >
                          <div className="relative">
                            <div className="absolute left-0 w-1 h-1 rounded-full bg-primary -translate-x-1/2" />
                            <div className="h-0.5 bg-primary" />
                          </div>
                        </div>
                      )}

                      {/* Empty state */}
                      {experiences.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-xs text-muted-foreground/60 text-center px-4">
                            Drag experiences here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}