import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { LogIn, LayoutDashboard, Menu, X, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Music2 } from "lucide-react";
import { useEffect, useState } from "react";

const MarketingHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

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
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-4">
      <div
        className={`max-w-6xl mx-auto rounded-full border border-border/60 transition-all duration-300 ${
          scrolled ? "bg-background/85 backdrop-blur-xl shadow-lg shadow-primary/5" : "bg-background/60 backdrop-blur-md"
        }`}
      >
        <div className="px-4 sm:px-5 h-14 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <span className="text-base font-serif italic text-primary-foreground font-bold">℞</span>
            </div>
            <span className="font-bold text-foreground text-[15px] tracking-tight">Digital Rx</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/60"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {socials.length > 0 && (
              <div className="hidden lg:flex items-center gap-0.5 mr-1 pr-2 border-r border-border/60">
                {socials.slice(0, 5).map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <s.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
            {user ? (
              <Button size="sm" onClick={() => navigate("/app")} className="gap-1.5 rounded-full h-9">
                <LayoutDashboard className="w-3.5 h-3.5" /> Open App
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate("/login")} className="gap-1.5 rounded-full h-9 hidden sm:inline-flex">
                  <LogIn className="w-3.5 h-3.5" /> Log in
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")} className="rounded-full h-9 shadow-md shadow-primary/20">
                  Get started
                </Button>
              </>
            )}
            <Button size="icon" variant="ghost" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="md:hidden rounded-full h-9 w-9" onClick={() => setOpen(!open)}>
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/60 shadow-xl overflow-hidden">
          <div className="p-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-sm rounded-lg hover:bg-muted/60 text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {socials.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 pt-3 mt-1 border-t border-border/60">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <s.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingHeader;
