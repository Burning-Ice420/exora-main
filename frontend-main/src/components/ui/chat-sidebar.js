"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Users, Settings, X, Crown, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/server/api"
import { useToast } from "@/components/ui/toast"
import FirebaseChat from "./firebase-chat"

export default function ChatSidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    if (isOpen && user) {
      loadChatRooms()
    }
  }, [isOpen, user])

  const loadChatRooms = async () => {
    try {
      setLoading(true)
      const response = await api.getMyChatRooms()
      
      if (response.status === 'success') {
        setChatRooms(response.chatRooms || [])
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
      error('Failed to Load', 'Could not load chat rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChat = (chatRoom) => {
    setSelectedChat(chatRoom)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedChat(null)
  }

  const handleDeleteChat = async (chatRoomId, e) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, [chatRoomId]: true }))
      
      await api.deleteChatRoom(chatRoomId)
      
      // Remove from local state
      setChatRooms(prev => prev.filter(chat => chat._id !== chatRoomId))
      success('Chat Closed', 'Chat room has been closed permanently')
    } catch (err) {
      console.error('Failed to delete chat:', err)
      error('Delete Failed', 'Could not close chat room')
    } finally {
      setActionLoading(prev => ({ ...prev, [chatRoomId]: false }))
    }
  }

  const isOwner = (chatRoom) => {
    return chatRoom.tripOwnerId?._id === user?._id || chatRoom.tripOwnerId === user?._id
  }

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInHours = (now - messageTime) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      return `${Math.floor(diffInHours / 24)}d`
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Chats Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Join some trips to start chatting with fellow travelers!
                </p>
              </div>
            ) : (
              <div className="p-2">
                {chatRooms.map((chatRoom, idx) => (
                  <motion.div
                    key={chatRoom._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    onClick={() => handleOpenChat(chatRoom)}
                    className="group relative p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Trip Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-lg overflow-hidden">
                        {chatRoom.tripId?.name ? chatRoom.tripId.name.charAt(0).toUpperCase() : 'T'}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {chatRoom.tripId?.name || 'Trip Chat'}
                          </h4>
                          {isOwner(chatRoom) && (
                            <Crown size={12} className="text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chatRoom.tripId?.location || 'Location not specified'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users size={10} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {chatRoom.participants?.length || 0} members
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {formatLastMessageTime(chatRoom.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      {/* Owner Actions */}
                      {isOwner(chatRoom) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteChat(chatRoom._id, e)}
                            disabled={actionLoading[chatRoom._id]}
                            className="p-1 h-6 w-6 text-red-500 hover:bg-red-500/10"
                            title="Delete Chat"
                          >
                            {actionLoading[chatRoom._id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Chat with fellow travelers from your trips
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Chat Modal */}
      <FirebaseChat
        isOpen={showChat}
        onClose={handleCloseChat}
        chatRoom={selectedChat}
        currentUser={user}
      />
    </>
  )
}
