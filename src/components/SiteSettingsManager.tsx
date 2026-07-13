import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Music2, Mail, Phone, Save } from "lucide-react";

const fields: { key: string; label: string; icon: any; placeholder: string }[] = [
  { key: "facebook_url", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
  { key: "twitter_url", label: "Twitter / X", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  { key: "instagram_url", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourhandle" },
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/you" },
  { key: "youtube_url", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
  { key: "whatsapp_url", label: "WhatsApp", icon: MessageCircle, placeholder: "https://wa.me/8801XXXXXXXXX" },
  { key: "tiktok_url", label: "TikTok", icon: Music2, placeholder: "https://tiktok.com/@handle" },
  { key: "contact_email", label: "Public Email", icon: Mail, placeholder: "hello@digitalrx.com" },
  { key: "contact_phone", label: "Public Phone", icon: Phone, placeholder: "+880 1XXX-XXXXXX" },
];

const SiteSettingsManager = () => {
  const [data, setData] = useState<Record<string, string>>({});
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row } = await (supabase as any).from("site_settings").select("*").limit(1).maybeSingle();
      if (row) { setId(row.id); setData(row); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = Object.fromEntries(fields.map((f) => [f.key, data[f.key] || ""]));
    const q = id
      ? (supabase as any).from("site_settings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id)
      : (supabase as any).from("site_settings").insert(payload).select().single();
    const { data: res, error } = await q;
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (!id && res) setId(res.id);
    toast.success("Site settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Site & Social Media Links</CardTitle>
        <p className="text-xs text-muted-foreground">Update what appears in the public website footer and contact pages.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <f.icon className="w-3.5 h-3.5 text-primary" /> {f.label}
              </Label>
              <Input
                value={data[f.key] || ""}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="h-9 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsManager;
