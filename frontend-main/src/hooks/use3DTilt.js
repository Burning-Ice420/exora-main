"use client"

import { useRef, useEffect, useCallback } from "react"
import { useReducedMotion } from "./useReducedMotion"

export function use3DTilt(options = {}) {
  const { 
    maxRotation = 4, 
    perspective = 1000, 
    scale = 1.02,
    shadowIntensity = 0.15 
  } = options
  const reducedMotion = useReducedMotion()
  const ref = useRef(null)
  const rafId = useRef(null)
  const currentTransform = useRef({ rotateX: 0, rotateY: 0, scale: 1 })
  const targetTransform = useRef({ rotateX: 0, rotateY: 0, scale: 1 })

  const updateTransform = useCallback(() => {
    if (!ref.current || reducedMotion) {
      rafId.current = null
      return
    }

    const { rotateX: targetX, rotateY: targetY, scale: targetScale } = targetTransform.current
    
    // Smooth interpolation for premium feel
    const diffX = targetX - currentTransform.current.rotateX
    const diffY = targetY - currentTransform.current.rotateY
    const diffScale = targetScale - currentTransform.current.scale

    currentTransform.current.rotateX += diffX * 0.15
    currentTransform.current.rotateY += diffY * 0.15
    currentTransform.current.scale += diffScale * 0.15

    const { rotateX: rx, rotateY: ry, scale: s } = currentTransform.current

    // Calculate shadow offset based on tilt
    const shadowX = ry * 0.5
    const shadowY = -rx * 0.5
    const shadowBlur = 20 + Math.abs(rx) * 0.5 + Math.abs(ry) * 0.5
    const shadowOpacity = shadowIntensity + (Math.abs(rx) + Math.abs(ry)) * 0.01

    ref.current.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
    ref.current.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${Math.min(shadowOpacity, 0.3)})`

    // Continue animation if not at target
    const threshold = 0.001
    if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold || Math.abs(diffScale) > threshold) {
      rafId.current = requestAnimationFrame(updateTransform)
    } else {
      rafId.current = null
    }
  }, [perspective, shadowIntensity, reducedMotion])

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || reducedMotion) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Normalize to -1 to 1 range
    const normalizedX = (x - centerX) / centerX
    const normalizedY = (y - centerY) / centerY

    // Apply subtle rotation
    targetTransform.current.rotateX = normalizedY * -maxRotation
    targetTransform.current.rotateY = normalizedX * maxRotation
    targetTransform.current.scale = scale

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateTransform)
    }
  }, [maxRotation, scale, updateTransform, reducedMotion])

  const handleMouseLeave = useCallback(() => {
    targetTransform.current = { rotateX: 0, rotateY: 0, scale: 1 }
    
    // Continue animation until reset
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateTransform)
    }
  }, [updateTransform])

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion) return

    element.style.transformStyle = "preserve-3d"
    element.style.willChange = "transform"

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave, reducedMotion])

  return { ref }
}

