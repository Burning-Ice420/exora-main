"use client"

import { useEffect, useState } from 'react'

/**
 * Custom hook to load Google Maps JavaScript API script
 * Ensures the script is loaded only once across the entire app
 * 
 * @param {string} apiKey - Google Maps API key from environment variable
 * @returns {boolean} - True when script is loaded and ready
 */
export function useGoogleMaps(apiKey) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If no API key provided, don't attempt to load
    if (!apiKey) {
      setError('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_KEY in your .env file.')
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script exists, wait for it to load
      existingScript.addEventListener('load', () => {
        setIsLoaded(true)
      })
      return
    }

    // Create and load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
      setError(null)
    }
    
    script.onerror = () => {
      setError('Failed to load Google Maps script. Please check your API key and network connection.')
      setIsLoaded(false)
    }

    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Don't remove the script on cleanup as it might be used by other components
      // The script will remain in the DOM for reuse
    }
  }, [apiKey])

  return { isLoaded, error }
}


