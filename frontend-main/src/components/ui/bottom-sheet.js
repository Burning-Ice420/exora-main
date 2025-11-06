"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function BottomSheet({ 
  children, 
  isOpen = true, 
  onClose,
  title = "Trips Near You",
  maxHeight = "80vh",
  minHeight = "200px"
}) {
  // Calculate positions - handle only visible when minimized
  const MIN_HEIGHT = 60 // Only handle visible
  
  const [maxHeightValue, setMaxHeightValue] = useState(850)
  const [midHeightValue, setMidHeightValue] = useState(500)
  const y = useMotionValue(0)
  const springY = useSpring(y, { damping: 25, stiffness: 300 })
  const sheetRef = useRef(null)
  
  // Calculate total height from y position
  const containerHeight = useMotionValue(maxHeightValue)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const maxH = window.innerHeight * 0.85
      const midH = window.innerHeight * 0.5
      setMaxHeightValue(maxH)
      setMidHeightValue(midH)
      // Start at mid height
      y.set(-midH)
      // Initialize height to match
      containerHeight.set(midH)
    }
  }, [y, containerHeight])
  
  useEffect(() => {
    const unsubscribe = springY.on("change", (latest) => {
      const calculatedHeight = Math.max(MIN_HEIGHT, -latest)
      containerHeight.set(calculatedHeight)
    })
    // Initialize height
    const initialHeight = Math.max(MIN_HEIGHT, -springY.get())
    containerHeight.set(initialHeight)
    return unsubscribe
  }, [springY, containerHeight])

  // Snap to nearest position
  const snapToPosition = (currentY) => {
    if (currentY >= 0) {
      return 0 // Closed
    } else if (currentY > -midHeightValue / 2) {
      return -midHeightValue // Mid position
    } else {
      return -maxHeightValue // Full position
    }
  }

  const handleDragEnd = (event, info) => {
    const snapY = snapToPosition(info.offset.y + y.get())
    y.set(snapY)
  }

  // Calculate opacity based on y position
  const opacity = useMotionValue(1)
  
  useEffect(() => {
    const unsubscribe = springY.on("change", (latest) => {
      const height = Math.max(MIN_HEIGHT, -latest)
      if (height <= MIN_HEIGHT) {
        opacity.set(0)
      } else {
        const fadeRange = 100
        const progress = Math.min(1, (height - MIN_HEIGHT) / fadeRange)
        opacity.set(progress)
      }
    })
    return unsubscribe
  }, [springY, opacity])

  // Track if minimized to conditionally allow map interaction
  const [isMinimized, setIsMinimized] = useState(false)
  
  useEffect(() => {
    const unsubscribe = springY.on("change", (latest) => {
      setIsMinimized(latest >= -MIN_HEIGHT)
    })
    // Initialize
    setIsMinimized(springY.get() >= -MIN_HEIGHT)
    return unsubscribe
  }, [springY])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: springY.get() < -MIN_HEIGHT ? 0.3 : 0 
        }}
        exit={{ opacity: 0 }}
        onClick={() => y.set(0)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        style={{ 
          pointerEvents: springY.get() < -MIN_HEIGHT ? "auto" : "none" 
        }}
      />

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        drag="y"
        dragConstraints={{ top: -maxHeightValue, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          y: springY,
          width: "70%",
          height: containerHeight,
          maxHeight: `${maxHeightValue}px`,
          touchAction: isMinimized ? "auto" : "none",
          left: "50%",
          bottom: "0px",
          top: "auto",
          transform: "translateX(-50%)",
        }}
        className="fixed z-50 bg-background border-t border-l border-r border-border rounded-t-3xl shadow-2xl flex flex-col"
        data-bottom-sheet="true"
        onPointerDown={(e) => {
          // When minimized, check if click is on handle
          if (isMinimized) {
            const handle = e.currentTarget.querySelector('[data-handle]')
            if (!handle || !handle.contains(e.target)) {
              // Not on handle, allow event to pass through to map
              e.stopPropagation()
              e.preventDefault()
              // Temporarily disable pointer events on this element
              const element = e.currentTarget
              element.style.pointerEvents = "none"
              // Re-enable after click completes
              setTimeout(() => {
                element.style.pointerEvents = "auto"
              }, 50)
            }
          }
        }}
      >
        {/* Drag Handle - Always interactive, even when minimized */}
        <motion.div 
          data-handle
          className="flex items-center justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none border-b border-border"
          style={{
            opacity: springY.get() < -MIN_HEIGHT ? 1 : 0.7,
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </motion.div>

        {/* Content - Smoothly animated based on drag position */}
        <motion.div 
          className="relative overflow-y-auto scrollbar-hide flex-1"
          style={{
            opacity: opacity,
            pointerEvents: springY.get() < -(MIN_HEIGHT + 10) ? "auto" : "none",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  )
}

