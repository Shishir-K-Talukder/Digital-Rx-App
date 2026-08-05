import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Loader2, RefreshCw } from "lucide-react";

export interface GenericInfo {
  found: boolean;
  sourceUrl?: string;
  generic?: string;
  indications?: string;
  dosage?: string;
  sideEffects?: string;
  contraindications?: string;
  precautions?: string;
  interaction?: string;
  pediatricUses?: string;
  pregnancy?: string;
  overdose?: string;
  modeOfAction?: string;
  drugClass?: string;
  error?: string;
}

const cache = new Map<string, GenericInfo>();

const Section = ({ title, body }: { title: string; body?: string }) => {
  if (!body) return null;
  return (
    <div className="border-t border-border/60 pt-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{title}</p>
      <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{body}</p>
    </div>
  );
};

interface Props {
  generic?: string;
  variant?: "pediatric" | "adult";
}

const GenericInfoPanel = ({ generic, variant = "adult" }: Props) => {
  const key = (generic || "").trim();
  const [info, setInfo] = useState<GenericInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = async (force = false) => {
    if (key.length < 3) return;
    if (!force && cache.has(key.toLowerCase())) {
      setInfo(cache.get(key.toLowerCase())!);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-medex-generic", { body: { query: key } });
      if (error) throw error;
      cache.set(key.toLowerCase(), data as GenericInfo);
      setInfo(data as GenericInfo);
    } catch {
      setInfo({ found: false, error: "Could not load info from medex.com.bd" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInfo(null);
    setExpanded(false);
    if (key.length < 3) return;
    const timer = setTimeout(() => load(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key.length < 3) return null;

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          Generic Info — {info?.generic || key}
        </div>
        <div className="flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => load(true)} disabled={loading}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {loading && !info && <p className="text-[11px] text-muted-foreground">Fetching from medex.com.bd…</p>}

      {info && !info.found && (
        <p className="text-[11px] text-muted-foreground">{info.error || "No generic info found on medex.com.bd"}</p>
      )}

      {info?.found && (
        <div className={`space-y-1.5 ${expanded ? "" : "max-h-56 overflow-hidden"}`}>
          <Section title="Indications" body={info.indications} />
          <Section title="Side Effects" body={info.sideEffects} />
          {expanded && (
            <>
              <Section title={variant === "pediatric" ? "Pediatric Dose / Use" : "Dosage"} body={variant === "pediatric" ? info.pediatricUses || info.dosage : info.dosage} />
              <Section title="Contraindications" body={info.contraindications} />
              <Section title="Precautions" body={info.precautions} />
              <Section title="Drug Interaction" body={info.interaction} />
              <Section title="Pregnancy & Lactation" body={info.pregnancy} />
              <Section title="Overdose Effects" body={info.overdose} />
              <Section title="Mode of Action" body={info.modeOfAction} />
              <Section title="Drug Class" body={info.drugClass} />
            </>
          )}
        </div>
      )}

      {info?.found && (
        <div className="flex items-center justify-between pt-1">
          <a href={info.sourceUrl} target="_blank" rel="noopener" className="text-[10px] text-primary flex items-center gap-1 hover:underline">
            View on medex <ExternalLink className="w-3 h-3" />
          </a>
          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show less" : "Show full details"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GenericInfoPanel;
