import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Save, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const db = supabase as any;

interface SmtpRow {
  id?: string;
  provider: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  notification_email: string;
  use_tls: boolean;
}

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const PROVIDERS = [
  { id: "gmail", name: "Gmail SMTP", host: "smtp.gmail.com", port: 587, tls: true },
  { id: "outlook", name: "Outlook / Office365", host: "smtp.office365.com", port: 587, tls: true },
  { id: "sendgrid", name: "SendGrid", host: "smtp.sendgrid.net", port: 587, tls: true },
  { id: "mailgun", name: "Mailgun", host: "smtp.mailgun.org", port: 587, tls: true },
  { id: "ses", name: "AWS SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587, tls: true },
  { id: "custom", name: "Custom SMTP", host: "", port: 587, tls: true },
];

const defaultSmtp: SmtpRow = {
  provider: "gmail", host: "smtp.gmail.com", port: 587, username: "", password: "",
  from_email: "", from_name: "Digital Rx", notification_email: "", use_tls: true,
};

const ContactManager = () => {
  const [smtp, setSmtp] = useState<SmtpRow>(defaultSmtp);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<ContactMsg | null>(null);

  const load = async () => {
    const [s, m] = await Promise.all([
      db.from("smtp_settings").select("*").limit(1).maybeSingle(),
      db.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);
    if (s.data) setSmtp(s.data);
    if (m.data) setMessages(m.data);
  };
  useEffect(() => { load(); }, []);

  const onProviderChange = (p: string) => {
    const preset = PROVIDERS.find(x => x.id === p)!;
    setSmtp(s => ({ ...s, provider: p, host: preset.host || s.host, port: preset.port, use_tls: preset.tls }));
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...smtp };
    if (smtp.id) {
      await db.from("smtp_settings").update(payload).eq("id", smtp.id);
    } else {
      const { data } = await db.from("smtp_settings").insert(payload).select().single();
      if (data) setSmtp(data);
    }
    setSaving(false);
    toast.success("SMTP settings saved");
    load();
  };

  const del = async (id: string) => {
    await db.from("contact_messages").delete().eq("id", id);
    setMessages(m => m.filter(x => x.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Email / SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Provider</Label>
            <Select value={smtp.provider} onValueChange={onProviderChange}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{PROVIDERS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">SMTP Host</Label>
            <Input value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Port</Label>
            <Input type="number" value={smtp.port} onChange={e => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })} className="h-9 text-xs" />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Switch checked={smtp.use_tls} onCheckedChange={v => setSmtp({ ...smtp, use_tls: v })} />
            <Label className="text-xs">Use TLS/SSL</Label>
          </div>
          <div>
            <Label className="text-xs">Username</Label>
            <Input value={smtp.username} onChange={e => setSmtp({ ...smtp, username: e.target.value })} placeholder="you@gmail.com" className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Password / App Password</Label>
            <Input type="password" value={smtp.password} onChange={e => setSmtp({ ...smtp, password: e.target.value })} className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">From Email</Label>
            <Input type="email" value={smtp.from_email} onChange={e => setSmtp({ ...smtp, from_email: e.target.value })} placeholder="noreply@yourdomain.com" className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">From Name</Label>
            <Input value={smtp.from_name} onChange={e => setSmtp({ ...smtp, from_name: e.target.value })} className="h-9 text-xs" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Notification Email (where contact form goes)</Label>
            <Input type="email" value={smtp.notification_email} onChange={e => setSmtp({ ...smtp, notification_email: e.target.value })} placeholder="admin@yourdomain.com" className="h-9 text-xs" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={save} disabled={saving} className="gap-1.5 h-9 text-xs">
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save SMTP Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Contact Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Subject</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {messages.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs">{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell className="text-xs">{m.email}</TableCell>
                  <TableCell className="text-xs">{m.subject || "-"}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(m)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-6">No messages yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Message from {selected.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div><b>Email:</b> {selected.email}</div>
            <div><b>Phone:</b> {selected.phone || "-"}</div>
            <div><b>Subject:</b> {selected.subject || "-"}</div>
            <div className="pt-2 border-t whitespace-pre-wrap">{selected.message}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactManager;
