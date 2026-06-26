import * as tus from 'tus-js-client';

// Always target the canonical site's function host (REACT_APP_SITE_URL), on web
// and native alike. This keeps preview/staging deploys (whose own Netlify site
// has no Bunny credentials) pointed at the production bunny-video function,
// which is configured and returns permissive CORS. On production web this is
// the same origin, so behavior is unchanged.
const FUNCTIONS_BASE = `${process.env.REACT_APP_SITE_URL || window.location.origin}/.netlify/functions/bunny-video`;

export async function createBunnyVideo(title) {
  const res = await fetch(`${FUNCTIONS_BASE}?action=create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error('Failed to create video');
  }

  return res.json();
}

export function uploadBunnyVideo(file, tusConfig, onProgress, onComplete, onError) {
  const upload = new tus.Upload(file, {
    endpoint: tusConfig.uploadUrl,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filetype: file.type,
      title: file.name,
    },
    headers: {
      AuthorizationSignature: tusConfig.signature,
      AuthorizationExpire: tusConfig.expirationTime,
      VideoId: tusConfig.videoId,
      LibraryId: tusConfig.libraryId,
    },
    onError: (error) => {
      console.error('TUS upload error:', error);
      if (onError) onError(error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
      if (onProgress) onProgress(percentage);
    },
    onSuccess: () => {
      if (onComplete) onComplete();
    },
  });

  upload.start();
  return upload;
}

export async function getBunnyVideoStatus(videoId) {
  const res = await fetch(`${FUNCTIONS_BASE}?action=status&videoId=${videoId}`);

  if (!res.ok) {
    throw new Error('Failed to get video status');
  }

  return res.json();
}

export async function deleteBunnyVideo(videoId) {
  const res = await fetch(`${FUNCTIONS_BASE}?action=delete&videoId=${videoId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete video');
  }

  return res.json();
}

export async function getSecureEmbedUrl(videoId) {
  const res = await fetch(`${FUNCTIONS_BASE}?action=embed-token&videoId=${videoId}`);

  if (!res.ok) {
    throw new Error('Failed to get embed URL');
  }

  const data = await res.json();
  return data.embedUrl;
}
