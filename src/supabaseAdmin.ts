import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase";

const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjanJvZ2d0YWZnb25wZmpiYXpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1NzI3NiwiZXhwIjoyMDY1NDMzMjc2fQ.db0PilVTAQSuRXYWKYnQYafJUgDkYLJIXCyHRlCnLT4";

export const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
