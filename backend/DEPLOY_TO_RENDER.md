# 🚀 Deploying CityRider Backend to Render

Follow these steps to deploy your backend to the cloud so your app works from anywhere.

## Step 1: Create a Render Account
1. Go to [https://render.com](https://render.com) and sign up (you can use your GitHub account).

## Step 2: Create a New Web Service
1. Click on the **"New +"** button and select **"Web Service"**.
2. Connect your GitHub account if you haven't already.
3. Search for your repository `cityrider` and click **"Connect"**.

## Step 3: Configure the Service
Fill in the details as follows:

- **Name:** `cityrider-backend` (or any name you like)
- **Region:** Choose the one closest to you (e.g., Singapore or Frankfurt)
- **Branch:** `main`
- **Root Directory:** `backend` (⚠️ Important: Don't leave this empty!)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** `Free`

## Step 4: Environment Variables
Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"**. Add the following:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://suriya003:admin@cluster0.jb7yduw.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `cityrider_super_secret_jwt_key_2024_production_change_in_production` |
| `NODE_ENV` | `production` |

*(Note: I copied these from your `env.template` file. If you have a different real password for MongoDB, make sure to use that!)*

## Step 5: Deploy
1. Click **"Create Web Service"**.
2. Wait for the deployment to finish. You will see logs.
3. Once it says "Live", copy the URL at the top (e.g., `https://cityrider-backend.onrender.com`).

## Step 6: Update Mobile App
1. Open `mobile/src/config/environment.js`.
2. Update the `production` section with your new Render URL:
   ```javascript
   production: {
       baseURL: 'https://your-app-name.onrender.com/api', // <--- Paste your Render URL here
       timeout: 15000,
   },
   ```
3. Save the file.

## Step 7: Build/Run the App
Now you can run your app in production mode or build a new APK, and it will connect to this cloud server!
