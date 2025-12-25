"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, Linkedin } from "lucide-react"
import HeroCarousel from "./HeroCarousel"

export default function Hero({ onGetEarlyAccess }) {
  return (
    <div className="relative">
      <HeroCarousel onPrimaryCta={onGetEarlyAccess} />

      {/* Minimal header overlay (logo + socials) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
          <a href="#" className="pointer-events-auto inline-flex items-center gap-3">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/12 flex items-center justify-center overflow-hidden">
              <Image src="/logos.png" alt="exora" width={56} height={56} className="h-10 w-10 object-contain" />
            </div>
            <span className="hidden sm:inline text-sm tracking-[0.18em] uppercase text-white/75">
              exora
            </span>
          </a>

          <div className="pointer-events-auto flex items-center gap-2">
            <motion.a
              href="https://www.instagram.com/exora.in?igsh=bjg4bmZxbzJ3b292&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-md ring-1 ring-white/10 text-white/85 hover:bg-black/40 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" strokeWidth={1.7} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/company/exora-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-md ring-1 ring-white/10 text-white/85 hover:bg-black/40 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" strokeWidth={1.7} />
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  )
}

