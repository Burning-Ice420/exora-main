"use client"

import { useEffect, useRef, useMemo, useCallback } from 'react'
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
  const linesLayer = useRef(null)
  const blocksLayer = useRef(null)
  const isInitializedRef = useRef(false)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onMarkerHoverRef = useRef(onMarkerHover)
  const prevExpKeyRef = useRef(null)
  const currentZoomRef = useRef(zoom)

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

    const markersLayerGroup = L.layerGroup().addTo(map)
    const linesLayerGroup = L.layerGroup().addTo(map)
    const blocksLayerGroup = L.layerGroup().addTo(map)
    
    mapInstance.current = map
    markersLayer.current = markersLayerGroup
    linesLayer.current = linesLayerGroup
    blocksLayer.current = blocksLayerGroup
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

  // Helper function to calculate distance between two coordinates (in km)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Function to update markers and blocks based on zoom level
  const updateMarkersAndBlocks = useCallback(() => {
    const map = mapInstance.current
    const markersLayerGroup = markersLayer.current
    const linesLayerGroup = linesLayer.current
    const blocksLayerGroup = blocksLayer.current
    
    if (!map || !markersLayerGroup || !linesLayerGroup || !blocksLayerGroup || !isInitializedRef.current) return
    if (!experiences || experiences.length === 0) return

    // Clear all layers
    markersLayerGroup.clearLayers()
    linesLayerGroup.clearLayers()
    blocksLayerGroup.clearLayers()

    const currentZoom = map.getZoom()
    const zoomThreshold = 11 // Lower threshold for easier testing - zoom level threshold for breaking down into blocks
    
    // Get experiences with valid coordinates
    const validExperiences = experiences
      .map(exp => {
        let lat, lng
        if (exp.startCoordinates?.length === 2) {
          [lat, lng] = exp.startCoordinates
        } else if (exp.coordinates?.length === 2) {
          [lat, lng] = exp.coordinates
        } else if (exp.location?.coordinates?.length === 2) {
          const coords = exp.location.coordinates
          if (Array.isArray(coords[0])) {
            [lng, lat] = coords
          } else {
            if (Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
              [lng, lat] = coords
            } else {
              [lat, lng] = coords
            }
          }
        } else {
          return null
        }
        return { ...exp, lat, lng }
      })
      .filter(Boolean)

    // If zoomed in enough, show blocks with connections
    if (currentZoom >= zoomThreshold) {
      
      // First, break down trips into itinerary items
      const itineraryItems = []
      const tripMarkers = []
      
      validExperiences.forEach(exp => {
        // Check if this experience has an itinerary with location data
        if (exp.itinerary && Array.isArray(exp.itinerary) && exp.itinerary.length > 0) {
          // Extract itinerary items with valid coordinates
          const itemsWithCoords = exp.itinerary
            .map(item => {
              let lat, lng
              
              // Check for coordinates in various formats
              if (item.coordinates?.latitude !== undefined && item.coordinates?.longitude !== undefined) {
                // Object format: { latitude, longitude }
                lat = item.coordinates.latitude
                lng = item.coordinates.longitude
              } else if (item.latitude !== undefined && item.longitude !== undefined) {
                // Direct properties
                lat = item.latitude
                lng = item.longitude
              } else if (item.coordinates?.length === 2) {
                // Array format: [lat, lng] or [lng, lat]
                const coords = item.coordinates
                if (Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
                  [lng, lat] = coords
                } else {
                  [lat, lng] = coords
                }
              } else if (item.location?.coordinates?.length === 2) {
                // Nested location coordinates
                const coords = item.location.coordinates
                if (Array.isArray(coords[0])) {
                  [lng, lat] = coords
                } else {
                  if (Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
                    [lng, lat] = coords
                  } else {
                    [lat, lng] = coords
                  }
                }
              } else if (item.place?.geometry?.location) {
                // Google Places format
                lat = item.place.geometry.location.lat || item.place.geometry.location.latitude
                lng = item.place.geometry.location.lng || item.place.geometry.location.longitude
              } else {
                // Fallback to trip's main coordinates if item doesn't have its own
                return null
              }
              
              // Validate coordinates
              if (typeof lat !== 'number' || typeof lng !== 'number' || 
                  isNaN(lat) || isNaN(lng) ||
                  lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return null
              }
              
              return {
                ...item,
                lat,
                lng,
                tripId: exp.id || exp._id,
                tripName: exp.name,
                createdBy: exp.createdBy
              }
            })
            .filter(Boolean)
          
          if (itemsWithCoords.length > 0) {
            itineraryItems.push(...itemsWithCoords)
          } else {
            // If no itinerary items with coordinates, show trip marker
            tripMarkers.push(exp)
          }
        } else {
          // No itinerary, show as regular trip marker
          tripMarkers.push(exp)
        }
      })


      // Show itinerary items as blocks with connections
      if (itineraryItems.length > 0) {
        // Group itinerary items by trip
        const itemsByTrip = {}
        itineraryItems.forEach(item => {
          const tripId = item.tripId
          if (!itemsByTrip[tripId]) {
            itemsByTrip[tripId] = []
          }
          itemsByTrip[tripId].push(item)
        })

        // Draw blocks and connections for each trip's itinerary
        Object.values(itemsByTrip).forEach(tripItems => {
          // Sort by day and startTime if available
          tripItems.sort((a, b) => {
            if (a.day && b.day && a.day !== b.day) {
              return a.day.localeCompare(b.day)
            }
            if (a.startTime !== undefined && b.startTime !== undefined) {
              return a.startTime - b.startTime
            }
            return 0
          })

          // Create blocks for each itinerary item
          tripItems.forEach((item, idx) => {
            createItineraryBlock(item, blocksLayerGroup, idx, tripItems.length)
          })

          // Draw dotted lines connecting itinerary items in sequence
          for (let i = 0; i < tripItems.length - 1; i++) {
            const item1 = tripItems[i]
            const item2 = tripItems[i + 1]
            const distance = calculateDistance(item1.lat, item1.lng, item2.lat, item2.lng)
            
            // Connect consecutive items
            const line = L.polyline(
              [[item1.lat, item1.lng], [item2.lat, item2.lng]],
              {
                color: '#8b5cf6',
                weight: 2,
                opacity: 0.5,
                dashArray: '8, 8',
                className: 'itinerary-connection-line'
              }
            ).addTo(linesLayerGroup)
          }
        })
      }

      // Show remaining trips without itinerary breakdown as regular blocks
      tripMarkers.forEach((exp, idx) => {
        createBlock(exp, blocksLayerGroup, idx, tripMarkers.length)
      })
    } else {
      // Normal zoom - show regular markers
      validExperiences.forEach(exp => {
        createMarker(exp, markersLayerGroup)
      })
    }
  }, [experiences])

  // Function to create a marker (defined as function declaration for hoisting)
  function createMarker(exp, layer) {
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
      // Skip experiences without valid coordinates
      return
    }

    // Get location image (prefer location images over profile images)
    // Check multiple possible image sources including Google Places photos
    let locationImage = null
    
    // First priority: direct image field
    if (exp.image && typeof exp.image === 'string') {
      locationImage = exp.image
    }
    // Second priority: images array
    else if (Array.isArray(exp.images) && exp.images.length > 0) {
      const firstImage = exp.images[0]
      if (typeof firstImage === 'string') {
        locationImage = firstImage
      } else if (firstImage?.url && typeof firstImage.url === 'string') {
        locationImage = firstImage.url
      }
    }
    // Third priority: place.photos with stored URL (from frontend extraction)
    else if (exp.place?.photos && Array.isArray(exp.place.photos) && exp.place.photos.length > 0) {
      const firstPhoto = exp.place.photos[0]
      // Check if photo has stored URL (from frontend extraction)
      if (firstPhoto?.url && typeof firstPhoto.url === 'string') {
        locationImage = firstPhoto.url
      }
      // Try getUrl() method if it exists (browser only, for live Google Places objects)
      else if (typeof firstPhoto?.getUrl === 'function') {
        try {
          locationImage = firstPhoto.getUrl({ maxWidth: 400, maxHeight: 400 })
        } catch (e) {
          console.error('Error getting photo URL from place:', e)
        }
      }
    }
    // Fourth priority: media
    else if (exp.media?.[0]?.url) {
      locationImage = exp.media[0].url
    }
    else if (exp.media?.images?.[0]) {
      locationImage = exp.media.images[0]
    }
    
    // Fallback to profile image if no location image
    const displayImage = locationImage || exp.createdBy?.profileImage || exp.hostAvatar || exp.profileImage
    const userName = exp.createdBy?.name || exp.host || 'Unknown'
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    const imageAlt = exp.name || exp.location || exp.destination || userName
    
    const budget = exp.budget || 0
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container" style="
            position: relative;
            width: 80px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: relative;
              width: 60px;
              height: 60px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.2);
              overflow: hidden;
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                ${displayImage ? `
                  <img 
                    src="${displayImage}" 
                    alt="${imageAlt}"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    "
                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px\\'>${userInitials}</div>'"
                  />
                ` : `
                  <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                  ">${userInitials}</div>
                `}
              </div>
            </div>
            ${budget > 0 ? `
              <div style="
                position: absolute;
                left: 70px;
                top: 0;
                background: #3b82f6;
                color: white;
                font-size: 12px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                white-space: nowrap;
                z-index: 10;
              ">₹${budget.toLocaleString()}</div>
            ` : budget === 0 ? `
              <div style="
                position: absolute;
                left: 70px;
                top: 0;
                background: #10b981;
                color: white;
                font-size: 12px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                white-space: nowrap;
                z-index: 10;
              ">🆓 Free</div>
            ` : ''}
          </div>
        `,
        iconSize: [80, 100],
        iconAnchor: [30, 60],
        popupAnchor: [0, -60]
      })

    const marker = L.marker([lat, lng], { icon: customIcon })

    // Create hover tooltip with location image
    // Check multiple possible image sources including Google Places photos
    let tooltipLocationImage = null
    
    // First priority: direct image field
    if (exp.image && typeof exp.image === 'string') {
      tooltipLocationImage = exp.image
    }
    // Second priority: images array
    else if (Array.isArray(exp.images) && exp.images.length > 0) {
      const firstImage = exp.images[0]
      if (typeof firstImage === 'string') {
        tooltipLocationImage = firstImage
      } else if (firstImage?.url && typeof firstImage.url === 'string') {
        tooltipLocationImage = firstImage.url
      }
    }
    // Third priority: place.photos with stored URL
    else if (exp.place?.photos && Array.isArray(exp.place.photos) && exp.place.photos.length > 0) {
      const firstPhoto = exp.place.photos[0]
      // Check if photo has stored URL (from frontend extraction)
      if (firstPhoto?.url && typeof firstPhoto.url === 'string') {
        tooltipLocationImage = firstPhoto.url
      }
      // Try getUrl() method if it exists (browser only)
      else if (typeof firstPhoto?.getUrl === 'function') {
        try {
          tooltipLocationImage = firstPhoto.getUrl({ maxWidth: 400, maxHeight: 400 })
        } catch (e) {
          console.error('Error getting photo URL from place:', e)
        }
      }
    }
    // Fourth priority: media
    else if (exp.media?.[0]?.url) {
      tooltipLocationImage = exp.media[0].url
    }
    else if (exp.media?.images?.[0]) {
      tooltipLocationImage = exp.media.images[0]
    }
    const tooltipDisplayImage = tooltipLocationImage || exp.createdBy?.profileImage || exp.hostAvatar || exp.profileImage
    const tooltipUserName = exp.createdBy?.name || exp.host || 'Unknown'
    const tooltipUserInitials = tooltipUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    const tripName = exp.name || 'Trip'
    const location = exp.location || exp.destination || ''
    const tooltipImageAlt = exp.name || exp.location || exp.destination || tooltipUserName
    
    
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
    
    const formatTime = (hour) => {
      if (hour === undefined || hour === null) return ''
      const h = Math.floor(hour)
      const m = Math.round((hour - h) * 60)
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
    }
    
    const timeSlot = exp.timeSlot || (exp.startTime !== undefined && exp.startTime < 12 ? 'morning' : exp.startTime !== undefined && exp.startTime < 17 ? 'afternoon' : exp.startTime !== undefined && exp.startTime < 21 ? 'evening' : 'night')
    const displayTime = exp.startTime !== undefined && exp.startTime !== null ? formatTime(exp.startTime) : ''
    
    const tooltipContent = `
        <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); box-sizing: border-box;">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
            ${tooltipDisplayImage ? `
              <div style="
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: 2px solid #e5e7eb;
                overflow: hidden;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                flex-shrink: 0;
              ">
                <img 
                  src="${escapeHtml(tooltipDisplayImage)}" 
                  alt="${escapeHtml(tooltipImageAlt)}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  "
                  onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px\\'>${escapeHtml(tooltipUserInitials)}</div>'"
                />
              </div>
            ` : `
              <div style="
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                border: 2px solid #e5e7eb;
                flex-shrink: 0;
              ">${escapeHtml(tooltipUserInitials)}</div>
            `}
            <div style="flex: 1; min-width: 0;">
              <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(tripName)}</h3>
              <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">hosted by ${escapeHtml(tooltipUserName)}</p>
            </div>
          </div>
          ${location ? `
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; display: flex; align-items: flex-start; gap: 6px;">
              <span style="flex-shrink: 0; margin-top: 2px; color: #ef4444;">📍</span>
              <span style="flex: 1; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(location)}</span>
            </div>
          ` : ''}
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            ${timeSlot ? `
              <div style="
                background: #dbeafe;
                color: #1e40af;
                font-size: 12px;
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <span>📅</span>
                <span style="text-transform: capitalize;">${timeSlot}</span>
              </div>
            ` : ''}
            ${displayTime ? `
              <div style="
                background: #dbeafe;
                color: #1e40af;
                font-size: 12px;
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <span>🕐</span>
                <span>${displayTime}</span>
              </div>
            ` : ''}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            ${exp.budget !== undefined ? `
              <div style="
                background: #3b82f6;
                color: white;
                font-size: 14px;
                font-weight: 700;
                padding: 8px 16px;
                border-radius: 8px;
                white-space: nowrap;
              ">${exp.budget === 0 ? '🆓 Free' : `₹${exp.budget.toLocaleString()}`}</div>
            ` : ''}
          </div>
        </div>
      `

    marker.bindTooltip(tooltipContent, {
      direction: 'right',
      offset: [10, 0],
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
    
      marker.addTo(layer)
  }

  // Function to create a block (expanded view for zoomed in) - defined as function declaration for hoisting
  function createBlock(exp, layer, index, total) {
    const lat = exp.lat
    const lng = exp.lng
    
    // Get location image (prefer location images over profile images)
    // Check multiple possible image sources including Google Places photos
    let locationImage = null
    
    // First priority: direct image field
    if (exp.image && typeof exp.image === 'string') {
      locationImage = exp.image
    }
    // Second priority: images array
    else if (Array.isArray(exp.images) && exp.images.length > 0) {
      const firstImage = exp.images[0]
      if (typeof firstImage === 'string') {
        locationImage = firstImage
      } else if (firstImage?.url && typeof firstImage.url === 'string') {
        locationImage = firstImage.url
      }
    }
    // Third priority: place.photos with stored URL (from frontend extraction)
    else if (exp.place?.photos && Array.isArray(exp.place.photos) && exp.place.photos.length > 0) {
      const firstPhoto = exp.place.photos[0]
      // Check if photo has stored URL (from frontend extraction)
      if (firstPhoto?.url && typeof firstPhoto.url === 'string') {
        locationImage = firstPhoto.url
      }
      // Try getUrl() method if it exists (browser only, for live Google Places objects)
      else if (typeof firstPhoto?.getUrl === 'function') {
        try {
          locationImage = firstPhoto.getUrl({ maxWidth: 400, maxHeight: 400 })
        } catch (e) {
          console.error('Error getting photo URL from place:', e)
        }
      }
    }
    // Fourth priority: media
    else if (exp.media?.[0]?.url) {
      locationImage = exp.media[0].url
    }
    else if (exp.media?.images?.[0]) {
      locationImage = exp.media.images[0]
    }
    
    const displayImage = locationImage || exp.createdBy?.profileImage || exp.hostAvatar || exp.profileImage
    const userName = exp.createdBy?.name || exp.host || 'Unknown'
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    const tripName = exp.name || 'Trip'
    const imageAlt = exp.name || exp.location || exp.destination || userName
    const budget = exp.budget || 0
    
    // Create a larger block icon for zoomed in view
    const blockIcon = L.divIcon({
      className: 'experience-block',
      html: `
        <div class="block-container" style="
          position: relative;
          width: 100px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform: rotate(${index * 5}deg);
          transition: transform 0.3s ease;
        ">
          <div style="
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid white;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${displayImage ? `
                <img 
                  src="${displayImage}" 
                  alt="${imageAlt}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  "
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px\\'>${userInitials}</div>'"
                />
              ` : `
                <div style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 24px;
                ">${userInitials}</div>
              `}
            </div>
          </div>
          ${budget > 0 ? `
            <div style="
              position: absolute;
              left: 90px;
              top: 0;
              background: #3b82f6;
              color: white;
              font-size: 13px;
              font-weight: 700;
              padding: 5px 10px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
              white-space: nowrap;
              z-index: 10;
            ">₹${budget.toLocaleString()}</div>
          ` : budget === 0 ? `
            <div style="
              position: absolute;
              left: 90px;
              top: 0;
              background: #10b981;
              color: white;
              font-size: 13px;
              font-weight: 700;
              padding: 5px 10px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
              white-space: nowrap;
              z-index: 10;
            ">🆓 Free</div>
          ` : ''}
        </div>
      `,
      iconSize: [100, 120],
      iconAnchor: [40, 80],
      popupAnchor: [0, -80]
    })

    const marker = L.marker([lat, lng], { icon: blockIcon })
    
    // Create tooltip
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
    
    const formatTime = (hour) => {
      if (hour === undefined || hour === null) return ''
      const h = Math.floor(hour)
      const m = Math.round((hour - h) * 60)
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
    }
    
    const timeSlot = exp.timeSlot || (exp.startTime !== undefined && exp.startTime < 12 ? 'morning' : exp.startTime !== undefined && exp.startTime < 17 ? 'afternoon' : exp.startTime !== undefined && exp.startTime < 21 ? 'evening' : 'night')
    const displayTime = exp.startTime !== undefined && exp.startTime !== null ? formatTime(exp.startTime) : ''
    
    const tooltipContent = `
      <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); box-sizing: border-box;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          ${displayImage ? `
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              border: 2px solid #e5e7eb;
              overflow: hidden;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
              flex-shrink: 0;
            ">
              <img 
                src="${escapeHtml(displayImage)}" 
                alt="${escapeHtml(imageAlt)}"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  display: block;
                "
                onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px\\'>${escapeHtml(userInitials)}</div>'"
              />
            </div>
          ` : `
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
              border: 2px solid #e5e7eb;
              flex-shrink: 0;
            ">${escapeHtml(userInitials)}</div>
          `}
          <div style="flex: 1; min-width: 0;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(tripName)}</h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">hosted by ${escapeHtml(userName)}</p>
          </div>
        </div>
        ${exp.location || exp.destination ? `
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; display: flex; align-items: flex-start; gap: 6px;">
            <span style="flex-shrink: 0; margin-top: 2px; color: #ef4444;">📍</span>
            <span style="flex: 1; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(exp.location || exp.destination)}</span>
          </div>
        ` : ''}
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          ${timeSlot ? `
            <div style="
              background: #dbeafe;
              color: #1e40af;
              font-size: 12px;
              font-weight: 600;
              padding: 6px 12px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span>📅</span>
              <span style="text-transform: capitalize;">${timeSlot}</span>
            </div>
          ` : ''}
          ${displayTime ? `
            <div style="
              background: #dbeafe;
              color: #1e40af;
              font-size: 12px;
              font-weight: 600;
              padding: 6px 12px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span>🕐</span>
              <span>${displayTime}</span>
            </div>
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          ${exp.budget !== undefined ? `
            <div style="
              background: #3b82f6;
              color: white;
              font-size: 14px;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 8px;
              white-space: nowrap;
            ">${exp.budget === 0 ? '🆓 Free' : `₹${exp.budget.toLocaleString()}`}</div>
          ` : ''}
        </div>
      </div>
    `

    marker.bindTooltip(tooltipContent, {
      direction: 'right',
      offset: [10, 0],
      className: 'custom-tooltip',
      permanent: false,
      interactive: true,
      sticky: true,
      opacity: 1
    })

    marker.on('click', () => {
      if (onMarkerClickRef.current) {
        onMarkerClickRef.current(exp)
      }
    })

    marker.on('mouseover', () => {
      marker.openTooltip()
      if (onMarkerHoverRef.current) {
        onMarkerHoverRef.current(exp)
      }
    })

    marker.on('mouseout', () => {
      marker.closeTooltip()
    })
    
    marker.addTo(layer)
  }

  // Function to create an itinerary item block
  function createItineraryBlock(item, layer, index, total) {
    const lat = item.lat
    const lng = item.lng
    
    const tripName = item.tripName || 'Trip'
    const experienceName = item.experienceName || item.name || 'Activity'
    const timeSlot = item.timeSlot || (item.startTime !== undefined && item.startTime < 12 ? 'morning' : item.startTime !== undefined && item.startTime < 17 ? 'afternoon' : item.startTime !== undefined && item.startTime < 21 ? 'evening' : 'night')
    const price = item.price || 0
    // Extract location string - handle both string and object formats
    let location = ''
    if (typeof item.location === 'string') {
      location = item.location
    } else if (item.location?.address) {
      location = item.location.address
    } else if (item.location?.name) {
      location = item.location.name
    } else if (item.place?.formatted_address) {
      location = item.place.formatted_address
    } else if (item.place?.name) {
      location = item.place.name
    }
    
    // Helper to escape HTML for safety
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
    
    // Get location image - use stored URLs directly
    let locationImage = null
    
    // First priority: direct image field
    if (item.image && typeof item.image === 'string') {
      locationImage = item.image
    }
    // Second priority: images array
    else if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0]
      if (typeof firstImage === 'string') {
        locationImage = firstImage
      } else if (firstImage?.url && typeof firstImage.url === 'string') {
        locationImage = firstImage.url
      }
    }
    // Third priority: place.photos with stored URL
    else if (item.place?.photos && Array.isArray(item.place.photos) && item.place.photos.length > 0) {
      const firstPhoto = item.place.photos[0]
      if (firstPhoto?.url && typeof firstPhoto.url === 'string') {
        locationImage = firstPhoto.url
      }
    }
    
    // Escape values for safe HTML insertion
    const safeImageUrl = locationImage ? escapeHtml(locationImage) : ''
    const safeExperienceName = escapeHtml(experienceName)
    const safeShortName = escapeHtml(experienceName.substring(0, 8))
    
    // Create a block icon for itinerary item
    const blockIcon = L.divIcon({
      className: 'itinerary-block',
      html: `
        <div class="block-container" style="
          position: relative;
          width: 100px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform: rotate(${index * 5}deg);
          transition: transform 0.3s ease;
        ">
          <div style="
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid white;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.6), 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${locationImage ? `
                <img 
                  src="${safeImageUrl}" 
                  alt="${safeExperienceName}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  "
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;text-align:center;padding:10px;line-height:1.2\\'>${safeShortName}${experienceName.length > 8 ? '...' : ''}</div>'"
                />
              ` : `
                <div style="
                  color: white;
                  font-weight: bold;
                  font-size: 14px;
                  text-align: center;
                  line-height: 1.2;
                  padding: 10px;
                ">${safeShortName}${experienceName.length > 8 ? '...' : ''}</div>
              `}
            </div>
          </div>
          ${price > 0 ? `
            <div style="
              position: absolute;
              left: 90px;
              top: 0;
              background: #3b82f6;
              color: white;
              font-size: 12px;
              font-weight: 700;
              padding: 4px 8px;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
              white-space: nowrap;
              z-index: 10;
            ">₹${price.toLocaleString()}</div>
          ` : price === 0 ? `
            <div style="
              position: absolute;
              left: 90px;
              top: 0;
              background: #10b981;
              color: white;
              font-size: 12px;
              font-weight: 700;
              padding: 4px 8px;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
              white-space: nowrap;
              z-index: 10;
            ">🆓 Free</div>
          ` : ''}
        </div>
      `,
      iconSize: [100, 120],
      iconAnchor: [40, 80],
      popupAnchor: [0, -80]
    })

    const marker = L.marker([lat, lng], { icon: blockIcon })
    
    // Create tooltip (escapeHtml already defined above)
    const formatTime = (hour) => {
      if (hour === undefined || hour === null) return ''
      const h = Math.floor(hour)
      const m = Math.round((hour - h) * 60)
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
    }
    
    const displayTime = item.startTime !== undefined && item.startTime !== null ? formatTime(item.startTime) : ''
    const userName = item.createdBy?.name || tripName
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    
    const tooltipContent = `
      <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); box-sizing: border-box;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          ${locationImage ? `
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              border: 2px solid #e5e7eb;
              overflow: hidden;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
              flex-shrink: 0;
            ">
              <img 
                src="${safeImageUrl}" 
                alt="${safeExperienceName}"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  display: block;
                "
                onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px\\'>${escapeHtml(userInitials)}</div>'"
              />
            </div>
          ` : `
            <div style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
              border: 2px solid #e5e7eb;
              flex-shrink: 0;
            ">${escapeHtml(userInitials)}</div>
          `}
          <div style="flex: 1; min-width: 0;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(experienceName)}</h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">hosted by ${escapeHtml(userName)}</p>
          </div>
        </div>
        ${location ? `
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; display: flex; align-items: flex-start; gap: 6px;">
            <span style="flex-shrink: 0; margin-top: 2px; color: #ef4444;">📍</span>
            <span style="flex: 1; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; white-space: normal;">${escapeHtml(location)}</span>
          </div>
        ` : ''}
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          ${timeSlot ? `
            <div style="
              background: #dbeafe;
              color: #1e40af;
              font-size: 12px;
              font-weight: 600;
              padding: 6px 12px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span>📅</span>
              <span style="text-transform: capitalize;">${timeSlot}</span>
            </div>
          ` : ''}
          ${displayTime ? `
            <div style="
              background: #dbeafe;
              color: #1e40af;
              font-size: 12px;
              font-weight: 600;
              padding: 6px 12px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span>🕐</span>
              <span>${displayTime}</span>
            </div>
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          ${price > 0 ? `
            <div style="
              background: #3b82f6;
              color: white;
              font-size: 14px;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 8px;
              white-space: nowrap;
            ">₹${price.toLocaleString()}</div>
          ` : price === 0 ? `
            <div style="
              background: #10b981;
              color: white;
              font-size: 14px;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 8px;
              white-space: nowrap;
            ">🆓 Free</div>
          ` : ''}
        </div>
      </div>
    `

    marker.bindTooltip(tooltipContent, {
      direction: 'right',
      offset: [10, 0],
      className: 'custom-tooltip',
      permanent: false,
      interactive: true,
      sticky: true,
      opacity: 1
    })

    marker.on('click', () => {
      if (onMarkerClickRef.current) {
        onMarkerClickRef.current(item)
      }
    })

    marker.on('mouseover', () => {
      marker.openTooltip()
      if (onMarkerHoverRef.current) {
        onMarkerHoverRef.current(item)
      }
    })

    marker.on('mouseout', () => {
      marker.closeTooltip()
    })
    
    marker.addTo(layer)
  }

  // Set up zoom listener when map is initialized
  useEffect(() => {
    const map = mapInstance.current
    
    if (!map || !isInitializedRef.current) return

    // Listen to zoom changes
    const handleZoomEnd = () => {
      currentZoomRef.current = map.getZoom()
      updateMarkersAndBlocks()
    }
    
    // Also listen to zoom during drag (for smoother updates)
    const handleZoom = () => {
      currentZoomRef.current = map.getZoom()
      updateMarkersAndBlocks()
    }
    
    map.on('zoomend', handleZoomEnd)
    map.on('zoom', handleZoom)
    
    return () => {
      if (map) {
        map.off('zoomend', handleZoomEnd)
        map.off('zoom', handleZoom)
      }
    }
  }, [updateMarkersAndBlocks])

  // Add markers when experiences change - only update if key actually changed
  useEffect(() => {
    const map = mapInstance.current
    
    // Wait for map to be initialized
    if (!map || !isInitializedRef.current) return

    // Skip if experiences haven't actually changed
    if (expKey === prevExpKeyRef.current) return
    
    prevExpKeyRef.current = expKey
    currentZoomRef.current = map.getZoom()

    // Update markers and blocks
    updateMarkersAndBlocks()
  }, [expKey, experiences, center, updateMarkersAndBlocks])

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
