import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileText, Stethoscope, Eye, Save, History, LogOut, LayoutDashboard, User, FolderOpen } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import DoctorHeader, { DoctorInfo } from "@/components/DoctorHeader";
import PatientInfo, { PatientData, savePatientToHistory } from "@/components/PatientInfo";
import ClinicalSection, { ClinicalData, defaultOnExamination } from "@/components/ClinicalSection";
import MedicineSection, { Medicine } from "@/components/MedicineSection";
import AdviceSection, { AdviceData } from "@/components/AdviceSection";
import PrintPreview from "@/components/PrintPreview";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import PatientRecordsPanel from "@/components/PatientRecordsPanel";
import PatientDocuments from "@/components/PatientDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDoctorSettings } from "@/hooks/useDoctorSettings";
import { usePrescriptions, PrescriptionRecord } from "@/hooks/usePrescriptions";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import IndexSkeleton from "@/components/skeletons/IndexSkeleton";
import { toast } from "sonner";

type MissingField = { label: string; fieldId: string };

const getMissingFields = (patient: PatientData, advice: AdviceData): MissingField[] => {
  const missing: MissingField[] = [];
  if (!patient.name?.trim()) missing.push({ label: "Patient Name", fieldId: "patient-name" });
  if (!String(patient.age ?? "").trim()) missing.push({ label: "Age", fieldId: "patient-age" });
  if (!patient.sex?.trim()) missing.push({ label: "Sex", fieldId: "patient-sex" });
  if (!String(advice.visitFee ?? "").trim()) missing.push({ label: "Visit Fee", fieldId: "advice-visitFee" });
  return missing;
};

const focusMissingField = (fieldId: string) => {
  setTimeout(() => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus?.();
    }
  }, 50);
};

const today = new Date().toISOString().split("T")[0];

const generatePatientId = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `P-${ymd}-${rnd}`;
};

const Index = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { profile, saveProfile, loading: profileLoading } = useProfile();
  const { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading: settingsLoading } = useDoctorSettings();
  const { prescriptions, savePrescription, updatePrescription, deletePrescription, loading: rxLoading } = usePrescriptions();
  const { isAdmin } = useAdmin();
  const [canPrint, setCanPrint] = useState<boolean>(false);
  const [editingRxId, setEditingRxId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).from("profiles").select("can_print").eq("user_id", user.id).maybeSingle();
      setCanPrint(!!data?.can_print);
    })();
  }, [user]);

  const [activeTab, setActiveTab] = useState("write");

  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });

  const [patient, setPatient] = useState<PatientData>({
    name: "", age: "", sex: "", mobile: "", address: "", date: today, patientId: generatePatientId(),
  });

  const [clinical, setClinical] = useState<ClinicalData>({
    chiefComplaint: "", onExamination: { ...defaultOnExamination }, drugHistory: "", diagnosis: "", investigation: "",
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [advice, setAdvice] = useState<AdviceData>({
    advice: "", followUpDate: "",
  });

  useEffect(() => {
    if (!profileLoading) {
      setDoctor(profile);
    }
  }, [profileLoading, profile]);

  // Pre-fill patient info from appointment
  useEffect(() => {
    const stored = sessionStorage.getItem("appointment-patient");
    if (stored) {
      try {
        const apptPatient = JSON.parse(stored);
        setPatient((prev) => ({
          ...prev,
          name: apptPatient.name || "",
          age: apptPatient.age || "",
          sex: apptPatient.sex || "",
          mobile: apptPatient.mobile || "",
        }));
      } catch {}
      sessionStorage.removeItem("appointment-patient");
    }

    // Load prescription for editing
    const editStored = sessionStorage.getItem("edit-prescription");
    if (editStored) {
      try {
        const rx = JSON.parse(editStored) as PrescriptionRecord;
        setEditingRxId(rx.id);
        setPatient({ ...rx.patient_data, date: rx.patient_data.date || today });
        setClinical(rx.clinical_data);
        setMedicines(rx.medicines);
        setAdvice(rx.advice);
        toast.info("Editing existing prescription. Save to update.");
      } catch {}
      sessionStorage.removeItem("edit-prescription");
    }
  }, []);

  const handleDoctorChange = (d: DoctorInfo) => {
    setDoctor(d);
    saveProfile(d);
  };

  const handlePrint = () => {
    if (!isAdmin && !canPrint) {
      toast.error("Printing is disabled for your account. Please contact an admin to enable print permission.");
      return;
    }
    const missing = getMissingFields(patient, advice);
    if (missing.length > 0) {
      setActiveTab("write");
      toast.error(`Please fill: ${missing.map((m) => m.label).join(", ")} before printing.`, {
        action: { label: `Go to ${missing[0].label}`, onClick: () => focusMissingField(missing[0].fieldId) },
      });
      focusMissingField(missing[0].fieldId);
      return;
    }
    // Auto-save / update prescription when printing
    savePatientToHistory(patient);
    if (editingRxId) {
      updatePrescription(editingRxId, patient, clinical, medicines, advice);
    } else {
      savePrescription(patient, clinical, medicines, advice);
    }

    const printData = { doctor, patient, clinical, medicines, advice, printSettings };
    sessionStorage.setItem("prescription-print-data", JSON.stringify(printData));

    const baseUrl = import.meta.env.BASE_URL || "/";
    const printUrl = `${window.location.origin}${baseUrl}${baseUrl.endsWith("/") ? "" : "/"}print`.replace(/\/+/g, "/").replace(":/", "://");
    window.open(printUrl, "_blank");
  };

  const handleSave = () => {
    const missing = getMissingFields(patient, advice);
    if (missing.length > 0) {
      setActiveTab("write");
      toast.error(`Please fill: ${missing.map((m) => m.label).join(", ")} before saving.`, {
        action: { label: `Go to ${missing[0].label}`, onClick: () => focusMissingField(missing[0].fieldId) },
      });
      focusMissingField(missing[0].fieldId);
      return;
    }
    savePatientToHistory(patient);
    if (editingRxId) {
      updatePrescription(editingRxId, patient, clinical, medicines, advice);
    } else {
      savePrescription(patient, clinical, medicines, advice);
    }
  };


  const handleLoadPrescription = (rx: PrescriptionRecord) => {
    setEditingRxId(rx.id);
    setPatient({ ...rx.patient_data, date: today });
    setClinical(rx.clinical_data);
    setMedicines(rx.medicines);
    setAdvice(rx.advice);
    setActiveTab("write");
  };

  const handleNewPrescription = () => {
    setEditingRxId(null);
    setPatient({ name: "", age: "", sex: "", mobile: "", address: "", date: today, patientId: generatePatientId() });
    setClinical({ chiefComplaint: "", onExamination: { ...defaultOnExamination }, drugHistory: "", drugHistoryMedicines: [], diagnosis: "", investigation: "" });
    setMedicines([]);
    setAdvice({ advice: "", followUpDate: "" });
    setActiveTab("write");
  };

  if (profileLoading || settingsLoading) {
    return <IndexSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-8">
      <FloatingNav
        actions={[
          { icon: <FileText className="w-5 h-5" />, label: "New Rx", onClick: handleNewPrescription },
          { icon: <Save className="w-5 h-5" />, label: "Save", onClick: handleSave },
          { icon: <Printer className="w-5 h-5" />, label: "Print", onClick: handlePrint },
        ]}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 mt-2">
            <TabsList className="bg-card border border-border/60 shadow-sm h-12 p-1 rounded-xl">
              <TabsTrigger value="write" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <Stethoscope className="w-4 h-4" /> Write Rx
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <Eye className="w-4 h-4" /> Preview
              </TabsTrigger>
              <TabsTrigger value="record" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <FolderOpen className="w-4 h-4" /> Record
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="space-y-4 mt-0">
            {/* Patient Info */}
            <PatientInfo patient={patient} onChange={setPatient} />

            {/* Clinical + Medicine side by side */}
            <div className="rx-page-grid">
              <div className="min-w-0">
                <ClinicalSection data={clinical} onChange={setClinical} options={medicineOptions} />
              </div>
              <div className="space-y-4 min-w-0">
                <MedicineSection medicines={medicines} onChange={setMedicines} options={medicineOptions} onOptionsChange={saveMedicineOptions} />
              </div>
            </div>

            {/* Advice & Documents */}
            <AdviceSection data={advice} onChange={setAdvice} options={medicineOptions} uiFontSize={printSettings.uiDropdownFontSize} />
            <div className="section-card p-5">
              <PatientDocuments patientId={prescriptions.find(
                (rx) => rx.patient_data.name === patient.name && rx.patient_data.mobile === patient.mobile
              )?.id} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <PrintPreview doctor={doctor} patient={patient} clinical={clinical} medicines={medicines} advice={advice} printSettings={printSettings} />
          </TabsContent>

          <TabsContent value="record" className="mt-0">
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <FolderOpen className="w-3.5 h-3.5" />
                </div>
                Patient Records
              </h3>
              <PatientRecordsPanel onLoadPrescription={handleLoadPrescription} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <History className="w-3.5 h-3.5" />
                </div>
                Prescription History
              </h3>
              <PrescriptionHistory
                prescriptions={prescriptions}
                onLoad={handleLoadPrescription}
                onDelete={deletePrescription}
                loading={rxLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
