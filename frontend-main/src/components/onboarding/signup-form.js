"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SignupForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    acceptedTerms: false,
  })
  const [passwordErrors, setPasswordErrors] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const validatePassword = (password) => {
    const errors = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }
    setPasswordErrors(errors)
    return errors.hasUpperCase && errors.hasLowerCase && errors.hasNumber && errors.hasSpecialChar
  }

  const isPasswordValid = formData.password && validatePassword(formData.password)
  const isValid = formData.fullName && formData.email && isPasswordValid && formData.acceptedTerms

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    if (name === "password") {
      validatePassword(value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      onSubmit()
    }
  }

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-y-auto pb-20 lg:pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm px-3 lg:px-4 py-3 lg:py-4 flex items-center gap-2 lg:gap-3"
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg smooth-transition text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Create Account</h1>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-3 lg:space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition text-sm lg:text-base"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary smooth-transition text-sm lg:text-base"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={`w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg bg-white/5 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 smooth-transition text-sm lg:text-base ${
              formData.password && !isPasswordValid
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-primary"
            }`}
          />
          {formData.password && (
            <div className="space-y-1 mt-2">
              <div className="text-xs space-y-0.5 lg:space-y-1">
                <div className={`flex items-center gap-2 ${passwordErrors.hasUpperCase ? "text-green-500" : "text-muted-foreground"}`}>
                  <span>{passwordErrors.hasUpperCase ? "✓" : "○"}</span>
                  <span>At least one uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordErrors.hasLowerCase ? "text-green-500" : "text-muted-foreground"}`}>
                  <span>{passwordErrors.hasLowerCase ? "✓" : "○"}</span>
                  <span>At least one lowercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordErrors.hasNumber ? "text-green-500" : "text-muted-foreground"}`}>
                  <span>{passwordErrors.hasNumber ? "✓" : "○"}</span>
                  <span>At least one number</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordErrors.hasSpecialChar ? "text-green-500" : "text-muted-foreground"}`}>
                  <span>{passwordErrors.hasSpecialChar ? "✓" : "○"}</span>
                  <span>At least one special character</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="space-y-4 pt-2"
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              required
            />
            <span className="text-sm text-foreground leading-relaxed">
              I agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Terms and Conditions
              </Link>
            </span>
          </label>
          {!formData.acceptedTerms && formData.fullName && formData.email && formData.password && (
            <p className="text-sm text-destructive ml-7">You must accept the Terms and Conditions to continue</p>
          )}
          
          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-4 rounded-lg smooth-transition silver-glow"
          >
            Continue
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
