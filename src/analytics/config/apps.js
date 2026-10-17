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
      || 'sb_publishable_6TauZJSXsvIDjLt3XslCgQ_VX-56QxY',
  },
}

export const DEFAULT_APP = 'fieldortho'
