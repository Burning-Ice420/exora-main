"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    eyebrow: "Travel, elevated",
    headline: (
      <>
        Match plans
        <br />
        <span className="text-primary">not people</span>
      </>
    ),
    subtext:
      "Find your kind of journey — curated, social, and effortless from the first idea to the last memory.",
    image: {
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80",
      alt: "A scenic mountain road at sunrise",
    },
    accent: "from-primary/22 via-primary/10 to-transparent",
  },
  {
    id: "slide-2",
    eyebrow: "Discover together",
    headline: (
      <>
        Build itineraries
        <br />
        <span className="text-primary">with your crew</span>
      </>
    ),
    subtext:
      "Collaborate in real-time, save the best spots, and keep the plan beautiful—on mobile and desktop.",
    image: {
      src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=80",
      alt: "Friends walking with backpacks in a city",
    },
    accent: "from-white/18 via-white/8 to-transparent",
  },
  {
    id: "slide-3",
    eyebrow: "Authentic experiences",
    headline: (
      <>
        Explore places
        <br />
        <span className="text-primary">that feel alive</span>
      </>
    ),
    subtext:
      "From hidden cafés to iconic views, discover experiences through people who actually went.",
    image: {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80",
      alt: "A city street with warm lights at night",
    },
    accent: "from-black/30 via-black/10 to-transparent",
  },
]

const popIn = (reducedMotion) => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: reducedMotion
      ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
      : { type: "spring", stiffness: 320, damping: 28, mass: 0.7 },
  },
})

const layer = (reducedMotion, delay = 0) => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 14, filter: reducedMotion ? "none" : "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: reducedMotion
      ? { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }
      : { type: "spring", stiffness: 380, damping: 34, delay },
  },
  exit: {
    opacity: 0,
    y: reducedMotion ? 0 : -8,
    filter: reducedMotion ? "none" : "blur(6px)",
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
})

export default function HeroCarousel({
  onPrimaryCta,
  primaryCtaLabel = "Get Early Access",
  slides = DEFAULT_SLIDES,
}) {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false, dragFree: false },
    []
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const canAnimate = !reducedMotion

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // Lightweight autoplay without extra plugins.
  useEffect(() => {
    if (!emblaApi) return
    if (!canAnimate) return
    if (isHovered) return

    const id = window.setInterval(() => {
      // Guard in case the tab is backgrounded.
      if (document.visibilityState !== "visible") return
      emblaApi.scrollNext()
    }, 5200)

    return () => window.clearInterval(id)
  }, [emblaApi, canAnimate, isHovered])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i) => emblaApi?.scrollTo(i), [emblaApi])

  const activeSlide = useMemo(() => slides[clamp(selectedIndex, 0, slides.length - 1)], [slides, selectedIndex])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], canAnimate ? [0, 46] : [0, 0])

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
      variants={popIn(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {/* Background / carousel */}
      <div
        className="absolute inset-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={() => setIsHovered(false)}
      >
        <div ref={emblaRef} className="h-full">
          <div className="flex h-full">
            {slides.map((s, idx) => (
              <div key={s.id} className="relative flex-[0_0_100%] h-full">
                <motion.div
                  className="absolute inset-0"
                  style={{ y: parallaxY }}
                  aria-hidden="true"
                >
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </motion.div>

                {/* Premium overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
                <div className={`absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-gradient-to-br ${s.accent} blur-3xl`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={activeSlide.id}>
              <motion.p
                className="text-xs sm:text-sm tracking-[0.18em] uppercase text-white/75 font-medium mb-4"
                variants={layer(reducedMotion, 0.05)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeSlide.eyebrow}
              </motion.p>

              <motion.h1
                className="text-[44px] sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.02] tracking-[-0.03em] drop-shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                variants={layer(reducedMotion, 0.12)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeSlide.headline}
              </motion.h1>

              <motion.p
                className="mt-6 text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl"
                variants={layer(reducedMotion, 0.18)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeSlide.subtext}
              </motion.p>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                variants={layer(reducedMotion, 0.24)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button
                  onClick={onPrimaryCta}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-7 py-3.5 text-sm sm:text-base font-medium text-primary-foreground shadow-[0_18px_45px_rgba(0,0,0,0.35)] ring-1 ring-white/10 hover:bg-primary/92 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
                  whileHover={canAnimate ? { y: -2, scale: 1.02 } : undefined}
                  whileTap={canAnimate ? { scale: 0.98 } : undefined}
                  transition={canAnimate ? { type: "spring", stiffness: 420, damping: 24 } : undefined}
                >
                  {primaryCtaLabel}
                </motion.button>

                <div className="text-xs sm:text-sm text-white/70">
                  No spam. Early access only.
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-10 flex items-center gap-2">
            {slides.map((s, i) => {
              const isActive = i === selectedIndex
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => scrollTo(i)}
                  className={[
                    "h-2.5 rounded-full transition-all duration-300",
                    isActive ? "w-8 bg-white/90" : "w-2.5 bg-white/35 hover:bg-white/55",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
                  ].join(" ")}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Arrows */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 sm:bottom-10 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md ring-1 ring-white/10 text-white/90 hover:bg-black/45 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md ring-1 ring-white/10 text-white/90 hover:bg-black/45 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.section>
  )
}


