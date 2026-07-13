import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";
import {
  Stethoscope, Printer, Pill, Calculator, Database, Shield,
  Users, FileText, CalendarDays, Check, ArrowRight, Sparkles, Zap,
} from "lucide-react";

const features = [
  { icon: Stethoscope, title: "Smart Prescription Writing", desc: "Search 30,000+ medicines, auto-fill brand & generic, save templates." },
  { icon: Printer, title: "Custom Print Layouts", desc: "A4/A5/Custom paper, header/footer toggles, font sizing per section." },
  { icon: Pill, title: "Pediatric & Adult Dose Calculator", desc: "Auto-calculates doses by weight — Paracetamol 8kg baby → 1 TSF TDS." },
  { icon: Calculator, title: "Clinical Tools", desc: "EDD, BMI, GFR, Insulin & Ovulation calculators built-in." },
  { icon: Database, title: "Patient Records", desc: "Cloud-synced patient history, documents, prescriptions." },
  { icon: CalendarDays, title: "Appointments", desc: "Schedule and track patient appointments effortlessly." },
  { icon: FileText, title: "Treatment Templates", desc: "Save common treatment sets and apply with one click." },
  { icon: Shield, title: "Secure & Private", desc: "Bank-grade encryption, BMDC compliant, role-based access." },
];

const pricingPlans = [
  {
    name: "Basic", price: "500", period: "/month", setup: "1,000 BDT setup",
    features: ["Unlimited prescriptions", "Patient management", "Print layouts", "Email support"],
    cta: "Get Basic", popular: false,
  },
  {
    name: "Standard", price: "2,000", period: "/year", setup: "500 BDT setup",
    features: ["Everything in Basic", "Treatment templates", "Dose calculators", "Priority support", "Appointment scheduling"],
    cta: "Get Standard", popular: true,
  },
  {
    name: "Lifetime", price: "5,000", period: "one-time", setup: "Free setup",
    features: ["Everything in Standard", "Lifetime updates", "All future tools", "Dedicated support", "Custom branding"],
    cta: "Get Lifetime", popular: false,
  },
];

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Digital Rx — Smart Prescription Platform for Doctors in Bangladesh</title>
        <meta name="description" content="Digital Rx helps doctors write prescriptions in seconds. 30,000+ medicines, dose calculators, custom print, patient records — all in one platform. Start free." />
        <link rel="canonical" href="https://digital-prescription-app.lovable.app/" />
        <meta property="og:title" content="Digital Rx — Prescribe Smarter, Heal Faster" />
        <meta property="og:description" content="Bangladesh's modern digital prescription platform. Built for doctors, loved by patients." />
        <meta property="og:url" content="https://digital-prescription-app.lovable.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Digital Rx",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "description": "Digital prescription writing platform for doctors in Bangladesh",
          "offers": [
            { "@type": "Offer", "price": "500", "priceCurrency": "BDT", "name": "Basic Monthly" },
            { "@type": "Offer", "price": "2000", "priceCurrency": "BDT", "name": "Standard Yearly" },
            { "@type": "Offer", "price": "5000", "priceCurrency": "BDT", "name": "Lifetime" },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <MarketingHeader />
        <main>

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32">
          {/* 3D background gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by doctors across Bangladesh
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Prescribe Smarter.<br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                Heal Faster.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
              Digital Rx is Bangladesh's modern prescription platform. Write, calculate doses,
              manage patients, and print beautiful prescriptions — all in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/30">
                <Link to="/signup">Start Free <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Request a Demo</Link>
              </Button>
            </div>

            {/* 3D Prescription Card */}
            <div className="relative max-w-2xl mx-auto perspective-1000">
              <div
                className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 text-left transform-gpu transition-transform duration-500 hover:scale-105"
                style={{ transform: "perspective(1000px) rotateX(8deg) rotateY(-4deg)" }}
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <div className="font-bold text-foreground">Dr. Rahman Ahmed</div>
                    <div className="text-[10px] text-muted-foreground">MBBS, FCPS (Medicine)</div>
                  </div>
                  <div className="text-3xl font-serif italic text-primary">℞</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-border">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">Karim</span></div>
                  <div><span className="text-muted-foreground">Age:</span> 32</div>
                  <div><span className="text-muted-foreground">Date:</span> 03-06-26</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-bold">Tab. Napa Extra</div>
                    <div className="text-xs text-muted-foreground">1+1+1 — After Meal — 5 days</div>
                  </div>
                  <div>
                    <div className="font-bold">Cap. Maxpro 20</div>
                    <div className="text-xs text-muted-foreground">1+0+1 — Before Meal — 7 days</div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Auto-saved
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything a modern doctor needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From prescription writing to clinical calculators — all integrated, beautifully.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <Card key={i} className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all border-border/60">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built by doctors, for doctors</h2>
            <p className="text-muted-foreground leading-relaxed">
              Digital Rx was created to solve the daily frustrations of paper prescriptions in Bangladesh.
              We combined deep medical knowledge with modern technology to build a tool that's fast, beautiful,
              and trustworthy. Used by hundreds of doctors across BD chambers and hospitals.
            </p>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Choose the plan that fits your practice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${plan.popular ? "border-primary border-2 shadow-xl shadow-primary/10 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">BDT {plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">{plan.setup}</p>
                <Button asChild className="w-full mb-5" variant={plan.popular ? "default" : "outline"}>
                  <Link to="/contact">{plan.cta}</Link>
                </Button>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-3">For better pricing or a personalized demo:</p>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/contact">Contact us <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 container mx-auto px-4">
          <Card className="p-10 sm:p-16 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to modernize your practice?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join hundreds of doctors using Digital Rx today. Free to start, no credit card needed.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/signup">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </Card>
        </section>
        </main>

        <MarketingFooter />
      </div>
    </>
  );
};

export default Home;
