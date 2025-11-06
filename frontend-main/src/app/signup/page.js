"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LocationSearch from '@/components/ui/location-search'
import ImageUpload from '@/components/ui/image-upload'
import { ArrowRight, ArrowLeft, Mail, Lock, User, MapPin, Calendar, Heart, Camera, Music, X } from 'lucide-react'

const TRAVEL_PREFERENCES = [
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
]

const PERSONALITY_TYPES = [
  { id: 'explorer', label: 'Explorer', description: 'Always seeking new adventures', emoji: '🗺️' },
  { id: 'planner', label: 'Planner', description: 'Loves organizing perfect trips', emoji: '📋' },
  { id: 'spontaneous', label: 'Spontaneous', description: 'Goes with the flow', emoji: '🎲' },
  { id: 'social', label: 'Social', description: 'Loves meeting new people', emoji: '👥' },
  { id: 'solo', label: 'Solo Traveler', description: 'Prefers independent journeys', emoji: '🧳' },
  { id: 'group', label: 'Group Leader', description: 'Enjoys organizing group trips', emoji: '👑' },
]

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(null)
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Profile
    dateOfBirth: '',
    age: '', // Will be calculated from dateOfBirth
    location: '',
    bio: '',
    profilePhoto: null, // Profile photo
    
    // Travel Preferences
    travelPreferences: [],
    personalityType: '',
    
    // Photos
    photos: [],
    
    // Interests
    interests: [],
  })

  const { register } = useAuth()
  const router = useRouter()

  const steps = [
    { title: 'Basic Info', subtitle: 'Let\'s start with the basics' },
    { title: 'Profile', subtitle: 'Tell us about yourself' },
    { title: 'Photos', subtitle: 'Add some photos and tell us about yourself' },
    { title: 'Travel Style', subtitle: 'What kind of traveler are you?' },
    { title: 'Preferences', subtitle: 'What do you love to do?' },
    { title: 'Interests', subtitle: 'What makes you unique?' },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Prepare data for backend - send age instead of dateOfBirth, include profilePhoto
      const { dateOfBirth, ...submitData } = formData
      
      // Add profile photo to submit data if available
      if (formData.profilePhoto) {
        submitData.profileImage = formData.profilePhoto
      }
      
      const result = await register(submitData)
      
      if (result.success) {
        router.push('/feed')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return ''
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age >= 0 ? age.toString() : ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
      // Auto-calculate age when dateOfBirth changes
      ...(name === 'dateOfBirth' && { age: calculateAge(value) })
    })
  }

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      location
    })
  }

  const handleProfilePhotoUpload = async (files) => {
    if (files.length === 0) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', files[0])
      
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const result = await response.json()
        setSelectedProfilePhoto(result.image)
        setFormData(prev => ({
          ...prev,
          profilePhoto: result.image
        }))
      }
    } catch (error) {
      console.error('Profile photo upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handlePhotosUpload = async (files) => {
    if (files.length === 0) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })
      
      const response = await fetch('/api/upload/feed', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const result = await response.json()
        setSelectedPhotos(prev => [...prev, ...result.images])
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...result.images]
        }))
      }
    } catch (error) {
      console.error('Photos upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handlePreferenceToggle = (preferenceId) => {
    setFormData({
      ...formData,
      travelPreferences: formData.travelPreferences.includes(preferenceId)
        ? formData.travelPreferences.filter(id => id !== preferenceId)
        : [...formData.travelPreferences, preferenceId]
    })
  }

  const handleInterestToggle = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter(item => item !== interest)
        : [...formData.interests, interest]
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`pl-10 ${
                      formData.password && !validatePassword(formData.password)
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                    required
                  />
                </div>
                {formData.password && (
                  <div className="space-y-1 mt-2">
                    <div className="text-xs space-y-1">
                      <div className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                        <span>{/[A-Z]/.test(formData.password) ? "✓" : "○"}</span>
                        <span>At least one uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                        <span>{/[a-z]/.test(formData.password) ? "✓" : "○"}</span>
                        <span>At least one lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                        <span>{/[0-9]/.test(formData.password) ? "✓" : "○"}</span>
                        <span>At least one number</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                        <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "✓" : "○"}</span>
                        <span>At least one special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Profile
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.age && (
                  <p className="text-sm text-muted-foreground">
                    Age: {formData.age} years old
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <LocationSearch
                  value={formData.location}
                  onChange={handleLocationChange}
                  placeholder="Where are you based?"
                />
              </div>

            </div>
          </div>
        )

      case 3: // Travel Style (moved from case 2)
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What kind of traveler are you?</h3>
              <div className="grid grid-cols-2 gap-3">
                {PERSONALITY_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, personalityType: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.personalityType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.emoji}</div>
                    <div className="text-sm font-semibold text-foreground">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4: // Travel Preferences (moved from case 3)
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What do you love to do while traveling?</h3>
              <div className="grid grid-cols-2 gap-3">
                {TRAVEL_PREFERENCES.map((pref) => (
                  <motion.button
                    key={pref.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePreferenceToggle(pref.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.travelPreferences.includes(pref.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{pref.emoji}</div>
                    <div className="text-sm font-semibold text-foreground">{pref.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: // Photos (moved up, now includes bio)
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Add some photos</h3>
              
              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Profile Photo</label>
                <ImageUpload
                  onImagesChange={handleProfilePhotoUpload}
                  maxImages={1}
                  uploading={uploading}
                />
                {selectedProfilePhoto && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={selectedProfilePhoto.secureUrl || selectedProfilePhoto.url} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="text-sm text-muted-foreground">Profile photo uploaded</span>
                  </div>
                )}
              </div>

              {/* Additional Photos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Additional Photos (up to 4)</label>
                <ImageUpload
                  onImagesChange={handlePhotosUpload}
                  maxImages={4}
                  uploading={uploading}
                />
                
                {/* Display uploaded photos */}
                {selectedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {selectedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo.secureUrl || photo.url} 
                          alt={`Photo ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 5: // Interests
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What are you passionate about?</h3>
              <div className="space-y-3">
                {['Photography', 'Music', 'Art', 'Sports', 'Cooking', 'Reading', 'Dancing', 'Gaming'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{interest === 'Music' ? '🎵' : interest === 'Art' ? '🎨' : '💫'}</div>
                      <span className="font-medium text-foreground">{interest}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 lg:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl space-y-4 lg:space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/20 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto"
          >
            <div className="text-xl lg:text-2xl font-bold text-foreground">exora</div>
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{steps[currentStep].title}</h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={18} />
                </div>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            >
              Next
              <ArrowRight size={18} />
            </Button>
          )}
        </div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:text-primary/80 font-medium smooth-transition"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
