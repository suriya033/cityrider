# CityRider - Build APK Locally

## Prerequisites
1. Install Android Studio
2. Install Java JDK 11 or higher

## Steps to Build APK

### 1. Generate Android Project
```bash
cd c:\Users\gopi\Desktop\cityrider\mobile
npx expo prebuild --platform android
```

### 2. Build APK
```bash
cd android
gradlew assembleRelease
```

### 3. Find Your APK
The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Alternative: Use EAS Build (Cloud)

### 1. Create Expo Account
- Go to https://expo.dev/signup
- Sign up with: suriya1252044@gmail.com
- Verify your email

### 2. Login
```bash
npx eas-cli login
```

### 3. Build APK
```bash
npx eas-cli build -p android --profile preview
```

The build will happen in the cloud and you'll get a download link!

## Quick Commands Reference

### For Local Build:
```bash
# Generate native code
npx expo prebuild

# Build APK
cd android
gradlew assembleRelease
```

### For Cloud Build (EAS):
```bash
# Login (after creating account)
npx eas-cli login

# Build
npx eas-cli build -p android --profile preview
```

## Troubleshooting

If you get "S is not a function" error:
```bash
npm cache clean --force
npm install -g eas-cli@latest
```

Then try login again.
