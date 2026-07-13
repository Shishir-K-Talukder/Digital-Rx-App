import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id?: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  whatsapp_url: string;
  tiktok_url: string;
  contact_email: string;
  contact_phone: string;
}

export const defaultSiteSettings: SiteSettings = {
  facebook_url: "", twitter_url: "", instagram_url: "", linkedin_url: "",
  youtube_url: "", whatsapp_url: "", tiktok_url: "", contact_email: "", contact_phone: "",
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("site_settings").select("*").limit(1).maybeSingle();
      if (data) setSettings(data as SiteSettings);
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
};
