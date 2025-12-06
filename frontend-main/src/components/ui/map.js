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
      // Check for startCoordinates first (for trips)
      if (exp.startCoordinates?.length === 2) {
        [lat, lng] = exp.startCoordinates
      } else if (exp.coordinates?.length === 2) {
        [lat, lng] = exp.coordinates
      } else if (exp.location?.coordinates?.length === 2) {
        // Handle both [lat, lng] and [lng, lat] formats
        if (Array.isArray(exp.location.coordinates[0])) {
          [lng, lat] = exp.location.coordinates
        } else {
          const coords = exp.location.coordinates
          // Try to determine format - if lng > 180 or lat > 90, swap
          if (Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
            [lng, lat] = coords
          } else {
            [lat, lng] = coords
          }
        }
      } else {
        // Skip experiences without valid coordinates - don't generate mock points
        return
      }

      // Get user profile picture or default avatar
      const profileImage = exp.createdBy?.profileImage || exp.hostAvatar || exp.profileImage
      const userName = exp.createdBy?.name || exp.host || 'Unknown'
      const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container" style="
            position: relative;
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${profileImage ? `
              <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2);
                overflow: hidden;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <img 
                  src="${profileImage}" 
                  alt="${userName}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  "
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px\\'>${userInitials}</div>'"
                />
              </div>
            ` : `
              <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
              ">${userInitials}</div>
            `}
            <div style="
              position: absolute;
              bottom: -6px;
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
        iconSize: [56, 64],
        iconAnchor: [28, 64],
        popupAnchor: [0, -64]
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layer)

      // Create hover tooltip with user profile picture and details
      const tooltipProfileImage = exp.createdBy?.profileImage || exp.hostAvatar || exp.profileImage
      const tooltipUserName = exp.createdBy?.name || exp.host || 'Unknown'
      const tooltipUserInitials = tooltipUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
      const tripName = exp.name || 'Trip'
      const location = exp.location || exp.destination || ''
      
      // Escape HTML to prevent XSS
      const escapeHtml = (text) => {
        if (!text) return ''
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }
        return String(text).replace(/[&<>"']/g, (m) => map[m])
      }
      
      const tooltipContent = `
        <div style="min-width: 220px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif; padding: 12px; background: white; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            ${tooltipProfileImage ? `
              <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: 2px solid #e5e7eb;
                overflow: hidden;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                flex-shrink: 0;
              ">
                <img 
                  src="${escapeHtml(tooltipProfileImage)}" 
                  alt="${escapeHtml(tooltipUserName)}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  "
                  onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px\\'>${escapeHtml(tooltipUserInitials)}</div>'"
                />
              </div>
            ` : `
              <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                border: 2px solid #e5e7eb;
                flex-shrink: 0;
              ">${escapeHtml(tooltipUserInitials)}</div>
            `}
            <div style="flex: 1; min-width: 0;">
              <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${escapeHtml(tripName)}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">by ${escapeHtml(tooltipUserName)}</p>
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 8px; font-size: 12px; color: #6b7280;">
            <span style="display: flex; align-items: center; gap: 4px;">👥 ${exp.membersInvolved?.length || exp.participants || 0}</span>
            ${exp.budget !== undefined ? `<span style="display: flex; align-items: center; gap: 4px;">${exp.budget === 0 ? '🆓 Free' : `💰 ₹${exp.budget.toLocaleString()}`}</span>` : ''}
          </div>
          ${location ? `
            <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              📍 ${escapeHtml(location)}
            </div>
          ` : ''}
          <div style="font-size: 10px; color: #9ca3af; padding-top: 8px; border-top: 1px solid #e5e7eb; text-align: center; font-weight: 500;">
            Click for details
          </div>
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -25],
        className: 'custom-tooltip',
        permanent: false,
        interactive: true,
        sticky: true,
        opacity: 1
      })

      // Use refs for callbacks to prevent re-renders
      marker.on('click', () => {
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current(exp)
        }
      })

      // Show tooltip on hover
      marker.on('mouseover', (e) => {
        marker.openTooltip()
        if (onMarkerHoverRef.current) {
          onMarkerHoverRef.current(exp)
        }
      })

      marker.on('mouseout', () => {
        marker.closeTooltip()
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
