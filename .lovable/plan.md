# Plan: Digital Rx — Public Site + App Enhancements

Large request — splitting into 6 deliverables. Confirm or adjust before I build.

## 1. Public Marketing Home (`/`)
- Move current app from `/` → `/app` (still protected). New public `/` = marketing page (no auth required).
- Sections: Hero (slogan + 3D effect), Features, About, Pricing, Contact, Footer.
- Header matches app header style; includes **About**, **Contact**, **Login** buttons.
- **Slogan suggestion** (pick one or give your own):
  - "Digital Rx — Prescribe Smarter, Heal Faster."
  - "Digital Rx — Bangladesh's Modern Prescription Pad."
- **3D effect**: subtle CSS 3D tilt on hero card + floating prescription mockup (no heavy three.js, keeps it fast & SEO-friendly).
- **SEO**: title, meta description, OG tags, JSON-LD (SoftwareApplication), sitemap.xml updated, robots.txt allows `/`.

## 2. Pricing Table
| Plan | Price | Setup |
|---|---|---|
| Basic | 500 BDT / month | 1000 BDT |
| Standard | 2000 BDT / year | 500 BDT |
| Lifetime | 5000 BDT one-time | Free |
- "Contact us for better price & demo" CTA below table.

## 3. Contact Form + Admin SMTP Config
- Public Contact page/section with name/email/phone/message form.
- New table `contact_messages` (stores submissions; admin viewable).
- New table `smtp_settings` (admin-only): provider (Google SMTP / SendGrid / Custom SMTP), host, port, username, password, from-email.
- New admin tab **"Contact"**: configure SMTP + view messages.
- Edge function `send-contact-email` uses configured SMTP to notify admin on new submission.

## 4. App Tweaks
- **PatientInfo**: add "Referred By" field (text + autocomplete from history).
- **PrintSetup**: toggle to show/hide Referred By on print.
- **ClinicalNotes**: when LMP date is entered, auto-calculate EDD (LMP + 280 days); EDD field stays manually editable.

## 5. Medex.com.bd Dose Scraper
- In Admin → Doses tab, add **"Sync from Medex"** button for both Pediatric and Adult rule managers.
- Input: brand or generic name → edge function scrapes medex.com.bd's "Indication & Dose" section → pre-fills the add-rule form for admin review before saving.
- (Note: medex doesn't expose structured dose data; we pull raw text and admin edits before save.)

## 6. Routing / Auth changes
- `/` → public Home (no auth)
- `/app` → current prescription editor (protected)
- `/login`, `/signup`, `/about`, `/contact` → public
- Logged-in users clicking logo from `/` → redirect to `/app`.

---

## Technical notes
- New tables: `contact_messages`, `smtp_settings` (admin-only RLS).
- New edge function: `send-contact-email` (uses nodemailer-style SMTP via `npm:nodemailer`).
- New edge function: `scrape-medex-dose`.
- Update `FloatingNav` and `Index.tsx` route.
- `react-helmet-async` for per-route SEO.

---

## Questions before I start
1. **Order**: Build all 6 in one shot, or phase it? (recommend: Phase A = Home+Pricing+SEO+App tweaks, Phase B = Contact+SMTP, Phase C = Medex scraper)
2. **Slogan**: pick one above or provide your own.
3. **Logo/brand color**: keep current app theme, or want a new accent for marketing site?
4. **Admin email**: where should contact-form notifications be sent? (one email address)