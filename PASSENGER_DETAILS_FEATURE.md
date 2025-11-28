# Passenger Details Feature

## Overview
Added comprehensive passenger details collection when booking a ride. This feature allows passengers to provide essential information during the booking process, which drivers can then view to better prepare for the trip.

## Changes Made

### 1. Backend Changes

#### Booking Model (`backend/models/Booking.js`)
- **Added `passengerDetails` field** with the following sub-fields:
  - `contactNumber`: Passenger's contact phone number
  - `emergencyContact`: Object containing:
    - `name`: Emergency contact person's name
    - `phone`: Emergency contact phone number
    - `relation`: Relationship to passenger
  - `numberOfAdults`: Number of adult passengers (default: 1)
  - `numberOfChildren`: Number of child passengers (default: 0)
  - `specialRequirements`: Any special needs or requests
  - `luggage`: Luggage size (enum: 'none', 'small', 'medium', 'large')

#### Booking Routes (`backend/routes/bookings.js`)
- **Updated POST `/api/bookings` endpoint** to accept and store `passengerDetails` from request body
- Passenger details are now saved with each booking

### 2. Mobile App Changes

#### Passenger Side - RideDetailScreen (`mobile/src/screens/passenger/RideDetailScreen.js`)

**New State Variables:**
- `contactNumber`: Required contact number
- `emergencyName`, `emergencyPhone`, `emergencyRelation`: Emergency contact details
- `numberOfAdults`, `numberOfChildren`: Passenger count
- `specialRequirements`: Special needs text
- `luggage`: Luggage size selection
- `showPassengerForm`: Toggle for emergency contact section

**New UI Components:**
- **Contact Number Input** (Required) - Phone number input with validation
- **Adults/Children Count** - Numeric inputs for passenger count
- **Luggage Selection** - Chip-based selection (None, Small, Medium, Large)
- **Emergency Contact Section** - Collapsible section with:
  - Emergency contact name
  - Emergency contact phone
  - Relationship to passenger
- **Special Requirements** - Multi-line text input for special needs

**Validation:**
- Contact number is required before booking
- Alert shown if contact number is missing

**Updated Booking Handler:**
- Now includes all passenger details in the booking API request

#### Driver Side - ManageRideScreen (`mobile/src/screens/driver/ManageRideScreen.js`)

**New Display Section:**
Added "Passenger Information" section in booking cards showing:
- **Contact Number** - Direct contact for the passenger
- **Passenger Count** - Number of adults and children
- **Luggage Information** - Size of luggage (if not 'none')
- **Emergency Contact** - Highlighted in orange box with:
  - Emergency contact name and relation
  - Emergency contact phone number
- **Special Requirements** - Highlighted in green box

**Visual Design:**
- Info rows with icons for quick scanning
- Color-coded boxes for emergency contact (orange) and special requirements (green)
- Clean, organized layout within existing booking cards

## User Flow

### For Passengers:
1. Browse and select a ride
2. Choose number of seats
3. Fill in passenger details:
   - Enter contact number (required)
   - Specify number of adults and children
   - Select luggage size
   - Optionally add emergency contact
   - Optionally add special requirements
4. Review total amount
5. Confirm booking

### For Drivers:
1. Navigate to "Manage Ride" for a specific ride
2. View list of bookings
3. For each booking, see:
   - Basic passenger info (name, email)
   - Seats booked and amount
   - **NEW:** Detailed passenger information including:
     - Contact number
     - Passenger count
     - Luggage details
     - Emergency contact (if provided)
     - Special requirements (if provided)
4. Confirm or reject bookings with full passenger context

## Benefits

### For Passengers:
- Provide important information upfront
- Ensure driver is aware of special needs
- Emergency contact for safety
- Clear communication about luggage

### For Drivers:
- Better trip planning with passenger count
- Prepare for luggage requirements
- Contact passengers directly if needed
- Aware of special requirements before the trip
- Emergency contact information for safety

## Technical Notes

- All passenger details are optional except contact number
- Emergency contact section is collapsible to reduce form clutter
- Luggage selection uses chip-based UI for easy selection
- Backend model is flexible and can be extended with more fields
- Data is properly validated on both frontend and backend
- Existing bookings without passenger details will still work (backward compatible)

## Testing Recommendations

1. **Create a new booking** with all passenger details filled
2. **Create a booking** with only required fields (contact number)
3. **View booking as driver** to verify all details display correctly
4. **Test validation** by attempting to book without contact number
5. **Test emergency contact** collapsible section
6. **Test luggage selection** chips
7. **Verify backward compatibility** with existing bookings

## Future Enhancements

Potential additions:
- Passenger preferences (music, temperature, etc.)
- Dietary restrictions for long trips
- Pickup location notes
- Photo ID verification
- Rating/review system integration
- Notification to driver when passenger adds special requirements
