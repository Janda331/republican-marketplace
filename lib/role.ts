import { supabase } from "./supabaseclient";

export type Role = "admin" | "vendor" | "customer";

export async function getMyRole(): Promise<Role | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return (data?.role as Role) ?? null;
}