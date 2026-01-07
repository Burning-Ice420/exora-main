# Google Places Autocomplete Setup Guide

This guide explains how to set up and use Google Places Autocomplete in the exora app.

## 📋 Overview

The app now uses Google Places Autocomplete for location search in:
- **Maps (Finder Screen)**: Search for locations on the map
- **Labs - Create Itinerary**: Search for trip locations when creating a new itinerary

## 🔑 Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name for later

### Step 2: Enable Required APIs
1. Navigate to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Places API** (required for autocomplete)
   - **Maps JavaScript API** (required for map functionality)

### Step 3: Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key (you'll need it in the next step)

### Step 4: Restrict Your API Key (IMPORTANT for Security)

**For Production:**
1. Click on your API key to edit it
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your domains:
   ```
   yourdomain.com/*
   *.yourdomain.com/*
   ```
4. Under **API restrictions**, select **Restrict key**
5. Choose only:
   - **Places API**
   - **Maps JavaScript API**
6. Click **Save**

**For Local Development:**
Add these referrers:
```
localhost:3000/*
127.0.0.1:3000/*
localhost:3001/*
127.0.0.1:3001/*
```

## ⚙️ Configuration

### 1. Create Environment File
Create a `.env.local` file in the `frontend-main` directory:

```bash
cd frontend-main
cp .env.example .env.local
```

### 2. Add Your API Key
Open `.env.local` and add your API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_actual_api_key_here
```

### 3. Restart Development Server
After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## 🧪 Testing

### Local Testing
1. Start your development server: `npm run dev`
2. Navigate to the **Labs** page and click "Create Trip"
3. Click on the location search field
4. Type a location (e.g., "Paris, France")
5. Select a suggestion from the dropdown
6. Verify that:
   - The address is displayed
   - Coordinates are logged to the console
   - The form accepts the location

### Testing on Maps (Finder Screen)
1. Navigate to the **Finder** page
2. Use the search bar at the top
3. Search for a location
4. The map should center on the selected location

### Console Logs
When a location is selected, you'll see in the browser console:
```javascript
{
  selectedAddress: "Full formatted address",
  selectedLatitude: 48.8566,
  selectedLongitude: 2.3522
}
```

## 📊 Data Available

When a location is selected, the `onSelect` callback receives:

```javascript
{
  address: "Full formatted address",      // e.g., "Paris, France"
  latitude: 48.8566,                      // Number
  longitude: 2.3522,                      // Number
  place: { /* Full Google Place object */ } // Complete place details
}
```

## 🔧 Usage in Code

### In Components

```javascript
import GooglePlacesAutocomplete from "@/components/ui/google-places-autocomplete"

function MyComponent() {
  const handleLocationSelect = (locationData) => {
    console.log('Address:', locationData.address)
    console.log('Latitude:', locationData.latitude)
    console.log('Longitude:', locationData.longitude)
    
    // Use the data as needed
    setFormData({
      location: locationData.address,
      coordinates: [locationData.latitude, locationData.longitude]
    })
  }

  return (
    <GooglePlacesAutocomplete
      value={formData.location}
      onSelect={handleLocationSelect}
      placeholder="Search for a location..."
    />
  )
}
```

## 🚨 Troubleshooting

### "Google Maps API key is missing" Error
- Check that `.env.local` exists and contains `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
- Restart your development server after adding the key
- Verify the key name is exactly `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

### "Failed to load Google Maps script" Error
- Check your internet connection
- Verify your API key is correct
- Ensure Places API and Maps JavaScript API are enabled
- Check browser console for detailed error messages

### Autocomplete Not Showing Suggestions
- Verify Places API is enabled in Google Cloud Console
- Check API key restrictions (should allow your domain)
- Check browser console for API errors
- Verify you haven't exceeded API quota limits

### "Selected location does not have valid coordinates"
- Some places (like countries) don't have precise coordinates
- Try selecting a more specific location (city, address, landmark)

## 💰 API Pricing

Google Places API has usage-based pricing:
- **Autocomplete (Per Session)**: First 1,000 sessions per month are free
- **Place Details**: First 1,000 requests per month are free
- See [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/) for details

## 🔒 Security Best Practices

1. **Always restrict your API key** to specific domains
2. **Never commit** `.env.local` to version control
3. **Use different keys** for development and production
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to avoid unexpected charges

## 📚 Additional Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)


