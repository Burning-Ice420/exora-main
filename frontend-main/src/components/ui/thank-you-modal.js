"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Copy, X } from "lucide-react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

export default function ThankYouModal({
  isOpen,
  onClose,
  activityName,
  passId,
  attendeeEmail,
  onCopyPassId,
}) {
  const reducedMotion = useReducedMotion()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Payment confirmed"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 18 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
          transition={
            reducedMotion
              ? { duration: 0.15 }
              : { type: "spring", stiffness: 260, damping: 22, mass: 0.9 }
          }
          className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] text-white shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)]"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(14,165,233,0.18)_0%,rgba(0,0,0,0)_60%)]" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative flex items-start gap-4">
              <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/25">
                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-wide text-white/70">
                  Payment confirmed
                </div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                  Thank you{activityName ? ` — you’re in!` : "!"}
                </h3>
                {activityName && (
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Booking for <span className="font-semibold text-white">{activityName}</span> is confirmed.
                  </p>
                )}
                {attendeeEmail && (
                  <p className="mt-3 text-sm text-white/70">
                    We’ve emailed your pass to{" "}
                    <span className="font-semibold text-white">{attendeeEmail}</span>.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-7 pb-6 sm:pb-7">
            {passId && (
              <div className="mt-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white/60">Pass ID</div>
                    <div className="mt-1 truncate font-mono text-sm text-white/90">{passId}</div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={onCopyPassId}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </motion.button>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                Done
              </button>
              <a
                href="/activities"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)] transition-colors hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Back to Exclusives
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


