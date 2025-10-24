# Exora - Travel Together

A modern travel planning and social platform built with Next.js, featuring a beautiful black-silver theme and smooth animations.

## Features

- **Feed Screen**: Social feed with posts, likes, comments, and saves
- **Finder Screen**: Discover nearby experiences with interactive map
- **Labs Screen**: Trip planning with timeline canvas and budget tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: Elegant black-silver color palette
- **Smooth Animations**: Framer Motion powered interactions

## Tech Stack

- **Framework**: Next.js 16.0.0
- **Styling**: Tailwind CSS 4.x with custom theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Exora theme
│   ├── layout.js           # Root layout with dark theme
│   └── page.js             # Main app with navigation
├── components/
│   ├── labs/               # Trip planning components
│   │   ├── experience-sidebar.js
│   │   ├── timeline-canvas.js
│   │   └── trip-details-modal.js
│   ├── screens/            # Main application screens
│   │   ├── feed-screen.js
│   │   ├── finder-screen.js
│   │   └── labs-screen.js
│   └── ui/                 # Reusable UI components
│       ├── avatar.js
│       ├── badge.js
│       ├── button.js
│       ├── card.js
│       └── input.js
├── lib/
│   └── utils.js            # Utility functions
└── hooks/                  # Custom React hooks
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Theme Features

### Color Palette
- **Background**: Deep black (`oklch(0.08 0 0)`)
- **Foreground**: Silver white (`oklch(0.95 0 0)`)
- **Primary**: Silver accent (`oklch(0.75 0 0)`)
- **Cards**: Subtle dark (`oklch(0.12 0 0)`)

### Custom Utilities
- `.glass-effect`: Frosted glass appearance
- `.silver-glow`: Subtle silver shadow
- `.smooth-transition`: Consistent 300ms transitions
- `.gradient-silver`: Silver gradient backgrounds

## Navigation

The app features a sidebar navigation with 5 main sections:

1. **Feed** (🏠): Social content feed
2. **Finder** (🔍): Experience discovery
3. **Labs** (🧭): Trip planning
4. **Profile** (👤): User profile (coming soon)
5. **Settings** (⚙️): App settings (coming soon)

## Components

### Feed Screen
- Social media style feed
- Interactive posts with likes, comments, shares
- Smooth animations and hover effects
- Glass morphism design

### Finder Screen
- Map-based experience discovery
- Filter by category and price
- Detailed experience modals
- Request to join functionality

### Labs Screen
- Drag-and-drop trip planning
- Timeline canvas with time slots
- Budget tracking and visualization
- Experience sidebar with suggestions

## Development

### Adding New Components
1. Create component in appropriate directory
2. Use shadcn/ui patterns for consistency
3. Apply Exora theme classes
4. Include smooth animations with Framer Motion

### Styling Guidelines
- Use CSS variables for theme colors
- Apply glass-effect for cards and modals
- Use smooth-transition for interactive elements
- Maintain consistent spacing with Tailwind classes

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

This project is part of the Exora travel platform.