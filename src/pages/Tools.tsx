import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import FloatingNav from "@/components/FloatingNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, CalendarHeart, Scale, Pill, User, Activity, Syringe, Heart, Shield } from "lucide-react";
import { PEDIATRIC_DRUGS, calculateDose, type PediatricDrug } from "@/lib/pediatricDrugs";
import { ADULT_DRUGS, calculateAdultDose, type AdultDrug } from "@/lib/adultDrugs";
import { addDays, differenceInDays, format, parseISO } from "date-fns";

/* -------------------- EDD Calculator -------------------- */
const EDDCalculator = () => {
  const [lmp, setLmp] = useState("");
  const result = useMemo(() => {
    if (!lmp) return null;
    try {
      const d = parseISO(lmp);
      const edd = addDays(d, 280);
      const today = new Date();
      const days = differenceInDays(today, d);
      const weeks = Math.floor(days / 7);
      const remDays = days - weeks * 7;
      return {
        edd: format(edd, "dd-MM-yyyy"),
        ga: days >= 0 && days <= 300 ? `${weeks} weeks ${remDays} days` : "—",
        daysLeft: differenceInDays(edd, today),
      };
    } catch { return null; }
  }, [lmp]);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarHeart className="w-4 h-4 text-primary" /> EDD Calculator (Naegele's rule)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">First day of LMP</Label>
          <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-9" />
        </div>
        {result && (
          <div className="rounded-lg border bg-accent/30 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">EDD</span><span className="font-bold text-primary">{result.edd}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gestational age</span><span className="font-semibold">{result.ga}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Days to EDD</span><span className="font-semibold">{result.daysLeft}</span></div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">EDD = LMP + 280 days (40 weeks).</p>
      </CardContent>
    </Card>
  );
};

/* -------------------- Ovulation Calculator -------------------- */
const OvulationCalculator = () => {
  const [lmp, setLmp] = useState("");
  const [cycle, setCycle] = useState("28");

  const result = useMemo(() => {
    if (!lmp) return null;
    try {
      const d = parseISO(lmp);
      const c = parseInt(cycle) || 28;
      const ovDay = addDays(d, c - 14);
      const fertileStart = addDays(ovDay, -5);
      const fertileEnd = addDays(ovDay, 1);
      const nextPeriod = addDays(d, c);
      return {
        ovulation: format(ovDay, "dd-MM-yyyy"),
        fertileWindow: `${format(fertileStart, "dd MMM")} – ${format(fertileEnd, "dd MMM yyyy")}`,
        nextPeriod: format(nextPeriod, "dd-MM-yyyy"),
      };
    } catch { return null; }
  }, [lmp, cycle]);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Heart className="w-4 h-4 text-primary" /> Ovulation Date Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">First day of LMP</Label>
            <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Cycle length (days)</Label>
            <Input type="number" value={cycle} onChange={(e) => setCycle(e.target.value)} className="h-9" placeholder="28" />
          </div>
        </div>
        {result && (
          <div className="rounded-lg border bg-accent/30 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Ovulation date</span><span className="font-bold text-primary">{result.ovulation}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fertile window</span><span className="font-semibold text-xs">{result.fertileWindow}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Next period</span><span className="font-semibold">{result.nextPeriod}</span></div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">Ovulation ≈ LMP + (cycle − 14 days). Fertile window: 5 days before to 1 day after.</p>
      </CardContent>
    </Card>
  );
};

/* -------------------- BMI / Weight Chart -------------------- */
const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  const bmi = useMemo(() => {
    const w = parseFloat(weight), h = parseFloat(height) / 100;
    if (!w || !h) return null;
    const val = w / (h * h);
    let cat = "";
    if (val < 18.5) cat = "Underweight";
    else if (val < 25) cat = "Normal";
    else if (val < 30) cat = "Overweight";
    else cat = "Obese";
    return { val: val.toFixed(1), cat };
  }, [weight, height]);

  const peds = useMemo(() => {
    const a = parseFloat(age);
    if (!a || a < 1 || a > 12) return null;
    return { wt: (2 * a + 8).toFixed(1), ht: (6 * a + 77).toFixed(0) };
  }, [age]);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Scale className="w-4 h-4 text-primary" /> BMI & Pediatric Weight</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" /></div>
          <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-9" /></div>
        </div>
        {bmi && (
          <div className="rounded-lg border bg-accent/30 p-3 text-sm flex justify-between">
            <span className="text-muted-foreground">BMI</span>
            <span className="font-bold text-primary">{bmi.val} kg/m² <span className="text-xs text-muted-foreground ml-1">({bmi.cat})</span></span>
          </div>
        )}
        <div className="pt-2 border-t">
          <Label className="text-xs">Child Age (1–12 yr) – Expected values</Label>
          <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" placeholder="years" />
          {peds && (
            <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Weight</span><span className="font-semibold">{peds.wt} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Height</span><span className="font-semibold">{peds.ht} cm</span></div>
              <p className="text-[10px] text-muted-foreground italic">Wt = 2×age+8 kg • Ht = 6×age+77 cm</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* -------------------- Pediatric Dose Calculator -------------------- */
const PediatricDose = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PediatricDrug | null>(null);
  const [weight, setWeight] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return PEDIATRIC_DRUGS.filter((d) => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  const result = selected && weight ? calculateDose(selected, parseFloat(weight)) : null;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Baby className="w-4 h-4 text-primary" /> Pediatric Dose Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Label className="text-xs">Medicine / Generic Name</Label>
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="e.g. Paracetamol, Amoxicillin..." className="h-9" />
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((d, i) => (
                <button key={i} type="button" className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-0 text-xs"
                  onMouseDown={(e) => { e.preventDefault(); setSelected(d); setQuery(d.name); setOpen(false); }}>
                  <div className="font-medium text-foreground">{d.name} <span className="text-muted-foreground">• {d.strength}</span></div>
                  <div className="text-[10px] text-muted-foreground">{d.generic} • {d.frequency}{d.dailyDose ? ` • ${d.dailyDose}` : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div><Label className="text-xs">Baby Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" placeholder="e.g. 8" /></div>
        {selected && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Strength</span><span className="font-semibold">{selected.strength}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Std dose</span><span className="font-semibold">{selected.dailyDose || "—"}</span></div>
          </div>
        )}
        {result && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Prescription Dose</p>
            <p className="text-2xl font-bold text-primary">{result.prescription}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{result.details}</p>
            {selected?.notes && <p className="text-[11px] text-foreground mt-1 italic">{selected.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* -------------------- Adult Dose Calculator -------------------- */
const AdultDose = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdultDrug | null>(null);
  const [weight, setWeight] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return ADULT_DRUGS.filter((d) => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q)).slice(0, 15);
  }, [query]);

  const result = selected ? calculateAdultDose(selected, weight ? parseFloat(weight) : undefined) : null;
  const needsWeight = selected?.kind === "mg/kg";

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4 text-primary" /> Adult Dose Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Label className="text-xs">Medicine / Generic Name</Label>
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="e.g. Paracetamol, Amoxicillin..." className="h-9" />
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((d, i) => (
                <button key={i} type="button" className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-0 text-xs"
                  onMouseDown={(e) => { e.preventDefault(); setSelected(d); setQuery(d.name); setOpen(false); }}>
                  <div className="font-medium text-foreground">{d.name} <span className="text-muted-foreground">• {d.dose}</span></div>
                  <div className="text-[10px] text-muted-foreground">{d.generic} • {d.frequency}{d.route ? ` • ${d.route}` : ""}{d.kind === "mg/kg" ? " • mg/kg" : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {needsWeight && (
          <div><Label className="text-xs">Patient Weight (kg) <span className="text-primary">— required</span></Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" placeholder="kg" /></div>
        )}
        {selected && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Standard</span><span className="font-semibold">{selected.dose} {selected.frequency}</span></div>
            {selected.maxDaily && <div className="flex justify-between"><span className="text-muted-foreground">Max</span><span className="font-semibold">{selected.maxDaily}</span></div>}
          </div>
        )}
        {result && (!needsWeight || weight) && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Prescription Dose</p>
            <p className="text-2xl font-bold text-primary">{result.prescription}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{result.details}</p>
            {selected?.notes && <p className="text-[11px] text-foreground mt-1 italic">{selected.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* -------------------- GFR Calculator (Cockcroft-Gault + CKD-EPI) -------------------- */
const GFRCalculator = () => {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [creatinine, setCreatinine] = useState(""); // mg/dL
  const [sex, setSex] = useState<"male" | "female">("male");
  const [race, setRace] = useState<"other" | "black">("other");

  const result = useMemo(() => {
    const a = parseFloat(age), w = parseFloat(weight), s = parseFloat(creatinine);
    if (!a || !w || !s) return null;
    // Cockcroft-Gault: CrCl = ((140-age) × weight) / (72 × Scr) × (0.85 if female)
    const cg = ((140 - a) * w) / (72 * s) * (sex === "female" ? 0.85 : 1);

    // CKD-EPI 2009 (simplified):
    const k = sex === "female" ? 0.7 : 0.9;
    const alpha = sex === "female" ? -0.329 : -0.411;
    const minScrK = Math.min(s / k, 1);
    const maxScrK = Math.max(s / k, 1);
    let ckdepi = 141 * Math.pow(minScrK, alpha) * Math.pow(maxScrK, -1.209) * Math.pow(0.993, a);
    if (sex === "female") ckdepi *= 1.018;
    if (race === "black") ckdepi *= 1.159;

    const stage = (g: number) => {
      if (g >= 90) return "G1 — Normal";
      if (g >= 60) return "G2 — Mildly decreased";
      if (g >= 45) return "G3a — Mild–moderate";
      if (g >= 30) return "G3b — Moderate–severe";
      if (g >= 15) return "G4 — Severely decreased";
      return "G5 — Kidney failure";
    };
    return { cg: cg.toFixed(1), ckdepi: ckdepi.toFixed(1), stage: stage(ckdepi) };
  }, [age, weight, creatinine, sex, race]);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="w-4 h-4 text-primary" /> GFR / Creatinine Clearance</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Age (yr)</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" /></div>
          <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" /></div>
          <div><Label className="text-xs">Serum Creatinine (mg/dL)</Label><Input type="number" step="0.01" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} className="h-9" placeholder="e.g. 1.1" /></div>
          <div>
            <Label className="text-xs">Sex</Label>
            <Select value={sex} onValueChange={(v) => setSex(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Race</Label>
            <Select value={race} onValueChange={(v) => setRace(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="other">Other</SelectItem><SelectItem value="black">Black / African</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        {result && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">CrCl (Cockcroft-Gault)</span><span className="font-bold text-primary">{result.cg} mL/min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">eGFR (CKD-EPI)</span><span className="font-bold text-primary">{result.ckdepi} mL/min/1.73m²</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">CKD Stage</span><span className="font-semibold">{result.stage}</span></div>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground italic">Cockcroft-Gault: ((140−age)×wt)/(72×Scr) × 0.85♀ • CKD-EPI 2009 formula.</p>
      </CardContent>
    </Card>
  );
};

/* -------------------- Insulin Calculator -------------------- */
const InsulinCalc = () => {
  const [weight, setWeight] = useState("");
  const [type, setType] = useState<"type1" | "type2">("type2");
  const [sensitivity, setSensitivity] = useState<"normal" | "sensitive" | "resistant">("normal");

  const w = parseFloat(weight) || 0;
  const mult = type === "type1"
    ? (sensitivity === "sensitive" ? 0.3 : sensitivity === "resistant" ? 0.6 : 0.5)
    : (sensitivity === "sensitive" ? 0.3 : sensitivity === "resistant" ? 0.7 : 0.5);
  const tdd = w > 0 ? Math.round(w * mult * 10) / 10 : 0;
  const basal = Math.round(tdd * 0.5 * 10) / 10;
  const bolus = Math.round(tdd * 0.5 * 10) / 10;
  const perMeal = Math.round((bolus / 3) * 10) / 10;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Syringe className="w-4 h-4 text-primary" /> Insulin Dose Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" /></div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="type1">Type 1</SelectItem><SelectItem value="type2">Type 2</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Sensitivity</Label>
            <Select value={sensitivity} onValueChange={(v) => setSensitivity(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="sensitive">Sensitive</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="resistant">Resistant</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        {w > 0 && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Daily Dose</span><span className="font-bold text-primary">{tdd} units</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Basal (50%)</span><span className="font-semibold">{basal} units</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bolus (50%)</span><span className="font-semibold">{bolus} units</span></div>
            <div className="flex justify-between border-t pt-1.5"><span className="text-muted-foreground">Per meal (÷3)</span><span className="font-bold text-primary">{perMeal} units</span></div>
            <p className="text-[10px] text-muted-foreground italic pt-1">TDD = Weight × {mult} U/kg ({sensitivity})</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* -------------------- Rabies Vaccine Schedule -------------------- */
const RabiesSchedule = () => {
  const [day0, setDay0] = useState("");
  const [regimen, setRegimen] = useState<"im" | "multisite">("im");

  const schedule = useMemo(() => {
    if (!day0) return null;
    try {
      const start = parseISO(day0);
      const today = new Date();
      const days = regimen === "im" ? [0, 3, 7, 14, 28] : [0, 7, 21];
      return days.map((d) => {
        const date = addDays(start, d);
        const diff = differenceInDays(date, today);
        const status = diff < 0 ? "Done" : diff === 0 ? "Today" : `In ${diff} day${diff === 1 ? "" : "s"}`;
        const dose =
          regimen === "im"
            ? "1 injection × 1 ml IM"
            : d === 0
            ? "2 injections × 1 ml (separate sites)"
            : "1 injection × 1 ml";
        return { d, date: format(date, "EEE, dd MMM yyyy"), status, dose, past: diff < 0, todayFlag: diff === 0 };
      });
    } catch { return null; }
  }, [day0, regimen]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-primary" /> Rabies Vaccine Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Day 0 (1st dose date)</Label>
            <Input type="date" value={day0} onChange={(e) => setDay0(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Regimen</Label>
            <Select value={regimen} onValueChange={(v) => setRegimen(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="im">Standard IM (1-1-1-1-1)</SelectItem>
                <SelectItem value="multisite">Abbreviated multisite (2-1-1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {schedule && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 overflow-hidden">
            <div className="px-3 py-2 bg-primary/10 text-xs font-semibold text-primary">
              {regimen === "im" ? "Standard IM regimen (1-1-1-1-1)" : "Abbreviated multisite regimen (2-1-1)"}
            </div>
            <div className="divide-y">
              {schedule.map((s) => (
                <div
                  key={s.d}
                  className={`flex items-center justify-between px-3 py-2 text-sm ${
                    s.todayFlag ? "bg-primary/10" : s.past ? "opacity-60" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold">Day {s.d} <span className="text-xs text-muted-foreground">• {s.date}</span></div>
                    <div className="text-[11px] text-muted-foreground">{s.dose}</div>
                  </div>
                  <span className={`text-xs font-bold ${s.todayFlag ? "text-primary" : s.past ? "text-muted-foreground" : "text-foreground"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground italic">
          Post-exposure prophylaxis (PEP). Add RIG for Category III exposures. Follow WHO guidelines.
        </p>
      </CardContent>
    </Card>
  );
};

/* -------------------- Page -------------------- */
const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clinical Calculators — Digital Rx Tools</title>
        <meta name="description" content="Quick pediatric & adult dose, GFR, BMI, EDD, ovulation, and insulin calculators for daily clinical practice." />
        <link rel="canonical" href="https://digital-prescription-app.lovable.app/tools" />
        <meta property="og:title" content="Clinical Calculators — Digital Rx Tools" />
        <meta property="og:description" content="Dose, GFR, BMI, EDD, ovulation, and insulin calculators built for daily practice." />
        <meta property="og:url" content="https://digital-prescription-app.lovable.app/tools" />
        <meta property="og:type" content="website" />
      </Helmet>
      <FloatingNav />
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Pill className="w-6 h-6 text-primary" /> Clinical Tools</h1>
          <p className="text-sm text-muted-foreground">Quick calculators for daily practice.</p>
        </div>
        <Tabs defaultValue="pedidose" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 justify-start">
            <TabsTrigger value="pedidose" className="text-xs">Pediatric Dose</TabsTrigger>
            <TabsTrigger value="adultdose" className="text-xs">Adult Dose</TabsTrigger>
            <TabsTrigger value="gfr" className="text-xs">GFR</TabsTrigger>
            <TabsTrigger value="insulin" className="text-xs">Insulin</TabsTrigger>
            <TabsTrigger value="rabies" className="text-xs">Rabies</TabsTrigger>
            <TabsTrigger value="edd" className="text-xs">EDD</TabsTrigger>
            <TabsTrigger value="ovulation" className="text-xs">Ovulation</TabsTrigger>
            <TabsTrigger value="bmi" className="text-xs">BMI</TabsTrigger>
          </TabsList>
          <TabsContent value="pedidose"><PediatricDose /></TabsContent>
          <TabsContent value="adultdose"><AdultDose /></TabsContent>
          <TabsContent value="gfr"><GFRCalculator /></TabsContent>
          <TabsContent value="insulin"><InsulinCalc /></TabsContent>
          <TabsContent value="rabies"><RabiesSchedule /></TabsContent>
          <TabsContent value="edd"><EDDCalculator /></TabsContent>
          <TabsContent value="ovulation"><OvulationCalculator /></TabsContent>
          <TabsContent value="bmi"><BMICalculator /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Tools;
