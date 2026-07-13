// Adult Dose database — fixed standard doses + weight-based mg/kg drugs.
// Compiled from common Bangladesh/UK adult dosing references.

export type AdultDoseKind = "fixed" | "mg/kg";

export interface AdultDrug {
  name: string;
  generic: string;
  kind: AdultDoseKind;
  // For fixed: standard adult dose (e.g. "500 mg")
  // For mg/kg: dose per kg per dose
  dose: string;          // text label
  mgPerKg?: number;      // numeric per dose (mg/kg)
  frequency: string;     // OD/BD/TDS/QDS
  route?: string;        // PO/IV/IM
  maxDaily?: string;
  notes?: string;
}

export const ADULT_DRUGS: AdultDrug[] = [
  // ── Analgesics / Antipyretics ──
  { name: "Paracetamol",        generic: "Paracetamol",            kind: "fixed",  dose: "500–1000 mg", frequency: "QDS", route: "PO", maxDaily: "4 g/day" },
  { name: "Ibuprofen",          generic: "Ibuprofen",              kind: "fixed",  dose: "400 mg",      frequency: "TDS", route: "PO", maxDaily: "2.4 g/day" },
  { name: "Diclofenac",         generic: "Diclofenac Sodium",      kind: "fixed",  dose: "50 mg",       frequency: "TDS", route: "PO", maxDaily: "150 mg/day" },
  { name: "Naproxen",           generic: "Naproxen",               kind: "fixed",  dose: "500 mg",      frequency: "BD",  route: "PO" },
  { name: "Tramadol",           generic: "Tramadol",               kind: "fixed",  dose: "50–100 mg",   frequency: "QDS", route: "PO", maxDaily: "400 mg/day" },
  { name: "Ketorolac",          generic: "Ketorolac",              kind: "fixed",  dose: "10 mg",       frequency: "QDS", route: "PO" },

  // ── Antibiotics — fixed ──
  { name: "Amoxicillin",        generic: "Amoxicillin",            kind: "fixed",  dose: "500 mg",      frequency: "TDS", route: "PO" },
  { name: "Co-Amoxiclav",       generic: "Amoxicillin + Clavulanic Acid", kind: "fixed", dose: "625 mg", frequency: "TDS", route: "PO" },
  { name: "Azithromycin",       generic: "Azithromycin",           kind: "fixed",  dose: "500 mg",      frequency: "OD",  route: "PO", notes: "3–5 days" },
  { name: "Clarithromycin",     generic: "Clarithromycin",         kind: "fixed",  dose: "500 mg",      frequency: "BD",  route: "PO" },
  { name: "Erythromycin",       generic: "Erythromycin",           kind: "fixed",  dose: "500 mg",      frequency: "QDS", route: "PO" },
  { name: "Ciprofloxacin",      generic: "Ciprofloxacin",          kind: "fixed",  dose: "500 mg",      frequency: "BD",  route: "PO" },
  { name: "Levofloxacin",       generic: "Levofloxacin",           kind: "fixed",  dose: "500 mg",      frequency: "OD",  route: "PO" },
  { name: "Moxifloxacin",       generic: "Moxifloxacin",           kind: "fixed",  dose: "400 mg",      frequency: "OD",  route: "PO" },
  { name: "Cefixime",           generic: "Cefixime",               kind: "fixed",  dose: "400 mg",      frequency: "OD",  route: "PO" },
  { name: "Cefuroxime",         generic: "Cefuroxime Axetil",      kind: "fixed",  dose: "500 mg",      frequency: "BD",  route: "PO" },
  { name: "Cephradine",         generic: "Cephradine",             kind: "fixed",  dose: "500 mg",      frequency: "QDS", route: "PO" },
  { name: "Doxycycline",        generic: "Doxycycline",            kind: "fixed",  dose: "100 mg",      frequency: "BD",  route: "PO" },
  { name: "Metronidazole",      generic: "Metronidazole",          kind: "fixed",  dose: "400 mg",      frequency: "TDS", route: "PO" },
  { name: "Linezolid",          generic: "Linezolid",              kind: "fixed",  dose: "600 mg",      frequency: "BD",  route: "PO" },
  { name: "Co-trimoxazole",     generic: "Sulfamethoxazole+Trimethoprim", kind: "fixed", dose: "960 mg", frequency: "BD", route: "PO" },

  // ── Antibiotics — mg/kg (IV) ──
  { name: "Ceftriaxone (IV)",   generic: "Ceftriaxone",            kind: "mg/kg",  dose: "50 mg/kg",  mgPerKg: 50, frequency: "OD",  route: "IV", maxDaily: "4 g/day" },
  { name: "Meropenem (IV)",     generic: "Meropenem",              kind: "mg/kg",  dose: "20 mg/kg",  mgPerKg: 20, frequency: "TDS", route: "IV" },
  { name: "Vancomycin (IV)",    generic: "Vancomycin",             kind: "mg/kg",  dose: "15 mg/kg",  mgPerKg: 15, frequency: "BD",  route: "IV" },
  { name: "Gentamicin (IV)",    generic: "Gentamicin",             kind: "mg/kg",  dose: "5 mg/kg",   mgPerKg: 5,  frequency: "OD",  route: "IV" },
  { name: "Amikacin (IV)",      generic: "Amikacin",               kind: "mg/kg",  dose: "15 mg/kg",  mgPerKg: 15, frequency: "OD",  route: "IV" },

  // ── PPI / GI ──
  { name: "Omeprazole",         generic: "Omeprazole",             kind: "fixed",  dose: "20 mg",  frequency: "OD",  route: "PO" },
  { name: "Esomeprazole",       generic: "Esomeprazole",           kind: "fixed",  dose: "20 mg",  frequency: "OD",  route: "PO" },
  { name: "Pantoprazole",       generic: "Pantoprazole",           kind: "fixed",  dose: "40 mg",  frequency: "OD",  route: "PO" },
  { name: "Rabeprazole",        generic: "Rabeprazole",            kind: "fixed",  dose: "20 mg",  frequency: "OD",  route: "PO" },
  { name: "Ranitidine",         generic: "Ranitidine",             kind: "fixed",  dose: "150 mg", frequency: "BD",  route: "PO" },
  { name: "Domperidone",        generic: "Domperidone",            kind: "fixed",  dose: "10 mg",  frequency: "TDS", route: "PO" },
  { name: "Ondansetron",        generic: "Ondansetron",            kind: "fixed",  dose: "4–8 mg", frequency: "TDS", route: "PO/IV" },
  { name: "Hyoscine",           generic: "Hyoscine Butylbromide",  kind: "fixed",  dose: "10–20 mg", frequency: "QDS", route: "PO" },

  // ── Cardiovascular ──
  { name: "Amlodipine",         generic: "Amlodipine",             kind: "fixed",  dose: "5–10 mg", frequency: "OD",  route: "PO" },
  { name: "Losartan",           generic: "Losartan",               kind: "fixed",  dose: "50 mg",   frequency: "OD",  route: "PO" },
  { name: "Telmisartan",        generic: "Telmisartan",            kind: "fixed",  dose: "40 mg",   frequency: "OD",  route: "PO" },
  { name: "Ramipril",           generic: "Ramipril",               kind: "fixed",  dose: "5 mg",    frequency: "OD",  route: "PO" },
  { name: "Bisoprolol",         generic: "Bisoprolol",             kind: "fixed",  dose: "5 mg",    frequency: "OD",  route: "PO" },
  { name: "Atenolol",           generic: "Atenolol",               kind: "fixed",  dose: "50 mg",   frequency: "OD",  route: "PO" },
  { name: "Metoprolol",         generic: "Metoprolol",             kind: "fixed",  dose: "50 mg",   frequency: "BD",  route: "PO" },
  { name: "Carvedilol",         generic: "Carvedilol",             kind: "fixed",  dose: "6.25 mg", frequency: "BD",  route: "PO" },
  { name: "Frusemide",          generic: "Furosemide",             kind: "fixed",  dose: "40 mg",   frequency: "OD",  route: "PO" },
  { name: "Spironolactone",     generic: "Spironolactone",         kind: "fixed",  dose: "25 mg",   frequency: "OD",  route: "PO" },
  { name: "Atorvastatin",       generic: "Atorvastatin",           kind: "fixed",  dose: "20 mg",   frequency: "OD",  route: "PO", notes: "at night" },
  { name: "Rosuvastatin",       generic: "Rosuvastatin",           kind: "fixed",  dose: "10 mg",   frequency: "OD",  route: "PO" },
  { name: "Clopidogrel",        generic: "Clopidogrel",            kind: "fixed",  dose: "75 mg",   frequency: "OD",  route: "PO" },
  { name: "Aspirin",            generic: "Aspirin",                kind: "fixed",  dose: "75 mg",   frequency: "OD",  route: "PO" },

  // ── Diabetes ──
  { name: "Metformin",          generic: "Metformin",              kind: "fixed",  dose: "500 mg",  frequency: "BD",  route: "PO" },
  { name: "Glimepiride",        generic: "Glimepiride",            kind: "fixed",  dose: "2 mg",    frequency: "OD",  route: "PO" },
  { name: "Gliclazide",         generic: "Gliclazide MR",          kind: "fixed",  dose: "60 mg",   frequency: "OD",  route: "PO" },
  { name: "Sitagliptin",        generic: "Sitagliptin",            kind: "fixed",  dose: "100 mg",  frequency: "OD",  route: "PO" },
  { name: "Empagliflozin",      generic: "Empagliflozin",          kind: "fixed",  dose: "10 mg",   frequency: "OD",  route: "PO" },

  // ── Respiratory ──
  { name: "Montelukast",        generic: "Montelukast",            kind: "fixed",  dose: "10 mg",   frequency: "OD",  route: "PO", notes: "at night" },
  { name: "Salbutamol",         generic: "Salbutamol",             kind: "fixed",  dose: "4 mg",    frequency: "QDS", route: "PO" },
  { name: "Doxofylline",        generic: "Doxofylline",            kind: "fixed",  dose: "400 mg",  frequency: "BD",  route: "PO" },
  { name: "Theophylline",       generic: "Theophylline SR",        kind: "fixed",  dose: "200–400 mg", frequency: "BD", route: "PO" },

  // ── Antihistamines / Allergy ──
  { name: "Cetirizine",         generic: "Cetirizine",             kind: "fixed",  dose: "10 mg",   frequency: "OD",  route: "PO" },
  { name: "Fexofenadine",       generic: "Fexofenadine",           kind: "fixed",  dose: "120–180 mg", frequency: "OD", route: "PO" },
  { name: "Desloratadine",      generic: "Desloratadine",          kind: "fixed",  dose: "5 mg",    frequency: "OD",  route: "PO" },
  { name: "Rupatadine",         generic: "Rupatadine",             kind: "fixed",  dose: "10 mg",   frequency: "OD",  route: "PO" },

  // ── Corticosteroids ──
  { name: "Prednisolone",       generic: "Prednisolone",           kind: "mg/kg",  dose: "1 mg/kg",  mgPerKg: 1,  frequency: "OD",  route: "PO", maxDaily: "60 mg/day" },
  { name: "Dexamethasone",      generic: "Dexamethasone",          kind: "fixed",  dose: "4 mg",     frequency: "QDS", route: "PO/IV" },
  { name: "Hydrocortisone (IV)",generic: "Hydrocortisone",         kind: "fixed",  dose: "100 mg",   frequency: "QDS", route: "IV" },

  // ── Anti-emetics / Misc ──
  { name: "Diazepam",           generic: "Diazepam",               kind: "fixed",  dose: "5 mg",     frequency: "BD",  route: "PO" },
  { name: "Alprazolam",         generic: "Alprazolam",             kind: "fixed",  dose: "0.25–0.5 mg", frequency: "BD", route: "PO" },
  { name: "Sertraline",         generic: "Sertraline",             kind: "fixed",  dose: "50 mg",    frequency: "OD",  route: "PO" },
  { name: "Escitalopram",       generic: "Escitalopram",           kind: "fixed",  dose: "10 mg",    frequency: "OD",  route: "PO" },
];

export interface AdultDoseResult {
  prescription: string;
  details: string;
}

export const calculateAdultDose = (drug: AdultDrug, weightKg?: number): AdultDoseResult => {
  if (drug.kind === "mg/kg" && drug.mgPerKg && weightKg && weightKg > 0) {
    const perDose = Math.round(drug.mgPerKg * weightKg);
    return {
      prescription: `${perDose} mg ${drug.frequency}${drug.route ? ` ${drug.route}` : ""}`,
      details: `${drug.mgPerKg} mg/kg × ${weightKg} kg = ${perDose} mg per dose${drug.maxDaily ? ` • max ${drug.maxDaily}` : ""}`,
    };
  }
  return {
    prescription: `${drug.dose} ${drug.frequency}${drug.route ? ` ${drug.route}` : ""}`,
    details: `Standard adult dose${drug.maxDaily ? ` • max ${drug.maxDaily}` : ""}`,
  };
};
