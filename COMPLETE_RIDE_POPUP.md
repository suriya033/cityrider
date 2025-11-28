# Complete Ride Popup Feature ✨

## Overview
Implemented a "Complete Ride" popup on the passenger HomeScreen. This feature automatically detects if the user has an active (confirmed) booking and displays a prominent popup card, allowing them to complete the ride directly from the home screen without navigating to the bookings page.

---

## 🎯 Features

### Automatic Detection
- Checks for active bookings when the user lands on the HomeScreen.
- Specifically looks for bookings with status `'confirmed'`.

### Prominent Popup
- **Location**: Floating at the bottom of the screen.
- **Style**: High elevation card with a green accent border.
- **Content**: Shows origin and destination of the active ride.
- **Action**: "Complete Ride" button to immediately finish the ride.

### User Flow
1. User opens app / goes to HomeScreen.
2. App checks for active rides.
3. If found, popup appears: "Ride in Progress".
4. User taps "Complete Ride".
5. Ride is marked as completed, popup disappears, and success message is shown.

---

## 🎨 Visual Design

### Popup Card
- **Background**: White
- **Elevation**: 8 (Floating effect)
- **Border**: Left green border (6px) to indicate active status/success action.
- **Radius**: 16px (Rounded corners)

### Complete Button
- **Color**: Green (#4caf50)
- **Icon**: Check-circle
- **Style**: Contained button

---

## 📱 Technical Details

### State Management
- `activeBooking`: Stores the current confirmed booking object.
- `useEffect`: Triggers the check when user role is 'passenger' or when refreshing.

### API Integration
- Uses `bookingsAPI.getMyBookings()` to fetch user's bookings.
- Uses `bookingsAPI.complete(id)` to execute the completion action.

---

**Status**: ✅ Complete
**Date**: November 24, 2025
**Feature**: Complete Ride Popup
**User Benefit**: One-tap ride completion
