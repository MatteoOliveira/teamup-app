import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ── Types ────────────────────────────────────────────────────

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  location: string | null;
  sports: string[];
  points: number;
  events_count: number;
  wins_count: number;
  teams_count: number;
  hours_played: number;
  is_admin: boolean;
  created_at: string;
};

export type Terrain = {
  id: string;
  name: string;
  sport: string;
  address: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  price_hour: number;
  rating: number;
  image_url: string | null;
  amenities: string[];
  created_at: string;
};

export type Event = {
  id: string;
  organizer_id: string;
  terrain_id: string | null;
  title: string;
  sport: string;
  level: "all" | "beginner" | "intermediate" | "advanced";
  description: string | null;
  event_date: string;
  start_time: string;
  duration_min: number;
  max_players: number;
  current_players: number;
  visibility: "public" | "private" | "invite";
  status: "open" | "full" | "cancelled" | "done";
  location_text: string | null;
  created_at: string;
  // Joined fields
  organizer?: Profile;
  terrain?: Terrain;
  participants?: EventParticipant[];
};

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  status: "confirmed" | "waitlist" | "cancelled";
  joined_at: string;
  profile?: Profile;
};

export type Team = {
  id: string;
  owner_id: string;
  name: string;
  sport: string;
  level: string;
  description: string | null;
  avatar_url: string | null;
  location: string | null;
  is_public: boolean;
  members_count: number;
  created_at: string;
  owner?: Profile;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profile?: Profile;
};

export type Message = {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
};

export type Booking = {
  id: string;
  terrain_id: string;
  user_id: string;
  event_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  terrain?: Terrain;
};

// ── Auth helpers ─────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  return data;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
