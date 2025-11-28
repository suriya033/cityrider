# Passenger Details - Quick Reference

## What Was Added

✅ **Passenger Form** - Comprehensive details collection during booking
✅ **Driver View** - Display all passenger information in booking cards
✅ **Backend Support** - Database model and API updates
✅ **Validation** - Contact number required before booking

## Files Modified

### Backend (3 files)
1. `backend/models/Booking.js` - Added passengerDetails schema
2. `backend/routes/bookings.js` - Updated create booking endpoint

### Mobile App (2 files)
1. `mobile/src/screens/passenger/RideDetailScreen.js` - Added passenger details form
2. `mobile/src/screens/driver/ManageRideScreen.js` - Added passenger details display

## Passenger Details Collected

### Required
- ✅ **Contact Number** - Must be provided

### Optional
- 📞 **Emergency Contact** (Name, Phone, Relation)
- 👥 **Passenger Count** (Adults, Children)
- 🧳 **Luggage Size** (None, Small, Medium, Large)
- 📝 **Special Requirements** (Free text)

## How to Test

### As Passenger:
1. Open the app and search for rides
2. Select a ride and tap to view details
3. Scroll to "Book Your Ride" section
4. Enter number of seats
5. **NEW:** Fill in passenger details:
   - Contact number (required)
   - Adults/Children count
   - Select luggage size
   - Optionally expand and add emergency contact
   - Optionally add special requirements
6. Tap "Confirm Booking"

### As Driver:
1. Navigate to "My Rides"
2. Select a ride and tap "Manage Ride"
3. View bookings list
4. **NEW:** Each booking now shows:
   - Passenger contact number
   - Number of adults and children
   - Luggage information
   - Emergency contact (if provided)
   - Special requirements (if provided)

## API Changes

### POST /api/bookings
**New Request Body:**
```json
{
  "rideId": "ride_id_here",
  "seatsBooked": 2,
  "passengerDetails": {
    "contactNumber": "+91 9876543210",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+91 9876543211",
      "relation": "Spouse"
    },
    "numberOfAdults": 2,
    "numberOfChildren": 1,
    "specialRequirements": "Need child seat",
    "luggage": "medium"
  }
}
```

## Database Schema

```javascript
passengerDetails: {
  contactNumber: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  numberOfAdults: Number (default: 1),
  numberOfChildren: Number (default: 0),
  specialRequirements: String,
  luggage: String (enum: 'none', 'small', 'medium', 'large')
}
```

## UI Components Added

### Passenger Side
- Contact Number Input (with phone icon)
- Adults/Children Number Inputs (side by side)
- Luggage Chips (None, Small, Medium, Large)
- Collapsible Emergency Contact Section
- Special Requirements Text Area

### Driver Side
- Passenger Information Section Header
- Info Rows (icon + text)
- Emergency Contact Box (orange border)
- Special Requirements Box (green border)

## Benefits

👍 **Better Communication** - Direct contact with passengers
👍 **Trip Planning** - Know passenger count and luggage in advance
👍 **Safety** - Emergency contact information available
👍 **Special Needs** - Drivers aware of requirements beforehand
👍 **Professional** - More organized and complete booking system

## Notes

- All fields except contact number are optional
- Emergency contact section is collapsible to reduce clutter
- Backward compatible - old bookings without details still work
- Data is validated on both frontend and backend
- Clean, modern UI with Material Design principles
