import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";
import { Card } from "@/components/ui/card";
import { Heart, Target, Users } from "lucide-react";

const About = () => (
  <>
    <Helmet>
      <title>About Digital Rx — Modern Prescription Platform</title>
      <meta name="description" content="Learn about Digital Rx, Bangladesh's modern digital prescription platform built by doctors for doctors." />
      <link rel="canonical" href="https://digital-prescription-app.lovable.app/about" />
      <meta property="og:title" content="About Digital Rx — Built by Doctors, for Doctors" />
      <meta property="og:description" content="Our mission, vision, and team behind Bangladesh's modern prescription platform." />
      <meta property="og:url" content="https://digital-prescription-app.lovable.app/about" />
      <meta property="og:type" content="website" />
    </Helmet>
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        <section className="pt-28 pb-16 container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center">About Digital Rx</h1>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            We're on a mission to modernize how doctors in Bangladesh write, manage, and deliver prescriptions.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Heart, title: "Our Mission", desc: "Empower every doctor with tools that save time and improve patient care." },
              { icon: Target, title: "Our Vision", desc: "A fully digital, paperless healthcare experience across Bangladesh." },
              { icon: Users, title: "Our Team", desc: "Doctors, designers, and engineers who deeply care about healthcare." },
            ].map((v) => (
              <Card key={v.title} className="p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold mb-1 text-base">{v.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 prose prose-sm max-w-none">
            <h2 className="text-xl font-bold mb-3">Why we built Digital Rx</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Paper prescriptions are slow, error-prone, and hard to track. Doctors spend hours writing repetitive
              information, and patients often can't read what's prescribed. We built Digital Rx to fix this — a
              clean, fast, beautiful prescription tool that fits how Bangladeshi doctors actually work.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From the 30,000+ medicine database sourced from medex.com.bd, to pediatric dose calculators that
              handle Paracetamol for an 8kg baby in one click, every feature has been designed with real practice in mind.
            </p>
          </Card>
        </section>
      </main>
      <MarketingFooter />
    </div>
  </>
);

export default About;
