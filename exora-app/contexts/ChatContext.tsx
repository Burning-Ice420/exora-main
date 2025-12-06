import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
// Note: Firebase integration would require additional setup
// For now, we'll create a basic structure that can be extended

interface ChatContextType {
  unreadCount: number;
  markAsRead: (roomId: string) => void;
  markAllAsRead: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>(
    {}
  );
  const { user } = useAuth();
  const lastReadTimesRef = useRef<Record<string, number>>({});

  // Keep ref in sync with state
  useEffect(() => {
    lastReadTimesRef.current = lastReadTimes;
  }, [lastReadTimes]);

  // TODO: Implement Firebase real-time database listener for chat messages
  // This would require Firebase configuration
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Placeholder for Firebase integration
    // In a real implementation, you would:
    // 1. Listen to chatRooms in Firebase
    // 2. Count unread messages per room
    // 3. Update unreadCount accordingly

    // For now, we'll keep it simple
    setUnreadCount(0);
  }, [user]);

  const markAsRead = useCallback((roomId: string) => {
    setLastReadTimes((prev) => {
      const currentTime = Date.now();
      if (prev[roomId] && currentTime - prev[roomId] < 1000) {
        return prev;
      }
      return {
        ...prev,
        [roomId]: currentTime,
      };
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setLastReadTimes({});
    setUnreadCount(0);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
