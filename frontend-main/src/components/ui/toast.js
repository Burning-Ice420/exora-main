"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

// Single Toast
const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <CheckCircle size={22} className="text-green-500" />,
          border: "border-green-400/40",
          bg: "bg-white/60 backdrop-blur-md",
          accent: "bg-green-500",
        }
      case "error":
        return {
          icon: <XCircle size={22} className="text-red-500" />,
          border: "border-red-400/40",
          bg: "bg-white/60 backdrop-blur-md",
          accent: "bg-red-500",
        }
      case "warning":
        return {
          icon: <AlertCircle size={22} className="text-yellow-500" />,
          border: "border-yellow-400/40",
          bg: "bg-white/60 backdrop-blur-md",
          accent: "bg-yellow-500",
        }
      default:
        return {
          icon: <Info size={22} className="text-blue-500" />,
          border: "border-blue-400/40",
          bg: "bg-white/60 backdrop-blur-md",
          accent: "bg-blue-500",
        }
    }
  }

  const { icon, border, bg, accent } = getStyles()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className={`relative w-full max-w-sm ${bg} border ${border} shadow-xl rounded-xl p-4 overflow-hidden`}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${accent}`}
        initial={{ width: "100%" }}
        animate={{ width: 0 }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
      />

      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-1 leading-snug">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-6 right-6 z-[9999] space-y-3">
    <AnimatePresence>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </AnimatePresence>
  </div>
)

// Toast Context + Provider
const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [
      ...prev,
      { id, duration: 4000, type: "info", ...toast },
    ])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (title, message) => addToast({ type: "success", title, message })
  const error = (title, message) => addToast({ type: "error", title, message })
  const warning = (title, message) => addToast({ type: "warning", title, message })
  const info = (title, message) => addToast({ type: "info", title, message })

  return (
    <ToastContext.Provider
      value={{ success, error, warning, info, addToast, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export default useToast
