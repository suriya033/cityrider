# Backend Fix: Booking Schema Update 🛠️

## Issue
The server was returning a **500 Internal Server Error** when passengers tried to complete a ride.

## Cause
The `Booking` model schema was missing:
1.  The `paymentMethod` field.
2.  The `'payment_processing'` status in the `status` enum.

When the backend tried to save a booking with `status: 'payment_processing'` or `paymentMethod: '...'`, Mongoose validation failed (or strict mode rejected it), causing the crash.

## Resolution
Updated `backend/models/Booking.js` to include:
- `paymentMethod`: String (default 'Online')
- `status`: Added `'payment_processing'` to the allowed values.

## Verification
- `nodemon` should automatically restart the server.
- Passengers can now successfully select a payment method and complete the ride.
- The status will correctly update to `payment_processing`, triggering the driver confirmation flow.

---

**Status**: ✅ Fixed
**Date**: November 24, 2025
**Files Modified**: `backend/models/Booking.js`
