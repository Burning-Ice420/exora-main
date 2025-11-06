"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, Palette, Globe, LogOut, Save, Edit3, Sun, Moon, Monitor } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [systemTheme, setSystemTheme] = useState("light")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    locationSharing: false,
    showOnlineStatus: true
  })

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemTheme(mediaQuery.matches ? "dark" : "light")
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    setLoading(false)
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  const getCurrentTheme = () => {
    if (theme === "system") {
      return systemTheme
    }
    return theme
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
  ]

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 border-2 border-primary flex items-center justify-center text-2xl overflow-hidden">
          {user?.profileImage?.secureUrl || user?.profileImage?.url ? (
            <img 
              src={user.profileImage.secureUrl || user.profileImage.url} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            "👤"
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{user?.name || "User"}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <h4 className="text-sm lg:text-md font-semibold text-foreground">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
            <Input value={user?.name || ""} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
            <Input value={user?.age || ""} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
            <Input value={user?.location || ""} disabled className="bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-foreground">Notification Preferences</h4>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Email Notifications</h5>
            <p className="text-sm text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch 
            checked={notifications.email} 
            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Push Notifications</h5>
            <p className="text-sm text-muted-foreground">Receive push notifications</p>
          </div>
          <Switch 
            checked={notifications.push} 
            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Marketing Emails</h5>
            <p className="text-sm text-muted-foreground">Receive promotional content</p>
          </div>
          <Switch 
            checked={notifications.marketing} 
            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
          />
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-foreground">Privacy & Security</h4>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Public Profile</h5>
            <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
          </div>
          <Switch 
            checked={privacy.profilePublic} 
            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profilePublic: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Location Sharing</h5>
            <p className="text-sm text-muted-foreground">Share your location with friends</p>
          </div>
          <Switch 
            checked={privacy.locationSharing} 
            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, locationSharing: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div>
            <h5 className="font-medium text-foreground">Online Status</h5>
            <p className="text-sm text-muted-foreground">Show when you're online</p>
          </div>
          <Switch 
            checked={privacy.showOnlineStatus} 
            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
          />
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => {
    const currentTheme = getCurrentTheme()
    const isLight = currentTheme === "light"
    const isDark = currentTheme === "dark"
    const isSystem = theme === "system"
    
    return (
      <div className="space-y-6">
        <h4 className="text-md font-semibold text-foreground">Appearance</h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-xl border border-border">
            <h5 className="font-medium text-foreground mb-2">Theme</h5>
            <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
            <div className="flex gap-3">
              <Button 
                variant={isLight && !isSystem ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                className={`flex-1 flex items-center justify-center gap-2 ${isLight && !isSystem ? "" : "hover:bg-muted/50"}`}
              >
                <Sun size={16} />
                Light
              </Button>
              <Button 
                variant={isDark && !isSystem ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 flex items-center justify-center gap-2 ${isDark && !isSystem ? "" : "hover:bg-muted/50"}`}
              >
                <Moon size={16} />
                Dark
              </Button>
              <Button 
                variant={isSystem ? "default" : "outline"}
                onClick={() => handleThemeChange("system")}
                className={`flex-1 flex items-center justify-center gap-2 ${isSystem ? "" : "hover:bg-muted/50"}`}
              >
                <Monitor size={16} />
                System
              </Button>
            </div>
            {isSystem && (
              <p className="text-xs text-muted-foreground mt-3">
                Currently using {systemTheme} mode (system preference)
              </p>
            )}
          </div>

          <div className="p-4 bg-card rounded-xl border border-border">
            <h5 className="font-medium text-foreground mb-2">Language</h5>
            <p className="text-sm text-muted-foreground mb-4">Select your preferred language</p>
            <select className="w-full p-3 bg-background border border-border rounded-lg text-foreground">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-foreground">Language & Region</h4>
      
      <div className="space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <h5 className="font-medium text-foreground mb-2">Display Language</h5>
          <select className="w-full p-3 bg-background border border-border rounded-lg text-foreground">
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <h5 className="font-medium text-foreground mb-2">Region</h5>
          <select className="w-full p-3 bg-background border border-border rounded-lg text-foreground">
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>India</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full bg-background overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 bg-card border-b lg:border-r border-border p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4 lg:mb-8">
            <Settings size={20} className="text-primary" />
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Settings</h2>
          </div>
          
          <nav className="flex lg:flex-col gap-2 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 lg:mx-0 px-4 lg:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg smooth-transition text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon size={18} className="" />
                  <span className="text-sm lg:text-base font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl">
            {activeTab === "profile" && renderProfileSettings()}
            {activeTab === "notifications" && renderNotificationSettings()}
            {activeTab === "privacy" && renderPrivacySettings()}
            {activeTab === "appearance" && renderAppearanceSettings()}
            {activeTab === "language" && renderLanguageSettings()}
          </div>

          {/* Logout Button */}
          <div className="mt-12 pt-8 border-t border-border">
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
