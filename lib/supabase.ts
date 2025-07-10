// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ggvndlvynuiievjvllff.supabase.co' // <= remplace par ton URL Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdndm5kbHZ5bnVpaWV2anZsbGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzIwMjUsImV4cCI6MjA2NzA0ODAyNX0.0s-w-NOibCjl0gaSy8k06Mx1zbWedn1Sv4N1qYjAWfI' // <= remplace par ta clé publique

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
