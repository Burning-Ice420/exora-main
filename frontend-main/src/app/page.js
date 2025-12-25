"use client"

import { useRef, useEffect, useState } from "react"
import Hero from "@/components/landing/Hero"
import Benefits from "@/components/landing/Benefits"
import SignupForm from "@/components/landing/SignupForm"

export default function LandingPage() {
  const signupFormRef = useRef(null)
  const videoRef = useRef(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {
        // Autoplay may be blocked, handle gracefully
      })
      video.addEventListener("loadeddata", () => setIsVideoLoaded(true))
    }
  }, [])

  const handleGetEarlyAccess = () => {
    signupFormRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    })
  }

  return (
    <main className="relative">
      {/* Fixed Video Background - visible throughout all sections */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{
            opacity: isVideoLoaded ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
          }}
        >
          <source src="https://res.cloudinary.com/dlfs3xnsa/video/upload/v1765324125/10100717-uhd_2560_1440_30fps_wkknqi.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay - increased opacity for less transparency */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* All content sections scroll over video */}
      <div className="relative z-10">
        <Hero onGetEarlyAccess={handleGetEarlyAccess} />
        <Benefits />
        <div ref={signupFormRef}>
          <SignupForm />
        </div>
      </div>
    </main>
  )
}
