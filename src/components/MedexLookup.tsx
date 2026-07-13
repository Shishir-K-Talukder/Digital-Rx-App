import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MedexResult {
  found: boolean;
  sourceUrl?: string;
  brand?: string;
  generic?: string;
  strength?: string;
  company?: string;
  indication?: string;
  dose?: string;
  pediatric?: string;
  error?: string;
}

const MedexLookup = ({ onPick, kind }: { onPick: (r: MedexResult) => void; kind: "pediatric" | "adult" }) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedexResult | null>(null);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-medex-dose", { body: { query: q.trim() } });
      if (error) throw error;
      if (!data.found) toast.error(data.error || "Not found");
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch from medex.com.bd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold">Sync from medex.com.bd</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Brand name e.g. Napa, Seclo"
          className="h-9 text-xs"
        />
        <Button onClick={search} disabled={loading} size="sm" className="h-9 gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
          {loading ? "Fetching..." : "Lookup"}
        </Button>
      </div>
      {result?.found && (
        <div className="text-[11px] space-y-1 p-2 bg-background rounded border">
          <div><b>{result.brand}</b> — {result.generic} {result.strength}</div>
          {result.company && <div className="text-muted-foreground">{result.company}</div>}
          {(kind === "pediatric" ? result.pediatric : result.dose) && (
            <div className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-muted-foreground border-t pt-1">
              {(kind === "pediatric" ? result.pediatric : result.dose) || "No dose info found"}
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <a href={result.sourceUrl} target="_blank" rel="noopener" className="text-primary text-[10px] flex items-center gap-1 hover:underline">
              View on medex <ExternalLink className="w-3 h-3" />
            </a>
            <Button size="sm" className="h-7 text-[11px]" onClick={() => onPick(result)}>Pre-fill form</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MedexLookup;
