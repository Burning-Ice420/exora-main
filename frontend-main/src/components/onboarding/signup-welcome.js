"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function SignupWelcome({ onSignupClick }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 pb-24">
      {/* Background gradient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center space-y-8 max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center silver-glow">
            <span className="text-3xl font-bold text-background">E</span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold text-foreground text-balance">Exora</h1>
          <p className="text-base text-muted-foreground">Discover, Connect, and Experience Travel Together.</p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3 pt-4"
        >
          <Button
            onClick={onSignupClick}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg smooth-transition silver-glow"
          >
            Sign Up
          </Button>
          <Button
            variant="outline"
            className="w-full border-border hover:bg-white/5 text-foreground font-semibold py-4 rounded-lg smooth-transition bg-transparent"
          >
            Log In
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
