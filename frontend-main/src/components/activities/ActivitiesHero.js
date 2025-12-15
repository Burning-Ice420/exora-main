"use client"

import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = (reducedMotion) => ({
  hidden: {
    opacity: 0,
    y: reducedMotion ? 0 : 30,
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

export default function ActivitiesHero() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.section
      className="bg-white py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={itemVariants(reducedMotion)}
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-black mb-6 leading-[1.05] tracking-[-0.02em]"
            variants={itemVariants(reducedMotion)}
          >
            Things to do
            <br />
            <span className="text-[#0a7ea4]">that matter</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-black/65 mb-6 leading-relaxed font-normal max-w-2xl mx-auto"
            variants={itemVariants(reducedMotion)}
          >
            Discover experiences that bring people together. Join activities, meet travelers, create memories.
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-3 text-sm text-black/45"
            variants={itemVariants(reducedMotion)}
          >
            <span className="h-px w-10 bg-black/15"></span>
            <span className="tracking-wide">Curated by travelers, for travelers</span>
            <span className="h-px w-10 bg-black/15"></span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

