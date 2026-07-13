import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PatientData } from "@/components/PatientInfo";
import { ClinicalData } from "@/components/ClinicalSection";
import { Medicine } from "@/components/MedicineSection";
import { AdviceData } from "@/components/AdviceSection";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export interface PrescriptionRecord {
  id: string;
  patient_data: PatientData;
  clinical_data: ClinicalData;
  medicines: Medicine[];
  advice: AdviceData;
  created_at: string;
}

export const usePrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadPrescriptions();
  }, [user]);

  const loadPrescriptions = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setPrescriptions(
        data.map((d) => ({
          id: d.id,
          patient_data: d.patient_data as unknown as PatientData,
          clinical_data: d.clinical_data as unknown as ClinicalData,
          medicines: d.medicines as unknown as Medicine[],
          advice: d.advice as unknown as AdviceData,
          created_at: d.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const savePrescription = async (
    patient: PatientData,
    clinical: ClinicalData,
    medicines: Medicine[],
    advice: AdviceData
  ) => {
    if (!user) return;

    // Upsert patient record - dedupe by patientId first, then by name+mobile, then name+age+sex
    let patientId: string | null = null;
    const humanPid = (patient as any).patientId?.trim?.() || "";

    if (humanPid) {
      // Find any existing prescription with same human patientId and reuse its patient_id link
      const { data: existingRx } = await supabase
        .from("prescriptions")
        .select("patient_id")
        .eq("user_id", user.id)
        .filter("patient_data->>patientId", "eq", humanPid)
        .not("patient_id", "is", null)
        .limit(1)
        .maybeSingle();
      if (existingRx?.patient_id) patientId = existingRx.patient_id;
    }

    if (!patientId && patient.name) {
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", patient.name)
        .eq("mobile", patient.mobile || "")
        .maybeSingle();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Secondary dedupe: name + age + sex
        const { data: altMatch } = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", patient.name)
          .eq("age", patient.age || "")
          .eq("sex", patient.sex || "")
          .maybeSingle();
        if (altMatch) patientId = altMatch.id;
      }
    }

    if (patientId) {
      await supabase.from("patients").update({
        age: patient.age, sex: patient.sex, address: patient.address, mobile: patient.mobile || "",
      }).eq("id", patientId);
    } else if (patient.name) {
      const { data: newPatient } = await supabase
        .from("patients")
        .insert({
          user_id: user.id,
          name: patient.name,
          age: patient.age,
          sex: patient.sex,
          mobile: patient.mobile || "",
          address: patient.address || "",
        })
        .select("id")
        .single();
      patientId = newPatient?.id ?? null;
    }

    const { error } = await supabase.from("prescriptions").insert({
      user_id: user.id,
      patient_id: patientId,
      patient_data: patient as unknown as Json,
      clinical_data: clinical as unknown as Json,
      medicines: medicines as unknown as Json,
      advice: advice as unknown as Json,
    });

    if (error) {
      toast.error("Failed to save prescription");
    } else {
      toast.success("Prescription saved!");
      loadPrescriptions();
    }
  };

  const updatePrescription = async (
    id: string,
    patient: PatientData,
    clinical: ClinicalData,
    medicines: Medicine[],
    advice: AdviceData
  ) => {
    if (!user) return;
    const { error } = await supabase.from("prescriptions").update({
      patient_data: patient as unknown as Json,
      clinical_data: clinical as unknown as Json,
      medicines: medicines as unknown as Json,
      advice: advice as unknown as Json,
    }).eq("id", id).eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update prescription");
    } else {
      toast.success("Prescription updated!");
      loadPrescriptions();
    }
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Prescription deleted");
  };

  return { prescriptions, savePrescription, updatePrescription, deletePrescription, loading, reload: loadPrescriptions };
};
