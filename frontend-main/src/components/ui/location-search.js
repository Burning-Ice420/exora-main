"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Button } from './button'
import { motion, AnimatePresence } from 'framer-motion'

const LocationSearch = ({ value, onChange, onLocationSelect, placeholder = "Search for a location..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Popular locations for suggestions
  const popularLocations = [
    'Mumbai, India',
    'Delhi, India', 
    'Bangalore, India',
    'Chennai, India',
    'Kolkata, India',
    'Pune, India',
    'Hyderabad, India',
    'Ahmedabad, India',
    'Goa, India',
    'Kerala, India',
    'Rajasthan, India',
    'Himachal Pradesh, India',
    'Kashmir, India',
    'Ladakh, India',
    'Sikkim, India',
    'New York, USA',
    'London, UK',
    'Paris, France',
    'Tokyo, Japan',
    'Sydney, Australia',
    'Dubai, UAE',
    'Singapore',
    'Bangkok, Thailand',
    'Bali, Indonesia',
    'Kathmandu, Nepal',
    'Colombo, Sri Lanka',
    'Dhaka, Bangladesh',
    'Islamabad, Pakistan',
    'Karachi, Pakistan',
    'Lahore, Pakistan'
  ]

  useEffect(() => {
    if (searchQuery.length > 0) {
      setLoading(true)
      // Simulate API call with popular locations
      setTimeout(() => {
        const filtered = popularLocations.filter(location =>
          location.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSuggestions(filtered.slice(0, 8))
        setLoading(false)
      }, 300)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (location) => {
    const callback = onLocationSelect || onChange
    if (callback) {
      callback(location)
    }
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    const callback = onLocationSelect || onChange
    if (callback) {
      callback('')
    }
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (value || '')}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {value && !isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-3 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm mt-2">Searching...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-1">
                {suggestions.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(location)}
                    className="w-full px-3 py-2 text-left text-foreground hover:bg-muted/50 flex items-center gap-2"
                  >
                    <MapPin size={16} className="text-muted-foreground" />
                    {location}
                  </button>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="p-3 text-center text-muted-foreground">
                <p className="text-sm">No locations found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Popular Locations
                </div>
                {popularLocations.slice(0, 6).map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(location)}
                    className="w-full px-3 py-2 text-left text-foreground hover:bg-muted/50 flex items-center gap-2"
                  >
                    <MapPin size={16} className="text-muted-foreground" />
                    {location}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LocationSearch
