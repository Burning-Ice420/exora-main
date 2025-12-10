"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { CheckCircle, X } from "lucide-react"

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

const modalVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0, 
    scale: reducedMotion ? 1 : 0.8,
    y: reducedMotion ? 0 : 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    scale: reducedMotion ? 1 : 0.8,
    y: reducedMotion ? 0 : 50,
    transition: { duration: 0.2 }
  }
})

const iconVariants = (reducedMotion) => ({
  hidden: { 
    scale: 0,
    rotate: -180
  },
  visible: { 
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2
    }
  }
})

const contentVariants = (reducedMotion) => ({
  hidden: { 
    opacity: 0,
    y: reducedMotion ? 0 : 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
})

export default function ThankYouModal({ isOpen, onClose, userName }) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants(reducedMotion)}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-8 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </motion.button>

            <div className="text-center">
              {/* Success Icon */}
              <motion.div
                variants={iconVariants(reducedMotion)}
                initial="hidden"
                animate="visible"
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-primary" strokeWidth={2.5} />
              </motion.div>

              {/* Content */}
              <motion.div
                variants={contentVariants(reducedMotion)}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                  Thank You{userName ? `, ${userName}` : ''}!
                </h2>
                <p className="text-lg text-white/90 mb-6 leading-relaxed drop-shadow-md">
                  You're on the waitlist. We'll notify you as soon as exora launches.
                </p>
                <motion.button
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Got it
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

