# Fast2SMS OTP Verification Implementation

This document describes the Fast2SMS OTP verification implementation for user signup.

## Overview

The signup flow now requires phone number verification via OTP before creating a user profile. The OTP is sent using Fast2SMS service.

## Backend Implementation

### 1. Database Models

#### User Model (`backend/models/User.js`)
- Added `phone` field (required, unique, 10 digits)
- `phoneVerified` field (default: false, set to true after OTP verification)

#### OTP Model (`backend/models/OTP.js`)
- Stores temporary OTPs with expiration (10 minutes)
- Auto-cleans expired OTPs using MongoDB TTL index
- Fields: `phone`, `otp`, `expiresAt`, `verified`, `createdAt`

### 2. Fast2SMS Service (`backend/services/fast2smsService.js`)

- Generates 6-digit OTP
- Sends OTP via Fast2SMS bulkV2 API
- Validates phone number format (10-digit Indian mobile number)

### 3. API Endpoints

#### POST `/api/users/send-otp`
- Sends OTP to the provided phone number
- Validates phone number format
- Checks if phone is already registered
- Request body: `{ "phone": "9876543210" }`
- Response: `{ "status": "success", "message": "OTP sent successfully" }`

#### POST `/api/users/verify-otp-signup`
- Verifies OTP and creates user profile
- Validates OTP (6 digits, not expired, matches)
- Creates user with phone verification
- Request body: All signup fields including `phone` and `otp`
- Response: `{ "status": "success", "token": "...", "user": {...} }`

### 4. Environment Configuration

Add to `backend/.env`:
```
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_ROUTE=q  # Optional, defaults to 'q' (Quick route for OTP)
```

## Frontend Implementation

### 1. Signup Flow

The signup process now includes these steps:
1. **Basic Info** - Name, Email, Phone, Password
2. **OTP Verification** - Enter 6-digit OTP sent to phone
3. **Profile** - Date of Birth, Location
4. **Photos** - Profile photo and additional photos
5. **Travel Style** - Personality type selection
6. **Preferences** - Travel preferences
7. **Interests** - User interests

### 2. API Client (`frontend-main/src/server/api.js`)

Added methods:
- `sendOTP(phone)` - Sends OTP to phone number
- `verifyOTPAndSignup(userData)` - Verifies OTP and creates account

### 3. Signup Page (`frontend-main/src/app/signup/page.js`)

- Added phone number input field in Basic Info step
- Added OTP verification step (step 1)
- OTP resend functionality with 60-second cooldown
- Phone number validation (10-digit Indian format)
- Automatic OTP sending when moving from Basic Info to OTP step

## Signup Flow

1. User enters basic info (name, email, phone, password)
2. On clicking "Next", OTP is automatically sent to phone
3. User enters 6-digit OTP
4. On verification, user proceeds to profile setup
5. After completing all steps, user profile is created with verified phone

## Phone Number Format

- Must be 10 digits
- Must start with 6, 7, 8, or 9 (Indian mobile number format)
- Non-digit characters are automatically removed

## OTP Details

- **Length**: 6 digits
- **Validity**: 10 minutes
- **Format**: Numeric only
- **Resend**: Available after 60 seconds

## Security Features

1. OTP expiration (10 minutes)
2. OTP can only be used once
3. Phone number uniqueness check
4. Rate limiting on OTP requests (via Fast2SMS)
5. OTP stored securely in database with expiration

## Testing

### Backend Testing
1. Test OTP sending: `POST /api/users/send-otp` with valid phone
2. Test OTP verification: `POST /api/users/verify-otp-signup` with correct OTP
3. Test invalid OTP: Should return error
4. Test expired OTP: Should return error

### Frontend Testing
1. Enter valid phone number and proceed
2. Check OTP is received on phone
3. Enter correct OTP and verify account creation
4. Test OTP resend functionality
5. Test invalid OTP handling

## Notes

- Fast2SMS API key must be configured in environment variables
- Phone numbers are stored without country code (10 digits)
- OTPs are automatically cleaned up after expiration
- The legacy `/api/users/signup` endpoint still exists but will return an error directing users to use OTP flow

