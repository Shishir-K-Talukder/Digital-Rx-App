import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PrintSettings } from "./PrintPreview";
import { SlidersHorizontal, Save, Check, ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const imageSettings = {
  logo: {
    label: "Logo PNG",
    url: "headerLogoUrl",
    path: "headerLogoPath",
    opacity: "headerLogoOpacity",
    width: "headerLogoWidth",
    height: "headerLogoHeight",
  },
  design: {
    label: "Header Design PNG",
    url: "headerDesignUrl",
    path: "headerDesignPath",
    opacity: "headerDesignOpacity",
    width: "headerDesignWidth",
    height: "headerDesignHeight",
  },
} as const;

type HeaderImageKind = keyof typeof imageSettings;

interface Props {
  settings: PrintSettings;
  onChange: (s: PrintSettings) => Promise<boolean> | boolean;
}

const PrintSetup = ({ settings, onChange }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [local, setLocal] = useState<PrintSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<HeaderImageKind | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const designInputRef = useRef<HTMLInputElement>(null);

  // Sync from parent when settings load from DB
  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const didSave = await Promise.resolve(onChange(local));

      if (didSave === false) {
        toast({ title: "Save failed", description: "Print settings could not be saved." });
        return;
      }

      const obsoletePaths = ([
        [settings.headerLogoPath, local.headerLogoPath],
        [settings.headerDesignPath, local.headerDesignPath],
      ] as const)
        .map(([oldPath, newPath]) => oldPath && oldPath !== newPath ? oldPath : null)
        .filter((path): path is string => !!path && !!user && path.startsWith(`${user.id}/print-header/`));
      if (obsoletePaths.length) {
        const { error } = await supabase.storage.from("profile-photos").remove(obsoletePaths);
        if (error) console.error("Could not remove previous print header image:", error.message);
      }

      setSaved(true);
      toast({ title: "Saved", description: "Print settings saved to database successfully." });
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save print settings:", error);
      toast({ title: "Save failed", description: "Print settings could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const handlePngUpload = async (kind: HeaderImageKind, file?: File) => {
    if (!file) return;
    if (file.type !== "image/png") {
      toast({ title: "PNG file required", description: "Choose a PNG image for print headers." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "Choose a PNG image smaller than 5 MB." });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in before uploading print images." });
      return;
    }

    setUploadingAsset(kind);
    try {
      const path = `${user.id}/print-header/${kind}-${Date.now()}-${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
        cacheControl: "3600",
        contentType: "image/png",
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      const fields = imageSettings[kind];
      setLocal((current) => ({
        ...current,
        [fields.url]: data.publicUrl,
        [fields.path]: path,
        [fields.opacity]: current[fields.opacity] || "100",
      }));
      toast({ title: "PNG uploaded", description: "Save Print Page Setup to use this image on prescriptions." });
    } catch (error) {
      console.error("Print PNG upload failed:", error);
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "The PNG could not be uploaded." });
    } finally {
      setUploadingAsset(null);
    }
  };

  const renderPngControls = (kind: HeaderImageKind) => {
    const fields = imageSettings[kind];
    const url = local[fields.url] || "";
    const opacity = local[fields.opacity] || "100";
    const width = local[fields.width] || (kind === "logo" ? "24" : "190");
    const height = local[fields.height] || (kind === "logo" ? "24" : "25");
    const inputRef = kind === "logo" ? logoInputRef : designInputRef;

    return (
      <div key={kind} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-semibold text-foreground">{fields.label}</Label>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="file"
              accept="image/png,.png"
              className="sr-only"
              onChange={(event) => {
                void handlePngUpload(kind, event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={uploadingAsset !== null} onClick={() => inputRef.current?.click()}>
              <ImagePlus className="w-3.5 h-3.5" />
              {uploadingAsset === kind ? "Uploading..." : "Upload PNG"}
            </Button>
            {url && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs"
                disabled={uploadingAsset !== null}
                onClick={() => setLocal((current) => ({ ...current, [fields.url]: "", [fields.path]: "" }))}
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            )}
          </div>
        </div>

        {url && (
          <div className="flex min-h-20 items-center justify-center rounded-md border border-border bg-muted/20 p-2">
            <img src={url} alt={`${fields.label} preview`} className="max-h-20 max-w-full object-contain" style={{ opacity: Math.min(100, Math.max(0, Number(opacity))) / 100 }} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Opacity (0 = transparent, 100 = solid)</Label>
            <Input
              value={opacity}
              onChange={(event) => setLocal({ ...local, [fields.opacity]: event.target.value })}
              className="h-9 text-xs"
              type="number"
              min={0}
              max={100}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input
              value={width}
              onChange={(event) => setLocal({ ...local, [fields.width]: event.target.value })}
              className="h-9 text-xs"
              type="number"
              min={kind === "logo" ? 10 : 40}
              max={kind === "logo" ? 80 : 240}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input
              value={height}
              onChange={(event) => setLocal({ ...local, [fields.height]: event.target.value })}
              className="h-9 text-xs"
              type="number"
              min={10}
              max={kind === "logo" ? 60 : 80}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Print Page Setup
        </h3>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving || uploadingAsset !== null} className="gap-1.5 h-8 text-xs">
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Page Size</Label>
          <Select value={local.pageSize} onValueChange={(v) => setLocal({ ...local, pageSize: v as PrintSettings["pageSize"] })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210×297mm)</SelectItem>
              <SelectItem value="A5">A5 (148×210mm)</SelectItem>
              <SelectItem value="Letter">Letter (216×279mm)</SelectItem>
              <SelectItem value="Custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {local.pageSize === "Custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
              <Input value={local.customWidth} onChange={(e) => setLocal({ ...local, customWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
              <Input value={local.customHeight} onChange={(e) => setLocal({ ...local, customHeight: e.target.value })} placeholder="297" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}

        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Header Size</Label>
          <Select value={local.headerSize} onValueChange={(v) => {
            if (v === "custom") {
              setLocal({ ...local, headerSize: "custom" as any, customHeaderHeight: local.customHeaderHeight || "80" });
            } else {
              setLocal({ ...local, headerSize: v as PrintSettings["headerSize"] });
            }
          }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {local.headerSize === "custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Height (mm)</Label>
              <Input value={local.customHeaderHeight || "25"} onChange={(e) => setLocal({ ...local, customHeaderHeight: e.target.value })} placeholder="25" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Width (mm)</Label>
              <Input value={local.customHeaderWidth || "210"} onChange={(e) => setLocal({ ...local, customHeaderWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Prescription Header PNG Setup</Label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderPngControls("logo")}
          {renderPngControls("design")}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Patient Information Box Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.patientInfoWidth || ""} onChange={(e) => setLocal({ ...local, patientInfoWidth: e.target.value })} placeholder="Full width (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.patientInfoHeight || ""} onChange={(e) => setLocal({ ...local, patientInfoHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Clinical Notes Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.clinicalNotesWidth || ""} onChange={(e) => setLocal({ ...local, clinicalNotesWidth: e.target.value })} placeholder="35% (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.clinicalNotesHeight || ""} onChange={(e) => setLocal({ ...local, clinicalNotesHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">℞ Prescription Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.rxSectionWidth || ""} onChange={(e) => setLocal({ ...local, rxSectionWidth: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.rxSectionHeight || ""} onChange={(e) => setLocal({ ...local, rxSectionHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Show / Hide Sections on Print</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { key: "showDoctorInfo", label: "Header Area", id: "show-doctor" },
            { key: "showDoctorText", label: "Doctor Info Text", id: "show-doctor-text" },
            { key: "showCC", label: "C/C", id: "show-cc" },
            { key: "showOE", label: "O/E", id: "show-oe" },
            { key: "showDiagnosis", label: "D/X", id: "show-dx" },
            { key: "showInvestigation", label: "Investigation", id: "show-inv" },
            { key: "showInvestigationResults", label: "IX Results", id: "show-ix-results" },
            { key: "showPatientId", label: "Patient ID", id: "show-patient-id" },
            { key: "showReferredBy", label: "Referred By", id: "show-referred-by" },
            { key: "showFooter", label: "Footer", id: "show-footer" },
          ].map(({ key, label, id }) => (
            <div key={key} className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2">
              <Switch checked={(local as any)[key]} onCheckedChange={(v) => setLocal({ ...local, [key]: v })} id={id} />
              <Label htmlFor={id} className="text-xs text-foreground cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Footer Customization</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Footer Height (mm)</Label>
            <Input value={local.footerHeight || ""} onChange={(e) => setLocal({ ...local, footerHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Footer Font Size (px)</Label>
            <Input value={local.footerFontSize || ""} onChange={(e) => setLocal({ ...local, footerFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label className="text-[11px] text-muted-foreground mb-1 block">Custom Footer Text</Label>
            <textarea
              value={local.footerText || ""}
              onChange={(e) => setLocal({ ...local, footerText: e.target.value })}
              placeholder="Leave empty to hide footer content"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Section Text Sizes (px)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Patient Info Font Size</Label>
            <Input value={local.patientInfoFontSize || ""} onChange={(e) => setLocal({ ...local, patientInfoFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Clinical Notes Font Size</Label>
            <Input value={local.clinicalNotesFontSize || ""} onChange={(e) => setLocal({ ...local, clinicalNotesFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Prescription (℞) Font Size</Label>
            <Input value={local.prescriptionFontSize || ""} onChange={(e) => setLocal({ ...local, prescriptionFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">
          Write-Rx UI Text Size (for older doctors / better readability)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Dropdown / Select Font Size (px)</Label>
            <Input
              value={local.uiDropdownFontSize || ""}
              onChange={(e) => setLocal({ ...local, uiDropdownFontSize: e.target.value })}
              placeholder="14 (default) — try 16, 18, 20"
              className="h-9 text-xs"
              type="number"
              min={12}
              max={28}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Controls the size of advice & follow-up dropdown options on the Write Rx page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSetup;
