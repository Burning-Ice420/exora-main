"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MapPin, Calendar, X, Save, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import TripDetailsModal from "@/components/labs/trip-details-modal"
import TimelineCanvas from "@/components/labs/timeline-canvas"
import ExperienceSidebar from "@/components/labs/experience-sidebar"
import api from "@/server/api"

export default function LabsScreen() {
  const [showTripModal, setShowTripModal] = useState(false)
  const [trip, setTrip] = useState(null)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedTrips, setSavedTrips] = useState([])
  const [savedBlocks, setSavedBlocks] = useState([])

  // Load saved trips and blocks on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setLoading(true)
        const [tripsResponse, blocksResponse] = await Promise.all([
          api.getTrips(),
          api.getMyBlocks()
        ])
        
        // Extract the actual data from the response
        const trips = tripsResponse?.trips || tripsResponse || []
        const blocks = blocksResponse?.blocks || blocksResponse || []
        
        setSavedTrips(trips)
        setSavedBlocks(blocks)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedData()
  }, [])

  // Load current trip from localStorage on mount
  useEffect(() => {
    const savedTrip = localStorage.getItem('currentTrip')
    if (savedTrip) {
      try {
        const tripData = JSON.parse(savedTrip)
        setTrip(tripData)
      } catch (error) {
        console.error('Failed to load trip from localStorage:', error)
        localStorage.removeItem('currentTrip')
      }
    }
  }, [])

  const handleCreateTrip = (tripData) => {
    const newTrip = {
      ...tripData,
      id: Date.now().toString(),
      itinerary: [],
    }
    setTrip(newTrip)
    setShowTripModal(false)
    
    // Save to localStorage for persistence
    localStorage.setItem('currentTrip', JSON.stringify(newTrip))
  }

  const handleAddExperience = (experience) => {
    if (trip) {
      const updatedTrip = {
        ...trip,
        itinerary: [...trip.itinerary, experience],
      }
      setTrip(updatedTrip)
      
      // Save to localStorage for persistence
      localStorage.setItem('currentTrip', JSON.stringify(updatedTrip))
    }
  }

  const handleRemoveExperience = (id) => {
    if (trip) {
      const updatedTrip = {
        ...trip,
        itinerary: trip.itinerary.filter((item) => item.id !== id),
      }
      setTrip(updatedTrip)
      
      // Save to localStorage for persistence
      localStorage.setItem('currentTrip', JSON.stringify(updatedTrip))
    }
  }

  const handleSaveTrip = async () => {
    try {
      setSaving(true)
      
      // Create blocks for each experience in the itinerary
      const savedBlocks = []
      for (const experience of trip.itinerary) {
        try {
          const blockData = {
            title: experience.experienceName || experience.name,
            destination: trip.location,
            radius: 5,
            type: 'Activity',
            description: `Experience: ${experience.experienceName || experience.name}`,
            location: {
              name: trip.location,
              address: trip.location,
              city: trip.location.split(',')[0] || trip.location,
              country: trip.location.split(',')[1]?.trim() || 'India'
            },
            timing: {
              startDate: new Date(trip.startDate),
              endDate: new Date(trip.endDate),
              startTime: experience.timeSlot === 'morning' ? '09:00' : 
                        experience.timeSlot === 'afternoon' ? '14:00' :
                        experience.timeSlot === 'evening' ? '18:00' : '21:00',
              duration: experience.duration || '2 hours'
            },
            cost: {
              estimated: experience.price || 0,
              currency: 'INR',
              perPerson: true
            },
            capacity: {
              minPeople: 1,
              maxPeople: 10
            },
            requirements: [],
            contact: '',
            media: [],
            tags: [experience.category || 'travel', 'activity', trip.location],
            // Required fields for Block model
            time: experience.timeSlot === 'morning' ? '09:00' : 
                  experience.timeSlot === 'afternoon' ? '14:00' :
                  experience.timeSlot === 'evening' ? '18:00' : '21:00',
            date: experience.day || trip.startDate,
            details: {
              title: experience.experienceName || experience.name,
              description: `Experience: ${experience.experienceName || experience.name}`,
              cost: experience.price || 0,
              location: trip.location,
              duration: experience.duration || '2 hours',
              activityType: experience.category || 'general',
              difficulty: 'easy'
            },
            ratings: {
              overall: 4, // Default rating between 1-5
              totalReviews: 0
            },
            categoryDetails: {
              activity: {
                activityType: experience.category || 'general',
                duration: experience.duration || '2 hours',
                difficulty: 'easy',
                equipment: [],
                requirements: []
              }
            }
          }
          
          const savedBlock = await api.createBlock(blockData)
          savedBlocks.push(savedBlock)
          console.log("Block saved:", savedBlock)
        } catch (blockError) {
          console.error('Failed to save block for experience:', experience, blockError)
        }
      }
      
      // Create a simple trip record (optional - just for reference)
      const tripData = {
        name: trip.name,
        location: trip.location,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        visibility: trip.visibility,
        description: `Trip with ${savedBlocks.length} activities`,
        itinerary: trip.itinerary
      }
      
      const savedTrip = await api.createTrip(tripData)
      console.log("Trip saved:", savedTrip)
      
      // Refresh saved trips and blocks list
      const [tripsResponse, blocksResponse] = await Promise.all([
        api.getTrips(),
        api.getMyBlocks()
      ])
      
      // Extract the actual data from the response
      const trips = tripsResponse?.trips || tripsResponse || []
      const blocks = blocksResponse?.blocks || blocksResponse || []
      
      setSavedTrips(trips)
      setSavedBlocks(blocks)
      
      // Clear localStorage after successful save
      localStorage.removeItem('currentTrip')
      setTrip(null)
    } catch (error) {
      console.error('Failed to save trip:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!trip) {
    return (
      <div className="w-full h-full bg-background overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Trip Planning Lab</h1>
              <p className="text-xs text-muted-foreground">Plan your perfect adventure</p>
            </div>
            <Button
              onClick={() => setShowTripModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg smooth-transition silver-glow text-sm"
            >
              <Plus size={16} className="mr-2" />
              New Trip
            </Button>
          </div>
        </div>

        {/* Saved Blocks (Primary) */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Saved Activities</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : savedBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBlocks.map((block) => (
                <motion.div
                  key={block._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="glass-effect rounded-xl p-4 space-y-3 hover:bg-white/10 smooth-transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary smooth-transition">
                        {block.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {block.destination}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-bold text-primary">₹{block.cost?.estimated?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  
                  {block.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {block.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {block.timing?.duration || '2 hours'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      block.approved 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {block.approved ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No activities yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start planning your first adventure!</p>
              <Button
                onClick={() => setShowTripModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg smooth-transition silver-glow text-sm"
              >
                <Plus size={16} className="mr-2" />
                Plan Your First Trip
              </Button>
            </div>
          )}
        </div>

        {/* Saved Trips (Secondary) */}
        <div className="p-4 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Trip Plans</h2>
          {savedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTrips.map((savedTrip) => (
                <motion.div
                  key={savedTrip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="glass-effect rounded-xl p-4 space-y-3 hover:bg-white/10 smooth-transition cursor-pointer group"
                  onClick={() => setTrip(savedTrip)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary smooth-transition">
                        {savedTrip.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {savedTrip.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-bold text-primary">₹{savedTrip.budget?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>{savedTrip.startDate} - {savedTrip.endDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {savedTrip.itinerary?.length || 0} activities
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      savedTrip.visibility === 'public' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {savedTrip.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🧳</div>
              <p className="text-sm text-muted-foreground">No trip plans yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          <TripDetailsModal 
            onCreateTrip={handleCreateTrip} 
            isOpen={showTripModal} 
            onClose={() => setShowTripModal(false)}
          />
        </AnimatePresence>
      </div>
    )
  }

  const totalSpent = trip.itinerary.reduce((sum, item) => sum + item.price, 0)
  const remainingBudget = trip.budget - totalSpent

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setTrip(null)
              localStorage.removeItem('currentTrip')
            }}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{trip.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                {trip.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {trip.startDate} - {trip.endDate}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-sm font-bold text-primary">₹{trip.budget.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Budget Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="border-b border-border bg-background/50 px-4 py-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">Spent: ₹{totalSpent.toLocaleString()}</span>
          <span className={`text-xs font-medium ${remainingBudget >= 0 ? "text-primary" : "text-destructive"}`}>
            Remaining: ₹{remainingBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-silver"
            initial={{ width: 0 }}
            animate={{ width: `${(totalSpent / trip.budget) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-0 lg:gap-6 lg:p-6 p-0">
        {/* Timeline Canvas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 overflow-hidden lg:rounded-lg lg:border lg:border-border"
        >
          <TimelineCanvas
            trip={trip}
            onRemoveExperience={handleRemoveExperience}
            onSelectExperience={setSelectedExperience}
            onAddExperience={handleAddExperience}
          />
        </motion.div>

        {/* Experience Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="hidden lg:flex w-96 border-l border-border flex-col"
        >
          <ExperienceSidebar onAddExperience={handleAddExperience} trip={trip} />
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3 flex gap-2"
      >
        <Button
          onClick={handleSaveTrip}
          disabled={saving}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg smooth-transition silver-glow text-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Trip
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="border-border hover:bg-white/5 text-foreground font-semibold py-3 rounded-lg bg-transparent text-sm"
        >
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          className="border-border hover:bg-white/5 text-foreground font-semibold py-3 rounded-lg bg-transparent text-sm"
        >
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </motion.div>

      {/* Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExperience(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-auto glass-effect rounded-t-2xl border-t border-border p-4 space-y-3 max-h-80 overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedExperience.experienceName}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selectedExperience.duration}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedExperience(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 smooth-transition"
                >
                  <X size={16} className="text-foreground" />
                </motion.button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="text-sm font-bold text-primary">₹{selectedExperience.price}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-xs font-semibold text-foreground">{selectedExperience.duration}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Time Slot</span>
                  <span className="text-xs font-semibold text-foreground capitalize">
                    {selectedExperience.timeSlot}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Experience the best of {trip.location} with this curated activity. Perfect for travelers looking to make
                the most of their time.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleRemoveExperience(selectedExperience.id)
                  setSelectedExperience(null)
                }}
                className="w-full py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 font-semibold smooth-transition text-sm"
              >
                Remove from Itinerary
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
