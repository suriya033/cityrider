#!/usr/bin/env node

/**
 * Setup Script for CityRider Production Build
 * 
 * This script helps configure the app for production deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('\n🚀 CityRider Production Setup\n');
    console.log('This script will help you configure your app for production.\n');

    // 1. Google Maps API Key
    console.log('📍 Step 1: Google Maps API Key');
    console.log('Get your API key from: https://console.cloud.google.com/\n');
    const mapsApiKey = await question('Enter your Google Maps API Key (or press Enter to skip): ');

    if (mapsApiKey && mapsApiKey.trim()) {
        const appJsonPath = path.join(__dirname, 'app.json');
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

        appJson.expo.android.config.googleMaps.apiKey = mapsApiKey.trim();

        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        console.log('✅ Google Maps API Key updated in app.json\n');
    } else {
        console.log('⚠️  Skipped Google Maps API Key. Update it manually in app.json\n');
    }

    // 2. Backend URL
    console.log('🌐 Step 2: Production Backend URL');
    console.log('Deploy your backend to Render, Railway, or Heroku first.\n');
    const backendUrl = await question('Enter your production backend URL (or press Enter to skip): ');

    if (backendUrl && backendUrl.trim()) {
        const envPath = path.join(__dirname, 'src', 'config', 'environment.js');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Update production baseURL
        envContent = envContent.replace(
            /baseURL: 'https:\/\/your-backend-url\.com\/api'/,
            `baseURL: '${backendUrl.trim()}${backendUrl.endsWith('/api') ? '' : '/api'}'`
        );

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Production backend URL updated in environment.js\n');
    } else {
        console.log('⚠️  Skipped backend URL. Update it manually in src/config/environment.js\n');
    }

    // 3. Summary
    console.log('\n📋 Setup Summary:');
    console.log('─────────────────────────────────────────');
    if (mapsApiKey && mapsApiKey.trim()) {
        console.log('✅ Google Maps API Key: Configured');
    } else {
        console.log('⚠️  Google Maps API Key: Not configured');
    }

    if (backendUrl && backendUrl.trim()) {
        console.log('✅ Backend URL: Configured');
    } else {
        console.log('⚠️  Backend URL: Not configured');
    }
    console.log('─────────────────────────────────────────\n');

    console.log('📝 Next Steps:');
    console.log('1. Review the changes in app.json and src/config/environment.js');
    console.log('2. Make sure your backend is deployed and accessible');
    console.log('3. Run: eas build -p android --profile production');
    console.log('4. Test the APK thoroughly before distribution\n');

    rl.close();
}

setup().catch(error => {
    console.error('❌ Setup failed:', error);
    rl.close();
    process.exit(1);
});
