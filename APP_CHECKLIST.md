# App Build & Publish Checklist

**App Name:** Field Orthopaedics Connect
**Client:** Field Orthopaedics (via ConveyMed/Mike)
**Created:** 2026-03-16
**Status:** Phase 1 & 2 - Building

---

## Phase 1 & 2: Gather Data & Build

### Client Info
| Field | Value | Status |
|-------|-------|--------|
| Company Name (Short) | Field Ortho | done |
| Company Name (Full) | Field Orthopaedics | done |
| App Name | Field Orthopaedics Connect | done |
| Bundle ID | com.fieldortho.app | done |
| Primary Color | #214185 | done |
| Secondary/Text Color | #231F20 | done |
| Logo File | ~/Downloads/Field Ortho app icon (1).png | done |
| Logo Long | ~/Downloads/High Res FO Logo_LONG_No Tagline_ white background (1).jpg | done |
| Description | Field Orthopaedics Connect provides instant access to surgical techniques, sales collateral, IFUs, clinical documents, and real-time updates. | done |
| Keywords | | |
| Org Code | 00000 | done |

### Legal Info
| Field | Value | Status |
|-------|-------|--------|
| Company Address | 5/30 Florence St, Teneriffe QLD 4005, Australia | done |
| Company Email | patryk@fieldorthopaedics.com | done |
| Company Phone | +61 7 3132 1760 | done |
| Contact Person | Patryk Kania, +1 (346) 562 2844 (US) | done |
| Governing Law | Queensland, Australia | done |
| Bug Report URL | https://forms.monday.com/forms/30735519b08af47ea9f1cdab062d102c?r=use1 | done |

### From Mike
| Item | Value | Status |
|------|-------|--------|
| GitHub repo (ConveyMed org) | https://github.com/ConveyMed/Field-Ortho | done |
| Chase added as collaborator | | needs confirm |
| Netlify site created & linked to repo | | waiting on Mike |
| Bunny API Key | 75e20c73-e9f5-4897-8610fc36e07a-1653-471b | done |
| Bunny Library ID | 619203 | done |
| Bunny Token Auth Key | c63490ca-e9a7-462d-ba2f-35f1b0ebff65 | done |
| Bunny CDN Host | vz-8f0f04c7-755.b-cdn.net | done |

### Service Keys (Chase creates)
| Service | Key | Value | Status |
|---------|-----|-------|--------|
| Supabase | Project Ref | whwpkcdpahhaxexxmbwq | done |
| Supabase | URL | https://whwpkcdpahhaxexxmbwq.supabase.co | done |
| Supabase | Anon Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3BrY2RwYWhoYXhleHhtYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg5NzMsImV4cCI6MjA4OTI5NDk3M30.0iEtHH8ONbKESACh4lqEyymowl8xIO1jhtQqSgKmaw0 | done |
| Supabase | Service Role Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3BrY2RwYWhoYXhleHhtYndxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcxODk3MywiZXhwIjoyMDg5Mjk0OTczfQ.rVZv067pAHD6nla99_SYLBClC03Od-2v6Tg27ADGJk4 | done |
| OneSignal | App ID | 7a40ef60-32f6-4b18-b8e4-abfe88467f44 | done |
| OneSignal | REST API Key | os_v2_app_pjao6ybs6zfrrohevp7iqrt7iqtcjfxcljle4m55otl4z6oi3vbdfxjpo627pzadx4vhn6a3kfhf2q7ucfhulrpgdw6ajjeh6fz3vxa | done |
| OneSignal | p8 file | ~/Apps/DemoTemplate/AuthKey_46WR2KRB9F.p8 | done |
| Gemini | API Key | | use shared |
| Netlify | Site Name | | waiting on Mike |

### App Customizations (from Mike's profile doc)
| Setting | Value |
|---------|-------|
| Feed Name | Field Connect |
| Post Permissions | All users can create, like, comment |
| Resource Library Header | Tool Box |
| Resource Tabs | Sales Tools, Training, Forms |
| AI Agent Name | Field AI |
| Nav Order | Home, Sales Tools, Field AI, Downloads, Profile |
| Directory | OFF |
| Chat | OFF |
| Updates/Notifications | OFF |
| Downloads | ON |

### What's Done
- [x] App name + bundle ID
- [x] Primary color
- [x] Supabase project (URL + keys)
- [x] GitHub repo created
- [x] Logo files received
- [x] Client info / legal info complete
- [x] Bug report URL
- [x] App profile doc from Mike

### What's Still Needed
- [x] Netlify site created (Chase did manual deploy)
- [x] Bunny keys received
- [x] OneSignal app created

---

## Phase 2: Build App

### Build Steps
- [x] Copy template to `/Users/chasekellis/Apps/FieldOrtho`
- [x] Update config files (supabase.js, .env, capacitor.config.ts, package.json)
- [x] Update branding (index.html, manifest.json, theme.js)
- [x] Update legal pages (LegalSupport.js)
- [x] Update bug report URL (Profile.js)
- [x] Update Support page (Support.js)
- [x] Generate icons from logo (iOS AppIcon, Android mipmaps, PWA icons, OG image, login logo)
- [x] Customize: rename feed to "Field Connect"
- [x] Customize: rename resource header to "Tool Box"
- [x] Customize: rename AI agent to "Field AI"
- [x] Customize: hide Directory, Chat, Updates from nav
- [x] Customize: nav order Home | Sales Tools | Field AI | Downloads | Profile
- [x] Customize: all users can post
- [x] Init git, commit, push to GitHub

### Supabase Setup (Claude does via MCP once Chase provides project keys)
- [x] Run schema SQL (all 15 tables + organization_code)
- [x] Create storage buckets (profile-images, post-images, chat-attachments, content-files)
- [x] Set secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY)
- [x] Deploy edge functions (ai-chat, send-push-notification, notification-dispatcher, support-contact)
- [x] Enable Realtime (posts, notifications, messages, chat_typing, message_reactions)
- [x] **Turn off email confirmation**
- [x] Create test accounts (Chase + Apple Review)
- [x] Create support_requests table
- [x] Create organization_code table (code: 00000)
- [x] Set Auth URL config (Site URL, Redirect URLs)
- [x] Update email templates (not needed, email confirmation off)

### Test Accounts
| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Chase (dev/admin) | TheK2way17@gmail.com | Pri123456! | Development & testing |
| Apple Review | Test@email.com | AppleTest | Required for App Store review |
| Client test | | | For client beta testing |

### Netlify Setup
- [x] Site created (manual deploy by Chase)
- [x] Set environment variables (6 env vars via CLI)
- [x] Deployed to https://fieldortho.netlify.app
- [x] Verified site loads

### OneSignal Setup
- [x] Create OneSignal app (App ID: 7a40ef60-32f6-4b18-b8e4-abfe88467f44)
- [ ] Upload .p8 APNs key (Key ID: 46WR2KRB9F, Team ID: 9B895DPQKP) -- **Chase does in OneSignal dashboard**
- [ ] Set bundle ID: com.fieldortho.app -- **Chase does in OneSignal dashboard**

### Build Outputs
| Output | Location |
|--------|----------|
| Web App | `https://___.netlify.app` |
| GitHub Repo | https://github.com/ConveyMed/Field-Ortho |

**Phase 2 complete?** [ ]

---

## Phase 3: Publish Setup

### iOS - Xcode
- [ ] `npx cap add ios && npx cap sync`
- [ ] Open Xcode: `npx cap open ios`
- [ ] Set bundle ID in project settings
- [ ] Replace AppIcon (1024x1024, no alpha)
- [ ] + Capability: **Push Notifications**
- [ ] + Capability: **Background Modes** > Remote notifications
- [ ] + Capability: **App Groups** > `group.com.fieldortho.app.onesignal`
- [ ] Create **Notification Service Extension** target
- [ ] Replace NotificationService.swift with OneSignal version
- [ ] Add **App Groups** to extension target (same group)
- [ ] Fix scheme: Manage Schemes > + > Target: App
- [ ] Update Podfile (add OneSignalXCFramework target)
- [ ] `cd ios/App && pod install`
- [ ] Archive > Upload to App Store Connect
- [ ] Submit to TestFlight

### Android - Gradle
- [x] Fix MainActivity.java package path
- [x] Generate upload keystore (fieldortho-upload-key.jks, password: fieldortho2026)
- [x] Configure signing in build.gradle
- [x] Add *.jks to .gitignore
- [x] Fix Gradle/AGP versions (AGP 8.9.1, Gradle 8.11.1, SDK 36)
- [x] Fix Kotlin stdlib conflicts
- [x] `cd android && ./gradlew bundleRelease`
- [ ] Upload AAB to Google Play Console internal testing

### Publish Outputs
| Output | Location |
|--------|----------|
| Keystore | `android/fieldortho-upload-key.jks` |
| Keystore Alias | `upload` |
| Keystore Password | `fieldortho2026` |
| AAB File | `android/app/build/outputs/bundle/release/app-release.aab` |
| TestFlight Build | |
| Google Play Internal | |

**Phase 3 complete?** [ ]

---

## Phase 4: Beta Test & Add Content

- [ ] TestFlight link sent to client
- [ ] Google Play internal test link sent to client
- [ ] Client adding content (resources, training, posts)
- [ ] Push notifications tested
- [ ] AI Chat tested with real product data
- [ ] All screens load correctly
- [ ] Offline downloads work

### Issues Found
| Issue | Status | Notes |
|-------|--------|-------|
| | | |

**Phase 4 complete?** [ ]

---

## Phase 5: Screenshots & Go Live

### Screenshots
- [ ] Run: `node scripts/screenshots.js`

### Screenshot Outputs
| Device | Location |
|--------|----------|
| iPhone 6.5" | `screenshots/iPhone-6.5/` |
| iPad Pro | `screenshots/iPad-Pro/` |
| Android Phone | `screenshots/Android-Phone/` |
| Android 7" Tablet | `screenshots/Android-7-Tablet/` |
| Android 10" Tablet | `screenshots/Android-10-Tablet/` |

### Store Listing Content
**Promo Text:**
> Your hub for Field Orthopaedics resources, surgical techniques, IFUs, training, and real-time updates.

**Keywords:**
> Field Orthopaedics, orthopedic, hand surgery, wrist, sales tools, training, surgical, AI assistant

**Support URL:** `https://[SITE].netlify.app/support`
**Privacy Policy:** `https://[SITE].netlify.app/privacy`
**Terms of Service:** `https://[SITE].netlify.app/terms`

### App Store (iOS) - Go Live
- [ ] Upload screenshots
- [ ] Fill promo text, description, keywords
- [ ] Set privacy policy URL
- [ ] Set support URL
- [ ] Submit for review
- [ ] **Approved** [ ] Date: ___

### Google Play (Android) - Go Live
- [ ] Fill store listing
- [ ] Upload screenshots
- [ ] Complete content rating + data safety
- [ ] Set privacy policy URL
- [ ] Submit for review
- [ ] **Approved** [ ] Date: ___

### Final URLs
| Store | URL |
|-------|-----|
| App Store | |
| Google Play | |
| Web | |

**Phase 5 complete?** [ ]

---

## Post-Launch
- [ ] Connect to ConveyMed Analytics dashboard
- [ ] Send store URLs to client
- [ ] Monitor for crashes/reviews first week
