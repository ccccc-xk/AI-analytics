import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tpfdrbxsfzafoxnjnvrs.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZmRyYnhzZnphZm94bmpudnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTM2NjYsImV4cCI6MjA5NTg4OTY2Nn0.7ELzDgs4KQH9_-kMqac5sovW1bZc3BWqadY8xkJBBQk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
