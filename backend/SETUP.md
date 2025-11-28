# Backend Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://suriyavj33_db_user:YOUR_PASSWORD@cluster0.bbfk6l6.mongodb.net/cityrider?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NODE_ENV=development
```

### Important Notes:

1. **MongoDB URI**: 
   - Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password
   - Make sure the database name is `cityrider` (it's in the URI)
   - If using local MongoDB: `mongodb://localhost:27017/cityrider`

2. **JWT_SECRET**: 
   - Change this to a strong, random string in production
   - Used for signing authentication tokens

3. **GOOGLE_MAPS_API_KEY**: 
   - Optional for now, but needed for full map features
   - Get one from [Google Cloud Console](https://console.cloud.google.com/)

## Step 3: Start MongoDB

### For MongoDB Atlas:
- No setup needed, just make sure your IP is whitelisted in Atlas

### For Local MongoDB:
- Windows: Start MongoDB service from Services
- Mac/Linux: Run `mongod` in terminal

## Step 4: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server should start on `http://localhost:5000`

## Step 5: Test the Connection

Open your browser or use Postman to test:

```bash
# Test server is running
GET http://localhost:5000/api/auth/me
# Should return 401 (unauthorized) - this means server is working!

# Test MongoDB connection
# Check console for "MongoDB Connected successfully" message
```

## Troubleshooting

### MongoDB Connection Error
- Check your MongoDB URI is correct
- For Atlas: Verify IP is whitelisted (use 0.0.0.0/0 for development)
- For Atlas: Check username and password are correct
- Check network connection

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 5000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Next Steps

1. Test the API endpoints using Postman or curl
2. Update the mobile app's API_BASE_URL in `mobile/src/services/api.js`
3. Test the full flow: Register → Login → Post Ride → Book Ride





