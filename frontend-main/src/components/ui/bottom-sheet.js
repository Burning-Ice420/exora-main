"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { X } from "lucide-react"

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
  
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [contentOpacity, setContentOpacity] = useState(0)
  const [maxHeightValue, setMaxHeightValue] = useState(850)
  const [midHeightValue, setMidHeightValue] = useState(500)
  const y = useMotionValue(0)
  const constraintsRef = useRef(null)
  const sheetRef = useRef(null)
  
  // Force transform to stay at 0 - continuously override framer-motion's y transform
  useEffect(() => {
    let rafId = null
    let isActive = true
    
    const overrideTransform = () => {
      if (sheetRef.current && isActive) {
        // Force transform to center horizontally and stay at bottom (translateY(0))
        const element = sheetRef.current
        element.style.transform = 'translateX(-50%) translateY(0px)'
        element.style.left = '50%'
        element.style.bottom = '0px'
        element.style.top = 'auto'
      }
      if (isActive) {
        rafId = requestAnimationFrame(overrideTransform)
      }
    }
    
    rafId = requestAnimationFrame(overrideTransform)
    
    return () => {
      isActive = false
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])
  
  // During drag, calculate height from y, but don't apply y transform
  // Instead, we'll use height directly and only use y for tracking drag

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMaxHeightValue(window.innerHeight * 0.85)
      setMidHeightValue(window.innerHeight * 0.5)
    }
  }, [])

  // Snap to nearest position - ensure it never goes below MIN_HEIGHT
  const snapToPosition = (currentY) => {
    // Never allow dragging below 0 (which equals MIN_HEIGHT)
    if (currentY >= 0) {
      return 0
    } else if (currentY > -50) {
      // Snap back to minimum if dragged down slightly
      return 0
    } else if (currentY > -(midHeightValue + MIN_HEIGHT) / 2) {
      return -midHeightValue
    } else {
      return -maxHeightValue
    }
  }

  const handleDragEnd = (event, info) => {
    const snapY = snapToPosition(info.offset.y)
    const finalHeight = Math.max(MIN_HEIGHT, -snapY)
    
    // Reset y to 0 and animate to final height
    y.set(0)
    
    // Use a smooth transition to the final height
    setTimeout(() => {
      setHeight(finalHeight)
      // Update content opacity
      if (finalHeight <= MIN_HEIGHT) {
        setContentOpacity(0)
      } else {
        // Fade in over first 100px of expansion
        const fadeRange = 100
        const progress = Math.min(1, (finalHeight - MIN_HEIGHT) / fadeRange)
        setContentOpacity(progress)
      }
    }, 0)
  }

  const openToHalf = () => {
    y.set(-midHeightValue)
    setHeight(midHeightValue)
  }

  const openToFull = () => {
    y.set(-maxHeightValue)
    setHeight(maxHeightValue)
  }

  const close = () => {
    y.set(0)
    setHeight(MIN_HEIGHT)
    if (onClose) onClose()
  }


  if (!isOpen && height === MIN_HEIGHT) return null

  return (
    <>
      {/* Backdrop */}
      {height > MIN_HEIGHT && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: height > MIN_HEIGHT ? 0.3 : 0 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          style={{ pointerEvents: height > MIN_HEIGHT ? "auto" : "none" }}
        />
      )}

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        drag="y"
        dragConstraints={{ top: -maxHeightValue, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        dragDirectionLock={true}
        onDrag={(event, info) => {
          // Immediately reset y to 0 to prevent transform
          y.set(0)
          
          // Update height in real-time during drag
          const newHeight = Math.max(MIN_HEIGHT, -info.offset.y)
          setHeight(newHeight)
          
          // Force transform reset
          if (sheetRef.current) {
            sheetRef.current.style.transform = 'translateX(-50%) translateY(0px)'
            sheetRef.current.style.bottom = '0px'
            sheetRef.current.style.top = 'auto'
          }
          
          // Update opacity - smooth fade in when expanding
          if (newHeight <= MIN_HEIGHT) {
            setContentOpacity(0)
          } else {
            // Fade in over first 100px of expansion
            const fadeRange = 100
            const progress = Math.min(1, (newHeight - MIN_HEIGHT) / fadeRange)
            setContentOpacity(progress)
          }
        }}
        onDragEnd={(event, info) => {
          handleDragEnd(event, info)
        }}
        className="w-full lg:w-[70%]"
        style={{
          height: `${height}px`,
          maxHeight: "85vh",
          touchAction: "none",
          left: "50%",
          bottom: "0px",
          top: "auto",
          transform: "translateX(-50%) translateY(0px)",
        }}
        animate={{
          height: `${height}px`,
        }}
        transition={{
          height: { 
            type: "spring", 
            damping: 35, 
            stiffness: 350, 
            mass: 0.6,
            restSpeed: 0.01
          },
        }}
        className="fixed z-50 bg-background border-t border-l border-r border-border rounded-t-3xl shadow-2xl"
        data-bottom-sheet="true"
      >
        {/* Drag Handle */}
        <div className={`flex items-center justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none ${height > MIN_HEIGHT ? 'border-b border-border' : ''}`}>
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content - Smoothly animated based on drag position */}
        <div className="relative h-full" style={{ height: `calc(100% - 40px)` }}>
          {/* Main content with smooth fade - only visible when expanded */}
          {height > MIN_HEIGHT && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: contentOpacity,
              }}
              transition={{
                opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }}
              style={{
                pointerEvents: height > MIN_HEIGHT + 10 ? "auto" : "none",
              }}
              className="overflow-y-auto h-full pb-24 scrollbar-hide"
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}

