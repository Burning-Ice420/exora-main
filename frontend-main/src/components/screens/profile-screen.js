"use client"

import { useState, useEffect } from "react"
import { Edit2, MapPin, Users, Settings, Share2, LogOut, X, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/server/api"
import ImageUpload from "@/components/ui/image-upload"
import LocationSearch from "@/components/ui/location-search"

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    trips: 0,
    connections: 0,
    experiences: 0,
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    age: '',
    gender: '',
    interests: [],
    travelPreferences: []
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)

  // Load user data and stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        // Load user stats
        const [tripsData, connectionsData, experiencesData] = await Promise.all([
          api.getTrips(),
          api.getConnections(),
          api.getExperiences({ user: user?.id })
        ])
        
        setStats({
          trips: tripsData.length || 0,
          connections: connectionsData.length || 0,
          experiences: experiencesData.length || 0,
        })
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadUserData()
    }
  }, [user])

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        age: user.age || '',
        gender: user.gender || '',
        interests: user.interests || [],
        travelPreferences: user.travelPreferences || []
      })
    }
  }, [user])

  const handleImageUpload = async (images) => {
    if (images.length === 0) return

    try {
      setUploading(true)
      const response = await api.uploadProfileImage(images[0])
      
      if (response.success) {
        // Store the uploaded image data for later use
        setUploadedImage(response.data)
        
        // Clear selected images after successful upload
        setSelectedImages([])
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Auto-upload when images are selected
  const handleImagesChange = async (images) => {
    setSelectedImages(images)
    
    // Auto-upload if images are selected
    if (images.length > 0) {
      await handleImageUpload(images)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setUploading(true)
      
      // Combine form data with uploaded image
      const profileData = {
        ...editForm,
        ...(uploadedImage && { profileImage: uploadedImage })
      }
      
      await updateProfile(profileData)
      setShowEditModal(false)
      setUploadedImage(null) // Clear uploaded image after successful save
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const trips = [
    { id: "1", name: "Goa Beach", date: "Mar 2024", location: "Goa", image: "🏖️" },
    { id: "2", name: "Himalayan Trek", date: "Feb 2024", location: "Himalayas", image: "🏔️" },
    { id: "3", name: "Kerala Backwaters", date: "Jan 2024", location: "Kerala", image: "🌴" },
    { id: "4", name: "Rajasthan Desert", date: "Dec 2023", location: "Rajasthan", image: "🏜️" },
    { id: "5", name: "Mumbai City", date: "Nov 2023", location: "Mumbai", image: "🌃" },
    { id: "6", name: "Ladakh Adventure", date: "Oct 2023", location: "Ladakh", image: "⛰️" },
  ]

  const preferences = user?.travelPreferences || ["Adventure", "Solo Travel", "Foodie", "Beach Lover", "Photography", "Budget Travel"]

  const connections = [
    { id: "1", name: "Sarah", avatar: "👩" },
    { id: "2", name: "Marco", avatar: "👨" },
    { id: "3", name: "Priya", avatar: "👩" },
    { id: "4", name: "Alex", avatar: "👨" },
    { id: "5", name: "Nina", avatar: "👩" },
  ]

  return (
    <div className="w-full h-full bg-background overflow-y-auto pb-24 scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Profile Content - Desktop Layout */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 border-2 border-primary flex items-center justify-center text-2xl lg:text-3xl shadow-lg shadow-primary/20 overflow-hidden"
            >
              {user?.profileImage?.secureUrl || user?.profileImage?.url ? (
                <img 
                  src={user.profileImage.secureUrl || user.profileImage.url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                "👤"
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
              >
                <Camera size={12} />
              </button>
            </motion.div>
            <div className="text-center lg:text-left space-y-1 flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">{user?.name || 'Loading...'}</h2>
              <p className="text-muted-foreground text-sm">{user?.bio || 'Travel enthusiast'}</p>
              <p className="text-xs text-primary font-medium">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</p>
            </div>

            {/* Stats - Desktop Grid */}
            <div className="grid grid-cols-3 gap-2 lg:gap-3 w-full lg:w-auto">
              {[
                { label: "Trips", value: stats.trips },
                { label: "Connections", value: stats.connections },
                { label: "Experiences", value: stats.experiences },
              ].map((stat) => (
                <div key={stat.label} className="glass-effect rounded-lg p-2 text-center">
                  <p className="text-lg lg:text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 lg:max-w-md">
            <Button
              onClick={() => setShowEditModal(true)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg smooth-transition silver-glow text-sm"
            >
              <Edit2 size={14} className="mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1 border-border hover:bg-white/5 bg-transparent text-foreground py-2 text-sm">
              <Share2 size={14} className="mr-2" />
              Share
            </Button>
            <Button 
              onClick={logout}
              variant="outline" 
              className="border-destructive/20 hover:bg-destructive/10 text-destructive py-2 text-sm"
            >
              <LogOut size={14} className="mr-2" />
              Logout
            </Button>
          </div>

          {/* Travel Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-foreground">Travel Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((tag, idx) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="px-3 py-1.5 rounded-full bg-gradient-silver text-primary-foreground text-xs font-medium hover:shadow-lg hover:shadow-primary/30 smooth-transition cursor-pointer"
                >
                  {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Photos */}
          {user?.photos && user.photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold text-foreground">Photos</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {user.photos.map((photo, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="glass-effect rounded-xl overflow-hidden hover:bg-white/10 smooth-transition cursor-pointer group"
                  >
                    <div className="w-full h-24 lg:h-28 relative overflow-hidden">
                      <img 
                        src={photo.secureUrl || photo.url} 
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Past Trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Past Trips</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {trips.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass-effect rounded-xl overflow-hidden hover:bg-white/10 smooth-transition cursor-pointer group"
                >
                  <div className="w-full h-24 lg:h-28 bg-gradient-to-br from-muted to-background flex items-center justify-center text-3xl lg:text-4xl relative overflow-hidden">
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} className="text-3xl lg:text-4xl">
                      {trip.image}
                    </motion.div>
                  </div>
                  <div className="p-2 lg:p-3 space-y-1">
                    <p className="font-semibold text-xs lg:text-sm text-foreground group-hover:text-primary smooth-transition line-clamp-1">
                      {trip.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={10} />
                      <span className="line-clamp-1">{trip.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{trip.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users size={16} /> Connections
              </h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View All
              </Button>
            </div>
            <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {connections.map((conn, idx) => (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-primary/30 smooth-transition"
                >
                  <span className="text-2xl lg:text-3xl">{conn.avatar}</span>
                  <p className="text-xs text-foreground font-medium mt-1">{conn.name}</p>
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-dashed border-border hover:border-primary flex items-center justify-center text-primary smooth-transition"
              >
                <span className="text-xl lg:text-2xl">+</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-effect rounded-xl p-3 lg:p-4 space-y-2"
          >
            <h3 className="text-sm font-semibold text-foreground">About</h3>
            <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
              Passionate about exploring hidden gems and meeting fellow travelers. Love good food, great conversations,
              and unforgettable adventures. Currently planning my next big trip!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowEditModal(false)
                    setUploadedImage(null) // Clear uploaded image when closing
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-6">
                {/* Profile Image Upload */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Profile Photo</h3>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={1}
                    maxSize={5}
                    placeholder="Upload profile photo"
                    className="max-w-md"
                    uploading={uploading}
                  />
                  
                  {/* Show upload status */}
                  {uploading && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium flex items-center">
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading profile photo...
                      </p>
                    </div>
                  )}
                  
                  {uploadedImage && !uploading && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Profile photo uploaded successfully (click Save Changes to apply)
                      </p>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your age"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <LocationSearch
                    value={editForm.location}
                    onChange={(location) => setEditForm({ ...editForm, location })}
                    placeholder="Where are you based?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setUploadedImage(null) // Clear uploaded image when canceling
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
