"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Star, Check, X, User } from "lucide-react"
import { Toaster, toast } from "sonner"
import { initiateRazorpayCheckout } from "@/lib/razorpay"
import ThankYouModal from "@/components/ui/thank-you-modal"

export default function ActivityDetailPage() {
  const params = useParams()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showCheckout, setShowCheckout] = useState(false)
  const [thankYouOpen, setThankYouOpen] = useState(false)
  const [thankYouData, setThankYouData] = useState({
    passId: "",
    attendeeEmail: "",
    activityName: "",
  })
  const [attendeeInfo, setAttendeeInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const copyPassId = async () => {
    const passId = thankYouData.passId
    if (!passId) return

    try {
      await navigator.clipboard.writeText(passId)
      toast.success("Pass ID copied")
    } catch {
      // Fallback: still show the pass id in UI, but notify failure
      toast.error("Could not copy. Please copy manually.")
    }
  }

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.exora.in"
        const response = await fetch(`${API_BASE_URL}/api/activities/${params.slug}`)

        if (!response.ok) {
          throw new Error("Activity not found")
        }

        const data = await response.json()
        setActivity(data.activity)
      } catch (error) {
        console.error("Error fetching activity:", error)
        toast.error("Failed to load activity")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchActivity()
    }
  }, [params.slug])

  const formatDate = (dateString) => {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handleJoin = async () => {
    if (!attendeeInfo.name || !attendeeInfo.email) {
      toast.error("Please enter your name and email")
      return
    }

    setIsProcessing(true)

    try {
      await initiateRazorpayCheckout({
        amount: activity.price,
        activityName: activity.name,
        activityId: activity._id,
        attendeeName: attendeeInfo.name,
        attendeeEmail: attendeeInfo.email,
        attendeePhone: attendeeInfo.phone,
        onSuccess: async (paymentResponse, verifyData) => {
          setIsProcessing(false)
          setShowCheckout(false)
          setThankYouData({
            passId: verifyData?.passId || "",
            attendeeEmail: attendeeInfo.email || "",
            activityName: activity.name || "",
          })
          setThankYouOpen(true)
          setAttendeeInfo({ name: "", email: "", phone: "" })
        },
        onFailure: (error) => {
          setIsProcessing(false)
          toast.error(error.message || "Payment failed. Please try again.")
        },
      })
    } catch (error) {
      setIsProcessing(false)
      toast.error(error.message || "Failed to initiate payment")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#0a7ea4]/20 border-t-[#0a7ea4] rounded-full animate-spin mb-4"></div>
          <p className="text-black/50 text-sm">Loading activity...</p>
        </div>
      </main>
    )
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-black/50 text-lg">Activity not found</p>
        </div>
      </main>
    )
  }

  const mainImage = activity.images?.[selectedImageIndex] || activity.images?.[0]

  return (
    <main className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <ThankYouModal
        isOpen={thankYouOpen}
        onClose={() => setThankYouOpen(false)}
        activityName={thankYouData.activityName}
        attendeeEmail={thankYouData.attendeeEmail}
        passId={thankYouData.passId}
        onCopyPassId={copyPassId}
      />

      {/* Hero Image Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-black/5">
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || activity.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎯
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Image Gallery */}
      {activity.images && activity.images.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {activity.images.map((img, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-[#0a7ea4] scale-105"
                    : "border-white/50 hover:border-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Image ${index + 1}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#0a7ea4]/10 text-[#0a7ea4] text-sm font-semibold">
              {activity.category}
            </span>
            {activity.featured && (
              <span className="px-3 py-1 rounded-full bg-[#0a7ea4] text-white text-sm font-semibold">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 leading-tight">
            {activity.name}
          </h1>

          <div className="flex items-center gap-6 text-sm text-black/60 mb-6">
            {activity.rating?.average > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#0a7ea4] text-[#0a7ea4]" />
                <span className="font-semibold">{activity.rating.average}</span>
                <span>({activity.rating.count} reviews)</span>
              </div>
            )}
            {activity.location?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{activity.location.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-black/70 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0a7ea4]" />
              <span className="font-medium">{formatDate(activity.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0a7ea4]" />
              <span className="font-medium">{activity.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0a7ea4]" />
              <span className="font-medium">
                {activity.booked || 0}/{activity.capacity || "∞"} booked
              </span>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="bg-[#0a7ea4]/5 border border-[#0a7ea4]/20 rounded-2xl p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#0a7ea4]">
                  ₹{activity.price.toLocaleString("en-IN")}
                </span>
                {activity.originalPrice && activity.originalPrice > activity.price && (
                  <span className="text-lg text-black/40 line-through">
                    ₹{activity.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-sm text-black/60 mt-1">per person</p>
            </div>
            <motion.button
              onClick={() => setShowCheckout(!showCheckout)}
              className="px-8 py-3.5 bg-[#0a7ea4] text-white rounded-xl font-semibold hover:bg-[#08759a] transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              {showCheckout ? "Cancel" : "Book Now"}
            </motion.button>
          </div>

          {showCheckout && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-[#0a7ea4]/20 pt-6 mt-6 space-y-4"
            >
              <h3 className="font-semibold text-lg mb-4">Enter Your Details</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={attendeeInfo.name}
                  onChange={(e) =>
                    setAttendeeInfo({ ...attendeeInfo, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={attendeeInfo.email}
                  onChange={(e) =>
                    setAttendeeInfo({ ...attendeeInfo, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={attendeeInfo.phone}
                  onChange={(e) =>
                    setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
                />
                <motion.button
                  onClick={handleJoin}
                  disabled={isProcessing}
                  className="w-full px-6 py-3.5 bg-[#0a7ea4] text-white rounded-xl font-semibold hover:bg-[#08759a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.97 }}
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-4">About This Experience</h2>
          {activity.description && (
            <div 
              className="text-black/70 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: activity.description }}
            />
          )}
          {activity.longDescription && (
            <div 
              className="text-black/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activity.longDescription }}
            />
          )}
        </div>

        {/* Highlights */}
        {activity.highlights && activity.highlights.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">Highlights</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {activity.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#0a7ea4] flex-shrink-0 mt-0.5" />
                  <span className="text-black/70">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Includes & Excludes */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {activity.includes && activity.includes.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-black mb-4">What's Included</h3>
              <div className="space-y-2">
                {activity.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#0a7ea4] flex-shrink-0 mt-0.5" />
                    <span className="text-black/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.excludes && activity.excludes.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-black mb-4">What's Not Included</h3>
              <div className="space-y-2">
                {activity.excludes.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <X className="w-5 h-5 text-black/30 flex-shrink-0 mt-0.5" />
                    <span className="text-black/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Host */}
        {activity.host && (
          <div className="bg-[#0a7ea4]/5 border border-[#0a7ea4]/20 rounded-2xl p-6 mb-12">
            <h3 className="text-xl font-bold text-black mb-4">Meet Your Host</h3>
            <div className="flex items-start gap-4">
              {activity.host.image ? (
                <Image
                  src={activity.host.image}
                  alt={activity.host.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#0a7ea4] flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-lg mb-1">{activity.host.name}</h4>
                {activity.host.bio && (
                  <p className="text-black/70 leading-relaxed">{activity.host.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requirements */}
        {activity.requirements && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-black mb-4">Requirements</h3>
            <div className="space-y-2 text-black/70">
              {activity.requirements.minAge && (
                <p>Minimum Age: {activity.requirements.minAge} years</p>
              )}
              {activity.requirements.physicalFitness && (
                <p>Physical Fitness: {activity.requirements.physicalFitness}</p>
              )}
              {activity.requirements.specialRequirements &&
                activity.requirements.specialRequirements.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Special Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {activity.requirements.specialRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}


