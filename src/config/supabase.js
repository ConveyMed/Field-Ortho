import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://whwpkcdpahhaxexxmbwq.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3BrY2RwYWhoYXhleHhtYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg5NzMsImV4cCI6MjA4OTI5NDk3M30.0iEtHH8ONbKESACh4lqEyymowl8xIO1jhtQqSgKmaw0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
