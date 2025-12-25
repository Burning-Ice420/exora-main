"use client"

import { useRef } from "react"
import Hero from "@/components/landing/Hero"
import Benefits from "@/components/landing/Benefits"
import SignupForm from "@/components/landing/SignupForm"

export default function LandingPage() {
  const signupFormRef = useRef(null)

  const handleGetEarlyAccess = () => {
    signupFormRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    })
  }

  return (
    <main className="relative min-h-screen text-white bg-[#05060a] overflow-x-hidden">
      {/* Premium landing background (keeps performance + consistent contrast) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[680px] w-[680px] rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-56 -right-56 h-[760px] w-[760px] rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_10%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(1000px_600px_at_80%_20%,rgba(99,102,241,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
      </div>

      <div className="relative">
        <Hero onGetEarlyAccess={handleGetEarlyAccess} />
        <Benefits />
        <div ref={signupFormRef}>
          <SignupForm />
        </div>
      </div>
    </main>
  )
}
