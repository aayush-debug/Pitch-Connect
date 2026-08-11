import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/letspitch";

export type InvestorProfile = {
  id: string;
  name: string;
  subscription_status: "inactive" | "active" | "expired";
  subscription_expires_at: string | null;
};

export type Profile = {
  userId: string;
  email: string | null;
  role: UserRole | null;
  founder: { id: string; name: string } | null;
  investor: InvestorProfile | null;
};

export const profileQueryKey = ["letspitch-profile"];

export function hasActiveSubscription(investor: InvestorProfile | null | undefined) {
  if (!investor) return false;
  if (investor.subscription_status !== "active") return false;
  if (!investor.subscription_expires_at) return false;
  return new Date(investor.subscription_expires_at).getTime() > Date.now();
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const [founderRes, investorRes] = await Promise.all([
        supabase.from("founders").select("id, name").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("investors")
          .select("id, name, subscription_status, subscription_expires_at")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const metaRole = (user.user_metadata as { role?: UserRole } | null)?.role ?? null;

      return {
        userId: user.id,
        email: user.email ?? null,
        role: founderRes.data ? "founder" : investorRes.data ? "investor" : metaRole,
        founder: founderRes.data ?? null,
        investor: (investorRes.data as InvestorProfile | null) ?? null,
      };
    },
  });
}
