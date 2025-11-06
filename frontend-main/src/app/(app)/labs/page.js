"use client"

import { Suspense } from "react"
import LabsScreen from "@/components/screens/labs-screen"

function LabsContent() {
  return <LabsScreen />
}

export default function LabsPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <LabsContent />
    </Suspense>
  )
}
