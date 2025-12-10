"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { use3DTilt } from "@/hooks/use3DTilt"
import { Users, Calendar, Share2, MapPin } from "lucide-react"

const benefits = [
  {
    icon: Users,
    title: "Connect with Travelers",
    description: "Find like-minded adventurers and build meaningful connections on your journey.",
  },
  {
    icon: Calendar,
    title: "Plan Together",
    description: "Collaborate on itineraries and discover hidden gems through shared experiences.",
  },
  {
    icon: Share2,
    title: "Share Authentically",
    description: "Document your travels with real stories and genuine recommendations.",
  },
  {
    icon: MapPin,
    title: "Discover New Places",
    description: "Explore destinations through the eyes of fellow travelers who've been there.",
  },
]

const containerVariants = (reducedMotion) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.15,
      delayChildren: 0.1,
    },
  },
})

const itemVariants = (reducedMotion) => ({
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

export default function Benefits() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const reducedMotion = useReducedMotion()

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          variants={containerVariants(reducedMotion)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            const { ref } = use3DTilt({ maxRotation: 8, scale: 1.02, shadowIntensity: 0.15 })
            return (
              <motion.div
                key={index}
                ref={ref}
                className="flex items-start gap-4 p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors duration-300 cursor-pointer"
                variants={itemVariants(reducedMotion)}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 tracking-tight drop-shadow-sm">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

