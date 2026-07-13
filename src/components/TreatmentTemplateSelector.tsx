import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookTemplate, Plus, Trash2, Save, Pencil, Check, X, FileDown } from "lucide-react";
import { Medicine } from "@/components/MedicineSection";
import { useTreatmentTemplates, TreatmentTemplate } from "@/hooks/useTreatmentTemplates";

interface Props {
  medicines: Medicine[];
  onApplyTemplate: (medicines: Medicine[]) => void;
}

const TreatmentTemplateSelector = ({ medicines, onApplyTemplate }: Props) => {
  const { templates, loading, saveTemplate, updateTemplate, deleteTemplate } = useTreatmentTemplates();
  const [saveOpen, setSaveOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);

  const handleSave = () => {
    if (!templateName.trim() || medicines.length === 0) return;
    saveTemplate(templateName.trim(), medicines);
    setTemplateName("");
    setSaveOpen(false);
  };

  const handleApply = (template: TreatmentTemplate) => {
    // Assign new IDs to avoid conflicts
    const newMedicines = template.medicines.map((m) => ({
      ...m,
      id: crypto.randomUUID(),
      taperingDoses: m.taperingDoses?.map((td) => ({ ...td, id: crypto.randomUUID() })) || [],
    }));
    onApplyTemplate(newMedicines);
    setBrowseOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Browse & Apply Templates */}
      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <BookTemplate className="w-3.5 h-3.5" /> Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookTemplate className="w-5 h-5 text-primary" /> Treatment Templates
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No templates saved yet. Save current medicines as a template first.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2.5 border border-transparent hover:border-border transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.medicines.length} medicine{t.medicines.length !== 1 ? "s" : ""}</p>
                  </div>
                  <Button size="sm" variant="default" className="h-7 text-[11px] gap-1 shrink-0" onClick={() => handleApply(t)}>
                    <FileDown className="w-3 h-3" /> Apply
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteTemplate(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Current as Template */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" disabled={medicines.length === 0}>
            <Save className="w-3.5 h-3.5" /> Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save as Treatment Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g. Fever Treatment)"
              className="h-10"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This will save {medicines.length} medicine{medicines.length !== 1 ? "s" : ""} with all dose, duration, meal & instruction details.
            </p>
            <Button onClick={handleSave} disabled={!templateName.trim()} className="w-full gap-2">
              <Save className="w-4 h-4" /> Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentTemplateSelector;
