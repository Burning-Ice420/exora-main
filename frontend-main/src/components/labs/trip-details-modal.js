"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin, Eye, EyeOff, X, Search } from "lucide-react"
import LocationSearch from "@/components/ui/location-search"

export default function TripDetailsModal({ onCreateTrip, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    visibility: "public",
    budget: 10000,
  })
  const [showLocationSearch, setShowLocationSearch] = useState(false)

  const isValid = formData.name && formData.location && formData.startDate && formData.endDate

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }))
    setShowLocationSearch(false)
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        visibility: "public",
        budget: 10000,
      })
      setShowLocationSearch(false)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      onCreateTrip(formData)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border border-border rounded-xl lg:rounded-2xl p-3 lg:p-4 max-w-sm w-full space-y-3 lg:space-y-4 max-h-[95vh] lg:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Let's plan your trip!</h2>
            <p className="text-xs text-muted-foreground mt-1">Fill in the details to get started</p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 smooth-transition"
            >
              <X size={20} className="text-muted-foreground hover:text-foreground" />
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Trip Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Trip Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Summer Adventure"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Location</label>
            {formData.location ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border">
                <MapPin size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">{formData.location}</span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, location: "" }))}
                  className="ml-auto p-1 rounded hover:bg-white/10 smooth-transition"
                >
                  <X size={12} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLocationSearch(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-muted-foreground hover:text-foreground smooth-transition"
              >
                <Search size={14} />
                Search for a location...
              </button>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Budget (₹)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Trip Visibility</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: "public" }))}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 smooth-transition text-sm ${
                  formData.visibility === "public"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye size={14} />
                Public
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: "private" }))}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 smooth-transition text-sm ${
                  formData.visibility === "private"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                <EyeOff size={14} />
                Private
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Public trips show your experiences on the exora Map</p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-lg smooth-transition silver-glow text-sm"
          >
            Create Trip
          </Button>
        </form>

        {/* Location Search Modal */}
        {showLocationSearch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-2xl p-4 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Select Location</h3>
                <button
                  onClick={() => setShowLocationSearch(false)}
                  className="p-1 rounded hover:bg-white/10 smooth-transition"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <LocationSearch onLocationSelect={handleLocationSelect} value={formData.location} />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}