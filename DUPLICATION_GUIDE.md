# Duplication Guide - Quick Reference

This guide shows exactly what files to update when duplicating this template for a new client.

---

## Files to Update

### 1. Supabase Credentials
**File:** `src/config/supabase.js`
```javascript
const supabaseUrl = '[CHANGE: Supabase Project URL]';
const supabaseAnonKey = '[CHANGE: Supabase Anon Key]';
```

### 2. OneSignal Credentials
**File:** `.env`
```
REACT_APP_ONESIGNAL_APP_ID=[CHANGE: OneSignal App ID]
REACT_APP_ONESIGNAL_REST_API_KEY=[CHANGE: OneSignal REST API Key]
```

### 2b. Gemini API Key (AI Chat)
**Location:** Supabase Secrets (CLI or MCP)

**Option A - CLI:**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAfcHjN75Fp1VKC1vUe2Jp2kUGynxZxQQk --project-ref YOUR_PROJECT_REF
```

**Option B - MCP (Claude Code):**
Use the Supabase MCP `execute_sql` or set secrets directly via the Supabase Management API.

**Default demo key:** `AIzaSyAfcHjN75Fp1VKC1vUe2Jp2kUGynxZxQQk`
**Note:** Shared key for testing. For production, create your own at https://aistudio.google.com/apikey

### 2c. BunnyCDN Video Keys
**Location:** Netlify Environment Variables (set in Netlify dashboard or CLI)

**Default keys (shared across ConveyMed apps):**
```
BUNNY_API_KEY=b6d36bac-0274-4274-b1948a6d46ca-8eaa-483c
BUNNY_LIBRARY_ID=606251
BUNNY_TOKEN_AUTH_KEY=8d15b6d7-bdf5-4ffe-9c36-fceb5133911e
```

**Option A - Netlify CLI:**
```bash
netlify env:set BUNNY_API_KEY "b6d36bac-0274-4274-b1948a6d46ca-8eaa-483c"
netlify env:set BUNNY_LIBRARY_ID "606251"
netlify env:set BUNNY_TOKEN_AUTH_KEY "8d15b6d7-bdf5-4ffe-9c36-fceb5133911e"
```

**Option B - Netlify Dashboard:**
Site Settings > Environment Variables > Add the three keys above.

**Also set in `.env` for frontend:**
```
REACT_APP_BUNNY_LIBRARY_ID=606251
```

**Note:** These default keys are shared across all ConveyMed apps. For a non-ConveyMed client, create their own Bunny video library at https://dash.bunny.net

### 3. Capacitor Config
**File:** `capacitor.config.ts`
```typescript
appId: '[CHANGE: com.clientname.app]',
appName: '[CHANGE: ClientName]',
```

### 3b. iOS Product Name (after `npx cap add ios`)
**File:** `ios/App/App.xcodeproj/project.pbxproj`

Change `PRODUCT_NAME` in both Debug and Release build configs:
```
PRODUCT_NAME = "[CHANGE: ClientName]";
```
Default is `"$(TARGET_NAME)"` which resolves to "App". This controls the archive name and what shows in Xcode Organizer.

### 4. Package Name
**File:** `package.json`
```json
{
  "name": "[CHANGE: clientname]",
  ...
}
```

### 5. HTML Meta Tags
**File:** `public/index.html`
- `<title>` - App title
- `<meta name="description">` - App description
- `<meta name="theme-color">` - Primary color
- `<meta property="og:*">` - Open Graph tags
- `<meta name="twitter:*">` - Twitter cards
- All URLs (canonical, og:url, etc.)

### 6. PWA Manifest
**File:** `public/manifest.json`
```json
{
  "short_name": "[CHANGE: ClientName]",
  "name": "[CHANGE: ClientName - Full Description]",
  "description": "[CHANGE: App description]",
  "theme_color": "[CHANGE: #HexColor]",
  ...
}
```

### 7. Theme Colors (if different from blue)
**File:** `src/App.css`
```css
:root {
  --primary-blue: [CHANGE: #HexColor];
  --primary-blue-light: [CHANGE: lighter shade];
  --primary-blue-dark: [CHANGE: darker shade];
  --accent-blue: [CHANGE: accent shade];
}
```

### 8. Logo/Icon Files - GENERATE FROM CLIENT LOGO

**Input Required:** One high-resolution logo (minimum 1024x1024 PNG with transparency)

**Generate these files for `public/`:**

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16x16, 32x32, 48x48 | Browser tab icon |
| `favicon-16.png` | 16x16 | Small favicon |
| `favicon-32.png` | 32x32 | Standard favicon |
| `logo192.png` | 192x192 | PWA icon, Android |
| `logo512.png` | 512x512 | PWA splash, Android |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `og-image.png` | 1200x630 | Social sharing (logo centered on brand color background) |

**Generate for `public/icons/`:**

| File | Size |
|------|------|
| `icon-72.png` | 72x72 |
| `icon-96.png` | 96x96 |
| `icon-128.png` | 128x128 |
| `icon-144.png` | 144x144 |
| `icon-152.png` | 152x152 |
| `icon-384.png` | 384x384 |

**iOS App Icon (after `npx cap add ios`):**
Location: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Modern Xcode (14+) only needs **one single 1024x1024 PNG**. Xcode auto-generates all other sizes.

1. Replace the existing PNG in the folder with the client's 1024x1024 icon
2. Make sure `Contents.json` references it (already configured in template)
3. Do NOT add extra sized PNGs - they'll show as "unassigned children" warnings
4. **IMPORTANT: Icon must NOT have an alpha channel (transparency).** Apple silently rejects it and shows a placeholder grid instead of your icon. Strip alpha with:
   ```bash
   python3 -c "from PIL import Image; img=Image.open('AppIcon.png'); bg=Image.new('RGB',img.size,(255,255,255)); bg.paste(img,mask=img.split()[3]) if img.mode=='RGBA' else None; bg.save('AppIcon.png')"
   ```

**Android App Icons (after `npx cap add android`):**
Location: `android/app/src/main/res/`

| Folder | Size |
|--------|------|
| `mipmap-mdpi/` | 48x48 |
| `mipmap-hdpi/` | 72x72 |
| `mipmap-xhdpi/` | 96x96 |
| `mipmap-xxhdpi/` | 144x144 |
| `mipmap-xxxhdpi/` | 192x192 |

**Quick Generation Tools:**
- [realfavicongenerator.net](https://realfavicongenerator.net) - Web favicons
- [appicon.co](https://appicon.co) - iOS/Android icons from one image
- [maskable.app](https://maskable.app) - Test maskable icons

### 9. Deep Link Protocol
**File:** `src/pages/EmailConfirmed.js`
```javascript
window.location.href = 'yourapp://';  // [CHANGE] Update to your app scheme
```

### 10. Browser Toolbar Color
**File:** `src/utils/browser.js`
```javascript
toolbarColor: '#1e40af',  // [CHANGE] Update to match client primary color
```

### 11. AI Chat Integration (Optional)
**File:** `src/components/AIChatPanel.js`
- Line 78: `MINDSTUDIO_EMBED_URL` - Practice key included, update for production
- Line 215: `ConveyMed AI` - Update header text
- Line 136: Medical disclaimer - Update or remove based on use case

---

## Practice/Default Keys (Work Out of Box)

These keys are included for testing. Replace with client's own keys for production:

| Key | Location | Default |
|-----|----------|---------|
| OneSignal App ID | `.env` | `7144dde5-f28b-42e4-a826-9f5adef0a772` |
| OneSignal REST API Key | `.env` | Demo key included |
| Gemini API Key | Supabase Secrets (CLI or MCP) | `AIzaSyAfcHjN75Fp1VKC1vUe2Jp2kUGynxZxQQk` |
| Supabase URL + Anon Key | `src/config/supabase.js` | Demo project (must replace) |
| BUNNY_API_KEY | Netlify Env Vars | `b6d36bac-0274-4274-b1948a6d46ca-8eaa-483c` |
| BUNNY_LIBRARY_ID | Netlify Env Vars + `.env` | `606251` |
| BUNNY_TOKEN_AUTH_KEY | Netlify Env Vars | `8d15b6d7-bdf5-4ffe-9c36-fceb5133911e` |
| APNs .p8 Key | OneSignal Dashboard | Shared: `AuthKey_46WR2KRB9F.p8` (Key ID: `46WR2KRB9F`, Team ID: `9B895DPQKP`) |

**Note:** Push notifications will work with default OneSignal key during testing but won't reach real users. Bunny keys are per-client (each client gets their own video library). The APNs .p8 key is shared across all apps (only the Bundle ID changes per client). Replace all keys before production.

---

## After Duplication Checklist

### Supabase Dashboard
- [ ] Set Site URL in Authentication > URL Configuration
- [ ] Add Redirect URLs
- [ ] Run all 12 SQL files in order
- [ ] Set up email templates
- [ ] Create storage buckets (profile-images, post-images, chat-attachments, content-files)

### Deploy Edge Functions
Deploy all edge functions with `--no-verify-jwt` (they use service role keys internally):
```bash
supabase functions deploy ai-chat --no-verify-jwt --project-ref YOUR_PROJECT_REF
supabase functions deploy send-push-notification --no-verify-jwt --project-ref YOUR_PROJECT_REF
supabase functions deploy notification-dispatcher --no-verify-jwt --project-ref YOUR_PROJECT_REF
supabase functions deploy physician-research --no-verify-jwt --project-ref YOUR_PROJECT_REF
```

**Via MCP (Claude Code):** Deploy with `verify_jwt: false` for all functions.

**IMPORTANT:** Do NOT deploy with `verify_jwt: true` - this causes 401 errors because the frontend's auth token may not always pass JWT verification at the edge function layer.

### OneSignal Dashboard
- [ ] Create new app in OneSignal
- [ ] Configure APNs: Upload shared .p8 key (`AuthKey_46WR2KRB9F.p8`), Key ID `46WR2KRB9F`, Team ID `9B895DPQKP`, client Bundle ID
- [ ] Configure Android (FCM) if needed
- [ ] Set up web push (if using)
- [ ] Copy App ID and REST API Key to `.env` and Supabase secrets

### Build & Deploy
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Deploy to Netlify
- [ ] Test authentication flow
- [ ] Test post creation
- [ ] Test chat

### iOS Build
- [ ] `npx cap add ios`
- [ ] `npx cap sync`
- [ ] Open in Xcode: `npx cap open ios`
- [ ] Set Bundle ID in Xcode (must match `capacitor.config.ts`)
- [ ] Configure signing (Team, Provisioning Profile)
- [ ] Add push notification capability
- [ ] Update `ios/App/App/Info.plist` with URL scheme for deep links
- [ ] Add location usage description to `ios/App/App/Info.plist` (required by OneSignal):
  ```xml
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>This app may use your location to provide relevant content and notifications.</string>
  ```
- [ ] Add camera/photo permissions to `ios/App/App/Info.plist` (required by @capacitor/camera):
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>This app uses the camera to take profile photos and upload images.</string>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>This app accesses your photo library to select profile photos and images.</string>
  <key>NSPhotoLibraryAddUsageDescription</key>
  <string>This app saves photos to your library.</string>
  ```
- [ ] Add export compliance key to skip encryption questions on each submission:
  ```xml
  <key>ITSAppUsesNonExemptEncryption</key>
  <false/>
  ```

### Android Build
- [ ] `npx cap add android`
- [ ] `npx cap sync`
- [ ] Open in Android Studio: `npx cap open android`

**Gradle Configuration** (after `npx cap add android`):

1. **Update `android/app/build.gradle`:**
   ```gradle
   android {
       defaultConfig {
           applicationId "com.clientname.app"  // Must match capacitor.config.ts
           minSdkVersion 22
           targetSdkVersion 34
       }
   }
   ```

2. **Update `android/app/src/main/res/values/strings.xml`:**
   ```xml
   <string name="app_name">ClientName</string>
   <string name="title_activity_main">ClientName</string>
   <string name="package_name">com.clientname.app</string>
   <string name="custom_url_scheme">clientname</string>
   ```

3. **For Release Builds - Create Keystore:**
   ```bash
   keytool -genkey -v -keystore android/app/release.keystore \
     -alias clientname -keyalg RSA -keysize 2048 -validity 10000
   ```

4. **Add to `android/app/build.gradle`:**
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('release.keystore')
               storePassword 'YOUR_STORE_PASSWORD'
               keyAlias 'clientname'
               keyPassword 'YOUR_KEY_PASSWORD'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

5. **Build APK/AAB:**
   ```bash
   cd android
   ./gradlew assembleRelease  # APK
   ./gradlew bundleRelease    # AAB for Play Store
   ```

### Common Android Issues
- **Gradle sync failed**: Run `cd android && ./gradlew clean`
- **SDK not found**: Set `ANDROID_HOME` environment variable
- **Build tools missing**: Install via Android Studio SDK Manager

---

*DemoTemplate - App Duplication System*
