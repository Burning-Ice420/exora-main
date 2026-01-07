"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'

/**
 * Google Places Autocomplete Component
 * 
 * Features:
 * - Client-side autocomplete using Google Places API
 * - Debounced input to reduce API calls
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Loading states and error handling
 * - Extracts formatted_address, latitude, and longitude
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected address value
 * @param {Function} props.onSelect - Callback when a place is selected
 *   Receives: { address, latitude, longitude, place }
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the input
 * @param {Object} props.autocompleteOptions - Options to pass to Google Autocomplete
 */
export default function GooglePlacesAutocomplete({
  value = '',
  onSelect,
  placeholder = 'Search for a location...',
  className = '',
  disabled = false,
  autocompleteOptions = {},
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const { isLoaded, error: mapsError } = useGoogleMaps(apiKey)
  
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState(null)
  
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const containerRef = useRef(null)

  // Initialize Google Places services when script is loaded
  useEffect(() => {
    if (isLoaded && window.google && !autocompleteServiceRef.current) {
      try {
        // Create AutocompleteService for getting predictions
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
        
        // Create PlacesService for getting place details
        const mapDiv = document.createElement('div')
        const map = new window.google.maps.Map(mapDiv)
        placesServiceRef.current = new window.google.maps.places.PlacesService(map)
      } catch (err) {
        console.error('Error initializing Google Places services:', err)
        setError('Failed to initialize location search. Please refresh the page.')
      }
    }
  }, [isLoaded])

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounced search function
  const performSearch = useCallback((query) => {
    if (!autocompleteServiceRef.current || !query.trim()) {
      setPredictions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const request = {
      input: query,
      ...autocompleteOptions,
    }

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setLoading(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions)
          setSelectedIndex(-1)
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([])
        } else {
          console.error('Places API error:', status)
          setError('Unable to search locations. Please try again.')
          setPredictions([])
        }
      }
    )
  }, [autocompleteOptions])

  // Handle input change with debounce
  const handleInputChange = useCallback((e) => {
    const query = e.target.value
    setInputValue(query)
    setIsOpen(true)
    setSelectedIndex(-1)

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce the search (300ms delay)
    debounceTimerRef.current = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query)
      } else {
        setPredictions([])
        setLoading(false)
      }
    }, 300)
  }, [performSearch])

  // Get place details and call onSelect
  const handlePlaceSelect = useCallback((placeId, description) => {
    if (!placesServiceRef.current || !placeId) return

    setLoading(true)
    setError(null)

    const request = {
      placeId: placeId,
      fields: ['formatted_address', 'geometry', 'name'],
    }

    placesServiceRef.current.getDetails(request, (place, status) => {
      setLoading(false)
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const address = place.formatted_address || description
        const lat = place.geometry?.location?.lat()
        const lng = place.geometry?.location?.lng()

        // Validate that we have coordinates
        if (lat === undefined || lng === undefined || lat === null || lng === null) {
          setError('Selected location does not have valid coordinates. Please choose another location.')
          return
        }

        // Call the onSelect callback with all the data
        if (onSelect) {
          onSelect({
            address,
            latitude: lat,
            longitude: lng,
            place: place,
          })
        }

        setInputValue(address)
        setPredictions([])
        setIsOpen(false)
        setSelectedIndex(-1)
      } else {
        console.error('Place details error:', status)
        setError('Failed to get location details. Please try again.')
      }
    })
  }, [onSelect])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || predictions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        // If there's a value but no predictions, try to use the current input
        if (inputValue.trim() && onSelect) {
          onSelect({
            address: inputValue,
            latitude: null,
            longitude: null,
            place: null,
          })
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < predictions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          const prediction = predictions[selectedIndex]
          handlePlaceSelect(prediction.place_id, prediction.description)
        } else if (predictions.length > 0) {
          // Select first prediction if none selected
          handlePlaceSelect(predictions[0].place_id, predictions[0].description)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, predictions, selectedIndex, inputValue, handlePlaceSelect, onSelect])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear function
  const handleClear = useCallback(() => {
    setInputValue('')
    setPredictions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    setError(null)
    if (onSelect) {
      onSelect({
        address: '',
        latitude: null,
        longitude: null,
        place: null,
      })
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [onSelect])

  // Show error if Google Maps failed to load
  if (mapsError) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          {mapsError}
        </div>
      </div>
    )
  }

  // Show loading state while Google Maps script loads
  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            disabled
            placeholder="Loading location search..."
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary opacity-50 cursor-not-allowed"
          />
          <Loader2 size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
        {inputValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-muted/50 smooth-transition"
            aria-label="Clear input"
          >
            <X size={14} className="text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
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
                <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Searching locations...</p>
              </div>
            ) : predictions.length > 0 ? (
              <div className="py-1">
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-3 py-2 text-left text-foreground hover:bg-muted/50 flex items-start gap-2 transition-colors ${
                      selectedIndex === index ? 'bg-muted/50' : ''
                    }`}
                  >
                    <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      {prediction.structured_formatting?.secondary_text && (
                        <div className="text-xs text-muted-foreground truncate">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : inputValue.trim().length > 0 ? (
              <div className="p-3 text-center text-muted-foreground">
                <p className="text-sm">No locations found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


