import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Baby, User, Search } from "lucide-react";
import { toast } from "sonner";
import MedexLookup, { MedexResult } from "./MedexLookup";

// Use as any until generated types include the new tables
const db = supabase as any;

interface PediRule {
  id: string; name: string; generic: string; category: string;
  strength: string; frequency: string; daily_dose: string;
  drop_ratio: number | null; notes: string;
}
interface AdultRule {
  id: string; name: string; generic: string; kind: string;
  dose: string; mg_per_kg: number | null; frequency: string;
  route: string; max_daily: string; notes: string;
}

const PED_CATEGORIES = ["8kg/tsf", "10kg/half", "10kg/tsf", "drop/kg"];
const FREQUENCIES = ["OD", "BD", "TDS", "QDS", "BD/TDS", "TDS/QDS"];

const PediatricRulesManager = () => {
  const [rules, setRules] = useState<PediRule[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", generic: "", category: "8kg/tsf", strength: "", frequency: "TDS", daily_dose: "", drop_ratio: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await db.from("pediatric_dose_rules").select("*").order("name");
    setRules((data as PediRule[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setLoading(true);
    const { error } = await db.from("pediatric_dose_rules").insert({
      name: form.name.trim(), generic: form.generic.trim(), category: form.category,
      strength: form.strength.trim(), frequency: form.frequency, daily_dose: form.daily_dose.trim(),
      drop_ratio: form.drop_ratio ? parseFloat(form.drop_ratio) : null, notes: form.notes.trim(),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added"); setForm({ name: "", generic: "", category: "8kg/tsf", strength: "", frequency: "TDS", daily_dose: "", drop_ratio: "", notes: "" });
    load();
  };

  const del = async (id: string) => {
    await db.from("pediatric_dose_rules").delete().eq("id", id);
    setRules(r => r.filter(x => x.id !== id));
    toast.success("Deleted");
  };

  const filtered = rules.filter(r => `${r.name} ${r.generic}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Baby className="w-4 h-4 text-primary" /> Pediatric Dose Rules ({rules.length})</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <MedexLookup kind="pediatric" onPick={(r: MedexResult) => setForm(f => ({
          ...f,
          name: r.brand || f.name,
          generic: r.generic || f.generic,
          strength: r.strength || f.strength,
          notes: (r.pediatric || r.dose || "").slice(0, 500),
        }))} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-lg border bg-muted/30">
          <Input placeholder="Brand name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-9 text-xs" />
          <Input placeholder="Generic name" value={form.generic} onChange={e => setForm({ ...form, generic: e.target.value })} className="h-9 text-xs" />
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PED_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Strength (e.g. 120 mg/tsf)" value={form.strength} onChange={e => setForm({ ...form, strength: e.target.value })} className="h-9 text-xs" />
          <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Daily dose ref" value={form.daily_dose} onChange={e => setForm({ ...form, daily_dose: e.target.value })} className="h-9 text-xs" />
          {form.category === "drop/kg" && <Input placeholder="Drop ratio (drops/kg)" type="number" value={form.drop_ratio} onChange={e => setForm({ ...form, drop_ratio: e.target.value })} className="h-9 text-xs" />}
          <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="h-9 text-xs" />
          <Button onClick={add} disabled={loading} className="h-9 gap-1 col-span-2 md:col-span-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>

        <ScrollArea className="max-h-[50vh]">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Generic</TableHead>
              <TableHead className="text-xs">Category</TableHead><TableHead className="text-xs">Strength</TableHead>
              <TableHead className="text-xs">Freq</TableHead><TableHead className="text-xs">Daily</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium">{r.name}</TableCell>
                  <TableCell className="text-xs">{r.generic}</TableCell>
                  <TableCell className="text-xs">{r.category}{r.drop_ratio ? ` (${r.drop_ratio}/kg)` : ""}</TableCell>
                  <TableCell className="text-xs">{r.strength}</TableCell>
                  <TableCell className="text-xs">{r.frequency}</TableCell>
                  <TableCell className="text-xs">{r.daily_dose}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-6">No rules yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const AdultRulesManager = () => {
  const [rules, setRules] = useState<AdultRule[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", generic: "", kind: "fixed", dose: "", mg_per_kg: "", frequency: "OD", route: "PO", max_daily: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await db.from("adult_dose_rules").select("*").order("name");
    setRules((data as AdultRule[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setLoading(true);
    const { error } = await db.from("adult_dose_rules").insert({
      name: form.name.trim(), generic: form.generic.trim(), kind: form.kind,
      dose: form.dose.trim(), mg_per_kg: form.mg_per_kg ? parseFloat(form.mg_per_kg) : null,
      frequency: form.frequency, route: form.route, max_daily: form.max_daily.trim(), notes: form.notes.trim(),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Added"); setForm({ name: "", generic: "", kind: "fixed", dose: "", mg_per_kg: "", frequency: "OD", route: "PO", max_daily: "", notes: "" });
    load();
  };

  const del = async (id: string) => {
    await db.from("adult_dose_rules").delete().eq("id", id);
    setRules(r => r.filter(x => x.id !== id));
    toast.success("Deleted");
  };

  const filtered = rules.filter(r => `${r.name} ${r.generic}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Adult Dose Rules ({rules.length})</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <MedexLookup kind="adult" onPick={(r: MedexResult) => setForm(f => ({
          ...f,
          name: r.brand || f.name,
          generic: r.generic || f.generic,
          notes: (r.dose || "").slice(0, 500),
        }))} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-lg border bg-muted/30">
          <Input placeholder="Brand name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-9 text-xs" />
          <Input placeholder="Generic name" value={form.generic} onChange={e => setForm({ ...form, generic: e.target.value })} className="h-9 text-xs" />
          <Select value={form.kind} onValueChange={v => setForm({ ...form, kind: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="fixed">Fixed dose</SelectItem><SelectItem value="mg/kg">mg/kg</SelectItem></SelectContent>
          </Select>
          <Input placeholder={form.kind === "mg/kg" ? "Dose label (e.g. 15 mg/kg)" : "Dose (e.g. 500 mg)"} value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} className="h-9 text-xs" />
          {form.kind === "mg/kg" && <Input placeholder="mg/kg (number)" type="number" step="0.1" value={form.mg_per_kg} onChange={e => setForm({ ...form, mg_per_kg: e.target.value })} className="h-9 text-xs" />}
          <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.route} onValueChange={v => setForm({ ...form, route: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{["PO", "IV", "IM", "SC", "PO/IV"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Max daily" value={form.max_daily} onChange={e => setForm({ ...form, max_daily: e.target.value })} className="h-9 text-xs" />
          <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="h-9 text-xs" />
          <Button onClick={add} disabled={loading} className="h-9 gap-1 col-span-2 md:col-span-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>

        <ScrollArea className="max-h-[50vh]">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Generic</TableHead>
              <TableHead className="text-xs">Kind</TableHead><TableHead className="text-xs">Dose</TableHead>
              <TableHead className="text-xs">Freq</TableHead><TableHead className="text-xs">Route</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium">{r.name}</TableCell>
                  <TableCell className="text-xs">{r.generic}</TableCell>
                  <TableCell className="text-xs">{r.kind}{r.mg_per_kg ? ` (${r.mg_per_kg})` : ""}</TableCell>
                  <TableCell className="text-xs">{r.dose}</TableCell>
                  <TableCell className="text-xs">{r.frequency}</TableCell>
                  <TableCell className="text-xs">{r.route}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-6">No rules yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const DoseRulesManager = () => (
  <div className="space-y-6">
    <PediatricRulesManager />
    <AdultRulesManager />
  </div>
);

export default DoseRulesManager;
