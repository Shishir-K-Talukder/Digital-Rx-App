import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { z } from "zod";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Music2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1, "Message required").max(2000),
});

const Contact = () => {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (error) {
      toast.error("Failed to send. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      // Try to send notification email (best-effort, ignore failure)
      supabase.functions.invoke("send-contact-email", { body: parsed.data }).catch(() => {});
    }
    setSending(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact Digital Rx — Get in Touch</title>
        <meta name="description" content="Contact the Digital Rx team for demos, pricing, or support. We'd love to hear from you." />
        <link rel="canonical" href="https://digital-prescription-app.lovable.app/contact" />
        <meta property="og:title" content="Contact Digital Rx — Demos, Pricing & Support" />
        <meta property="og:description" content="Reach the Digital Rx team for a demo, custom pricing, or support — we reply within one business day." />
        <meta property="og:url" content="https://digital-prescription-app.lovable.app/contact" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <MarketingHeader />
        <main>
        <section className="pt-28 pb-16 container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-center">Contact Us</h1>
          <p className="text-muted-foreground text-center mb-12">
            Have a question or want a demo? Drop us a line.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: settings.contact_email || "hello@digitalrx.app", href: `mailto:${settings.contact_email || "hello@digitalrx.app"}` },
                { icon: Phone, label: "Phone", value: settings.contact_phone || "+880 1XXX-XXXXXX", href: `tel:${settings.contact_phone || ""}` },
                { icon: MapPin, label: "Location", value: "Dhaka, Bangladesh", href: undefined as string | undefined },
              ].map((c) => (
                <Card key={c.label} className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="text-sm font-medium hover:text-primary break-all">{c.value}</a>
                    ) : (
                      <div className="text-sm font-medium">{c.value}</div>
                    )}
                  </div>
                </Card>
              ))}
              {(() => {
                const socials = [
                  { url: settings.facebook_url, icon: Facebook, label: "Facebook" },
                  { url: settings.twitter_url, icon: Twitter, label: "Twitter" },
                  { url: settings.instagram_url, icon: Instagram, label: "Instagram" },
                  { url: settings.linkedin_url, icon: Linkedin, label: "LinkedIn" },
                  { url: settings.youtube_url, icon: Youtube, label: "YouTube" },
                  { url: settings.whatsapp_url, icon: MessageCircle, label: "WhatsApp" },
                  { url: settings.tiktok_url, icon: Music2, label: "TikTok" },
                ].filter((s) => s.url);
                if (socials.length === 0) return null;
                return (
                  <Card className="p-4">
                    <div className="text-xs text-muted-foreground mb-3 font-medium">Follow us</div>
                    <div className="flex flex-wrap gap-2">
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="w-9 h-9 rounded-full bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 transition-all"
                        >
                          <s.icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </Card>
                );
              })()}
            </div>

            <Card className="p-6 md:col-span-2">
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Subject</Label>
                    <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={150} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Message *</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} maxLength={2000} />
                </div>
                <Button type="submit" disabled={sending} className="w-full gap-2">
                  <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </section>
        </main>
        <MarketingFooter />
      </div>
    </>
  );
};

export default Contact;
