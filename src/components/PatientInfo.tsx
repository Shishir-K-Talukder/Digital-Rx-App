import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePatientAges } from "@/hooks/usePatientAges";

export interface PatientData {
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  date: string;
  patientId?: string;
  referredBy?: string;
}

interface Props {
  patient: PatientData;
  onChange: (p: PatientData) => void;
}

const PATIENT_HISTORY_KEY = "patient-field-history";

interface PatientHistoryEntry {
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  patientId?: string;
}

const getPatientHistory = (): PatientHistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(PATIENT_HISTORY_KEY) || "[]");
  } catch { return []; }
};

export const savePatientToHistory = (patient: PatientData) => {
  if (!patient.name.trim() && !patient.patientId?.trim()) return;
  const history = getPatientHistory();
  const existing = history.findIndex(
    (h) =>
      (patient.patientId && h.patientId && h.patientId.toLowerCase() === patient.patientId.toLowerCase()) ||
      (h.name.toLowerCase() === patient.name.toLowerCase() && h.mobile === patient.mobile)
  );
  const entry: PatientHistoryEntry = {
    name: patient.name, age: patient.age, sex: patient.sex,
    mobile: patient.mobile, address: patient.address,
    patientId: patient.patientId || "",
  };
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.unshift(entry);
  }
  localStorage.setItem(PATIENT_HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
};

const PatientFieldWithSuggestions = ({
  value, placeholder, className, suggestions, onSelect, onChange,
}: {
  value: string; placeholder: string; className?: string;
  suggestions: { label: string; data: PatientHistoryEntry }[];
  onSelect: (entry: PatientHistoryEntry) => void;
  onChange: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = focused && value.length > 0
    ? suggestions.filter((s) => s.label.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : focused ? suggestions.slice(0, 8) : [];

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setFocused(false);
      }
    }, 150);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
      {filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-md mt-0.5 max-h-[160px] overflow-y-auto">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors flex justify-between items-center"
              onMouseDown={(e) => { e.preventDefault(); onSelect(s.data); setFocused(false); }}
            >
              <span className="font-medium">{s.data.name}</span>
              <span className="text-muted-foreground text-[10px]">{s.data.age} • {s.data.mobile}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AgeFieldWithMemory = ({
  value, onChange, savedAges,
}: {
  value: string;
  onChange: (v: string) => void;
  savedAges: string[];
}) => {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = focused
    ? (value.length > 0
        ? savedAges.filter((a) => a.toLowerCase().includes(value.toLowerCase()))
        : savedAges
      ).slice(0, 8)
    : [];

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) setFocused(false);
    }, 150);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder="বয়স"
        className="h-9 text-sm"
      />
      {filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-md mt-0.5 max-h-[200px] overflow-y-auto">
          {filtered.map((a, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors"
              onMouseDown={(e) => { e.preventDefault(); onChange(a); setFocused(false); }}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientInfo = ({ patient, onChange }: Props) => {
  const [history, setHistory] = useState<PatientHistoryEntry[]>([]);
  const { ages: savedAges } = usePatientAges();

  useEffect(() => {
    setHistory(getPatientHistory());
  }, []);

  const nameSuggestions = history.map((h) => ({ label: h.name, data: h }));
  const idSuggestions = history
    .filter((h) => h.patientId && h.patientId.trim())
    .map((h) => ({ label: h.patientId as string, data: h }));

  // Merge cloud-synced ages + local history ages (cloud first, dedup)
  const localAges = Array.from(new Set(history.map((h) => h.age.trim()).filter(Boolean)));
  const mergedAges = Array.from(new Set([...savedAges, ...localAges]));

  const handleSelectPatient = (entry: PatientHistoryEntry) => {
    onChange({
      ...patient,
      name: entry.name,
      age: entry.age,
      sex: entry.sex,
      mobile: entry.mobile,
      address: entry.address,
      patientId: entry.patientId || patient.patientId || "",
    });
  };

  return (
    <div className="section-card p-5">
      <h3 className="section-header mb-4">
        <div className="section-header-icon flex items-center justify-center">
          <User className="w-3.5 h-3.5" />
        </div>
        Patient Information
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {/* Row 1: Patient ID, Name, Age, Sex */}
        <div className="col-span-2 sm:col-span-2" id="patient-id">
          <Label className="field-label">Patient ID</Label>
          <PatientFieldWithSuggestions
            value={patient.patientId || ""}
            onChange={(v) => onChange({ ...patient, patientId: v })}
            placeholder="ID"
            className="h-9 text-sm"
            suggestions={idSuggestions}
            onSelect={handleSelectPatient}
          />
        </div>
        <div className="col-span-2 sm:col-span-2" id="patient-name">
          <Label className="field-label">Patient Name</Label>
          <PatientFieldWithSuggestions
            value={patient.name}
            onChange={(v) => onChange({ ...patient, name: v })}
            placeholder="রোগীর নাম"
            className="h-9 text-sm"
            suggestions={nameSuggestions}
            onSelect={handleSelectPatient}
          />
        </div>
        <div id="patient-age">
          <Label className="field-label">Age</Label>
          <AgeFieldWithMemory
            value={patient.age}
            onChange={(v) => onChange({ ...patient, age: v })}
            savedAges={mergedAges}
          />
        </div>
        <div id="patient-sex">
          <Label className="field-label">Sex</Label>
          <Select value={patient.sex} onValueChange={(v) => onChange({ ...patient, sex: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Date, Mobile */}
        <div className="col-span-2 sm:col-span-3">
          <Label className="field-label">Date</Label>
          <Input type="date" value={patient.date} onChange={(e) => onChange({ ...patient, date: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Label className="field-label">Mobile</Label>
          <Input value={patient.mobile} onChange={(e) => onChange({ ...patient, mobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
        </div>

        {/* Row 3: Address */}
        <div className="col-span-2 sm:col-span-6">
          <Label className="field-label">Address</Label>
          <Input value={patient.address} onChange={(e) => onChange({ ...patient, address: e.target.value })} placeholder="ঠিকানা" className="h-9 text-sm" />
        </div>

        {/* Row 4: Referred By */}
        <div className="col-span-2 sm:col-span-6">
          <Label className="field-label">Referred By</Label>
          <Input
            value={patient.referredBy || ""}
            onChange={(e) => onChange({ ...patient, referredBy: e.target.value })}
            placeholder="Dr. Name / Hospital / Self"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
