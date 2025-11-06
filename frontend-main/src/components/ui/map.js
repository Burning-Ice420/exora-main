"use client"

import { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default).prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const Map = ({
  experiences = [],
  center = [15.2993, 74.1240],
  zoom = 13,
  className = 'h-64',
  onMarkerClick,
  onMarkerHover,
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersLayer = useRef(null)
  const isInitializedRef = useRef(false)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onMarkerHoverRef = useRef(onMarkerHover)
  const prevExpKeyRef = useRef(null)

  // Update callback refs without triggering marker updates
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
    onMarkerHoverRef.current = onMarkerHover
  }, [onMarkerClick, onMarkerHover])

  // Create map once - never recreate, only initialize once
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map)

    const layer = L.layerGroup().addTo(map)
    mapInstance.current = map
    markersLayer.current = layer
    isInitializedRef.current = true

    // Cleanup only on actual unmount (not Strict Mode remount)
    return () => {
      // Only cleanup if component is truly unmounting
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        markersLayer.current = null
        isInitializedRef.current = false
      }
    }
  }, []) // Empty deps - map created only once

  // Compute stable key for experiences
  const expKey = useMemo(
    () => experiences.map((e, idx) => e.id || e._id || `exp-${idx}`).filter(Boolean).join(','),
    [experiences]
  )

  // Update map center/zoom when they change (but don't recreate map)
  useEffect(() => {
    if (mapInstance.current && isInitializedRef.current) {
      mapInstance.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Add markers when experiences change - only update if key actually changed
  useEffect(() => {
    const map = mapInstance.current
    const layer = markersLayer.current
    
    // Wait for map to be initialized
    if (!map || !layer || !isInitializedRef.current) return

    // Skip if experiences haven't actually changed
    if (expKey === prevExpKeyRef.current) return
    
    prevExpKeyRef.current = expKey

    // Clear layer group before adding new markers
    layer.clearLayers()

    // Only add markers if we have experiences
    if (!experiences || experiences.length === 0) return

    experiences.forEach((exp) => {
      let lat, lng
      if (exp.coordinates?.length === 2) {
        [lat, lng] = exp.coordinates
      } else if (exp.location?.coordinates?.length === 2) {
        [lng, lat] = exp.location.coordinates
      } else {
        // Generate stable coordinates based on experience ID for demo
        const seed = (exp.id || exp._id || '').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        lat = center[0] + ((seed % 100) / 1000 - 0.05)
        lng = center[1] + (((seed * 7) % 100) / 1000 - 0.05)
      }

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container" style="
            position: relative;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ">
              <div style="
                transform: rotate(45deg);
                font-size: 20px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
              ">${exp.image || '🗺️'}</div>
            </div>
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid rgba(139, 92, 246, 0.3);
            "></div>
          </div>
        `,
        iconSize: [48, 56],
        iconAnchor: [24, 56],
        popupAnchor: [0, -56]
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layer)

      // Create hover tooltip with brief details
      const tooltipContent = `
        <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 18px;">${exp.image || '📍'}</span>
            <div>
              <h3 style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">${exp.name || 'Trip'}</h3>
              <p style="margin: 0; font-size: 11px; color: #6b7280;">by ${exp.createdBy?.name || exp.host || 'Unknown'}</p>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px; font-size: 11px; color: #6b7280;">
            <span>👥 ${exp.membersInvolved?.length || exp.participants || 0}</span>
            ${exp.budget !== undefined ? `<span>${exp.budget === 0 ? 'Free' : `₹${exp.budget}`}</span>` : ''}
          </div>
          <div style="font-size: 10px; color: #9ca3af; padding-top: 4px; border-top: 1px solid #e5e7eb;">
            Click for details
          </div>
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -15],
        className: 'custom-tooltip',
        permanent: false,
        interactive: true,
        sticky: false,
        opacity: 0.98
      })

      // Use refs for callbacks to prevent re-renders
      marker.on('click', () => {
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current(exp)
        }
      })

      marker.on('mouseover', () => {
        if (onMarkerHoverRef.current) {
          onMarkerHoverRef.current(exp)
        }
      })
    })
  }, [expKey, experiences, center])

  return (
    <div
      ref={mapRef}
      className={`w-full ${className} ${className.includes('h-full') ? '' : 'rounded-lg border border-border'} overflow-hidden bg-background`}
      style={{
        minHeight: '200px',
        backgroundColor: 'var(--background)',
        willChange: 'auto',
        backfaceVisibility: 'hidden',
      }}
    />
  )
}

export default Map
