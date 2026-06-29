import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  hasSupabaseBrowserEnv,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl!,
      supabasePublishableKey!,
    );
  }

  return browserClient;
}
