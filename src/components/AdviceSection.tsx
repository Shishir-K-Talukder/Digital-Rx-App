import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Bold } from "lucide-react";
import { MedicineOptions } from "./MedicineSettings";

export interface AdviceData {
  advice: string;
  followUpDate: string;
  visitFee?: string;
}

interface Props {
  data: AdviceData;
  onChange: (d: AdviceData) => void;
  options: MedicineOptions;
  /** Font size in px for dropdown trigger + items. Default 14. */
  uiFontSize?: string;
}

const AdviceSection = ({ data, onChange, options, uiFontSize }: Props) => {
  const adviceRef = useRef<HTMLTextAreaElement>(null);
  const fontPx = Math.max(12, Math.min(28, parseInt(uiFontSize || "14") || 14));
  const triggerStyle = { fontSize: `${fontPx}px` };
  const itemStyle = { fontSize: `${fontPx}px`, lineHeight: 1.4 };
  const triggerHeight = Math.max(32, Math.round(fontPx * 2.2));

  const handleAdviceSelect = (value: string) => {
    if (value === "__custom__") return;
    const current = data.advice;
    const newAdvice = current ? `${current}\n${value}` : value;
    onChange({ ...data, advice: newAdvice });
  };

  const handleFollowUpSelect = (value: string) => {
    if (value === "__custom__") {
      onChange({ ...data, followUpDate: "" });
      return;
    }
    onChange({ ...data, followUpDate: value });
  };

  const applyBold = () => {
    const ta = adviceRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = data.advice;
    if (start === end) {
      // Insert bold marker at cursor
      const next = `${text.slice(0, start)}**bold**${text.slice(end)}`;
      onChange({ ...data, advice: next });
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 2, start + 6); }, 0);
    } else {
      const selected = text.slice(start, end);
      const next = `${text.slice(0, start)}**${selected}**${text.slice(end)}`;
      onChange({ ...data, advice: next });
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start, end + 4); }, 0);
    }
  };

  return (
    <div className="section-card p-5">
      <h3 className="section-header mb-4">
        <div className="section-header-icon flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        Advice & Follow-up
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-2">
          <Label className="field-label">Quick Advice</Label>
          <div className="flex gap-2">
            <Select onValueChange={handleAdviceSelect}>
              <SelectTrigger
                className="flex-1"
                style={{ ...triggerStyle, height: `${triggerHeight}px` }}
              >
                <SelectValue placeholder="Select advice..." />
              </SelectTrigger>
              <SelectContent>
                {options.adviceList.map((a) => (
                  <SelectItem key={a} value={a} style={itemStyle} className="py-2">{a}</SelectItem>
                ))}
                <SelectItem value="__custom__" style={itemStyle} className="py-2 font-medium">✏️ Custom Advice</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyBold}
              className="px-3 gap-1.5 font-bold"
              style={{ height: `${triggerHeight}px`, fontSize: `${fontPx}px` }}
              title="Bold (wrap selection in **text**)"
            >
              <Bold className="w-4 h-4" /> Bold
            </Button>
          </div>
          <Textarea
            ref={adviceRef}
            value={data.advice}
            onChange={(e) => onChange({ ...data, advice: e.target.value })}
            placeholder="পরামর্শ লিখুন বা উপর থেকে নির্বাচন করুন... (নির্বাচিত টেক্সটে Bold বোতাম চাপুন)"
            className="text-sm min-h-[60px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label className="field-label">Follow-up</Label>
          <Select onValueChange={handleFollowUpSelect}>
            <SelectTrigger style={{ ...triggerStyle, height: `${triggerHeight}px` }}>
              <SelectValue placeholder="Select follow-up..." />
            </SelectTrigger>
            <SelectContent>
              {options.followUpOptions.map((opt) => (
                <SelectItem key={opt} value={opt} style={itemStyle} className="py-2">{opt}</SelectItem>
              ))}
              <SelectItem value="__custom__" style={itemStyle} className="py-2 font-medium">✏️ Custom</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={data.followUpDate}
            onChange={(e) => onChange({ ...data, followUpDate: e.target.value })}
            placeholder="কাস্টম ফলো-আপ লিখুন বা উপর থেকে নির্বাচন করুন..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2" id="advice-visitFee">
          <Label className="field-label">Visit Fee (৳)</Label>
          <Input
            value={data.visitFee || ""}
            onChange={(e) => onChange({ ...data, visitFee: e.target.value })}
            placeholder="৫০০"
            type="number"
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">শুধু ড্যাশবোর্ডের হিসাবের জন্য, প্রিন্টে দেখাবে না</p>
        </div>
      </div>
    </div>
  );
};

export default AdviceSection;
