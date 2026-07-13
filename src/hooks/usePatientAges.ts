import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns a deduplicated, frequency-sorted list of past `age` values
 * the current doctor has used, fetched from the `patients` table.
 * Synced across devices because it lives in Lovable Cloud.
 */
export const usePatientAges = () => {
  const { user } = useAuth();
  const [ages, setAges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAges([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("age, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1000);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load patient ages:", error);
        setAges([]);
      } else {
        const counts = new Map<string, number>();
        (data || []).forEach((row) => {
          const a = (row.age || "").trim();
          if (!a) return;
          counts.set(a, (counts.get(a) || 0) + 1);
        });
        // Sort: most-used first, then alphabetical
        const sorted = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([age]) => age);
        setAges(sorted);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { ages, loading };
};
