# API Connection Troubleshooting Guide

## Error: "Request timeout. Please check your internet connection"

This error occurs when the mobile app cannot connect to the backend server. Follow these steps to fix it:

### Step 1: Verify Backend is Running

1. Check the terminal running `npm run dev` in the backend folder
2. You should see: `🚀 Server running on port 5004`
3. If not running, start it:
   ```bash
   cd backend
   npm run dev
   ```

### Step 2: Check Your IP Address

The current API URL is: `http://10.211.33.35:5004/api`

**For Physical Device:**
1. Find your computer's IP address:
   - Windows: Open CMD and type `ipconfig` - look for "IPv4 Address"
   - Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`
2. Update `mobile/src/services/api.js` line 4:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5004/api';
   ```

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5004/api';
```

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:5004/api';
```

### Step 3: Test Backend Connection

Open your browser and navigate to:
```
http://YOUR_IP_ADDRESS:5004/api/auth/login
```

You should see a response (even if it's an error - that means the server is reachable).

### Step 4: Check Firewall Settings

**Windows:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Make sure Node.js is allowed on both Private and Public networks

**Mac:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Make sure Node is allowed

### Step 5: Verify Network Connection

1. Make sure your phone and computer are on the **same WiFi network**
2. Try pinging your computer from another device on the same network

### Step 6: Clear App Cache and Restart

1. Stop the Metro bundler (Ctrl+C in the terminal running `npm start`)
2. Clear cache:
   ```bash
   cd mobile
   npx react-native start --reset-cache
   ```
3. Rebuild the app

### Step 7: Check MongoDB Connection

Make sure MongoDB is connected. In the backend terminal, you should see:
```
✅ MongoDB Connected successfully
```

If not, check your MongoDB connection string in `backend/server.js`.

## Quick Fixes

### Fix 1: Increase Timeout (Already Applied)
The timeout has been increased to 60 seconds in `api.js`.

### Fix 2: Use Localhost for Testing
If you're using an emulator/simulator, try:
```javascript
export const API_BASE_URL = 'http://localhost:5004/api';
```

### Fix 3: Restart Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npm start -- --reset-cache

# Terminal 3 - Run on device
cd mobile
npx react-native run-android
# or
npx react-native run-ios
```

## Common Issues

### Issue: "Network Error"
- **Cause**: Cannot reach the server
- **Fix**: Check IP address and firewall settings

### Issue: "Request timeout"
- **Cause**: Server is slow or not responding
- **Fix**: Check if backend is running and MongoDB is connected

### Issue: "401 Unauthorized"
- **Cause**: Invalid or expired token
- **Fix**: App will automatically clear auth data - just login again

## Debugging Tips

1. **Check Console Logs**: Look for these messages in the terminal:
   - `📡 API Request: POST /auth/login`
   - `✅ API Response: POST /auth/login - 200`
   - `❌ API Error: ...`

2. **Test with Postman**: 
   - Send a POST request to `http://YOUR_IP:5004/api/auth/login`
   - Body: `{"email": "test@test.com", "password": "password"}`

3. **Check Backend Logs**: The backend terminal will show all incoming requests

## Current Configuration

- **API Base URL**: `http://10.211.33.35:5004/api`
- **Timeout**: 60 seconds
- **Backend Port**: 5004
- **MongoDB**: Connected to Atlas cluster

## Need More Help?

If the issue persists:
1. Check the exact error message in the app
2. Check backend terminal for errors
3. Verify both devices are on the same network
4. Try using the Android emulator with `http://10.0.2.2:5004/api`
