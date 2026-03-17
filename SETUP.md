# New Instance Setup Guide

Complete checklist for deploying a new app instance from this template.

> **`[CHANGE]` markers**: Files throughout this template contain `[CHANGE]` comments/placeholders where client-specific values must be set. Search the project for `[CHANGE]` to find all of them. Key files: `capacitor.config.ts`, `ios/App/App/Info.plist`, `src/config/supabase.js`.

---

## 1. Supabase Project

Create a new Supabase project, then configure:

### Database Schema
- Apply the full schema from an existing instance (demo) using `pg_dump` or Supabase migrations
- Ensure all tables, functions, triggers, and RLS policies are applied

### Realtime Publications
Enable Realtime on these tables (Database > Replication):
- `posts`
- `notifications`
- `messages`
- `chat_typing`
- `message_reactions`

### Required Table: `app_settings`
Must have a **unique constraint on the `key` column** for upsert to work:
```sql
ALTER TABLE app_settings ADD CONSTRAINT app_settings_key_unique UNIQUE (key);
```

Must have these columns:
- `key` (text, unique)
- `value` (text/jsonb)
- `updated_at` (timestamptz, default now())
- `updated_by` (uuid, references auth.users)

### Edge Functions
Deploy these Supabase Edge Functions (from `/supabase/functions/`):
- `notification-dispatcher`
- `send-push-notification`
- `ai-chat`

Edge Functions need these secrets set in Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`
- `GEMINI_API_KEY` (Google Gemini, for ai-chat)

---

## 2. Code Configuration

### Supabase Connection
Update `src/config/supabase.js` with the new project's credentials:
```js
export const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co';
export const supabaseAnonKey = 'YOUR_ANON_KEY';
```

### Capacitor (Mobile Builds)
Update `capacitor.config.ts`:
- `appId` - Client's bundle ID (e.g., `com.clientname.app`)
- `appName` - Client's app display name

### OneSignal (Push Notifications)
Update `.env` with the client's OneSignal app credentials:
```
REACT_APP_ONESIGNAL_APP_ID=your-onesignal-app-id
REACT_APP_ONESIGNAL_REST_API_KEY=os_v2_app_your-key-here
```

### iOS / Android Native Config

Files with `[CHANGE]` markers need to be updated for each new client. Search the project for `[CHANGE]` to find all of them.

**`ios/App/App/Info.plist`** - Update these values:
- `CFBundleDisplayName` - Client's app name
- `NSCameraUsageDescription` - Customize with client app name
- `NSPhotoLibraryUsageDescription` - Customize with client app name
- `NSPhotoLibraryAddUsageDescription` - Customize with client app name
- `NSLocationWhenInUseUsageDescription` - Customize with client app name

**Do NOT remove any privacy keys from Info.plist.** Apple requires all `NS...UsageDescription` keys to be present or TestFlight/App Store submission will be rejected. Even if the app doesn't directly use location/camera, Capacitor plugins may reference these APIs.

**`capacitor.config.ts`** - Already covered above (appId, appName).

---

## 3. Netlify Environment Variables

Set all of these in Netlify (Site settings > Environment variables):

| Variable | Used By | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | bunny-webhook | Supabase project API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | bunny-webhook | Supabase service role key (server-side only) |
| `ONESIGNAL_APP_ID` | bunny-webhook | OneSignal app ID for push notifications |
| `ONESIGNAL_REST_API_KEY` | bunny-webhook | OneSignal REST API key (server-side) |
| `REACT_APP_ONESIGNAL_APP_ID` | Frontend build | OneSignal app ID (exposed to client) |
| `REACT_APP_ONESIGNAL_REST_API_KEY` | Frontend build | OneSignal API key (exposed to client) |
| `BUNNY_API_KEY` | bunny-video | Bunny CDN API key for video management |
| `BUNNY_LIBRARY_ID` | bunny-video | Bunny CDN video library ID |
| `BUNNY_TOKEN_AUTH_KEY` | bunny-video | Bunny CDN token auth key for signed embeds |

### Shared Bunny Credentials (ConveyMed)
All ConveyMed apps (demo, meduloc-hub, new deployments) share the same Bunny library. Get the values from an existing deployment or the credentials email from Mike.

---

## 4. Netlify Site Setup

1. Create new Netlify site linked to the repo
2. Set build command: `CI=false npm run build`
3. Set publish directory: `build`
4. Add all environment variables from section 3
5. Deploy

---

## 5. Post-Deploy Verification

- [ ] App loads and login works
- [ ] Posts appear on Home feed in realtime (no refresh needed)
- [ ] Creating a post shows it immediately
- [ ] Video upload works in Manage Library / Manage Training
- [ ] Push notifications fire on new posts
- [ ] Chat messages deliver in realtime
- [ ] Typing indicators work in chat
- [ ] Admin nav toggles (Profile > Owner Controls) persist across devices
- [ ] AI chat responds (requires Gemini API key)
