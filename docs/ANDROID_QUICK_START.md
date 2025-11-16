# Quick Start: Building for Google Play Store

This is a quick reference guide for building the app for Android/Google Play Store.

## Prerequisites

- Node.js v18+
- JDK 17
- Android Studio or Android SDK Command Line Tools

## Quick Commands

```bash
# 1. Install dependencies
npm install

# 2. Build and sync to Android
npm run android:sync

# 3. Open in Android Studio (to run on device/emulator)
npm run android:open

# 4. Or run directly on connected device
npm run android:run
```

## Production Release Build

```bash
# Build release APK
cd android
./gradlew assembleRelease

# Or build release AAB (for Google Play)
./gradlew bundleRelease
```

Output files:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Before Production Release

1. **Create signing key** (one-time):
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing** in `android/keystore.properties`:
   ```properties
   storePassword=YOUR_PASSWORD
   keyPassword=YOUR_PASSWORD
   keyAlias=my-key-alias
   storeFile=../my-release-key.keystore
   ```

3. **Update app version** in `android/app/build.gradle`:
   ```gradle
   versionCode 1      // Increment for each release
   versionName "1.0.0"
   ```

## Publishing to Google Play

1. Create account at [Google Play Console](https://play.google.com/console)
2. Create new app
3. Complete all required sections (privacy policy, content rating, etc.)
4. Upload the AAB file
5. Submit for review

**For detailed instructions, see [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)**

## Common Issues

**Build fails**: Ensure JDK 17 is installed and ANDROID_HOME is set
**App crashes**: Check logcat with `adb logcat`
**API key issues**: For production, use a backend API proxy instead of embedding the key

## Next Steps

- [ ] Test on physical Android device
- [ ] Create app icons and screenshots
- [ ] Write privacy policy
- [ ] Complete Google Play Console setup
- [ ] Submit for review
