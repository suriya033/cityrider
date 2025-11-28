# 🚀 Quick Start Guide

## ⚠️ IMPORTANT: Update Your MongoDB Password

1. Open `backend/.env` file
2. Replace `<db_password>` with your actual MongoDB Atlas password
3. Save the file

Example:
```
MONGODB_URI=mongodb+srv://suriyavj33_db_user:YOUR_ACTUAL_PASSWORD@cluster0.bbfk6l6.mongodb.net/cityrider?retryWrites=true&w=majority&appName=Cluster0
```

## 🔧 MongoDB Atlas Setup

Before running, make sure:

1. **Your IP is whitelisted in MongoDB Atlas:**
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access" in the left menu
   - Click "Add IP Address"
   - For development: Add `0.0.0.0/0` (allows all IPs)
   - Click "Confirm"

2. **Your database user exists:**
   - Go to "Database Access" in MongoDB Atlas
   - Make sure `suriyavj33_db_user` exists and password is correct

## ▶️ Start the Application

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## ✅ Success Indicators

You should see:
```
MongoDB Connected successfully
Server running on port 5000
```

## 🧪 Test the Connection

Open another terminal and test:

```bash
# Test if server is running
curl http://localhost:5000/api/auth/me

# Or use Postman/Insomnia
GET http://localhost:5000/api/auth/me
```

Expected: 401 Unauthorized (this means server is working!)

## ❌ Common Issues

### "MongoDB Connection Error"
- Check password in `.env` file is correct
- Verify IP is whitelisted in MongoDB Atlas
- Check network connection

### "Port 5000 already in use"
- Change PORT in `.env` file to another port (e.g., 5001)
- Or stop the process using port 5000

### "Module not found"
- Run `npm install` in the backend directory

## 📝 Next Steps

Once server is running:
1. Update mobile app's API URL in `mobile/src/services/api.js`
2. Test registration: POST to `/api/auth/register`
3. Test login: POST to `/api/auth/login`





