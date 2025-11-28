# OTP Verification Booking System

## Overview
Implemented a secure OTP-based booking verification system where passengers receive a unique 6-digit code when they register a ride. Drivers must accept the booking and then verify the passenger by entering this OTP code before the ride can start.

## New Booking Flow

### Previous Flow:
1. Passenger books → Status: `pending`
2. Driver confirms → Status: `confirmed`
3. Ride starts

### New Flow:
1. **Passenger registers ride** → Status: `registered` + Gets OTP code
2. **Driver accepts booking** → Status: `accepted`
3. **Driver enters passenger's OTP** → Status: `confirmed` (Verified)
4. **Ride starts**

## Changes Made

### 1. Backend Changes

#### Booking Model (`backend/models/Booking.js`)
**New Fields:**
- `verificationCode`: String (required) - 6-digit OTP code
- `isVerified`: Boolean (default: false) - Tracks if OTP was verified
- `verifiedAt`: Date - Timestamp when verification occurred

**Updated Status Enum:**
```javascript
enum: ['pending', 'registered', 'accepted', 'confirmed', 'canceled', 'completed']
```

#### Booking Routes (`backend/routes/bookings.js`)
**New Helper Function:**
- `generateOTP()` - Generates random 6-digit code

**Updated POST `/api/bookings`:**
- Generates OTP code automatically
- Sets status to `'registered'` instead of `'pending'`
- Returns verification code in response

**Replaced `/api/bookings/:id/confirm` with two new endpoints:**

1. **PUT `/api/bookings/:id/accept`** (Driver action)
   - Driver accepts a registered booking
   - Changes status from `'registered'` to `'accepted'`
   - Authorization: Must be the ride's driver

2. **PUT `/api/bookings/:id/verify`** (Driver action)
   - Driver enters passenger's OTP code
   - Validates the verification code
   - Changes status from `'accepted'` to `'confirmed'`
   - Sets `isVerified: true` and `verifiedAt: Date`
   - Authorization: Must be the ride's driver

### 2. Mobile App Changes

#### API Service (`mobile/src/services/api.js`)
**Updated bookingsAPI:**
```javascript
accept: (id) => api.put(`/bookings/${id}/accept`)
verify: (id, verificationCode) => api.put(`/bookings/${id}/verify`, { verificationCode })
// Removed: confirm: (id) => api.put(`/bookings/${id}/confirm`)
```

#### Passenger Side

**RideDetailScreen.js:**
- Changed button text: "Confirm Booking" → "Register Booking"
- Updated success alert to display OTP code
- Alert message includes instructions to share code with driver
- Extracts `verificationCode` from API response

**MyBookingsScreen.js:**
- Added OTP display for `registered` and `accepted` bookings
- Shows verification code in highlighted blue box with dashed border
- Includes helpful hints based on status
- Updated `getStatusColor()` to include new statuses:
  - `registered`: Blue (#2196f3)
  - `accepted`: Teal (#00bcd4)
  - `confirmed`: Green (#4caf50)
  - `completed`: Gray (#9e9e9e)
- Allow cancellation for both `pending` and `registered` statuses

#### Driver Side

**ManageRideScreen.js:**
- **Replaced `handleConfirmBooking`** with:
  - `handleAcceptBooking()` - Accepts registered bookings
  - `handleVerifyBooking()` - Prompts for OTP and verifies

- **Updated booking action buttons:**
  - **Registered status**: Shows "Accept" and "Reject" buttons
  - **Accepted status**: Shows "Verify with OTP" and "Reject" buttons
  - **Confirmed status**: Shows "Message Passenger" button

- **OTP Verification Dialog:**
  - Uses `Alert.prompt()` for OTP input
  - Numeric keyboard for easy entry
  - Validates 6-digit code length
  - Shows success/error messages

- **Updated status colors** to match passenger side

## User Experience

### For Passengers:

1. **Register a Ride:**
   - Fill in passenger details
   - Tap "Register Booking"
   - Receive OTP code in success alert
   - Code is also visible in "My Trips" screen

2. **View OTP Code:**
   - Navigate to "My Trips"
   - See verification code in blue highlighted box
   - Status shows as "REGISTERED" or "ACCEPTED"

3. **Share with Driver:**
   - Tell driver the 6-digit code when meeting
   - Driver enters code to start ride
   - Status changes to "CONFIRMED"

### For Drivers:

1. **Accept Booking:**
   - View registered bookings in "Manage Ride"
   - Review passenger details
   - Tap "Accept" button
   - Status changes to "ACCEPTED"

2. **Verify Passenger:**
   - When passenger arrives, tap "Verify with OTP"
   - Enter the 6-digit code passenger provides
   - System validates the code
   - On success, booking is confirmed and ride can start

3. **Start Ride:**
   - After verification, status shows "CONFIRMED"
   - Can message passenger
   - Begin the journey

## Security Benefits

✅ **Prevents Fraud** - Only passenger with OTP can confirm the ride
✅ **Identity Verification** - Ensures right passenger boards
✅ **Driver Protection** - Driver knows passenger is legitimate
✅ **Passenger Safety** - Confirms driver accepted their specific booking
✅ **Audit Trail** - `verifiedAt` timestamp for records

## Status Progression

```
REGISTERED (Blue)
    ↓ Driver accepts
ACCEPTED (Teal)
    ↓ Driver verifies OTP
CONFIRMED (Green)
    ↓ Ride completes
COMPLETED (Gray)
```

**Alternative paths:**
- Any status → CANCELED (Red) if rejected

## API Examples

### Register a Booking
```javascript
POST /api/bookings
{
  "rideId": "ride_id",
  "seatsBooked": 2,
  "passengerDetails": { ... }
}

Response:
{
  "_id": "booking_id",
  "verificationCode": "123456",  // OTP code
  "status": "registered",
  ...
}
```

### Accept a Booking
```javascript
PUT /api/bookings/:id/accept

Response:
{
  "status": "accepted",
  ...
}
```

### Verify with OTP
```javascript
PUT /api/bookings/:id/verify
{
  "verificationCode": "123456"
}

Response:
{
  "status": "confirmed",
  "isVerified": true,
  "verifiedAt": "2025-11-24T09:30:00.000Z",
  ...
}
```

## Error Handling

**Invalid OTP:**
- Returns 400 error: "Invalid verification code"
- Driver can retry with correct code

**Wrong Status:**
- Accept: Must be in `registered` status
- Verify: Must be in `accepted` status

**Authorization:**
- Only ride's driver can accept/verify bookings

## Testing Checklist

### Passenger Flow:
- [ ] Register a new booking
- [ ] Verify OTP code is displayed in alert
- [ ] Check OTP is visible in My Trips
- [ ] Verify status shows as "REGISTERED"
- [ ] Cancel a registered booking

### Driver Flow:
- [ ] View registered booking in Manage Ride
- [ ] Accept a registered booking
- [ ] Verify status changes to "ACCEPTED"
- [ ] Enter correct OTP code
- [ ] Verify booking becomes "CONFIRMED"
- [ ] Try entering wrong OTP (should fail)
- [ ] Reject a booking

### Edge Cases:
- [ ] Try to verify without accepting first
- [ ] Try to accept already accepted booking
- [ ] Enter OTP with wrong length
- [ ] Enter non-numeric OTP

## Future Enhancements

Potential improvements:
- SMS/Email delivery of OTP
- OTP expiration time (e.g., 24 hours)
- Resend OTP functionality
- QR code generation for OTP
- Biometric verification option
- Driver can request OTP resend
- Notification when driver accepts booking
- Push notification with OTP code

## Migration Notes

**Existing Bookings:**
- Old bookings without `verificationCode` will need migration
- Can generate OTP for existing `pending` bookings
- Or mark old bookings as `confirmed` with `isVerified: false`

**Backward Compatibility:**
- Old mobile app versions won't work with new API
- Recommend force update or version check
