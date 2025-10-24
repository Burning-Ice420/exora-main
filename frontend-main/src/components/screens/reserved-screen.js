"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SignupWelcome from "@/components/onboarding/signup-welcome"
import SignupForm from "@/components/onboarding/signup-form"
import PersonalityQuestionnaire from "@/components/onboarding/personality-questionnaire"

export default function ReservedScreen() {
  const [currentStep, setCurrentStep] = useState("welcome")

  const handleSignupClick = () => setCurrentStep("signup")
  const handleFormSubmit = () => setCurrentStep("questionnaire")
  const handleBackToWelcome = () => setCurrentStep("welcome")

  return (
    <div className="w-full h-full bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SignupWelcome onSignupClick={handleSignupClick} />
          </motion.div>
        )}

        {currentStep === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupForm onSubmit={handleFormSubmit} onBack={handleBackToWelcome} />
          </motion.div>
        )}

        {currentStep === "questionnaire" && (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PersonalityQuestionnaire />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
