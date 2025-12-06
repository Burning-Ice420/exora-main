"use client"

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Check } from 'lucide-react'
import { Button } from './button'

delete (L.Icon.Default).prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapPicker = ({ 
  initialCenter = [15.2993, 74.1240], 
  initialZoom = 13,
  onLocationSelect,
  onCancel 
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialCenter[0], lng: initialCenter[1] })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Cleanup previous map instance if it exists
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
      markerRef.current = null
      setIsInitialized(false)
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map)

      // Create a custom marker icon for the starting point
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="
            position: relative;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                font-size: 24px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
              ">📍</div>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
      })

      // Add initial marker
      const marker = L.marker(initialCenter, { 
        icon: startIcon,
        draggable: true 
      }).addTo(map)

      markerRef.current = marker
      setSelectedLocation({ lat: initialCenter[0], lng: initialCenter[1] })

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setSelectedLocation({ lat, lng })
      })

      // Handle marker drag
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        setSelectedLocation({ lat, lng })
      })

      mapInstance.current = map
      setIsInitialized(true)
      
      // Force map to invalidate size after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize()
        }
      }, 200)
    }, 150)

    return () => {
      clearTimeout(timer)
      if (mapInstance.current) {
        try {
          mapInstance.current.remove()
        } catch (e) {
          console.warn('Error removing map:', e)
        }
        mapInstance.current = null
        markerRef.current = null
        setIsInitialized(false)
      }
    }
  }, [])

  const handleConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      const coords = [selectedLocation.lat, selectedLocation.lng]
      console.log('Confirming location:', coords)
      onLocationSelect({
        coordinates: coords,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      })
    } else {
      console.warn('No location selected')
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-2">
          Click on the map or drag the marker to set your trip starting point
        </p>
        {selectedLocation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-foreground bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
              <MapPin size={14} className="text-primary" />
              <span className="font-mono text-primary font-medium">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
              >
                <Check size={16} className="mr-2" />
                Accept Location
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div 
        ref={mapRef}
        className="flex-1 rounded-lg border border-border overflow-hidden bg-background"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}

export default MapPicker

