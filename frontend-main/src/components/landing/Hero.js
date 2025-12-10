"use client"

import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { MapPin, Users, Compass, Plane, Instagram, Facebook, Linkedin } from "lucide-react"
import Image from "next/image"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    y: reducedMotion ? 0 : 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

const iconVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    scale: reducedMotion ? 1 : 0.8,
    y: reducedMotion ? 0 : 10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

export default function Hero({ onGetEarlyAccess }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
        {/* Logo - positioned on the left */}
        <motion.div
          className="absolute top-8 left-4 sm:left-6 lg:left-8 z-20"
          variants={itemVariants(reducedMotion)}
        >
          <a href="#" className="block">
            <div className="w-24 h-24 sm:w-32 sm:h-32">
              <Image
                src="/logo.png"
                alt="Logo"
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>
          </a>
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">

          <motion.p
            className="text-sm sm:text-base md:text-lg text-white/70 mb-6 tracking-wider uppercase font-medium"
            variants={itemVariants(reducedMotion)}
          >
            Revolutionizing the Social Funnel
          </motion.p>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-[-0.02em] drop-shadow-lg"
            variants={itemVariants(reducedMotion)}
          >
            Match Plans
            <br />
            <span className="text-primary drop-shadow-md">Not People</span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-14 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-md"
            variants={itemVariants(reducedMotion)}
          >
            Connect with fellow travelers, plan unforgettable journeys, and share authentic experiences.
          </motion.p>

          <motion.div
            variants={itemVariants(reducedMotion)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={onGetEarlyAccess}
              className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Get Early Access
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MapPin className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2} />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Social Media Icons */}
          <motion.div
            variants={itemVariants(reducedMotion)}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <motion.a
              href="https://www.instagram.com/exora.in?igsh=bjg4bmZxbzJ3b292&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/company/exora-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-5 h-5" strokeWidth={1.5} />
            </motion.a>
            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="X (formerly Twitter)">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </motion.a>
          </motion.div>
          </div>
        </div>
      </motion.section>
  )
}

