"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Home as HomeIcon, Search, Compass, Users, User, Settings, MessageCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ConnectionsManager from "./connections-manager"
import ChatSidebar from "./ui/chat-sidebar"
import { useChat } from "@/contexts/ChatContext"

export default function Navigation() {
  const pathname = usePathname()
  const [showChatSidebar, setShowChatSidebar] = useState(false)
  const { unreadCount } = useChat()


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
        
        {/* Connections Manager */}
        <div className="ml-5 mt-2">
          <ConnectionsManager />
        </div>

        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChatSidebar(true)}
          className="w-14 h-14 rounded-xl flex items-center ml-5 mt-2 justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 smooth-transition relative"
        >
          <MessageCircle size={22} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
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
          
          {/* Mobile Chat Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChatSidebar(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg smooth-transition text-muted-foreground hover:text-foreground relative"
          >
            <div className="relative">
              <MessageCircle size={20} />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.div>
              )}
            </div>
            <span className="text-xs font-medium">Chat</span>
          </motion.button>

          {/* Mobile Connections Manager */}
          <div className="flex flex-col items-center gap-1">
            <ConnectionsManager />
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={showChatSidebar}
        onClose={() => setShowChatSidebar(false)}
      />
    </>
  )
}
