"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Home as HomeIcon, Search, Compass, Users, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const tabs = [
    { id: "feed", label: "Feed", icon: HomeIcon, href: "/feed" },
    { id: "finder", label: "Finder", icon: Search, href: "/finder" },
    { id: "labs", label: "Labs", icon: Compass, href: "/labs" },
    { id: "family", label: "Family", icon: Users, href: "/family" },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  const getActiveTab = () => {
    if (pathname === "/") return "feed"
    return pathname.split("/")[1] || "feed"
  }

  const activeTab = getActiveTab()

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block w-24 bg-card border-r border-border flex flex-col  items-center py-6 space-y-6"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link key={tab.id} href={tab.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-xl flex items-center ml-5 mt-2 justify-center smooth-transition ${
                  isActive
                    ? "bg-primary text-primary-foreground silver-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon size={22} />
              </motion.button>
            </Link>
          )
        })}
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex justify-around">
          {tabs.slice(0, 3).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link key={tab.id} href={tab.href}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg smooth-transition ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
