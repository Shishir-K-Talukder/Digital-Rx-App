import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookTemplate, Trash2, Pencil, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useTreatmentTemplates, TreatmentTemplate } from "@/hooks/useTreatmentTemplates";

const TreatmentTemplateManager = () => {
  const { templates, loading, updateTemplate, deleteTemplate } = useTreatmentTemplates();
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startEdit = (t: TreatmentTemplate) => {
    setEditId(t.id);
    setEditName(t.name);
  };

  const saveEdit = (t: TreatmentTemplate) => {
    if (editName.trim()) {
      updateTemplate(t.id, editName.trim(), t.medicines);
    }
    setEditId(null);
  };

  if (loading) return <p className="text-sm text-muted-foreground py-4">Loading templates...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookTemplate className="w-5 h-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Treatment Templates</h4>
        <span className="text-sm text-muted-foreground ml-auto">{templates.length} templates</span>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No templates yet. Go to Rx Write page, add medicines, then click "Save Template".
        </p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {templates.map((t) => (
            <div key={t.id} className="bg-muted/40 rounded-xl border-2 border-transparent hover:border-border transition-all">
              <div className="flex items-center gap-3 px-4 py-3">
                {editId === t.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && saveEdit(t)} autoFocus />
                    <Button size="icon" variant="default" className="h-10 w-10 shrink-0" onClick={() => saveEdit(t)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10 shrink-0" onClick={() => setEditId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 text-left min-w-0" onClick={() => toggleExpand(t.id)}>
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.medicines.length} medicine{t.medicines.length !== 1 ? "s" : ""}</p>
                    </button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => toggleExpand(t.id)}>
                      {expanded.has(t.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => startEdit(t)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10" onClick={() => deleteTemplate(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
              {expanded.has(t.id) && (
                <div className="px-4 pb-3 border-t border-border/50">
                  {t.medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-border/20 last:border-0">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                      <span className="font-medium text-foreground flex-1 truncate">{med.name || "—"}</span>
                      <span className="text-muted-foreground">{med.dose}</span>
                      <span className="text-muted-foreground">{med.duration}</span>
                      <span className="text-muted-foreground">{med.mealTiming}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentTemplateManager;
