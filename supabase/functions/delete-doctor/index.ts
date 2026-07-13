// Admin-only: fully delete a doctor (auth user + ALL their data + storage files)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Verify caller identity
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("Auth check failed:", userErr?.message);
      return json({ error: "Invalid or expired token" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 2. Verify caller is admin
    const { data: roleRow, error: roleErr } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr) {
      console.error("Role check error:", roleErr);
      return json({ error: `Role check failed: ${roleErr.message}` }, 500);
    }
    if (!roleRow) return json({ error: "Forbidden: admin only" }, 403);

    // 3. Validate input
    const body = await req.json().catch(() => ({}));
    const target_user_id = body?.target_user_id;
    if (!target_user_id || typeof target_user_id !== "string") {
      return json({ error: "target_user_id (uuid string) required" }, 400);
    }
    if (target_user_id === userData.user.id) {
      return json({ error: "Cannot delete your own account" }, 400);
    }

    console.log(`Admin ${userData.user.id} deleting doctor ${target_user_id}`);

    // 4. Delete storage files (profile photos, patient docs, prescription pdfs)
    const buckets = ["profile-photos", "patient-documents", "prescription-pdfs"];
    for (const bucket of buckets) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(target_user_id, {
          limit: 1000, sortBy: { column: "name", order: "asc" },
        });
        if (files && files.length > 0) {
          const paths = files.map((f) => `${target_user_id}/${f.name}`);
          // Recursively try subfolders too
          const { data: subFiles } = await admin.storage.from(bucket).list(target_user_id, { limit: 1000 });
          const allPaths = [...paths];
          if (subFiles) {
            for (const sf of subFiles) {
              if (!sf.name.includes(".")) {
                const { data: nested } = await admin.storage.from(bucket).list(`${target_user_id}/${sf.name}`, { limit: 1000 });
                if (nested) allPaths.push(...nested.map((n) => `${target_user_id}/${sf.name}/${n.name}`));
              }
            }
          }
          if (allPaths.length > 0) {
            const { error: rmErr } = await admin.storage.from(bucket).remove(allPaths);
            if (rmErr) console.error(`Storage remove ${bucket} error:`, rmErr.message);
          }
        }
      } catch (e) {
        console.error(`Storage cleanup ${bucket} failed:`, (e as Error).message);
      }
    }

    // 5. Delete database rows in dependency order
    const tables = [
      "prescriptions",
      "appointments",
      "patients",
      "treatment_templates",
      "doctor_settings",
      "user_roles",
      "profiles",
    ] as const;

    for (const t of tables) {
      const { error } = await admin.from(t).delete().eq("user_id", target_user_id);
      if (error) {
        console.error(`Delete ${t} failed:`, error.message);
        return json({ error: `Failed to delete ${t}: ${error.message}` }, 500);
      }
    }

    // 6. Delete the auth user (this is what truly removes login access)
    const { error: delErr } = await admin.auth.admin.deleteUser(target_user_id);
    if (delErr) {
      console.error("Auth delete failed:", delErr.message);
      return json({ error: `Auth user delete failed: ${delErr.message}` }, 500);
    }

    console.log(`Successfully deleted doctor ${target_user_id}`);
    return json({ success: true, deleted_user_id: target_user_id });
  } catch (e) {
    console.error("Unexpected error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
