import { createClient } from '@supabase/supabase-js';

// Defaults to PRODUCTION. For local 2.0 testing against the Supabase branch,
// set REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY in .env.development.local
// (loaded only by `npm start`, never by `npm run build`). Delete that file to
// point back at prod. Production builds always fall back to the hardcoded prod values.
// The prod fallback is the publishable key (sb_publishable_...), not the legacy
// anon JWT, so legacy JWT keys can be disabled once this build is out (FO-27).
export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  || 'https://whwpkcdpahhaxexxmbwq.supabase.co';
export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  || 'sb_publishable_6TauZJSXsvIDjLt3XslCgQ_VX-56QxY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
