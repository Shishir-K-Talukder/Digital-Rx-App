import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorInfo } from "@/components/DoctorHeader";

const emptyProfile: DoctorInfo = {
  name: "",
  degrees: "",
  specialization: "",
  bmdcNo: "",
  chamberAddress: "",
  phone: "",
};

const HEADER_KEYS = [
  "preTitle", "specializationBn", "nameColor", "specializationColor",
  "chamber1Name", "chamber1Address", "chamber1Hours",
  "chamber2Name", "chamber2Address", "chamber2Hours",
] as const;

const mapProfileToDoctorInfo = (data?: {
  name?: string;
  degrees?: string;
  specialization?: string;
  bmdc_no?: string;
  chamber_address?: string;
  phone?: string;
  header_settings?: any;
} | null): DoctorInfo => {
  const h = (data?.header_settings ?? {}) as Record<string, string>;
  const extras: Record<string, string> = {};
  HEADER_KEYS.forEach((k) => { extras[k] = h?.[k] ?? ""; });
  return {
    name: data?.name ?? "",
    degrees: data?.degrees ?? "",
    specialization: data?.specialization ?? "",
    bmdcNo: data?.bmdc_no ?? "",
    chamberAddress: data?.chamber_address ?? "",
    phone: data?.phone ?? "",
    ...extras,
  };
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorInfo>(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(emptyProfile);
      setLoading(false);
      return;
    }

    void loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error);
      setLoading(false);
      return;
    }

    setProfile(mapProfileToDoctorInfo(data));
    setLoading(false);
  };

  const saveProfile = async (info: DoctorInfo) => {
    if (!user) return false;

    const previousProfile = profile;
    setProfile(info);

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        name: info.name,
        degrees: info.degrees,
        specialization: info.specialization,
        bmdc_no: info.bmdcNo,
        chamber_address: info.chamberAddress,
        phone: info.phone,
        header_settings: HEADER_KEYS.reduce((acc, k) => {
          acc[k] = (info as any)[k] ?? "";
          return acc;
        }, {} as Record<string, string>),
      }, { onConflict: "user_id" })
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Failed to save profile:", error);
      setProfile(previousProfile);
      return false;
    }

    setProfile(mapProfileToDoctorInfo(data));
    return true;
  };

  return { profile, saveProfile, loading };
};
