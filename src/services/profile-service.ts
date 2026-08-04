import { supabase } from "@/lib/supabase";
import { transformProfile } from "@/lib/transformers/profile-transformer";
import { UserProfile, ProfileRow } from "@/types";

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const response = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  console.log("🔍 [PROFILE TRACE 1/6] Raw Supabase DB Response (before processing):", response);

  const { data, error } = response;

  if (error) {
    console.error("❌ [Profile Service] Error fetching profile from Supabase:", error.message);
    return null;
  }

  console.log("🔍 [PROFILE TRACE 1/6] Raw Supabase DB Payload:", data);
  const transformed = transformProfile(data as ProfileRow);
  console.log("🔍 [PROFILE TRACE 2/6] Service Layer Mapped Profile:", transformed);

  return transformed;
}
