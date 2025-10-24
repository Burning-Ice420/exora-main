"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, Palette, Globe, LogOut, Save, Edit3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
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

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    setLoading(false)
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

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-foreground">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-foreground">Appearance</h4>
      
      <div className="space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <h5 className="font-medium text-foreground mb-2">Theme</h5>
          <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Light</Button>
            <Button className="flex-1">Dark</Button>
            <Button variant="outline" className="flex-1">System</Button>
          </div>
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
      <div className="flex h-full">
        {/* Settings Sidebar */}
        <div className="w-64 bg-card border-r border-border p-6">
          <div className="flex items-center gap-3 mb-8">
            <Settings size={24} className="text-primary" />
            <h2 className="text-xl font-bold text-foreground">Settings</h2>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
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
