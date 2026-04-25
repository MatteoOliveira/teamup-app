"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/home");
      } else {
        // Show onboarding only once (first visit)
        const seen = localStorage.getItem("teamup_onboarding_done");
        router.replace(seen ? "/login" : "/onboarding");
      }
    });
  }, [router]);

  return null;
}
