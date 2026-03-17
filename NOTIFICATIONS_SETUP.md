# Notification Setup

## Required API Keys

### 1. OneSignal (Push Notifications)
- **Website:** https://onesignal.com
- **Keys needed:**
  - `ONESIGNAL_APP_ID` - Found in Settings > Keys & IDs
  - `ONESIGNAL_REST_API_KEY` - Found in Settings > Keys & IDs

**Setup steps:**
1. Create account at onesignal.com
2. Create new app
3. Configure Web Push (for Netlify)
4. Configure iOS/Android if using Capacitor builds
5. Copy App ID and REST API Key

**Apple APNs Key (for iOS push):**

We use a single shared .p8 key across all apps. One key works for every bundle ID.

- **Key file:** `AuthKey_46WR2KRB9F.p8` (stored in Chase's Downloads)
- **Key ID:** `46WR2KRB9F`
- **Team ID:** `9B895DPQKP`
- **App Bundle ID:** [CHANGE: per client app, e.g. com.medulochub.app]

**OneSignal APNs setup (per app):**
1. Go to OneSignal > App Settings > Apple iOS (APNs) Configuration
2. Select `.p8 Auth Key (Recommended)`
3. Upload the shared .p8 file
4. Enter Key ID: `46WR2KRB9F`
5. Enter Team ID: `9B895DPQKP`
6. Enter the client's App Bundle ID
7. Save

**If the .p8 file is lost:**
1. Go to developer.apple.com > Account > Keys
2. Click + to create a new key
3. Name it (e.g. "OneSignal Push")
4. Check "Apple Push Notifications service (APNs)"
5. Register and download (can only download once)
6. Note the new Key ID
7. Update all apps in OneSignal with the new key

**OneSignal App:**
- App ID: [Get from OneSignal Dashboard]
- SDK: Ionic (for Capacitor - not Web React)

---

## Configuration

### Supabase Secrets (Edge Functions)
```bash
supabase secrets set ONESIGNAL_APP_ID=your_app_id --project-ref YOUR_PROJECT_REF
supabase secrets set ONESIGNAL_REST_API_KEY=your_rest_api_key --project-ref YOUR_PROJECT_REF
```

### Frontend Environment (.env)
```
REACT_APP_ONESIGNAL_APP_ID=your_app_id
```

---

## Database Migration
Run `supabase/notification_preferences.sql` in Supabase SQL Editor to create the user_notification_preferences table.

---

## Edge Functions Deployed
- `send-push-notification` - OneSignal integration
- `notification-dispatcher` - Central routing

---

## Notification Triggers Implemented

### Posts & Feed (6)
- New post published
- Post liked
- Post commented
- Comment replied
- Bookmarked post activity
- Scheduled post published

### Chat (4)
- Direct message
- Group message
- Added to chat
- Removed from chat

### Updates & Events (4)
- New update
- New event
- Event reminder
- RSVP digest

### Admin (2)
- New user joined
- Conversation reported
