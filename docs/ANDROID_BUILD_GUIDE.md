# Android Build Guide for Google Play Store

This guide explains how to build and deploy the Agentic AI App Generator to the Google Play Store.

## Prerequisites

- Node.js v18 or higher
- Java Development Kit (JDK) 17
- Android Studio (recommended) or Android SDK Command Line Tools
- Gradle (comes with Android Studio)

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the web application:**
   ```bash
   npm run build
   ```

3. **Sync with Android platform:**
   ```bash
   npx cap sync android
   ```

## Development Build

### Option 1: Using Android Studio (Recommended)

1. **Open the Android project:**
   ```bash
   npm run android:open
   ```
   This will open Android Studio with the Android project.

2. **Run on emulator or device:**
   - In Android Studio, select a device/emulator from the device dropdown
   - Click the "Run" button (green play icon)

### Option 2: Using Command Line

1. **Run on connected device:**
   ```bash
   npm run android:run
   ```

## Production Build for Google Play Store

### Step 1: Generate a Signing Key

You need a keystore file to sign your app for release:

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Keep this keystore file secure and never commit it to version control!

### Step 2: Configure Gradle for Release Signing

1. Create a file `android/keystore.properties` with your keystore information:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=my-key-alias
   storeFile=../my-release-key.keystore
   ```

2. Update `android/app/build.gradle` to use the keystore:
   Add this before the `android` block:
   ```gradle
   def keystorePropertiesFile = rootProject.file("keystore.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Update the `signingConfigs` and `buildTypes` sections:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (keystorePropertiesFile.exists()) {
                   keyAlias keystoreProperties['keyAlias']
                   keyPassword keystoreProperties['keyPassword']
                   storeFile file(keystoreProperties['storeFile'])
                   storePassword keystoreProperties['storePassword']
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

### Step 3: Update App Version and Metadata

1. **Update version in `android/app/build.gradle`:**
   ```gradle
   defaultConfig {
       versionCode 1        // Increment this for each release
       versionName "1.0.0"  // Semantic version
   }
   ```

2. **Update app name and details in `android/app/src/main/res/values/strings.xml`:**
   ```xml
   <resources>
       <string name="app_name">Agentic AI App Generator</string>
       <string name="title_activity_main">Agentic AI App Generator</string>
   </resources>
   ```

### Step 4: Build Release APK or AAB

**For APK (older format):**
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

**For AAB (recommended for Google Play):**
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

**Or use the npm script:**
```bash
npm run android:build
```

### Step 5: Test the Release Build

Before uploading to Google Play Store, test the release build:

```bash
# Install the APK on a device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or use bundletool for AAB testing
java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app.apks --mode=universal
java -jar bundletool.jar install-apks --apks=app.apks
```

## Publishing to Google Play Store

### Step 1: Create a Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a developer account (one-time $25 fee)
3. Complete the account setup

### Step 2: Create a New App

1. In Google Play Console, click "Create app"
2. Fill in app details:
   - App name: "Agentic AI App Generator"
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (or Paid as appropriate)
3. Accept declarations and create app

### Step 3: Complete App Information

Fill out all required sections:

1. **App content:**
   - Privacy policy URL
   - App access (if app requires login)
   - Ads declaration
   - Content rating questionnaire
   - Target audience
   - News apps declaration (if applicable)

2. **Store listing:**
   - App name
   - Short description (80 characters)
   - Full description (4000 characters)
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, up to 8)
   - App category

3. **App pricing:**
   - Set as Free or Paid
   - Select available countries

### Step 4: Upload Release

1. Go to "Production" > "Create new release"
2. Upload the AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
3. Fill in release notes
4. Review and roll out to production

### Step 5: Submit for Review

1. Complete all required tasks in the Play Console dashboard
2. Submit your app for review
3. Wait for Google's review (typically 1-3 days)

## App Requirements for Google Play

### Required Policies Compliance

1. **Privacy Policy:** Must have a publicly accessible privacy policy URL
2. **Data Safety Form:** Declare what user data the app collects
3. **Content Rating:** Complete the content rating questionnaire
4. **Target API Level:** Must target recent Android API level (currently API 33+)

### Update Target SDK Version

In `android/app/build.gradle`:
```gradle
android {
    compileSdk 34
    defaultConfig {
        targetSdk 34
        minSdk 22
    }
}
```

### Add Required Permissions Documentation

Ensure all permissions in AndroidManifest.xml are necessary and documented.

## Continuous Deployment

### Using GitHub Actions (Optional)

Create `.github/workflows/android-release.yml`:

```yaml
name: Android Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup JDK
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build web app
        run: npm run build
        
      - name: Sync Capacitor
        run: npx cap sync android
        
      - name: Build Android AAB
        run: |
          cd android
          ./gradlew bundleRelease
          
      - name: Upload AAB
        uses: actions/upload-artifact@v3
        with:
          name: app-release.aab
          path: android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### Common Issues

1. **Build fails with "SDK not found":**
   - Set ANDROID_HOME environment variable
   - Or install Android SDK via Android Studio

2. **Gradle build fails:**
   - Try `cd android && ./gradlew clean`
   - Check Java version: `java -version` (should be JDK 17)

3. **App crashes on startup:**
   - Check logcat: `adb logcat`
   - Ensure all required permissions are declared
   - Verify network connectivity for API calls

4. **App rejected by Google Play:**
   - Review the rejection reason in Play Console
   - Common issues: missing privacy policy, incorrect content rating, policy violations

## Environment Variables for Android

Since the app uses environment variables (GEMINI_API_KEY), you need to handle this for the mobile build:

### Option 1: Build-time Configuration
Update `capacitor.config.ts` to include your API key (NOT RECOMMENDED for production):

```typescript
server: {
  androidScheme: 'https',
  // WARNING: This exposes your API key in the app
  // Use server-side API proxy for production
}
```

### Option 2: Use a Backend API Proxy (RECOMMENDED)
Create a backend API that proxies requests to Gemini API, keeping the API key secure on the server.

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)

## Support

For issues specific to this app, please open an issue on the GitHub repository.
