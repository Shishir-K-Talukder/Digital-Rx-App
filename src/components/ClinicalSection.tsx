import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ClipboardList, Plus, X, Pill, CalendarIcon, Stethoscope } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MedicineOptions } from "@/components/MedicineSettings";
import { useMedicineSearch, MedicineSuggestion } from "@/hooks/useMedicineSearch";

export interface OnExaminationData {
  bp: string; weight: string; temp: string; pulse: string; heart: string; lungs: string; abd: string;
  anaemia: string; jaundice: string; cyanosis: string; oedema: string;
  rr: string; spo2: string; lmp: string; edd: string; fm: string; fhr: string; gravida: string; para: string;
}

export interface PVExaminationData {
  vulvaVagina: string;
  cervix: string;
  uterus: string;
  adnexa: string;
  cmt: string;
  pod: string;
}

export interface ClinicalData {
  chiefComplaint: string;
  onExamination: OnExaminationData;
  pvExamination?: PVExaminationData;
  drugHistory: string;
  drugHistoryMedicines?: string[];
  diagnosis: string;
  investigation: string;
  investigationResults?: string;
}

export const defaultOnExamination: OnExaminationData = {
  bp: "", weight: "", temp: "", pulse: "", heart: "", lungs: "", abd: "",
  anaemia: "Absent", jaundice: "Absent", cyanosis: "Absent", oedema: "Absent",
  rr: "", spo2: "", lmp: "", edd: "", fm: "", fhr: "Absent", gravida: "", para: "",
};

export const defaultPVExamination: PVExaminationData = {
  vulvaVagina: "", cervix: "", uterus: "", adnexa: "", cmt: "", pod: "",
};

const COMMON_INVESTIGATIONS = [
  "CBC", "ESR", "CRP", "RBS", "FBS", "HbA1c",
  "S. Creatinine", "S. Uric Acid", "S. Electrolyte",
  "Lipid Profile", "LFT", "Thyroid Profile (FT4, TSH)",
  "Urine R/M/E", "Urine C/S", "Stool R/M/E",
  "X-Ray Chest P/A", "X-Ray L/S Spine B/V", "X-Ray KUB",
  "USG of W/A", "USG of KUB", "Echo",
  "ECG", "CT Scan", "MRI",
  "Blood Grouping", "HBsAg", "Anti-HCV",
  "Widal Test", "Blood C/S", "Sputum for AFB",
  "Dengue NS1 Ag", "Dengue IgM/IgG",
  "S. Bilirubin", "S. Albumin", "PT/INR",
  "ANA", "Anti-dsDNA", "RA Factor",
];

interface Props {
  data: ClinicalData;
  onChange: (d: ClinicalData) => void;
  options?: MedicineOptions;
}

const presentAbsentOptions = ["Absent", "Present"];

// O/E suggestion history stored in localStorage
const OE_HISTORY_KEY = "oe-field-history";

const getOEHistory = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(OE_HISTORY_KEY) || "{}");
  } catch { return {}; }
};

const saveOEValue = (fieldKey: string, value: string) => {
  if (!value || value === "Absent" || value === "Present") return;
  const history = getOEHistory();
  const existing = history[fieldKey] || [];
  if (!existing.includes(value)) {
    history[fieldKey] = [value, ...existing].slice(0, 10);
    localStorage.setItem(OE_HISTORY_KEY, JSON.stringify(history));
  }
};

const OEInputWithSuggestions = ({ fieldKey, value, placeholder, onChange }: {
  fieldKey: string; value: string; placeholder: string; onChange: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused) {
      const history = getOEHistory();
      const items = (history[fieldKey] || []).filter(
        (s) => !value || s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(items);
    }
  }, [focused, value, fieldKey]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setFocused(false);
        if (value) saveOEValue(fieldKey, value);
      }
    }, 150);
  }, [fieldKey, value]);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-7 text-xs border-0 shadow-none bg-transparent"
      />
      {focused && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-md mt-0.5 max-h-[120px] overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-2 py-1 text-xs hover:bg-accent transition-colors"
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setFocused(false); saveOEValue(fieldKey, s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InvestigationTab = ({ value, onChange, investigationList }: { value: string; onChange: (v: string) => void; investigationList: string[] }) => {
  const [customInv, setCustomInv] = useState("");

  // Parse current investigation string into array of items
  const currentItems = value
    ? value.split("\n").map((s) => s.replace(/^•\s*/, "").trim()).filter(Boolean)
    : [];

  const updateInvestigation = (items: string[]) => {
    onChange(items.map((item) => `• ${item}`).join("\n"));
  };

  const toggleItem = (item: string) => {
    if (currentItems.includes(item)) {
      updateInvestigation(currentItems.filter((i) => i !== item));
    } else {
      updateInvestigation([...currentItems, item]);
    }
  };

  const addCustom = () => {
    const trimmed = customInv.trim();
    if (trimmed && !currentItems.includes(trimmed)) {
      updateInvestigation([...currentItems, trimmed]);
      setCustomInv("");
    }
  };

  const removeItem = (item: string) => {
    updateInvestigation(currentItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      {/* Selected items as bullet chips */}
      {currentItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-accent/20 rounded-lg border border-border/50 min-h-[36px]">
          {currentItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary/20"
            >
              • {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom investigation input */}
      <div className="flex gap-1.5">
        <Input
          value={customInv}
          onChange={(e) => setCustomInv(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom investigation..."
          className="h-8 text-xs flex-1"
        />
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0" onClick={addCustom} disabled={!customInv.trim()}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {/* Common investigations checkboxes */}
      <div className="max-h-[280px] overflow-y-auto rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-0">
          {investigationList.map((inv, idx) => {
            const checked = currentItems.includes(inv);
            return (
              <label
                key={inv}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-accent/40 transition-colors border-b border-border/30 ${
                  idx % 2 === 0 ? "border-r border-border/30" : ""
                } ${checked ? "bg-primary/5 font-medium" : ""}`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleItem(inv)}
                  className="h-3.5 w-3.5"
                />
                <span className={checked ? "text-primary" : "text-foreground"}>{inv}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DrugHistoryMedicineSelector = ({ selectedMedicines, onChange }: { selectedMedicines: string[]; onChange: (meds: string[]) => void }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState("Tab");
  const { suggestions } = useMedicineSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const MEDICINE_TYPES = ["Tab", "Cap", "Syp", "Inj", "Drop", "Cream", "Oint", "Supp"];

  const addMedicine = (displayText: string) => {
    if (!selectedMedicines.includes(displayText)) {
      onChange([...selectedMedicines, displayText]);
    }
    setQuery("");
    setShowSuggestions(false);
  };

  const addFromSuggestion = (s: MedicineSuggestion) => {
    const text = `${s.detectedType}. ${s.name} ${s.strength}`;
    addMedicine(text);
  };

  const addManual = () => {
    const trimmed = query.trim();
    if (trimmed) {
      addMedicine(`${selectedType}. ${trimmed}`);
    }
  };

  const removeMedicine = (name: string) => {
    onChange(selectedMedicines.filter((m) => m !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addManual();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        <Pill className="w-3.5 h-3.5" /> Current / Previous Medicines
      </Label>

      {/* Selected medicines as bullet list */}
      {selectedMedicines.length > 0 && (
        <div className="p-2.5 bg-accent/20 rounded-lg border border-border/50 space-y-1">
          {selectedMedicines.map((med) => (
            <div key={med} className="flex items-center justify-between group">
              <span className="text-xs font-semibold text-primary">• {med}</span>
              <button type="button" onClick={() => removeMedicine(med)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Type selector + Search input */}
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-1.5">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-8 w-[80px] text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDICINE_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{t}.</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search medicine name & strength..."
            className="h-8 text-xs flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 shrink-0"
            onClick={addManual}
            disabled={!query.trim()}
          >
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 max-h-[200px] overflow-y-auto">
            {suggestions.map((s, i) => {
              const q = query.trim();
              const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const parts = q ? s.name.split(new RegExp(`(${escaped})`, "ig")) : [s.name];
              return (
                <button
                  key={`${s.name}-${s.strength}-${i}`}
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center justify-between border-b border-border/30 last:border-0"
                  onMouseDown={(e) => { e.preventDefault(); addFromSuggestion(s); }}
                >
                  <span>
                    <span className="font-bold text-primary">{s.detectedType}.</span>{" "}
                    <span className="font-medium">
                      {parts.map((p, pi) =>
                        q && p.toLowerCase() === q.toLowerCase()
                          ? <mark key={pi} className="bg-primary/20 text-primary font-bold rounded px-0.5">{p}</mark>
                          : <span key={pi}>{p}</span>
                      )}
                    </span>{" "}
                    <span className="text-muted-foreground">{s.strength}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">{s.generic}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const InvestigationResultsTab = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [newItem, setNewItem] = useState("");

  const currentItems = value
    ? value.split("\n").map((s) => s.replace(/^•\s*/, "").trim()).filter(Boolean)
    : [];

  const updateResults = (items: string[]) => {
    onChange(items.map((item) => `• ${item}`).join("\n"));
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (trimmed) {
      updateResults([...currentItems, trimmed]);
      setNewItem("");
    }
  };

  const removeItem = (idx: number) => {
    updateResults(currentItems.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* Display results as bullet points */}
      {currentItems.length > 0 && (
        <div className="p-3 bg-accent/20 rounded-lg border border-border/50 space-y-1.5">
          {currentItems.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between group gap-2">
              <span className="text-xs text-foreground leading-relaxed">• {item}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input to add new result */}
      <div className="flex gap-1.5">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder="e.g. HbA1c: 6.5%, CBC: Normal..."
          className="h-8 text-xs flex-1"
        />
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0" onClick={addItem} disabled={!newItem.trim()}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
    </div>
  );
};

// Parse DD-MM-YYYY into a Date (returns null if invalid)
const parseDMY = (v: string): Date | null => {
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(`${y}-${mo}-${d}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
};
const formatDMY = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${date.getFullYear()}`;
};

const ClinicalSection = ({ data, onChange, options }: Props) => {
  const pv = data.pvExamination || defaultPVExamination;
  const updatePV = (key: keyof PVExaminationData, value: string) => {
    onChange({ ...data, pvExamination: { ...pv, [key]: value } });
  };

  const updateOE = (key: keyof OnExaminationData, value: string) => {
    const next = { ...data.onExamination, [key]: value };
    // Auto-calculate EDD when LMP is valid DD-MM-YYYY (Naegele's rule: LMP + 280 days)
    if (key === "lmp") {
      const lmpDate = parseDMY(value);
      if (lmpDate) {
        const edd = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        next.edd = formatDMY(edd);
      }
    }
    onChange({ ...data, onExamination: next });
  };


  const oeFields: { key: keyof OnExaminationData; label: string; placeholder: string; type: "text" | "select" | "date" }[] = [
    { key: "bp", label: "BP", placeholder: "120/80", type: "text" },
    { key: "weight", label: "Weight", placeholder: "70 kg", type: "text" },
    { key: "temp", label: "Temp", placeholder: "99°F", type: "text" },
    { key: "pulse", label: "Pulse", placeholder: "80 bpm", type: "text" },
    { key: "heart", label: "Heart", placeholder: "Heart", type: "text" },
    { key: "lungs", label: "Lungs", placeholder: "Lungs", type: "text" },
    { key: "abd", label: "Abd", placeholder: "Soft", type: "text" },
    { key: "anaemia", label: "Anaemia", placeholder: "Absent", type: "select" },
    { key: "jaundice", label: "Jaundice", placeholder: "Absent", type: "select" },
    { key: "cyanosis", label: "Cyanosis", placeholder: "Absent", type: "select" },
    { key: "oedema", label: "Oedema", placeholder: "Absent", type: "select" },
    { key: "rr", label: "RR", placeholder: "RR", type: "text" },
    { key: "spo2", label: "SPO2", placeholder: "SPO2", type: "text" },
    { key: "lmp", label: "LMP", placeholder: "DD-MM-YYYY", type: "date" },
    { key: "edd", label: "EDD", placeholder: "DD-MM-YYYY", type: "date" },
    { key: "fm", label: "FM", placeholder: "Present/Absent", type: "select" },
    { key: "fhr", label: "FHR", placeholder: "FHR", type: "text" },
    { key: "gravida", label: "GRAVIDA", placeholder: "Primi", type: "text" },
    { key: "para", label: "PARA", placeholder: "Para", type: "text" },
  ];

  const pvFields: { key: keyof PVExaminationData; label: string; placeholder: string }[] = [
    { key: "vulvaVagina", label: "Vulva & Vagina", placeholder: "Findings..." },
    { key: "cervix", label: "Cervix", placeholder: "Findings..." },
    { key: "uterus", label: "Uterus", placeholder: "Size, position..." },
    { key: "adnexa", label: "Adnexa", placeholder: "Findings..." },
    { key: "cmt", label: "Cervical Motion Tenderness (CMT)", placeholder: "Present / Absent" },
    { key: "pod", label: "Pouch of Douglas (POD)", placeholder: "Findings..." },
  ];

  return (
    <div className="section-card p-5 sticky top-[60px]">
      <h3 className="section-header mb-4">
        <div className="section-header-icon flex items-center justify-center">
          <ClipboardList className="w-3.5 h-3.5" />
        </div>
        Clinical Notes
      </h3>

      <Tabs defaultValue="cc" className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-7 h-10 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="cc" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            C/C
          </TabsTrigger>
          <TabsTrigger value="oe" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            O/E
          </TabsTrigger>
          <TabsTrigger value="pv" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            P/V
          </TabsTrigger>
          <TabsTrigger value="dh" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            D/H
          </TabsTrigger>
          <TabsTrigger value="dx" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            D/X
          </TabsTrigger>
          <TabsTrigger value="inv" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            Inv
          </TabsTrigger>
          <TabsTrigger value="ix" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            IX
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cc" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Chief Complaint</Label>
          <Textarea
            value={data.chiefComplaint}
            onChange={(e) => onChange({ ...data, chiefComplaint: e.target.value })}
            placeholder="জ্বর, কাশি ৩ দিন যাবৎ..."
            className="text-sm min-h-[100px] resize-none"
          />
          {/* Quick suggestion chips */}
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Quick Add:</p>
            <div className="flex flex-wrap gap-1.5">
              {(options?.chiefComplaints?.length ? options.chiefComplaints : [
                "Fever", "Cough", "Cold", "Headache", "Body ache",
                "Sore throat", "Vomiting", "Diarrhoea", "Abdominal pain",
                "Chest pain", "Breathlessness", "Weakness", "Dizziness",
                "Burning micturition", "Skin rash", "Joint pain",
                "Back pain", "Loss of appetite", "Weight loss",
              ]).map((cc) => (
                <button
                  key={cc}
                  type="button"
                  onClick={() => {
                    const current = data.chiefComplaint.trim();
                    const separator = current ? ", " : "";
                    onChange({ ...data, chiefComplaint: current + separator + cc });
                  }}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-border bg-muted/40 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                >
                  + {cc}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="oe" className="mt-0 space-y-4">
          <div className="rounded-lg border border-border/70 overflow-hidden divide-y divide-border/40">
            {oeFields.map((f) => (
              <div key={f.key} className="flex items-center text-sm bg-card hover:bg-muted/30 transition-colors">
                <div className="w-[88px] px-2.5 py-1.5 font-semibold text-[11px] tracking-wide text-muted-foreground shrink-0">
                  {f.label}
                </div>
                <div className="flex-1 px-1.5 py-0.5">
                  {f.type === "select" ? (
                    <Select value={data.onExamination[f.key] || "Absent"} onValueChange={(v) => updateOE(f.key, v)}>
                      <SelectTrigger className="h-7 text-xs border-0 shadow-none bg-transparent focus:ring-0 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {presentAbsentOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "date" ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={data.onExamination[f.key]}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^\d-]/g, "");
                          const digits = v.replace(/-/g, "");
                          let formatted = digits.slice(0, 2);
                          if (digits.length >= 3) formatted += "-" + digits.slice(2, 4);
                          if (digits.length >= 5) formatted += "-" + digits.slice(4, 8);
                          updateOE(f.key, formatted);
                        }}
                        placeholder={f.placeholder}
                        className="h-7 text-xs border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary">
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={parseDMY(data.onExamination[f.key]) || undefined}
                            onSelect={(d) => d && updateOE(f.key, formatDMY(d))}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <OEInputWithSuggestions fieldKey={f.key} value={data.onExamination[f.key]} placeholder={f.placeholder} onChange={(v) => updateOE(f.key, v)} />
                  )}
                </div>
              </div>
            ))}
          </div>

        </TabsContent>

        <TabsContent value="pv" className="mt-0">
          <div className="rounded-lg border border-border/70 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border/50">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-foreground">PV Examination</p>
            </div>
            <div className="divide-y divide-border/40">
              {pvFields.map((f) => (
                <div key={f.key} className="flex items-start text-sm bg-card hover:bg-muted/30 transition-colors">
                  <div className="w-[160px] px-2.5 py-2 font-medium text-[11px] text-muted-foreground shrink-0 leading-tight">
                    {f.label}
                  </div>
                  <div className="flex-1 px-1.5 py-1">
                    <Input
                      value={pv[f.key]}
                      onChange={(e) => updatePV(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="h-7 text-xs border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dh" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Drug History</Label>
          <Textarea
            value={data.drugHistory}
            onChange={(e) => onChange({ ...data, drugHistory: e.target.value })}
            placeholder="রোগী আগে কী কী ওষুধ খেয়েছে / বর্তমানে কী চলছে..."
            className="text-sm min-h-[80px] resize-none mb-3"
          />

          {/* Medicine suggestions for D/H */}
          <DrugHistoryMedicineSelector
            selectedMedicines={data.drugHistoryMedicines || []}
            onChange={(meds) => onChange({ ...data, drugHistoryMedicines: meds })}
          />
        </TabsContent>

        <TabsContent value="dx" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Diagnosis</Label>
          <Textarea
            value={data.diagnosis}
            onChange={(e) => onChange({ ...data, diagnosis: e.target.value })}
            placeholder="Viral Fever"
            className="text-sm min-h-[140px] resize-none"
          />
        </TabsContent>

        <TabsContent value="ix" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Investigation Results (IX)</Label>
          <InvestigationResultsTab
            value={data.investigationResults || ""}
            onChange={(v) => onChange({ ...data, investigationResults: v })}
          />
        </TabsContent>
        <TabsContent value="inv" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Investigation</Label>
          <InvestigationTab
            value={data.investigation}
            onChange={(v) => onChange({ ...data, investigation: v })}
            investigationList={options?.investigations?.length ? options.investigations : COMMON_INVESTIGATIONS}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalSection;
