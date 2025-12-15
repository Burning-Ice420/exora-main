# Activity Booking System - Complete Guide

## Overview

A complete activity booking system with Razorpay payment integration, email confirmations, and digital passes. Built with Exora's brand colors and no login required.

## Features

✅ **New Activity Model** - Dedicated Activity model with comprehensive fields
✅ **Detailed Activity Pages** - Full activity details with image galleries
✅ **No Login Required** - Public booking system
✅ **Razorpay Integration** - Seamless payment processing
✅ **Email Confirmations** - Automated pass emails with UID
✅ **Digital Passes** - Unique pass IDs for verification
✅ **Exora Color Scheme** - Uses brand colors (#0a7ea4)

## Backend Setup

### 1. Environment Variables

Add to `backend/.env`:

```env
# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (choose one option)

# Option 1: Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Option 2: Custom SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM="Exora <noreply@exora.in>"
```

### 2. Seed Activity

Run the seed script to create a sample activity:

```bash
cd backend
node scripts/seed-activity.js
```

This creates: **Sunset Beach Yoga & Meditation Experience**

### 3. API Endpoints

**Public Endpoints (No Auth Required):**

- `GET /api/activities` - List all activities
- `GET /api/activities/:slugOrId` - Get single activity
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment and create pass

## Frontend Setup

### 1. Environment Variables

Add to `frontend-main/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 2. Pages

- `/activities` - Activity listing page
- `/activity/[slug]` - Detailed activity page with booking

## Models

### Activity Model

```javascript
{
  name: String,
  slug: String (auto-generated),
  description: String,
  longDescription: String,
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  price: Number,
  originalPrice: Number,
  date: Date,
  time: String,
  duration: String,
  location: {
    name: String,
    address: String,
    city: String,
    state: String,
    coordinates: { lat, lng }
  },
  category: String,
  tags: [String],
  highlights: [String],
  includes: [String],
  excludes: [String],
  requirements: {
    minAge: Number,
    physicalFitness: String,
    specialRequirements: [String]
  },
  capacity: Number,
  booked: Number,
  host: {
    name: String,
    bio: String,
    image: String
  },
  status: String,
  featured: Boolean,
  rating: {
    average: Number,
    count: Number
  }
}
```

### ActivityPass Model

```javascript
{
  passId: String (UUID, unique),
  activityId: ObjectId,
  activityName: String,
  attendeeName: String,
  attendeeEmail: String,
  attendeePhone: String,
  paymentId: String,
  orderId: String,
  amount: Number,
  status: String,
  usedAt: Date,
  verifiedBy: String
}
```

## Payment Flow

1. User views activity details
2. Clicks "Book Now" and enters name, email, phone
3. Clicks "Proceed to Payment"
4. Razorpay checkout opens
5. User completes payment
6. Backend verifies payment signature
7. Creates ActivityPass with unique UUID
8. Sends confirmation email with pass details
9. User receives email with Pass ID for verification

## Email Template

The confirmation email includes:
- Attendee name
- Activity name
- Date, time, location
- Pass ID (UUID)
- Amount paid
- Beautiful HTML design with Exora branding

## Pass Verification

Passes can be verified using:
- Pass ID (UUID)
- Attendee email
- Payment ID

Query the `ActivityPass` model to verify:
```javascript
const pass = await ActivityPass.findOne({ passId: 'uuid-here' })
```

## Color Scheme

Exora brand colors used throughout:
- Primary: `#0a7ea4` (Cyan/Blue)
- Hover: `#08759a` (Darker cyan)
- Background: White
- Text: Black with opacity variations

## Testing

### Test Payment Flow

1. Visit `/activities`
2. Click on an activity
3. Enter test details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
4. Use Razorpay test mode
5. Complete payment
6. Check email for confirmation

### Test Email

For development, the system uses Ethereal Email (fake SMTP). Check console logs for email preview URLs.

## File Structure

```
backend/
  models/
    Activity.js          # Activity model
    ActivityPass.js      # Pass model
  controllers/
    activityController.js # Activity CRUD
    paymentController.js  # Payment handling
  routes/
    activities.js        # Activity routes
    payments.js          # Payment routes
  services/
    emailService.js      # Email sending
  scripts/
    seed-activity.js     # Seed script

frontend-main/
  src/
    app/
      activities/
        page.js          # Listing page
      activity/
        [slug]/
          page.js        # Detail page
    components/
      activities/
        ActivityCard.js  # Card component
        ActivityGrid.js  # Grid layout
        ActivitiesHero.js # Hero section
    lib/
      razorpay.js        # Payment handler
```

## Next Steps

1. Add more activities via admin panel or seed scripts
2. Implement pass verification endpoint
3. Add QR code generation for passes
4. Set up production email service
5. Add activity reviews/ratings
6. Implement waitlist for sold-out activities

## Support

For issues or questions, check:
- Backend logs: `backend/logs/`
- Email service logs in console
- Razorpay dashboard for payment status


