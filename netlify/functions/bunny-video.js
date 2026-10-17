const crypto = require('crypto');

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY;
const BUNNY_API_BASE = 'https://video.bunnycdn.com/library';

const headers = {
  'Content-Type': 'application/json',
  'AccessKey': BUNNY_API_KEY,
};

// Public project values (the same ones the app ships with); env overrides.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://whwpkcdpahhaxexxmbwq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
  || 'sb_publishable_6TauZJSXsvIDjLt3XslCgQ_VX-56QxY';

// The app's real origins: iOS shell, Android shell (androidScheme https),
// the live site, its deploy previews, and local dev.
const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'https://localhost',
  'https://fieldortho.netlify.app',
  'http://localhost:3000',
];
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+--fieldortho\.netlify\.app$/;

let corsHeaders = {};
const corsFor = (origin) => ({
  ...(origin && (ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin))
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {}),
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
});

// Who is calling: verifies the Supabase session token, then reads the
// caller's own users row (RLS lets a signed-in user read users).
async function getCaller(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const meRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!meRes.ok) return null;
  const me = await meRes.json();
  if (!me?.id) return null;

  const rowRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(me.id)}&select=is_admin,is_owner`,
    { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY } },
  );
  const rows = rowRes.ok ? await rowRes.json() : [];
  const row = Array.isArray(rows) ? rows[0] : null;
  return { id: me.id, isAdmin: !!(row?.is_admin || row?.is_owner) };
}

exports.handler = async (event) => {
  corsHeaders = corsFor(event.headers?.origin || event.headers?.Origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const action = event.queryStringParameters?.action;

  try {
    // Creating and deleting library videos is admin work (content_items
    // writes are admin/owner-only too). status and embed-token stay open for
    // now because the store build 2.0.6 calls them with no token; see FO-28.
    if (action === 'create' || action === 'delete') {
      const caller = await getCaller(event);
      if (!caller) return respond(401, { error: 'Not authenticated' });
      if (!caller.isAdmin) return respond(403, { error: 'Admin access required' });
    }

    switch (action) {
      case 'create':
        return await createVideo(event);
      case 'status':
        return await getVideoStatus(event);
      case 'delete':
        return await deleteVideo(event);
      case 'embed-token':
        return await getEmbedToken(event);
      default:
        return respond(400, { error: 'Invalid action. Use: create, status, delete, embed-token' });
    }
  } catch (err) {
    console.error('Bunny video error:', err);
    return respond(500, { error: 'Internal server error' });
  }
};

async function createVideo(event) {
  const body = JSON.parse(event.body || '{}');
  const title = body.title || 'Untitled Video';

  // Create a video object in Bunny library
  const res = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Bunny create error:', errorText);
    return respond(res.status, { error: 'Failed to create video in Bunny' });
  }

  const video = await res.json();

  // Generate TUS auth signature for direct upload
  const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const signatureString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${video.guid}`;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

  return respond(200, {
    videoId: video.guid,
    libraryId: BUNNY_LIBRARY_ID,
    tusConfig: {
      uploadUrl: `https://video.bunnycdn.com/tusupload`,
      expirationTime,
      signature,
      videoId: video.guid,
      libraryId: BUNNY_LIBRARY_ID,
    },
  });
}

async function getVideoStatus(event) {
  const videoId = event.queryStringParameters?.videoId;
  if (!videoId) {
    return respond(400, { error: 'videoId is required' });
  }

  const res = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    return respond(res.status, { error: 'Failed to get video status' });
  }

  const video = await res.json();

  // Bunny status codes: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
  let status = 'processing';
  if (video.status === 4) status = 'ready';
  else if (video.status === 5) status = 'error';
  else if (video.status >= 1 && video.status <= 3) status = 'processing';

  return respond(200, {
    videoId: video.guid,
    status,
    bunnyStatus: video.status,
    title: video.title,
    length: video.length,
    width: video.width,
    height: video.height,
  });
}

async function deleteVideo(event) {
  const videoId = event.queryStringParameters?.videoId;
  if (!videoId) {
    return respond(400, { error: 'videoId is required' });
  }

  const res = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Bunny delete error:', errorText);
    return respond(res.status, { error: 'Failed to delete video' });
  }

  return respond(200, { success: true });
}

async function getEmbedToken(event) {
  const videoId = event.queryStringParameters?.videoId;
  if (!videoId) {
    return respond(400, { error: 'videoId is required' });
  }

  // Generate a signed token for the embed URL
  // Token expires in 1 hour
  const expiresTimestamp = Math.floor(Date.now() / 1000) + 3600;
  const tokenString = `${BUNNY_TOKEN_AUTH_KEY}${videoId}${expiresTimestamp}`;
  const token = crypto.createHash('sha256').update(tokenString).digest('hex');

  const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?token=${token}&expires=${expiresTimestamp}`;

  return respond(200, { embedUrl });
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
