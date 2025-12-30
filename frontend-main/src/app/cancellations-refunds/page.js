"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CancellationsRefundsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Cancellation and Refund Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="prose prose-invert max-w-none space-y-6 text-foreground"
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              At exora, we understand that plans can change. This Cancellation and Refund Policy outlines the terms and conditions for canceling trips and requesting refunds. Please read this policy carefully before making a booking.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Trip Cancellations</h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">2.1 Cancellation by Participant</h3>
              <p className="text-muted-foreground leading-relaxed">
                Participants may cancel their participation in a trip at any time. The refund amount depends on when the cancellation is made:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>More than 30 days before trip start:</strong> Full refund minus processing fees (5% of total amount)</li>
                <li><strong>15-30 days before trip start:</strong> 75% refund minus processing fees</li>
                <li><strong>7-14 days before trip start:</strong> 50% refund minus processing fees</li>
                <li><strong>Less than 7 days before trip start:</strong> No refund (except in cases of emergency or force majeure)</li>
              </ul>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground">2.2 Cancellation by Trip Host</h3>
              <p className="text-muted-foreground leading-relaxed">
                If a trip host cancels a trip, all participants will receive a full refund, including processing fees. We will also make every effort to help you find alternative trips.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground">2.3 Cancellation by exora</h3>
              <p className="text-muted-foreground leading-relaxed">
                In rare cases, exora may need to cancel a trip due to safety concerns, natural disasters, or other unforeseen circumstances. In such cases, all participants will receive a full refund, and we will assist in finding alternative arrangements.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Refund Process</h2>
            <p className="text-muted-foreground leading-relaxed">
              To request a cancellation and refund:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>Go to your trip details page and click "Cancel Participation"</li>
              <li>Select your reason for cancellation</li>
              <li>Submit your cancellation request</li>
              <li>You will receive a confirmation email with refund details</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Refunds will be processed to the original payment method within 7-14 business days after approval. Processing times may vary depending on your payment provider.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Special Circumstances</h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">4.1 Medical Emergencies</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you need to cancel due to a medical emergency (yours or an immediate family member), you may be eligible for a full refund or credit, subject to providing appropriate documentation (medical certificate, hospital records, etc.).
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground">4.2 Force Majeure</h3>
              <p className="text-muted-foreground leading-relaxed">
                In cases of force majeure events (natural disasters, pandemics, government restrictions, etc.), we will work with all parties to find fair solutions, which may include full refunds, trip credits, or rescheduling.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-foreground">4.3 Travel Insurance</h3>
              <p className="text-muted-foreground leading-relaxed">
                We strongly recommend purchasing travel insurance to cover unexpected cancellations, medical emergencies, and other travel-related issues. exora is not responsible for losses that could have been covered by travel insurance.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Partial Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              In some cases, partial refunds may be available for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Unused portions of trip packages (if you leave early)</li>
              <li>Services that were not provided as described</li>
              <li>Significant changes to trip itinerary that you did not agree to</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Partial refund requests will be evaluated on a case-by-case basis.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Processing Fees</h2>
            <p className="text-muted-foreground leading-relaxed">
              A processing fee of 5% of the total trip cost (minimum ₹100) applies to all cancellations, except when:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>The trip is canceled by the host or exora</li>
              <li>The cancellation is due to a medical emergency (with documentation)</li>
              <li>The cancellation is due to force majeure events</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Trip Credits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Instead of a refund, you may choose to receive trip credits that can be used for future bookings. Trip credits:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Are valid for 12 months from the date of issue</li>
              <li>Can be used for any trip on the platform</li>
              <li>Are non-transferable and non-refundable</li>
              <li>May include a bonus amount (e.g., 10% extra) as an incentive</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Disputes and Appeals</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you believe your cancellation or refund request was incorrectly processed, you can:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>Contact our support team at support@exora.in with your booking reference number</li>
              <li>Provide any relevant documentation or evidence</li>
              <li>Our team will review your case within 5-7 business days</li>
              <li>We will provide a written response with our decision and reasoning</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify this Cancellation and Refund Policy at any time. Changes will be effective immediately upon posting to this page. Your continued use of our service after any changes constitutes acceptance of the new policy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The policy in effect at the time of your booking will apply to your cancellation and refund request.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about cancellations or refunds, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Email:</strong> info@exora.in</p>
              <p><strong className="text-foreground">Refund Inquiries:</strong> info@exora.in</p>
              <p><strong className="text-foreground">Phone:</strong> +91 9226947807</p>
              <p><strong className="text-foreground">Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <Button
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            I Understand
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

