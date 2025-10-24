"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Upload } from "lucide-react"

export default function PersonalityQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState({
    travelPersonality: [],
    travelVibe: [],
    destination: [],
    socialPreferences: [],
    profilePicture: null,
    bio: "",
    gender: "",
    age: "",
  })

  const travelPersonalities = [
    { id: "chill", label: "Chill explorer", emoji: "🌴" },
    { id: "adventurer", label: "Adventurer", emoji: "🧗" },
    { id: "aesthetic", label: "Aesthetic hunter", emoji: "📸" },
    { id: "party", label: "Party nomad", emoji: "🍸" },
    { id: "nature", label: "Nature lover", emoji: "🏞" },
    { id: "soul", label: "Soul searcher", emoji: "🧘" },
  ]

  const travelVibes = [
    { id: "spontaneous", label: "Spontaneous", emoji: "⚡" },
    { id: "planned", label: "Well-planned", emoji: "📋" },
    { id: "luxury", label: "Luxury", emoji: "✨" },
    { id: "budget", label: "Budget", emoji: "💰" },
    { id: "solo", label: "Solo", emoji: "🎒" },
    { id: "group", label: "Group trips", emoji: "👥" },
  ]

  const destinations = [
    { id: "mountains", label: "Mountains", emoji: "⛰️" },
    { id: "beaches", label: "Beaches", emoji: "🏖️" },
    { id: "cities", label: "Cities", emoji: "🏙️" },
    { id: "countryside", label: "Countryside", emoji: "🌾" },
    { id: "islands", label: "Islands", emoji: "🏝️" },
    { id: "deserts", label: "Deserts", emoji: "🏜️" },
  ]

  const socialPreferences = [
    { id: "locals", label: "Locals", emoji: "🏘️" },
    { id: "solo", label: "Solo travelers", emoji: "🧑‍🤝‍🧑" },
    { id: "creators", label: "Creators", emoji: "📱" },
    { id: "adventure", label: "Adventure buddies", emoji: "🤝" },
    { id: "chill", label: "Anyone chill", emoji: "😎" },
  ]

  const toggleSelection = (field, value) => {
    setData((prev) => {
      const current = prev[field]
      const isSelected = current.includes(value)
      return {
        ...prev,
        [field]: isSelected ? current.filter((v) => v !== value) : [...current, value],
      }
    })
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    console.log("Onboarding complete:", data)
    // Here you would typically save to Firebase or your backend
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">What kind of traveler are you?</h2>
              <p className="text-sm text-muted-foreground">Select up to 3 that resonate with you</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {travelPersonalities.map((personality) => (
                <motion.button
                  key={personality.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelection("travelPersonality", personality.id)}
                  className={`p-3 rounded-lg border-2 smooth-transition text-center space-y-1 ${
                    data.travelPersonality.includes(personality.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-white/5 hover:border-border/50"
                  }`}
                >
                  <div className="text-2xl">{personality.emoji}</div>
                  <p className="text-xs font-medium text-foreground">{personality.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">When you travel, what's your vibe?</h2>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {travelVibes.map((vibe) => (
                <motion.button
                  key={vibe.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelection("travelVibe", vibe.id)}
                  className={`p-3 rounded-lg border-2 smooth-transition text-center space-y-1 ${
                    data.travelVibe.includes(vibe.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-white/5 hover:border-border/50"
                  }`}
                >
                  <div className="text-2xl">{vibe.emoji}</div>
                  <p className="text-xs font-medium text-foreground">{vibe.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your dream getaway looks like…</h2>
              <p className="text-muted-foreground">Select all that appeal to you</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {destinations.map((dest) => (
                <motion.button
                  key={dest.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelection("destination", dest.id)}
                  className={`p-4 rounded-xl border-2 smooth-transition text-center space-y-2 ${
                    data.destination.includes(dest.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-white/5 hover:border-border/50"
                  }`}
                >
                  <div className="text-3xl">{dest.emoji}</div>
                  <p className="text-sm font-medium text-foreground">{dest.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Who would you love to meet while traveling?</h2>
              <p className="text-muted-foreground">Select all that interest you</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {socialPreferences.map((pref) => (
                <motion.button
                  key={pref.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelection("socialPreferences", pref.id)}
                  className={`p-4 rounded-xl border-2 smooth-transition text-center space-y-2 ${
                    data.socialPreferences.includes(pref.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-white/5 hover:border-border/50"
                  }`}
                >
                  <div className="text-3xl">{pref.emoji}</div>
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground">Let's get to know you better</p>
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Profile Picture</label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 smooth-transition cursor-pointer">
                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={data.bio}
                onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Describe your travel mantra…"
                maxLength={150}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition resize-none h-24"
              />
              <p className="text-xs text-muted-foreground">{data.bio.length}/150</p>
            </div>

            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  value={data.gender}
                  onChange={(e) => setData((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Age</label>
                <input
                  type="number"
                  value={data.age}
                  onChange={(e) => setData((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition"
                />
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden pb-24">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-4"
      >
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <motion.div
              key={step}
              className={`h-2 rounded-full smooth-transition ${
                step <= currentStep ? "bg-primary w-8" : "bg-border w-2"
              }`}
              animate={{ width: step <= currentStep ? 32 : 8 }}
            />
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">Step {currentStep} of 5</p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-4 flex gap-3"
      >
        <Button
          onClick={handlePrev}
          disabled={currentStep === 1}
          variant="outline"
          className="flex-1 border-border hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg bg-transparent text-sm"
        >
          <ChevronLeft size={16} className="mr-2" />
          Back
        </Button>
        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg smooth-transition silver-glow text-sm"
          >
            Next
            <ChevronRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg smooth-transition silver-glow text-sm"
          >
            Finish Setup
          </Button>
        )}
      </motion.div>
    </div>
  )
}
