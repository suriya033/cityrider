# CityRider Mobile App

React Native mobile application for ride-sharing.

## Setup Instructions

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Update API base URL in `src/services/api.js`:
   - For iOS Simulator: `http://localhost:5000/api`
   - For Android Emulator: `http://10.0.2.2:5000/api`
   - For Physical Device: `http://YOUR_COMPUTER_IP:5000/api`

3. Start the Expo development server:
```bash
npm start
# or
expo start
```

4. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Features

- **Authentication**: Login and registration for drivers and passengers
- **Driver Features**:
  - Post new rides
  - Manage posted rides
  - View and confirm bookings
  - View passenger details

- **Passenger Features**:
  - Search rides by origin, destination, date
  - View ride details
  - Book rides
  - View booking history
  - Message drivers

- **Common Features**:
  - User profiles
  - Real-time messaging
  - Location picker with map integration
  - Route visualization

## Environment Setup

Make sure you have:
- Node.js installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio for Android emulator
- Expo Go app on your phone for testing on physical device

## Notes

- Update the API base URL in `src/services/api.js` based on your testing environment
- For Google Maps integration, you'll need to configure API keys in `app.json`
- Socket.IO connection URL should match your backend server URL






