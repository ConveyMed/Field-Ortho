import { createClient } from '@supabase/supabase-js';

// Defaults to PRODUCTION. For local 2.0 testing against the Supabase branch,
// set REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY in .env.development.local
// (loaded only by `npm start`, never by `npm run build`). Delete that file to
// point back at prod. Production builds always fall back to the hardcoded prod values.
export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  || 'https://whwpkcdpahhaxexxmbwq.supabase.co';
export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3BrY2RwYWhoYXhleHhtYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg5NzMsImV4cCI6MjA4OTI5NDk3M30.0iEtHH8ONbKESACh4lqEyymowl8xIO1jhtQqSgKmaw0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
