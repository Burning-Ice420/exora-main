"use client"

import { useMemo, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const easeOutExpo = [0.16, 1, 0.3, 1]

function isValidRemoteImageUrl(url) {
  if (!url || typeof url !== "string") return false
  if (url.startsWith("/")) return true
  if (url === "🎯") return false
  if (url.startsWith("data:")) return false

  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    const allowedHost =
      host === "images.unsplash.com" ||
      host === "images.pexels.com" ||
      host === "res.cloudinary.com" ||
      host.endsWith(".cloudinary.com")

    if (allowedHost) return true

    const path = u.pathname.toLowerCase()
    return /\.(png|jpe?g|webp|gif|avif|svg)$/.test(path)
  } catch {
    return false
  }
}

function getActivityBg(activity) {
  const url = activity?.images?.[0]?.url
  if (!isValidRemoteImageUrl(url)) return null
  return url
}

function pickFeaturedActivity(activities = []) {
  if (!Array.isArray(activities) || activities.length === 0) return null
  const withImage = activities.find((a) => Boolean(getActivityBg(a)))
  return withImage || activities[0]
}

const heroContentVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 240, damping: 26, mass: 0.9 },
  },
}

const heroChildren = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
}

export default function ActivitiesHero({ isDark = false, activities = [] }) {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef(null)

  const featured = useMemo(() => pickFeaturedActivity(activities), [activities])
  const bgImage = getActivityBg(featured)
  const title = featured?.name || "Things to do, done right"
  const description =
    featured?.description?.slice(0, 160) ||
    "Curated experiences with premium pacing, clean design, and smooth motion — no clutter, just vibes."
  const eyebrow = featured?.category ? `${featured.category} • Featured` : "Exclusives by Exora • Activities"
  const meta = featured?.location?.name || "Curated picks"
  const href = featured?.slug || featured?._id || featured?.id ? `/activity/${featured.slug || featured._id || featured.id}` : "#activities"
  const cta = featured ? "View featured activity" : "Browse experiences"

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-10, 10])
  const imageY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [10, -10])

  return (
    <section ref={sectionRef} className="pt-2 pb-10 md:pb-14">
      <motion.div
        className={`relative w-full overflow-hidden ${
          isDark ? "bg-black" : "bg-white"
        }`}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 26, scale: 0.985 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 220, damping: 22, mass: 0.9 }
        }
      >
        {/* Full-width background (fade-style) */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(14,165,233,0.16),rgba(0,0,0,0)_60%),radial-gradient(900px_520px_at_0%_100%,rgba(99,102,241,0.10),rgba(0,0,0,0)_60%),linear-gradient(180deg,#050507,#000)]"
              : "bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(14,165,233,0.12),rgba(255,255,255,0)_60%),radial-gradient(900px_520px_at_0%_100%,rgba(99,102,241,0.08),rgba(255,255,255,0)_60%),linear-gradient(180deg,#ffffff,#f6f7fb)]"
          }`}
        />

        {/* Background image layer (soft fade + parallax) */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            y: bgY,
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: bgImage ? 0.22 : 0,
          }}
          initial={reducedMotion ? { opacity: bgImage ? 0.22 : 0 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: bgImage ? 0.22 : 0 } : { opacity: bgImage ? 0.22 : 0 }}
          transition={{ duration: 1.0, ease: easeOutExpo }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/10" />
        <div className={`pointer-events-none absolute inset-0 ${isDark ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"}`} />

        {/* Content */}
        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 py-12 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:py-16">
              <motion.div
                className="lg:col-span-7"
                variants={heroContentVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-md"
                  variants={heroChildren}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/90" />
                  <span>{eyebrow}</span>
                  <span className="text-white/55">•</span>
                  <span className="text-white/70">{meta}</span>
                </motion.div>

                <motion.h1
                  className="mt-5 text-[2.35rem] leading-[1.02] tracking-[-0.04em] font-semibold text-white sm:text-5xl md:text-6xl"
                  variants={heroChildren}
                >
                  {title}
                </motion.h1>

                <motion.p
                  className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
                  variants={heroChildren}
                >
                  {description}
                </motion.p>

                <motion.a
                  href={href}
                  className="mt-7 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_40px_-25px_rgba(0,0,0,0.7)] ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  variants={heroChildren}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                >
                  {cta}
                </motion.a>
              </motion.div>

              {/* Pop-out image (Zomato-ish) */}
              <div className="lg:col-span-5">
                <motion.div
                  className="relative mx-auto w-full max-w-[520px] lg:max-w-none"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0.2 }
                      : { type: "spring", stiffness: 220, damping: 22, mass: 0.9, delay: 0.12 }
                  }
                >
                  <motion.div
                    className="relative overflow-hidden rounded-[26px] border border-white/12 bg-black/20 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)]"
                    style={{ y: imageY }}
                    whileHover={reducedMotion ? undefined : { scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  >
                    <div className="aspect-[4/3] bg-white/5">
                      <img
                        src={bgImage || "/logos.png"}
                        alt={featured?.name || "Featured activity"}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/45" />
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow-[0_18px_40px_-30px_rgba(0,0,0,0.65)]">
                        Featured
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

