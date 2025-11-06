"use client"

import { Suspense } from "react"
import FinderScreen from "@/components/screens/finder-screen"

function FinderContent() {
  return <FinderScreen />
}

export default function FinderPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <FinderContent />
    </Suspense>
  )
}
