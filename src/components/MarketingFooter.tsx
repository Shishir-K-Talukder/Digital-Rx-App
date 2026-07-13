import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Music2, Mail, Phone } from "lucide-react";

const MarketingFooter = () => {
  const { settings } = useSiteSettings();

  const socials = [
    { url: settings.facebook_url, icon: Facebook, label: "Facebook" },
    { url: settings.twitter_url, icon: Twitter, label: "Twitter" },
    { url: settings.instagram_url, icon: Instagram, label: "Instagram" },
    { url: settings.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: settings.youtube_url, icon: Youtube, label: "YouTube" },
    { url: settings.whatsapp_url, icon: MessageCircle, label: "WhatsApp" },
    { url: settings.tiktok_url, icon: Music2, label: "TikTok" },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background to-muted/30 mt-20">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-base font-serif italic text-primary-foreground font-bold">℞</span>
            </div>
            <span className="font-bold text-foreground">Digital Rx</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Bangladesh's modern digital prescription platform — built for doctors, loved by patients.
          </p>
          {socials.length > 0 && (
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
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Product</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/#features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link to="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
            <li><Link to="/signup" className="hover:text-primary transition-colors">Sign up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Company</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About us</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Get in touch</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {settings.contact_email && (
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">{settings.contact_email}</a>
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <a href={`tel:${settings.contact_phone}`} className="hover:text-primary transition-colors">{settings.contact_phone}</a>
              </li>
            )}
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Digital Rx. All rights reserved.
      </div>
    </footer>
  );
};

export default MarketingFooter;
