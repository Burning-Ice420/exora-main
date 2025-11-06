"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { rtdb } from '@/lib/firebase'
import { ref, onValue, off } from 'firebase/database'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastReadTimes, setLastReadTimes] = useState({})
  const { user } = useAuth()
  const lastReadTimesRef = useRef({})

  // Keep ref in sync with state
  useEffect(() => {
    lastReadTimesRef.current = lastReadTimes
  }, [lastReadTimes])

  useEffect(() => {
    if (!user || !rtdb) return

    // Listen to all chat rooms for unread messages
    const chatRoomsRef = ref(rtdb, 'chatRooms')
    const unsubscribes = []
    
    const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUnreadCount(0)
        return
      }

      const chatRooms = snapshot.val()

      // Clear previous listeners
      unsubscribes.forEach(unsub => unsub())
      unsubscribes.length = 0

      let totalUnread = 0
      let processedRooms = 0

      Object.entries(chatRooms).forEach(([roomId, roomData]) => {
        // Check if user is a participant in this chat room
        if (roomData.participants && roomData.participants.includes(user._id)) {
          const messagesRef = ref(rtdb, `chatRooms/${roomId}/messages`)
          
          const messageUnsubscribe = onValue(messagesRef, (messagesSnapshot) => {
            if (messagesSnapshot.exists()) {
              const messages = messagesSnapshot.val()
              // Use ref to get current value without causing re-renders
              const lastReadTime = lastReadTimesRef.current[roomId] || 0
              
              // Count unread messages (messages after last read time and not sent by current user)
              const unreadInRoom = Object.values(messages).filter(message => 
                new Date(message.timestamp).getTime() > lastReadTime && 
                message.senderId !== user._id
              ).length
              
              totalUnread += unreadInRoom
            }
            
            processedRooms++
            if (processedRooms === Object.keys(chatRooms).length) {
              setUnreadCount(totalUnread)
            }
          })
          
          unsubscribes.push(messageUnsubscribe)
        }
      })

      // If no rooms were processed, set count to 0
      if (processedRooms === 0) {
        setUnreadCount(0)
      }
    })

    return () => {
      off(chatRoomsRef)
      unsubscribes.forEach(unsub => unsub())
    }
  }, [user]) // Removed lastReadTimes from dependencies

  const markAsRead = useCallback((roomId) => {
    setLastReadTimes(prev => {
      const currentTime = Date.now()
      // Only update if the roomId doesn't exist or if time has significantly changed (avoid rapid updates)
      if (prev[roomId] && (currentTime - prev[roomId]) < 1000) {
        return prev // Recently updated, skip
      }
      return {
        ...prev,
        [roomId]: currentTime
      }
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setLastReadTimes({})
    setUnreadCount(0)
  }, [])

  return (
    <ChatContext.Provider value={{
      unreadCount,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
