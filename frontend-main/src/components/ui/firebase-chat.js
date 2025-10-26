"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

// Firebase imports
import { ref, push, onValue, off, set } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { useChat } from '@/contexts/ChatContext'

export default function FirebaseChat({ isOpen, onClose, chatRoom, currentUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef(null)
  const { success, error } = useToast()
  const { markAsRead } = useChat()

  // Firebase real-time listener
  useEffect(() => {
    let unsubscribe = null
    let timeoutId = null

    if (isOpen && chatRoom) {
      setConnectionError(false)
      setRetryCount(0)
      
      if (rtdb) {
        setLoading(true)
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          setLoading(false)
          setConnectionError(true)
        }, 10000) // 10 second timeout
        
        try {
          const messagesRef = ref(rtdb, `chatRooms/${chatRoom.firebaseRoomId}/messages`)
          
          unsubscribe = onValue(messagesRef, (snapshot) => {
            // Clear timeout since we got a response
            if (timeoutId) {
              clearTimeout(timeoutId)
              timeoutId = null
            }
            
            if (snapshot.exists()) {
              const messagesData = Object.entries(snapshot.val()).map(([id, data]) => ({
                id,
                ...data,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
              }))
              setMessages(messagesData)
            } else {
              setMessages([])
            }
            setLoading(false)
          }, (err) => {
            // Clear timeout on error
            if (timeoutId) {
              clearTimeout(timeoutId)
              timeoutId = null
            }
            
            setConnectionError(true)
            error('Connection Error', 'Failed to connect to chat')
            setLoading(false)
          })
        } catch (err) {
          // Clear timeout on error
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          
          setConnectionError(true)
          error('Connection Error', 'Failed to connect to chat')
          setLoading(false)
        }
      } else {
        setConnectionError(true)
        error('Connection Error', 'Chat service not available')
        setLoading(false)
      }
    }

    // Cleanup listener on unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isOpen, chatRoom])



  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatRoom) return

    try {
      setSending(true)
      
      if (!rtdb) {
        error('Connection Error', 'Chat service not available')
        return
      }

      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser._id,
        senderName: currentUser.name,
        timestamp: new Date().toISOString(),
        type: 'user'
      }
      const messagesRef = ref(rtdb, `chatRooms/${chatRoom.firebaseRoomId}/messages`)
      const newMessageRef = push(messagesRef)
      await set(newMessageRef, messageData)
      
      setNewMessage("")
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('Failed to send message:', err)
      error('Send Failed', 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && chatRoom) {
      markAsRead(chatRoom.firebaseRoomId)
    }
  }, [isOpen, chatRoom, markAsRead])


  if (!isOpen || !chatRoom) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Chat Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Trip Chat</h2>
                <p className="text-sm text-muted-foreground">
                  {chatRoom.participants?.length || 0} participants
                  <span className="ml-2 text-xs text-green-500">
                    (Realtime DB)
                  </span>
                </p>
              </div>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading chat...</p>
              </div>
            ) : connectionError ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Connection Failed</h3>
                  <p className="text-muted-foreground mb-4">
                    Unable to connect to chat service. Please try again.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chat room: {chatRoom.firebaseRoomId}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setConnectionError(false)
                    setLoading(true)
                    setRetryCount(prev => prev + 1)
                    // Trigger reconnection by updating a dependency
                    window.location.reload()
                  }}
                  variant="outline"
                >
                  Retry Connection {retryCount > 0 && `(${retryCount})`}
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground">Start the conversation!</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Chat room: {chatRoom.firebaseRoomId}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === currentUser._id
                        ? 'bg-primary text-primary-foreground'
                        : message.type === 'system'
                        ? 'bg-muted text-muted-foreground text-center'
                        : 'bg-card border border-border'
                    }`}
                  >
                    {message.type !== 'system' && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={connectionError ? "Connection failed - cannot send messages" : "Type a message..."}
                className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={sending || connectionError}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending || connectionError}
                className="px-4"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
