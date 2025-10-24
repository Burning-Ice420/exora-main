"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"

const TIME_SLOTS = ["morning", "afternoon", "evening", "night"]
const TIME_LABELS = {
  morning: "🌅 Morning",
  afternoon: "☀️ Afternoon",
  evening: "🌅 Evening",
  night: "🌙 Night",
}

export default function TimelineCanvas({ trip, onRemoveExperience, onSelectExperience, onAddExperience }) {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

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

  const getExperiencesForSlot = (date, timeSlot) => {
    return trip.itinerary.filter((item) => item.day === date && item.timeSlot === timeSlot)
  }

  const handleDragStart = (e, experience) => {
    setDraggedItem(experience)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, slotKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverSlot(slotKey)
  }

  const handleDrop = (e, date, timeSlot) => {
    e.preventDefault()
    setDragOverSlot(null)

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

    if (itemToAdd && onAddExperience) {
      const updatedItem = {
        ...itemToAdd,
        day: date,
        timeSlot: timeSlot,
      }
      onAddExperience(updatedItem)
      setDraggedItem(null)
    }
  }

  const handleDragLeave = () => {
    setDragOverSlot(null)
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Trip Timeline</h3>
        <p className="text-xs text-muted-foreground mt-1">{dates.length} days planned</p>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="inline-flex gap-6 p-6 min-w-full">
          {dates.map((date, dateIdx) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: dateIdx * 0.05 }}
              className="flex-shrink-0 w-72 space-y-3"
            >
              {/* Day Header */}
              <div className="glass-effect rounded-lg p-4 text-center border border-border">
                <p className="text-sm font-semibold text-foreground">Day {dateIdx + 1}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                {TIME_SLOTS.map((timeSlot) => {
                  const experiences = getExperiencesForSlot(date, timeSlot)
                  const slotKey = `${date}-${timeSlot}`
                  const isOver = dragOverSlot === slotKey

                  return (
                    <motion.div
                      key={slotKey}
                      className={`glass-effect rounded-lg p-4 min-h-28 border-2 smooth-transition space-y-3 ${
                        isOver ? "border-primary bg-primary/10" : "border-dashed border-border hover:border-primary/50"
                      }`}
                      onDragOver={(e) => handleDragOver(e, slotKey)}
                      onDrop={(e) => handleDrop(e, date, timeSlot)}
                      onDragLeave={handleDragLeave}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {TIME_LABELS[timeSlot]}
                      </p>

                      {/* Experiences in this slot */}
                      <div className="space-y-2">
                        {experiences.map((exp) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => onSelectExperience(exp)}
                            className="bg-primary/20 border border-primary/50 rounded-lg p-3 flex items-start justify-between group hover:bg-primary/30 smooth-transition cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{exp.experienceName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                              {exp.price > 0 && <p className="text-xs text-primary font-semibold mt-1">₹{exp.price}</p>}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveExperience(exp.id)
                              }}
                              className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive smooth-transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Empty state */}
                      {experiences.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-3">Drag experience here</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}