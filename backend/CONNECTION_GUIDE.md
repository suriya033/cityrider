# MongoDB Connection Guide

## Option 1: MongoDB Atlas (Cloud) - Recommended

1. **Get your connection string from MongoDB Atlas:**
   - Go to MongoDB Atlas Dashboard
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

2. **Update your `.env` file:**
   ```
   MONGODB_URI=mongodb+srv://suriyavj33_db_user:YOUR_ACTUAL_PASSWORD@cluster0.bbfk6l6.mongodb.net/cityrider?retryWrites=true&w=majority
   ```
   
   **Important:**
   - Replace `YOUR_ACTUAL_PASSWORD` with your actual MongoDB password
   - Make sure `cityrider` is the database name (or add it after `.net/`)
   - Ensure your IP is whitelisted in Atlas (use 0.0.0.0/0 for all IPs during development)

## Option 2: Local MongoDB

1. **Install MongoDB locally** (if not already installed)

2. **Start MongoDB service:**
   - Windows: Start from Services or run `mongod`
   - Mac/Linux: Run `mongod`

3. **Update your `.env` file:**
   ```
   MONGODB_URI=mongodb://localhost:27017/cityrider
   ```

## Testing the Connection

After setting up, run:
```bash
npm run dev
```

You should see:
```
MongoDB Connected successfully
Server running on port 5000
```

If you see an error, check:
- Password is correct (for Atlas)
- IP is whitelisted (for Atlas)
- MongoDB service is running (for local)
- Network connection is active





