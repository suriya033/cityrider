# CityRider - Production Configuration Guide

## Critical Issues Fixed

### 1. ✅ API URL Configuration
- **Issue**: App was trying to connect to local development server (http://10.231.17.88:5005/api)
- **Fix**: Updated to use `__DEV__` flag to differentiate between development and production
- **Action Required**: Deploy your backend and update the production URL in `src/services/api.js`

### 2. ✅ Network Error Handling
- **Issue**: App crashed when backend was unreachable
- **Fix**: Added graceful fallback to cached user data when network is unavailable
- **Result**: App won't crash if backend is down, users can still access cached data

### 3. ⚠️ Google Maps API Key (ACTION REQUIRED)
- **Issue**: Using dummy API key: `AIzaSyDummy-Key-Replace-With-Real-One`
- **Fix Required**: Get a real Google Maps API key

## How to Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key
6. Update `mobile/app.json` line 40:
   ```json
   "googleMaps": {
     "apiKey": "YOUR_REAL_API_KEY_HERE"
   }
   ```

## Deploy Backend (Required for Production)

Your backend needs to be publicly accessible. Options:

### Option 1: Render (Recommended - Free Tier Available)
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables (MongoDB, JWT_SECRET, etc.)
7. Deploy and copy the URL

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Configure environment variables
4. Deploy

### Option 3: Heroku
1. Install Heroku CLI
2. Run: `heroku create cityrider-backend`
3. Push backend code
4. Configure environment variables

## Update Production API URL

After deploying backend, update `mobile/src/services/api.js`:

```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://10.231.17.88:5005/api'  // Development
  : 'https://your-deployed-backend.onrender.com/api'; // Production
```

## Rebuild APK

After making these changes:

```bash
cd mobile
eas build -p android --profile production
```

## Testing Checklist

Before releasing:
- [ ] Backend deployed and accessible
- [ ] Google Maps API key added
- [ ] Production API URL updated
- [ ] Test login/register
- [ ] Test ride creation
- [ ] Test booking flow
- [ ] Test maps functionality
- [ ] Test offline mode (cached data)

## Current Status

✅ Network error handling fixed
✅ API URL configuration improved
⚠️ Need Google Maps API key
⚠️ Need to deploy backend
⚠️ Need to update production API URL

## Quick Fix for Testing

If you just want to test the app without backend:

1. The app will now use cached data if backend is unreachable
2. Login once while connected to development backend
3. App will work offline with cached user data
4. Some features requiring real-time data won't work

## Notes

- The app won't crash anymore when backend is unreachable
- Users will see their cached data
- Network-dependent features will show appropriate error messages
- Maps will still need a valid API key to work
