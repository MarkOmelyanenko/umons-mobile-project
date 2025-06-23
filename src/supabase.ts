// src/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ccjroggtafgonpfjbazq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjanJvZ2d0YWZnb25wZmpiYXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTcyNzYsImV4cCI6MjA2NTQzMzI3Nn0.w3jb5rSB3WjXFVM0IXwQsMuOuDnz30TKu9zZ_oqHqs8";

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey);
