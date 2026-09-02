import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { DoctorInfo } from "@/components/DoctorHeader";
import FloatingNav from "@/components/FloatingNav";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import PanelExpiryCountdown from "@/components/PanelExpiryCountdown";
import { Save, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const MULTILINE_KEYS = [
  "degrees", "chamberAddress", "chamber1Address", "chamber1Hours",
  "chamber2Address", "chamber2Hours", "specializationBn",
];

const Profile = () => {
  const { user } = useAuth();
  const { profile, saveProfile, loading } = useProfile();
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });

  useEffect(() => {
    if (!loading) {
      setDoctor(profile);
    }
  }, [loading, profile]);

  useEffect(() => {
    if (user) loadPhotoUrl();
  }, [user]);

  const loadPhotoUrl = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("profile_photo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile photo:", error);
      return;
    }

    if (data?.profile_photo_url) setPhotoUrl(data.profile_photo_url);
  };

  const handlePhotoChange = async (url: string) => {
    setPhotoUrl(url);

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, profile_photo_url: url }, { onConflict: "user_id" });

      if (error) {
        console.error("Failed to save profile photo:", error);
        toast.error("Profile photo could not be saved.");
      }
    }
  };

  const handleSave = async () => {
    const didSave = await saveProfile(doctor);

    if (!didSave) {
      toast.error("Profile could not be saved.");
      return;
    }

    toast.success("Profile saved!");
  };

  const fields: { key: keyof DoctorInfo; label: string; placeholder: string }[] = [
    { key: "preTitle", label: "Title Line (above name)", placeholder: "স্বাস্থ্য সহকারী ও মাইক্রোবায়োলজিস্ট" },
    { key: "name", label: "Doctor Name", placeholder: "শিশির কুমার তালুকদার" },
    { key: "degrees", label: "Degrees (one per line)", placeholder: "ডি.এম.এফ (ঢাকা)\nএম.সি.এইচ (ঢাকা শিশু হাসপাতাল)" },
    { key: "specialization", label: "Specialization (English)", placeholder: "Medicine Specialist" },
    { key: "specializationBn", label: "Specialization (Bangla banner)", placeholder: "মেডিসিন, চর্ম, বাতব্যথা, মা ও শিশু রোগে অভিজ্ঞ" },
    { key: "bmdcNo", label: "BMDC No", placeholder: "ডি - ২৫৩২৪" },
    { key: "chamberAddress", label: "Chamber Address (fallback)", placeholder: "123 Green Road, Dhaka" },
    { key: "phone", label: "Mobile", placeholder: "০১৭৭৩-০০৬৯৪০" },
    { key: "chamber1Name", label: "Chamber 1 Name", placeholder: "মমতা ফার্মেসি" },
    { key: "chamber1Address", label: "Chamber 1 Address", placeholder: "রসুলপুর বাজার, পীরগঞ্জ, রংপুর।" },
    { key: "chamber1Hours", label: "Chamber 1 Visiting Hours", placeholder: "সোমবার - শনিবার, সকাল ০৯ টা - দুপুর ১২ পর্যন্ত।" },
    { key: "chamber2Name", label: "Chamber 2 Name", placeholder: "মা-বাবা চিকিৎসালয়" },
    { key: "chamber2Address", label: "Chamber 2 Address", placeholder: "বালিকা বিদ্যালয়ের সামনে, ভেন্ডাবাড়ি বাজার, পীরগঞ্জ, রংপুর।" },
    { key: "chamber2Hours", label: "Chamber 2 Visiting Hours", placeholder: "সোমবার - শনিবার, দুপুর ০২ টা - রাত ১০ পর্যন্ত।" },
  ];

  const colorFields: { key: keyof DoctorInfo; label: string; fallback: string }[] = [
    { key: "nameColor", label: "Doctor Name Color", fallback: "#c00000" },
    { key: "specializationColor", label: "Specialization Color", fallback: "#008000" },
  ];

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <FloatingNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <PanelExpiryCountdown />
            <ProfilePhotoUpload
              photoUrl={photoUrl}
              doctorName={doctor.name}
              onPhotoChange={handlePhotoChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</Label>
                  {MULTILINE_KEYS.includes(f.key as string) ? (
                    <Textarea
                      value={doctor[f.key] ?? ""}
                      onChange={(e) => setDoctor({ ...doctor, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="text-sm min-h-[64px]"
                    />
                  ) : (
                    <Input
                      value={doctor[f.key] ?? ""}
                      onChange={(e) => setDoctor({ ...doctor, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colorFields.map((c) => (
                <div key={c.key}>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">{c.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={doctor[c.key] || c.fallback}
                      onChange={(e) => setDoctor({ ...doctor, [c.key]: e.target.value })}
                      className="h-9 w-14 p-1"
                    />
                    <Input
                      value={doctor[c.key] ?? ""}
                      onChange={(e) => setDoctor({ ...doctor, [c.key]: e.target.value })}
                      placeholder={c.fallback}
                      className="h-9 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 text-xs"
                      onClick={() => setDoctor({ ...doctor, [c.key]: "" })}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <p className="text-xs text-muted-foreground">Email: {user.email}</p>
            )}
            <Button className="gap-1.5 text-sm" onClick={handleSave}>
              <Save className="w-4 h-4" /> Save Profile
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;

