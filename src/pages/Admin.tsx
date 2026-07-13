import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users, Stethoscope, FileText, Shield, Search, Trash2, Eye, UserCheck, UserX,
  ArrowLeft, Pill, CalendarDays, Database, RefreshCw, Settings, Plus, Download,
  BarChart3, Activity, Clock, Timer, Calculator, Mail, Globe,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Navigate, useNavigate } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";
import DoseRulesManager from "@/components/DoseRulesManager";
import ContactManager from "@/components/ContactManager";
import SiteSettingsManager from "@/components/SiteSettingsManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// ─── Types ───
interface DoctorProfile {
  id: string; user_id: string; name: string; degrees: string; specialization: string;
  bmdc_no: string; phone: string; chamber_address: string; is_active: boolean;
  profile_photo_url: string; created_at: string; updated_at: string;
  panel_expires_at: string | null;
  can_print?: boolean;
}
interface Patient {
  id: string; user_id: string; name: string; age: string; sex: string;
  mobile: string; address: string; created_at: string;
}
interface Prescription {
  id: string; user_id: string; patient_data: any; clinical_data: any;
  medicines: any; advice: any; created_at: string;
}
interface UserRole { id: string; user_id: string; role: string; created_at: string; }
interface Appointment {
  id: string; user_id: string; patient_name: string; patient_mobile: string;
  patient_age: string; patient_sex: string; appointment_date: string;
  appointment_time: string; status: string; notes: string; created_at: string;
}
interface MedicineRow {
  id: string; name: string; generic: string; strength: string; company: string; created_at: string;
}
interface TreatmentTemplate {
  id: string; user_id: string; name: string; medicines: any; created_at: string;
}

// ─── Component ───
const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [medicinesTotal, setMedicinesTotal] = useState<number>(0);
  const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);

  const [search, setSearch] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Expiry management
  const [expiryDoctor, setExpiryDoctor] = useState<DoctorProfile | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [deleteDoctor, setDeleteDoctor] = useState<DoctorProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // New medicine form
  const [newMedName, setNewMedName] = useState("");
  const [newMedGeneric, setNewMedGeneric] = useState("");
  const [newMedStrength, setNewMedStrength] = useState("");
  const [newMedCompany, setNewMedCompany] = useState("");

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState<{ page: number; total_pages: number; last_run: string } | null>(null);

  useEffect(() => {
    if (isAdmin) { loadAll(); loadSyncInfo(); }
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    const [docRes, patRes, rxRes, roleRes, apptRes, medRes, tmplRes, medCountRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("appointment_date", { ascending: false }),
      supabase.from("medicines").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("treatment_templates").select("*").order("created_at", { ascending: false }),
      supabase.from("medicines").select("*", { count: "exact", head: true }),
    ]);
    if (docRes.data) setDoctors(docRes.data as any);
    if (patRes.data) setPatients(patRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (roleRes.data) setRoles(roleRes.data as any);
    if (apptRes.data) setAppointments(apptRes.data as any);
    if (medRes.data) setMedicines(medRes.data as any);
    if (tmplRes.data) setTemplates(tmplRes.data as any);
    if (typeof medCountRes.count === "number") setMedicinesTotal(medCountRes.count);
    setLoading(false);
  };

  // ─── Helpers ───
  const getDoctorName = (userId: string) => {
    const doc = doctors.find((d) => d.user_id === userId);
    return doc?.name || userId.slice(0, 8) + "...";
  };
  const getDoctorRxCount = (userId: string) => prescriptions.filter((rx) => rx.user_id === userId).length;
  const getDoctorPatientCount = (userId: string) => patients.filter((p) => p.user_id === userId).length;
  const activeDoctors = doctors.filter((d) => d.is_active !== false).length;
  const inactiveDoctors = doctors.filter((d) => d.is_active === false).length;

  const showValue = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    const text = String(value).trim();
    return text || "—";
  };

  const labelFromKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .replace(/\bBp\b/, "BP")
      .replace(/\bSpo2\b/, "SpO₂")
      .replace(/\bFhr\b/, "FHR")
      .replace(/\bLmp\b/, "LMP")
      .replace(/\bEdd\b/, "EDD")
      .replace(/\bRr\b/, "RR");

  const nonEmptyEntries = (obj: Record<string, unknown> = {}) =>
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");

  const renderText = (text: unknown) => {
    const lines = showValue(text).split("\n");
    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      return (
        <span key={`${line}-${lineIndex}`} className="block">
          {parts.map((part, partIndex) => part.startsWith("**") && part.endsWith("**") ? (
            <strong key={`${part}-${partIndex}`}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={`${part}-${partIndex}`}>{part}</span>
          ))}
        </span>
      );
    });
  };

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months: { name: string; prescriptions: number; patients: number; appointments: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      months.push({
        name: format(date, "MMM yy"),
        prescriptions: prescriptions.filter((rx) => isWithinInterval(new Date(rx.created_at), { start, end })).length,
        patients: patients.filter((p) => isWithinInterval(new Date(p.created_at), { start, end })).length,
        appointments: appointments.filter((a) => { try { return isWithinInterval(new Date(a.appointment_date), { start, end }); } catch { return false; } }).length,
      });
    }
    return months;
  }, [prescriptions, patients, appointments]);

  // Filtered lists
  const filteredDoctors = doctors.filter((d) =>
    `${d.name} ${d.specialization} ${d.bmdc_no} ${d.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.mobile} ${p.address}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMedicines = medicines.filter((m) =>
    `${m.name} ${m.generic} ${m.company}`.toLowerCase().includes(medSearch.toLowerCase())
  );

  // Live DB search across the FULL medicines table (not just loaded 500)
  useEffect(() => {
    const term = medSearch.trim();
    if (term.length < 2) return;
    const handle = setTimeout(async () => {
      const safe = term.replace(/[%(),'"]/g, " ").trim();
      if (!safe) return;
      const { data } = await supabase
        .from("medicines")
        .select("*")
        .or(`name.ilike.%${safe}%,generic.ilike.%${safe}%,company.ilike.%${safe}%`)
        .limit(200);
      if (data && data.length > 0) {
        setMedicines((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          (data as any[]).forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [medSearch]);

  // ─── Actions ───
  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: !currentActive } as any).eq("user_id", userId);
    if (error) { toast.error("Failed to update user status"); return; }
    setDoctors((prev) => prev.map((d) => (d.user_id === userId ? { ...d, is_active: !currentActive } : d)));
    toast.success(!currentActive ? "User activated" : "User deactivated");
  };

  const togglePrintPermission = async (userId: string, current: boolean) => {
    const { error } = await (supabase as any).from("profiles").update({ can_print: !current }).eq("user_id", userId);
    if (error) { toast.error("Failed to update print permission"); return; }
    setDoctors((prev) => prev.map((d) => (d.user_id === userId ? { ...d, can_print: !current } : d)));
    toast.success(!current ? "Print permission granted" : "Print permission revoked");
  };

  const deletePatient = async (id: string) => {
    await supabase.from("patients").delete().eq("id", id);
    setPatients((p) => p.filter((x) => x.id !== id));
    toast.success("Patient deleted");
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((p) => p.filter((x) => x.id !== id));
    toast.success("Prescription deleted");
  };

  const deleteAppointment = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setAppointments((a) => a.filter((x) => x.id !== id));
    toast.success("Appointment deleted");
  };

  const deleteMedicine = async (id: string) => {
    await supabase.from("medicines").delete().eq("id", id);
    setMedicines((m) => m.filter((x) => x.id !== id));
    toast.success("Medicine deleted");
  };

  const addMedicine = async () => {
    const name = newMedName.trim();
    if (!name) { toast.error("Medicine name is required"); return; }
    const payload = {
      name,
      generic: newMedGeneric.trim(),
      strength: newMedStrength.trim(),
      company: newMedCompany.trim(),
    };
    const { data, error } = await supabase
      .from("medicines")
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error("Add medicine failed:", error);
      toast.error(`Failed to add: ${error.message}`);
      return;
    }
    if (data) {
      // Prepend so the new medicine is visible immediately at the top of the list
      setMedicines((prev) => [data as any, ...prev.filter((m) => m.id !== (data as any).id)]);
      // Clear search so the new row is not hidden by an active filter
      setMedSearch("");
    }
    setNewMedName(""); setNewMedGeneric(""); setNewMedStrength(""); setNewMedCompany("");
    toast.success(`"${name}" added to medicine database`);
  };

  const deleteTemplate = async (id: string) => {
    await supabase.from("treatment_templates").delete().eq("id", id);
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  };

  const addAdminRole = async () => {
    const uid = newAdminUserId.trim();
    if (!uid) { toast.error("Select a doctor first"); return; }
    if (roles.some((r) => r.user_id === uid && r.role === "admin")) {
      toast.error("This user is already an admin"); return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" as any });
    if (error) { toast.error(error.message); } else {
      const docName = doctors.find((d) => d.user_id === uid)?.name || uid.slice(0, 8);
      toast.success(`Admin role assigned to ${docName}`);
      setNewAdminUserId("");
      loadAll();
    }
  };

  const runMedicineSync = async (reset = false) => {
    setSyncing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { toast.error("Not authenticated"); return; }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-medicines?pages=60${reset ? "&reset=1" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || `HTTP ${res.status}`); return; }
      toast.success(`Synced pages ${json.fromPage}–${json.toPage} • ${json.upserted} medicines updated`);
      loadAll();
      loadSyncInfo();
    } catch (e) {
      toast.error(`Sync failed: ${(e as Error).message}`);
    } finally {
      setSyncing(false);
    }
  };

  const loadSyncInfo = async () => {
    const { data } = await supabase.from("sync_state").select("value").eq("key", "medex_last_page").maybeSingle();
    if (data?.value) setSyncInfo(data.value as any);
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    setRoles((r) => r.filter((x) => x.id !== id));
    toast.success("Role removed");
  };

  // Parse DD-MM-YYYY -> ISO; returns null if invalid/empty
  const parseDMYToISO = (s: string): string | null => {
    const m = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    const d = new Date(`${yyyy}-${mm}-${dd}T23:59:59`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };
  const formatISOToDMY = (iso: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  };

  const setPanelExpiry = async (lifetime = false) => {
    if (!expiryDoctor) return;
    let val: string | null = null;
    if (!lifetime) {
      if (!expiryDate.trim()) { toast.error("Enter expiry date as DD-MM-YYYY or choose Lifetime"); return; }
      val = parseDMYToISO(expiryDate);
      if (!val) { toast.error("Invalid date — use DD-MM-YYYY format"); return; }
    }
    const { error } = await supabase.from("profiles").update({ panel_expires_at: val } as any).eq("user_id", expiryDoctor.user_id);
    if (error) { toast.error("Failed to set expiry"); return; }
    setDoctors((prev) => prev.map((d) => d.user_id === expiryDoctor.user_id ? { ...d, panel_expires_at: val } : d));
    toast.success(val ? `Expiry set to ${formatISOToDMY(val)}` : "Lifetime access granted");
    setExpiryDoctor(null); setExpiryDate("");
  };

  const confirmDeleteDoctor = async () => {
    if (!deleteDoctor) return;
    setDeleting(true);
    try {
      const uid = deleteDoctor.user_id;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Not authenticated. Please re-login.");
        return;
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-doctor`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ target_user_id: uid }),
      });

      const text = await res.text();
      let parsed: any = {};
      try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { error: text }; }

      if (!res.ok || parsed?.error) {
        const msg = parsed?.error || `HTTP ${res.status}`;
        console.error("delete-doctor failed:", res.status, parsed);
        toast.error(`Delete failed: ${msg}`);
        return;
      }

      setDoctors((prev) => prev.filter((d) => d.user_id !== uid));
      setPatients((prev) => prev.filter((p) => p.user_id !== uid));
      setPrescriptions((prev) => prev.filter((p) => p.user_id !== uid));
      setAppointments((prev) => prev.filter((a) => a.user_id !== uid));
      setTemplates((prev) => prev.filter((t) => t.user_id !== uid));
      setRoles((prev) => prev.filter((r) => r.user_id !== uid));
      toast.success(`Doctor "${deleteDoctor.name || uid.slice(0, 8)}" deleted permanently`);
      setDeleteDoctor(null);
    } catch (e) {
      console.error("delete-doctor error:", e);
      toast.error(`Delete failed: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
  };

  const exportData = () => {
    const data = { doctors, patients, prescriptions, appointments, templates, roles, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `app-backup-${format(new Date(), "yyyy-MM-dd")}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  // ─── Guards ───
  if (adminLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background pt-16 pb-8">
      <FloatingNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage doctors, patients, prescriptions and site settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-full" onClick={exportData}>
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-full" onClick={loadAll} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-6">
          {[
            { icon: <Stethoscope className="w-4 h-4 text-primary" />, label: "Doctors", value: doctors.length },
            { icon: <UserCheck className="w-4 h-4 text-emerald-500" />, label: "Active", value: activeDoctors },
            { icon: <UserX className="w-4 h-4 text-destructive" />, label: "Inactive", value: inactiveDoctors },
            { icon: <Users className="w-4 h-4 text-primary" />, label: "Patients", value: patients.length },
            { icon: <FileText className="w-4 h-4 text-primary" />, label: "Prescriptions", value: prescriptions.length },
            { icon: <CalendarDays className="w-4 h-4 text-primary" />, label: "Appointments", value: appointments.length },
            { icon: <Pill className="w-4 h-4 text-primary" />, label: "Medicines", value: medicinesTotal || medicines.length },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search doctors, patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-11 h-auto bg-card border border-border/60 p-1.5 rounded-2xl shadow-sm gap-1">
            {[
              { v: "overview", icon: BarChart3, label: "Overview" },
              { v: "doctors", icon: Stethoscope, label: "Doctors" },
              { v: "patients", icon: Users, label: "Patients" },
              { v: "prescriptions", icon: FileText, label: "Rx" },
              { v: "appointments", icon: CalendarDays, label: "Appts" },
              { v: "medicines", icon: Pill, label: "Medicines" },
              { v: "doserules", icon: Calculator, label: "Doses" },
              { v: "templates", icon: Settings, label: "Templates" },
              { v: "contact", icon: Mail, label: "Contact" },
              { v: "site", icon: Globe, label: "Site" },
              { v: "roles", icon: Shield, label: "Access" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="text-[11px] gap-1 rounded-xl py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="doserules"><DoseRulesManager /></TabsContent>
          <TabsContent value="contact"><ContactManager /></TabsContent>
          <TabsContent value="site"><SiteSettingsManager /></TabsContent>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Monthly Activity (6 Months)</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const maxVal = Math.max(1, ...monthlyData.flatMap((m) => [m.prescriptions, m.patients, m.appointments]));
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Rx</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Patients</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Appts</span>
                        </div>
                        {monthlyData.map((m) => (
                          <div key={m.name} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-foreground">{m.name}</span>
                              <span className="text-muted-foreground">{m.prescriptions} Rx · {m.patients} pts · {m.appointments} appts</span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(m.prescriptions / maxVal) * 100}%` }} />
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(m.patients / maxVal) * 100}%` }} />
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(m.appointments / maxVal) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4" /> Database Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Profiles (Doctors)", count: doctors.length },
                      { label: "Patients", count: patients.length },
                      { label: "Prescriptions", count: prescriptions.length },
                      { label: "Appointments", count: appointments.length },
                      { label: "Medicines in DB", count: medicinesTotal || medicines.length },
                      { label: "Treatment Templates", count: templates.length },
                      { label: "Admin Roles", count: roles.length },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{r.label}</span>
                        <Badge variant="secondary" className="text-xs">{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ DOCTORS ═══ */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Doctors / Users</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>BMDC</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Rx</TableHead>
                         <TableHead className="text-center">Patients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Print</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doc) => (
                        <TableRow key={doc.id} className={doc.is_active === false ? "opacity-50" : ""}>
                          <TableCell className="font-medium">
                            <button className="text-left hover:underline" onClick={() => setSelectedDoctor(doc)}>{doc.name || "—"}</button>
                          </TableCell>
                          <TableCell className="text-xs">{doc.specialization || "—"}</TableCell>
                          <TableCell className="text-xs">{doc.bmdc_no || "—"}</TableCell>
                          <TableCell className="text-xs">{doc.phone || "—"}</TableCell>
                          <TableCell className="text-center text-xs">{getDoctorRxCount(doc.user_id)}</TableCell>
                          <TableCell className="text-center text-xs">{getDoctorPatientCount(doc.user_id)}</TableCell>
                          <TableCell>
                            <Badge variant={doc.is_active !== false ? "default" : "destructive"} className="text-[10px]">
                              {doc.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={!!doc.can_print}
                              onCheckedChange={() => togglePrintPermission(doc.user_id, !!doc.can_print)}
                              aria-label="Toggle print permission"
                            />
                          </TableCell>
                          <TableCell>
                            {(() => {
                              if (!doc.panel_expires_at) return <Badge variant="secondary" className="text-[10px]">Lifetime</Badge>;
                              const exp = new Date(doc.panel_expires_at);
                              const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
                              const expired = days < 0;
                              return (
                                <button onClick={() => { setExpiryDoctor(doc); setExpiryDate(formatISOToDMY(doc.panel_expires_at)); }}>
                                  <Badge variant={expired ? "destructive" : days <= 7 ? "destructive" : "secondary"} className="text-[10px] cursor-pointer">
                                    {expired ? "Expired" : `${days}d left`}
                                  </Badge>
                                </button>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="flex gap-1">
                            <Switch checked={doc.is_active !== false} onCheckedChange={() => toggleUserActive(doc.user_id, doc.is_active !== false)} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setExpiryDoctor(doc); setExpiryDate(formatISOToDMY(doc.panel_expires_at)); }}>
                              <Timer className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteDoctor(doc)}
                              title="Delete doctor permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDoctors.length === 0 && <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground">No doctors found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PATIENTS ═══ */}
          <TabsContent value="patients">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Patients ({filteredPatients.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Age</TableHead><TableHead>Sex</TableHead>
                        <TableHead>Mobile</TableHead><TableHead>Address</TableHead><TableHead>Doctor</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name || "—"}</TableCell>
                          <TableCell>{p.age}</TableCell><TableCell>{p.sex}</TableCell>
                          <TableCell>{p.mobile}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{p.address || "—"}</TableCell>
                          <TableCell className="text-xs">{getDoctorName(p.user_id)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePatient(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPatients.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No patients found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PRESCRIPTIONS ═══ */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Prescriptions ({prescriptions.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead><TableHead>Doctor</TableHead>
                        <TableHead>Medicines</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((rx) => {
                        const pd = rx.patient_data as any;
                        const medCount = Array.isArray(rx.medicines) ? rx.medicines.length : 0;
                        return (
                          <TableRow key={rx.id}>
                            <TableCell className="font-medium">{pd?.name || "—"}</TableCell>
                            <TableCell className="text-xs">{getDoctorName(rx.user_id)}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{medCount} meds</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(rx.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPrescription(rx)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePrescription(rx.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {prescriptions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No prescriptions</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ APPOINTMENTS ═══ */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Appointments ({appointments.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead>
                        <TableHead>Status</TableHead><TableHead>Doctor</TableHead><TableHead>Notes</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.patient_name || "—"}</TableCell>
                          <TableCell className="text-xs">{a.appointment_date}</TableCell>
                          <TableCell className="text-xs">{a.appointment_time}</TableCell>
                          <TableCell><Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px]">{a.status}</Badge></TableCell>
                          <TableCell className="text-xs">{getDoctorName(a.user_id)}</TableCell>
                          <TableCell className="text-xs max-w-[100px] truncate">{a.notes || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAppointment(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {appointments.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No appointments</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MEDICINES DB ═══ */}
          <TabsContent value="medicines">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between gap-2 flex-wrap">
                  <span>Medicine Database ({(medicinesTotal || medicines.length).toLocaleString()})</span>
                  <div className="flex items-center gap-2">
                    {syncInfo && (
                      <span className="text-[10px] font-normal text-muted-foreground">
                        Last sync: {syncInfo.last_run ? new Date(syncInfo.last_run).toLocaleString() : "—"} • next page {((syncInfo.page || 0) + 1)}/{syncInfo.total_pages || "?"}
                      </span>
                    )}
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={syncing} onClick={() => runMedicineSync(false)}>
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                      {syncing ? "Syncing..." : "Sync from medex.com.bd"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-[10px]" disabled={syncing} onClick={() => runMedicineSync(true)} title="Restart sync from page 1">
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new medicine */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Input placeholder="Medicine name *" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Generic name" value={newMedGeneric} onChange={(e) => setNewMedGeneric(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Strength" value={newMedStrength} onChange={(e) => setNewMedStrength(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Company" value={newMedCompany} onChange={(e) => setNewMedCompany(e.target.value)} className="h-9 text-sm" />
                  <Button size="sm" className="h-9 gap-1" onClick={addMedicine}><Plus className="w-3.5 h-3.5" /> Add</Button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search medicines..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
                <ScrollArea className="max-h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Generic</TableHead><TableHead>Strength</TableHead>
                        <TableHead>Company</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicines.slice(0, 100).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-xs">{m.name}</TableCell>
                          <TableCell className="text-xs">{m.generic || "—"}</TableCell>
                          <TableCell className="text-xs">{m.strength || "—"}</TableCell>
                          <TableCell className="text-xs">{m.company || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMedicine(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredMedicines.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No medicines found</TableCell></TableRow>}
                      {filteredMedicines.length > 100 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground">Showing first 100 of {filteredMedicines.length} results. Use search to narrow down.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ TREATMENT TEMPLATES ═══ */}
          <TabsContent value="templates">
            <Card>
              <CardHeader><CardTitle className="text-sm">Treatment Templates ({templates.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Doctor</TableHead>
                        <TableHead>Medicines</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((t) => {
                        const medCount = Array.isArray(t.medicines) ? t.medicines.length : 0;
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.name || "—"}</TableCell>
                            <TableCell className="text-xs">{getDoctorName(t.user_id)}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{medCount} meds</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {templates.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No templates</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ADMIN ACCESS ═══ */}
          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle className="text-sm">Manage Admin Access</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Assign admin role to a registered doctor</Label>
                  <div className="flex gap-2">
                    <select
                      value={newAdminUserId}
                      onChange={(e) => setNewAdminUserId(e.target.value)}
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">— Select a doctor —</option>
                      {doctors
                        .filter((d) => !roles.some((r) => r.user_id === d.user_id && r.role === "admin"))
                        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                        .map((d) => (
                          <option key={d.user_id} value={d.user_id}>
                            {d.name || "(no name)"} {d.bmdc_no ? `• BMDC ${d.bmdc_no}` : ""} {d.phone ? `• ${d.phone}` : ""}
                          </option>
                        ))}
                    </select>
                    <Button onClick={addAdminRole} disabled={!newAdminUserId}>Assign Admin</Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead><TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead><TableHead>Assigned</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{getDoctorName(r.user_id)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{r.user_id}</TableCell>
                        <TableCell><Badge>{r.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRole(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {roles.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No roles assigned</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══ DIALOGS ═══ */}
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Doctor Details</DialogTitle></DialogHeader>
            {selectedDoctor && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Name:</span> <strong>{selectedDoctor.name || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Degrees:</span> {selectedDoctor.degrees || "—"}</div>
                  <div><span className="text-muted-foreground">Specialization:</span> {selectedDoctor.specialization || "—"}</div>
                  <div><span className="text-muted-foreground">BMDC No:</span> {selectedDoctor.bmdc_no || "—"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedDoctor.phone || "—"}</div>
                  <div><span className="text-muted-foreground">Chamber:</span> {selectedDoctor.chamber_address || "—"}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={selectedDoctor.is_active !== false ? "default" : "destructive"}>{selectedDoctor.is_active !== false ? "Active" : "Inactive"}</Badge></div>
                  <div><span className="text-muted-foreground">Joined:</span> {new Date(selectedDoctor.created_at).toLocaleDateString()}</div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground font-mono">User ID: {selectedDoctor.user_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorRxCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Prescriptions</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorPatientCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Patients</p></CardContent></Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-4xl max-h-[88vh] overflow-auto">
            <DialogHeader><DialogTitle>Prescription View</DialogTitle></DialogHeader>
            {selectedPrescription && (
              <div className="space-y-5 text-sm">
                {(() => {
                  const patient = selectedPrescription.patient_data || {};
                  const clinical = selectedPrescription.clinical_data || {};
                  const exam = clinical.onExamination || {};
                  const medicinesList = Array.isArray(selectedPrescription.medicines) ? selectedPrescription.medicines : [];
                  const advice = selectedPrescription.advice || {};
                  const examEntries = nonEmptyEntries(exam);

                  return (
                    <>
                      <div className="rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[11px] uppercase text-muted-foreground">Patient</p>
                            <h3 className="text-lg font-semibold text-foreground">{showValue(patient.name)}</h3>
                            <p className="text-xs text-muted-foreground">ID: {showValue(patient.patientId)}</p>
                          </div>
                          <div className="text-xs text-muted-foreground sm:text-right">
                            <p>Doctor: <span className="font-medium text-foreground">{getDoctorName(selectedPrescription.user_id)}</span></p>
                            <p>Date: {new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                          {[
                            ["Age", patient.age],
                            ["Sex", patient.sex],
                            ["Mobile", patient.mobile],
                            ["Address", patient.address],
                            ["Visit Fee", advice.visitFee ? `৳${advice.visitFee}` : ""],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-md bg-muted/45 p-2">
                              <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
                              <p className="font-medium text-foreground">{showValue(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <section className="rounded-lg border border-border p-4">
                          <h4 className="mb-3 font-semibold text-foreground">Clinical Information</h4>
                          <div className="space-y-3">
                            {[
                              ["Chief Complaint", clinical.chiefComplaint],
                              ["Diagnosis", clinical.diagnosis],
                              ["Investigation", clinical.investigation],
                              ["Drug History", clinical.drugHistory],
                            ].map(([label, value]) => (
                              showValue(value) !== "—" && (
                                <div key={label}>
                                  <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
                                  <div className="whitespace-pre-wrap text-foreground">{renderText(value)}</div>
                                </div>
                              )
                            ))}
                          </div>
                        </section>

                        <section className="rounded-lg border border-border p-4">
                          <h4 className="mb-3 font-semibold text-foreground">On Examination</h4>
                          {examEntries.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {examEntries.map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between gap-2 rounded-md bg-muted/45 px-2 py-1.5">
                                  <span className="text-[10px] uppercase text-muted-foreground">{labelFromKey(key)}</span>
                                  <span className="text-right text-xs font-medium text-foreground">{showValue(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No examination notes</p>
                          )}
                        </section>
                      </div>

                      <section className="rounded-lg border border-border p-4">
                        <h4 className="mb-3 font-semibold text-foreground">Rx Medicines</h4>
                        {medicinesList.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-10">#</TableHead>
                                  <TableHead>Medicine</TableHead>
                                  <TableHead>Dose</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Meal / Instructions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {medicinesList.map((medicine: any, index: number) => (
                                  <TableRow key={medicine.id || `${medicine.name}-${index}`}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                      <p className="font-semibold text-foreground">{showValue(medicine.name)}</p>
                                      <p className="text-[11px] text-muted-foreground">{showValue(medicine.type || medicine.formulation)}</p>
                                    </TableCell>
                                    <TableCell className="font-medium">{showValue(medicine.dose)}</TableCell>
                                    <TableCell>{showValue(medicine.duration)}</TableCell>
                                    <TableCell>
                                      <div>{showValue(medicine.mealTiming)}</div>
                                      {showValue(medicine.instructions) !== "—" && <div className="text-xs text-muted-foreground">{medicine.instructions}</div>}
                                      {Array.isArray(medicine.taperingDoses) && medicine.taperingDoses.length > 0 && (
                                        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                                          {medicine.taperingDoses.map((taper: any, taperIndex: number) => (
                                            <p key={taper.id || taperIndex}>Then: {showValue(taper.dose)} — {showValue(taper.duration)}</p>
                                          ))}
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No medicines added</p>
                        )}
                      </section>

                      <section className="rounded-lg border border-border p-4">
                        <h4 className="mb-3 font-semibold text-foreground">Advice & Follow-up</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Advice</p>
                            <div className="whitespace-pre-wrap text-foreground">{renderText(advice.advice)}</div>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Follow-up</p>
                            <p className="text-foreground">{showValue(advice.followUpDate)}</p>
                          </div>
                        </div>
                      </section>
                    </>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ═══ EXPIRY DIALOG ═══ */}
        <Dialog open={!!expiryDoctor} onOpenChange={() => setExpiryDoctor(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Timer className="w-4 h-4" /> Set Panel Expiry</DialogTitle></DialogHeader>
            {expiryDoctor && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Doctor: <strong>{expiryDoctor.name || expiryDoctor.user_id.slice(0, 8)}</strong></p>
                <div>
                  <Label className="text-xs">Expiry Date (DD-MM-YYYY)</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="DD-MM-YYYY"
                    value={expiryDate}
                    maxLength={10}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^\d-]/g, "");
                      const digits = v.replace(/-/g, "").slice(0, 8);
                      let out = digits;
                      if (digits.length > 4) out = `${digits.slice(0,2)}-${digits.slice(2,4)}-${digits.slice(4)}`;
                      else if (digits.length > 2) out = `${digits.slice(0,2)}-${digits.slice(2)}`;
                      setExpiryDate(out);
                    }}
                    className="mt-1 h-9 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Leave empty & click "Set Lifetime" for unlimited access</p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1.5 text-sm" onClick={() => setPanelExpiry(false)}>
                    <Clock className="w-3.5 h-3.5" /> Set Expiry
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm gap-1.5" onClick={() => setPanelExpiry(true)}>
                    ♾ Lifetime
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Doctor Confirmation */}
        <AlertDialog open={!!deleteDoctor} onOpenChange={(open) => !open && setDeleteDoctor(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Delete Doctor Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove <strong>{deleteDoctor?.name || "this doctor"}</strong> and ALL their data:
                patients, prescriptions, appointments, templates, settings, roles, and login account.
                <br /><br />
                <span className="text-destructive font-semibold">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); confirmDeleteDoctor(); }}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin;
