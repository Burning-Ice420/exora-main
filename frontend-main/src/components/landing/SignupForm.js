"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { use3DTilt } from "@/hooks/use3DTilt"
import api from "@/server/api"
import ThankYouModal from "./ThankYouModal"

const formVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    y: reducedMotion ? 0 : 12 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

const successVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    scale: reducedMotion ? 1 : 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const reducedMotion = useReducedMotion()
  const { ref: formRef } = use3DTilt({ maxRotation: 6, scale: 1.015, shadowIntensity: 0.12 })

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return "Email is required"
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return ""
  }

  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Name is required"
    }
    if (name.trim().length > 100) {
      return "Name must be less than 100 characters"
    }
    return ""
  }

  const validatePhone = (phone) => {
    if (!phone) return ""
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (phone.length > 20) {
      return "Phone number must be less than 20 characters"
    }
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number"
    }
    return ""
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (emailError && value) {
      setEmailError(validateEmail(value))
    }
    setSubmitError("")
  }

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email))
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    if (nameError && value) {
      setNameError(validateName(value))
    }
    setSubmitError("")
  }

  const handleNameBlur = () => {
    setNameError(validateName(name))
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setPhone(value)
    if (phoneError && value) {
      setPhoneError(validatePhone(value))
    }
    setSubmitError("")
  }

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phone))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")
    
    const emailValidationError = validateEmail(email)
    const nameValidationError = validateName(name)
    const phoneValidationError = validatePhone(phone)

    if (emailValidationError) {
      setEmailError(emailValidationError)
    }
    if (nameValidationError) {
      setNameError(nameValidationError)
    }
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
    }

    if (emailValidationError || nameValidationError || phoneValidationError) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await api.addToWaitlist({
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim() || undefined
      })
      
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Clear all errors
      setEmailError("")
      setNameError("")
      setPhoneError("")
      setSubmitError("")
    } catch (error) {
      setIsSubmitting(false)
      if (error?.status === 409) {
        setSubmitError("You're already on the waitlist.")
      } else if (error?.message === 'Failed to fetch') {
        setSubmitError("Unable to reach server. Please try again.")
      } else {
        setSubmitError(error.message || "Failed to join waitlist. Please try again.")
      }
    }
  }

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={formVariants(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Join the Waitlist
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md">
            Be among the first to experience exora when we launch.
          </p>
        </motion.div>

        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-5 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer"
          variants={formVariants(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3.5 rounded-lg border bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:scale-[1.02] transition-all duration-200 ${
                    emailError ? "border-destructive/60" : "border-white/20"
                  }`}
                  disabled={isSubmitting}
                  required
                />
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-destructive"
                  >
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  placeholder="Your name"
                  className={`w-full px-4 py-3.5 rounded-lg border bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:scale-[1.02] transition-all duration-200 ${
                    nameError ? "border-destructive/60" : "border-white/20"
                  }`}
                  disabled={isSubmitting}
                  required
                />
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-destructive"
                  >
                    {nameError}
                  </motion.p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Phone <span className="text-white/60 text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="+91 9876543210"
                  className={`w-full px-4 py-3.5 rounded-lg border bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:scale-[1.02] transition-all duration-200 ${
                    phoneError ? "border-destructive/60" : "border-white/20"
                  }`}
                  disabled={isSubmitting}
                />
                {phoneError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-sm text-destructive"
                  >
                    {phoneError}
                  </motion.p>
                )}
              </div>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/20 border border-destructive/40"
                >
                  <p className="text-sm text-destructive">{submitError}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Join the Waitlist"
                )}
              </motion.button>
            </motion.form>

        {/* Thank You Modal */}
        <ThankYouModal
          isOpen={isSuccess}
          onClose={() => {
            setIsSuccess(false)
            setEmail("")
            setName("")
            setPhone("")
          }}
          userName={name}
        />
      </div>
    </section>
  )
}

