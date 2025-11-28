# Fix "require unknown module 1" Error

## 🔍 Error Analysis

**Error:** `require unknown module 1`

**Cause:** This error typically occurs due to:
1. Metro bundler cache corruption
2. Asset import issues
3. Module resolution problems
4. Stale build artifacts

## ✅ Solution Steps

### Step 1: Clear Metro Bundler Cache
```bash
# Stop the current Metro bundler (Ctrl+C)

# Clear cache and restart
npx react-native start --reset-cache

# Or use npm script
npm start -- --reset-cache
```

### Step 2: Clear Watchman Cache (if using)
```bash
watchman watch-del-all
```

### Step 3: Clear Node Modules Cache
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or on Windows
rmdir /s /q node_modules
npm install
```

### Step 4: Clear Expo Cache (if using Expo)
```bash
expo start -c

# Or
npx expo start --clear
```

### Step 5: Clean Build Folders
```bash
# Android
cd android
./gradlew clean
cd ..

# iOS
cd ios
rm -rf build
pod install
cd ..
```

## 🚀 Quick Fix (Recommended)

### For Expo Projects:
```bash
# Stop current server (Ctrl+C)
npx expo start -c
```

### For React Native CLI:
```bash
# Stop current server (Ctrl+C)
npx react-native start --reset-cache
```

## 🔧 Alternative Solutions

### Solution 1: Restart Metro with Clean Cache
```bash
# In mobile directory
npm start -- --reset-cache
```

### Solution 2: Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# On Windows
del /s /q %TEMP%\metro-*
del /s /q %TEMP%\haste-*
```

### Solution 3: Reinstall Dependencies
```bash
# Remove package-lock and node_modules
rm package-lock.json
rm -rf node_modules

# Reinstall
npm install
```

## 📋 Verification Steps

After applying the fix:

1. **Check Metro bundler starts clean:**
   ```
   ✓ Metro bundler ready
   ✓ No cache warnings
   ✓ All modules resolved
   ```

2. **Verify app loads:**
   ```
   ✓ App launches successfully
   ✓ No module errors
   ✓ Images load correctly
   ```

3. **Test asset loading:**
   ```
   ✓ Background images visible
   ✓ Icons display properly
   ✓ No require errors
   ```

## 🎯 Specific Fix for CityRider

### Current Setup:
- **Assets Location:** `mobile/assets/bg1.jpg` ✅ EXISTS
- **Import Pattern:** `require('../../../assets/bg1.jpg')` ✅ CORRECT
- **Issue:** Metro cache corruption

### Recommended Action:
```bash
# Navigate to mobile directory
cd c:\Users\gopi\Desktop\cityrider\mobile

# Stop current server (Ctrl+C in terminal)

# Start with cache reset
npm start -- --reset-cache

# Or if using Expo
npx expo start -c
```

## 🔄 Prevention

### To avoid this issue in future:

1. **Regular cache clearing:**
   ```bash
   # Weekly or after major changes
   npm start -- --reset-cache
   ```

2. **Clean node_modules periodically:**
   ```bash
   # Monthly or when issues arise
   rm -rf node_modules && npm install
   ```

3. **Use consistent import paths:**
   ```javascript
   // Good - relative path
   require('../../../assets/bg1.jpg')
   
   // Good - absolute path (with alias)
   require('@assets/bg1.jpg')
   ```

4. **Avoid circular dependencies:**
   - Check import chains
   - Use proper module structure
   - Avoid importing parent from child

## 📝 Common Variations

### Error Messages:
- `require unknown module 1`
- `require unknown module 2`
- `Unable to resolve module`
- `Module not found`

### All Fixed By:
- Clearing Metro cache
- Restarting bundler
- Reinstalling dependencies

## ✅ Expected Result

After fix:
```
✓ Metro bundler running
✓ All modules resolved
✓ Assets loading correctly
✓ No require errors
✓ App running smoothly
```

---

**Quick Command:**
```bash
npm start -- --reset-cache
```

**Status:** This will fix the "require unknown module 1" error.
