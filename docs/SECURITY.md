# Security Best Practices for Android/Mobile Deployment

This document outlines important security considerations when deploying the Agentic AI App Generator as a mobile application.

## API Key Security

### Problem
The app currently uses the Gemini API key directly in the frontend code. When building for mobile, this key gets embedded in the APK/AAB file, which can be extracted by malicious users.

### Solutions

#### Option 1: Backend API Proxy (Recommended for Production)

Create a backend API that acts as a proxy between the mobile app and Gemini API:

```
Mobile App → Your Backend API → Gemini API
```

**Benefits:**
- API key stays secure on the server
- Can implement rate limiting and user authentication
- Monitor API usage
- Can switch AI providers without updating the app

**Implementation Steps:**
1. Create a backend server (Node.js, Python, etc.)
2. Store API key as environment variable on server
3. Create API endpoint that accepts requests from mobile app
4. Forward requests to Gemini API
5. Return responses to mobile app

Example backend endpoint:
```javascript
// Node.js/Express example
app.post('/api/generate', authenticate, async (req, res) => {
  const { prompt } = req.body;
  
  // Call Gemini API with server-side API key
  const response = await gemini.generateContent(prompt);
  
  res.json(response);
});
```

Update mobile app to call your backend:
```typescript
// In services/geminiClient.ts
const API_ENDPOINT = 'https://your-backend.com/api/generate';

async function generateContent(prompt: string) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAuthToken}`
    },
    body: JSON.stringify({ prompt })
  });
  return response.json();
}
```

#### Option 2: Environment-Specific Builds

For development/testing purposes only:

1. Use different API keys for development vs production
2. Implement API key rotation
3. Monitor API usage for abuse
4. Set up billing alerts

**Still not recommended for production as keys can be extracted from the APK.**

## Network Security

### HTTPS Only
The Capacitor config is already set to use HTTPS:
```typescript
server: {
  androidScheme: 'https'
}
```

### Certificate Pinning (Advanced)
For additional security, implement SSL certificate pinning to prevent man-in-the-middle attacks:

```typescript
// Install: npm install @capacitor-community/http
import { Http } from '@capacitor-community/http';

const options = {
  url: 'https://your-api.com',
  headers: { 'Content-Type': 'application/json' },
  data: { prompt: 'test' },
  // Certificate pinning
  webFetchExtra: {
    trustSelfSigned: false
  }
};
```

## Data Storage Security

### Sensitive Data
If storing sensitive data locally:

1. **Use Capacitor Preferences with encryption:**
```typescript
import { Preferences } from '@capacitor/preferences';

// Don't store API keys or tokens in plain text
await Preferences.set({ key: 'user_token', value: encryptedToken });
```

2. **Use Android Keystore for secrets:**
```typescript
// Use secure storage plugin
import { SecureStoragePlugin } from '@capacitor-community/secure-storage';

await SecureStoragePlugin.set({ key: 'api_key', value: sensitiveData });
```

## Permissions

### Minimize Permissions
Only request permissions that are absolutely necessary. Current permissions:
- `INTERNET` - Required for API calls ✓
- `ACCESS_NETWORK_STATE` - Helpful for checking connectivity ✓
- `WRITE_EXTERNAL_STORAGE` - Only if app needs file downloads
- `READ_EXTERNAL_STORAGE` - Only if app needs file uploads

### Request at Runtime
For Android 6.0+ (API 23+), request permissions at runtime when needed:

```typescript
import { Filesystem } from '@capacitor/filesystem';

// Request permission when user needs it
const permission = await Filesystem.requestPermissions();
```

## Code Obfuscation

Enable ProGuard/R8 for release builds to obfuscate code:

In `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Add to `android/app/proguard-rules.pro`:
```
-keepattributes *Annotation*
-keepclassmembers class ** {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}
```

## User Authentication

### Implement User Authentication
Instead of open API access:

1. **Add user authentication system**
2. **Track API usage per user**
3. **Implement rate limiting**
4. **Add user quotas**

Example with Supabase (already in dependencies):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Use user token for backend API calls
const token = data.session.access_token;
```

## App Integrity

### Google Play Integrity API
Verify app integrity to prevent tampering:

```typescript
// Install: npm install @capacitor-community/play-integrity
import { PlayIntegrity } from '@capacitor-community/play-integrity';

const result = await PlayIntegrity.requestIntegrityToken({
  nonce: 'your-nonce'
});
```

## Updates and Patching

### Over-the-Air Updates
Consider using Capacitor Live Updates for quick security patches:

```bash
npm install @capacitor/live-updates
```

This allows pushing critical fixes without waiting for Google Play review.

## Monitoring and Logging

### Implement Security Monitoring

1. **Track API usage patterns**
2. **Log authentication attempts**
3. **Monitor for unusual activity**
4. **Set up alerts for anomalies**

### Use Crash Reporting
```bash
npm install @capacitor/crashlytics
```

## Compliance

### Privacy Policy
Required by Google Play. Must disclose:
- What data is collected
- How data is used
- Third-party services (Gemini API)
- Data retention policy
- User rights (access, deletion)

### GDPR/CCPA Compliance
If targeting EU/California users:
- Implement data deletion
- Provide data export
- Cookie consent (for web view)
- Clear privacy controls

## Checklist for Production Release

- [ ] API keys moved to backend proxy
- [ ] HTTPS enforced
- [ ] Certificate pinning implemented (optional but recommended)
- [ ] Code obfuscation enabled
- [ ] Minimal permissions requested
- [ ] User authentication implemented
- [ ] Rate limiting configured
- [ ] Crash reporting set up
- [ ] Security monitoring enabled
- [ ] Privacy policy created and linked
- [ ] Compliance requirements met
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented

## Additional Resources

- [OWASP Mobile Security Testing Guide](https://owasp.org/www-project-mobile-security-testing-guide/)
- [Android Security Best Practices](https://developer.android.com/topic/security/best-practices)
- [Capacitor Security](https://capacitorjs.com/docs/guides/security)
- [Google Play Security Best Practices](https://developer.android.com/google/play/security-best-practices)

## Reporting Security Issues

If you discover a security vulnerability, please report it to the repository maintainers privately rather than opening a public issue.
