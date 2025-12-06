# Exora Mobile App

React Native mobile application for Exora travel platform, built with Expo Router.

## Features

- **Authentication**: Login and signup with secure token storage
- **Feed**: View and create posts with images, likes, and comments
- **Finder**: Discover trips on an interactive map
- **Labs**: Plan and manage your trips and blocks
- **Profile**: View and edit your profile, manage connections
- **Settings**: Customize app preferences and manage account

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure API URL:

   - Update `exora-app/lib/api.ts` with your backend API URL
   - Or set it in `app.json` under `extra.apiUrl`

3. Run the app:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
exora-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── feed.tsx       # Feed screen
│   │   ├── finder.tsx     # Finder screen
│   │   ├── labs.tsx       # Labs screen
│   │   ├── profile.tsx    # Profile screen
│   │   └── settings.tsx   # Settings screen
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Signup screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── ProtectedRoute.tsx # Route protection
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── ThemeContext.tsx   # Theme management
│   └── ChatContext.tsx    # Chat functionality
└── lib/                   # Utilities
    └── api.ts            # API client
```

## Backend Integration

The app integrates with the Exora backend API. Make sure your backend is running and accessible at the configured API URL.

### API Endpoints Used

- Authentication: `/api/auth/*`
- Feed: `/api/feed/*`
- Trips: `/api/trips/*`
- Connections: `/api/connections/*`
- Uploads: `/api/uploads/*`
- Blocks: `/api/blocks/*`
- Trip Requests: `/api/trip-requests/*`

## Dependencies

Key dependencies:

- `expo-router`: File-based routing
- `expo-secure-store`: Secure token storage
- `expo-image-picker`: Image selection
- `react-native-maps`: Map functionality
- `@expo/vector-icons`: Icon library

## Notes

- The app uses Expo SecureStore for token management
- Image uploads are handled through the backend API
- Map functionality requires proper API keys for production
- Chat functionality structure is in place but requires Firebase setup for full implementation

## Development

The app follows the same flow and functionality as the web frontend (`frontend-main/`), adapted for React Native mobile experience.
