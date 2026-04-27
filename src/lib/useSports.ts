"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type SportItem = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
};

let cache: SportItem[] | null = null;

export function useSports() {
  const [sports, setSports] = useState<SportItem[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache !== null) { setSports(cache); setLoading(false); return; }
    supabase
      .from("sports")
      .select("slug, name, emoji, color")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        const items: SportItem[] = (data ?? []).map((s) => ({
          id: s.slug,
          label: s.name,
          emoji: s.emoji,
          color: s.color,
          soft: s.color + "22",
        }));
        cache = items;
        setSports(items);
        setLoading(false);
      });
  }, []);

  const sportRecord = Object.fromEntries(sports.map((s) => [s.id, s]));

  return { sports, sportRecord, loading };
}
