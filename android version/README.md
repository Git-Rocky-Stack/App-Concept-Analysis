# Strategia-X Android App

Native Android wrapper for the Strategia-X (Viral App Architect) web application.

## Project Structure

```
android version/
├── app/
│   ├── src/main/
│   │   ├── java/com/strategiax/app/
│   │   │   ├── MainActivity.kt      # Main activity with WebView & AdMob
│   │   │   └── WebAppInterface.kt   # JavaScript bridge for native features
│   │   ├── res/
│   │   │   ├── layout/              # UI layouts
│   │   │   ├── values/              # Colors, themes, strings
│   │   │   └── xml/                 # Network & backup configs
│   │   ├── assets/                  # Place compiled web app here
│   │   └── AndroidManifest.xml      # App configuration
│   ├── build.gradle.kts             # App dependencies
│   └── proguard-rules.pro           # Code obfuscation rules
├── build.gradle.kts                 # Root build config
├── settings.gradle.kts              # Project settings
└── gradle.properties                # Gradle configuration
```

## Setup Instructions

### Prerequisites
- Android Studio Arctic Fox (2020.3.1) or later
- JDK 17 or higher
- Android SDK 34 (Android 14)

### Building the App

1. **Copy your local.properties**
   ```bash
   cp local.properties.example local.properties
   # Edit local.properties with your Android SDK path
   ```

2. **Build the React Web App**
   ```bash
   cd .. # Go to project root
   npm install
   npm run build
   ```

3. **Copy Web Assets**
   Copy the built web app to `app/src/main/assets/`:
   ```bash
   mkdir -p app/src/main/assets
   cp -r ../dist/* app/src/main/assets/
   ```

4. **Open in Android Studio**
   - Open the `android version` folder as a project
   - Let Gradle sync complete
   - Build and run on device/emulator

### JavaScript Bridge API

The WebView exposes a `window.Android` object with these methods:

```javascript
// Show interstitial ad
window.Android.showInterstitial();

// Share content
window.Android.shareContent(title, text, url);

// Show toast message
window.Android.showToast(message);

// Copy to clipboard
window.Android.copyToClipboard(text);

// Get device info
const info = JSON.parse(window.Android.getDeviceInfo());

// Check network status
const isOnline = window.Android.isOnline();

// Check if running in native app
const isNative = window.Android.isNativeApp();

// Store/retrieve preferences
window.Android.setPreference(key, value);
window.Android.getPreference(key);

// Open external URL
window.Android.openExternalUrl(url);

// Trigger vibration
window.Android.vibrate(durationMs);
```

### AdMob Configuration

The app uses **test Ad Unit IDs** by default. Before releasing:

1. Create an AdMob account at [admob.google.com](https://admob.google.com)
2. Register your app and create ad units
3. Replace the test IDs in:
   - `AndroidManifest.xml` - Application ID
   - `activity_main.xml` - Banner Ad Unit ID
   - `MainActivity.kt` - Interstitial Ad Unit ID

**Test IDs (DO NOT use in production):**
- App ID: `ca-app-pub-3940256099942544~3347511713`
- Banner: `ca-app-pub-3940256099942544/6300978111`
- Interstitial: `ca-app-pub-3940256099942544/1033173712`

### Building for Release

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore strategiax-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias strategiax
   ```

2. Add signing config to `app/build.gradle.kts`

3. Build release APK:
   ```bash
   ./gradlew assembleRelease
   ```

## Features

- **WebView Integration** - Loads React web app with full JavaScript support
- **AdMob Ads** - Banner and interstitial ad support
- **Native Share** - Share app ideas via Android share sheet
- **Deep Linking** - Support for `strategiax://` URLs
- **Offline Error Handling** - Graceful error page when offline
- **Back Button Support** - Navigate within WebView history
- **Progress Indicator** - Shows page load progress
- **Edge-to-Edge Display** - Modern fullscreen UI

## License

Proprietary - Strategia-X
