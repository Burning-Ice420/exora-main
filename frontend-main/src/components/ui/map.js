"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const Map = ({ experiences = [], center = [15.2993, 74.1240], zoom = 13, className = "h-64" }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map with terrain view
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    })

    // Add terrain tile layer
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors',
      maxZoom: 17,
    }).addTo(map)

    // Add experience markers
    experiences.forEach((experience, index) => {
      // Generate random coordinates around center for demo
      const lat = center[0] + (Math.random() - 0.5) * 0.1
      const lng = center[1] + (Math.random() - 0.5) * 0.1
      
      const marker = L.marker([lat, lng]).addTo(map)
      
      // Create custom popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${experience.image || '📍'}</span>
            <div>
              <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">${experience.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">by ${experience.host}</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #6b7280;">
              👥 ${experience.participants} going
            </span>
            <span style="font-size: 11px; color: #6b7280;">
              🕐 ${experience.time}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; padding: 2px 8px; background: #e5e7eb; border-radius: 12px; color: #374151;">
              ${experience.category}
            </span>
            <span style="font-size: 12px; font-weight: 600; color: #059669;">
              ${experience.price === 0 ? 'Free' : `₹${experience.price}`}
            </span>
          </div>
        </div>
      `
      
      marker.bindPopup(popupContent)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, experiences])

  return (
    <div 
      ref={mapRef} 
      className={`w-full ${className} rounded-lg overflow-hidden border border-border`}
      style={{ minHeight: '200px' }}
    />
  )
}

export default Map
