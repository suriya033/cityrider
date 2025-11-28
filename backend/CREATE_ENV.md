# Create .env File - Step by Step

## Option 1: Manual Creation (Recommended)

1. **Create a new file** named `.env` in the `backend` folder

2. **Copy and paste** this content:

```
PORT=5000
MONGODB_URI=mongodb+srv://suriyavj33_db_user:YOUR_PASSWORD_HERE@cluster0.bbfk6l6.mongodb.net/cityrider?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=cityrider_super_secret_jwt_key_2024_production_change_in_production
NODE_ENV=development
GOOGLE_MAPS_API_KEY=
```

3. **Replace `YOUR_PASSWORD_HERE`** with your actual MongoDB Atlas password

4. **Save the file** as `.env` (make sure there's no extension like .txt)

## Option 2: Copy from Template

1. Copy `env.template` file
2. Rename it to `.env`
3. Replace `<db_password>` with your actual password

## Important Notes:

- **Database name**: `cityrider` is already added to the connection string
- **Password**: Replace the placeholder with your actual MongoDB password
- **No spaces**: Make sure there are no spaces around the `=` sign
- **Special characters**: If your password has special characters like `@`, `#`, etc., you may need to URL encode them

## After Creating .env:

1. Make sure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for all IPs)
2. Run: `npm run dev`
3. You should see: "MongoDB Connected successfully"





