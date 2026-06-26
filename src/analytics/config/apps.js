// Single app - uses FieldOrtho's own Supabase.
// Env-driven (same vars as src/config/supabase.js) so a branch-pointed build keeps
// the analytics dashboard on the branch too; production falls back to the hardcoded prod values.
export const APPS = {
  fieldortho: {
    id: 'fieldortho',
    name: 'FieldOrtho',
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL
      || 'https://whwpkcdpahhaxexxmbwq.supabase.co',
    supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3BrY2RwYWhoYXhleHhtYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg5NzMsImV4cCI6MjA4OTI5NDk3M30.0iEtHH8ONbKESACh4lqEyymowl8xIO1jhtQqSgKmaw0',
  },
}

export const DEFAULT_APP = 'fieldortho'
