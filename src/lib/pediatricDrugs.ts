// Pediatric Dose drug database, compiled from:
// - "Paediatrics Dose by Dr. Sumon"
// - "Drug Dose for Pediatrics — QuickRx"
//
// Formula categories:
//   8kg/tsf      → 1 TSF per 8 kg per dose       (tsf = weight / 8)
//   10kg/half    → ½ TSF per 10 kg per dose      (tsf = weight / 20)
//   10kg/tsf     → 1 TSF per 10 kg per dose      (tsf = weight / 10)
//   drop/kg      → drops/kg/dose (drops = weight × ratio)

export type DoseCategory = "8kg/tsf" | "10kg/half" | "10kg/tsf" | "drop/kg";

export interface PediatricDrug {
  name: string;
  generic: string;
  category: DoseCategory;
  strength: string;            // e.g. "120mg/tsf", "80mg/ml"
  frequency: string;           // OD/BD/TDS/QDS/...
  dailyDose?: string;          // text reference (e.g. "15 mg/kg/dose")
  dropRatio?: number;          // for drop/kg
  notes?: string;
}

export const PEDIATRIC_DRUGS: PediatricDrug[] = [
  // ---- 1 TSF per 8 kg / dose (syrup) ----
  { name: "Paracetamol",                generic: "Paracetamol",                  category: "8kg/tsf",  strength: "120 mg/tsf", frequency: "TDS/QDS", dailyDose: "10–15 mg/kg/dose" },
  { name: "Amoxicillin",                generic: "Amoxicillin",                  category: "8kg/tsf",  strength: "125 mg/tsf", frequency: "TDS",     dailyDose: "20–50 mg/kg/day" },
  { name: "Amoxicillin + Clav. Acid",   generic: "Amoxicillin + Clavulanic Acid",category: "8kg/tsf",  strength: "125+31.25 mg/tsf", frequency: "TDS", dailyDose: "20–50 mg/kg/day" },
  { name: "Cefpodoxime",                generic: "Cefpodoxime",                  category: "8kg/tsf",  strength: "40 mg/tsf",  frequency: "BD",      dailyDose: "10 mg/kg/day" },
  { name: "Cefuroxime",                 generic: "Cefuroxime Axetil",            category: "8kg/tsf",  strength: "125 mg/tsf", frequency: "BD",      dailyDose: "20–30 mg/kg/day" },
  { name: "Cephradine",                 generic: "Cephradine",                   category: "8kg/tsf",  strength: "125 mg/tsf", frequency: "TDS",     dailyDose: "50–100 mg/kg/day" },
  { name: "Cefadroxil",                 generic: "Cefadroxil",                   category: "8kg/tsf",  strength: "125 mg/tsf", frequency: "BD",      dailyDose: "30–50 mg/kg/day" },
  { name: "Flucloxacillin",             generic: "Flucloxacillin",               category: "8kg/tsf",  strength: "125 mg/tsf", frequency: "QDS",     dailyDose: "50–100 mg/kg/day" },
  { name: "Co-trimoxazole",             generic: "Sulfamethoxazole+Trimethoprim",category: "8kg/tsf",  strength: "240 mg/tsf", frequency: "BD",      dailyDose: "10 mg/kg/day" },
  { name: "Chloroquine",                generic: "Chloroquine",                  category: "8kg/tsf",  strength: "80 mg/tsf",  frequency: "OD",      dailyDose: "10 mg/kg D1+D2 then 5 mg/kg D3" },
  { name: "Phenobarbitone (Syrup)",     generic: "Phenobarbital",                category: "8kg/tsf",  strength: "20 mg/tsf",  frequency: "BD",      dailyDose: "5 mg/kg/day" },
  { name: "Mefenamic Acid",             generic: "Mefenamic Acid",               category: "8kg/tsf",  strength: "50 mg/tsf",  frequency: "BD/TDS",  dailyDose: "8 mg/kg/dose" },
  { name: "Lactulose",                  generic: "Lactulose",                    category: "8kg/tsf",  strength: "—",          frequency: "TDS" },

  // ---- ½ TSF per 10 kg / dose ----
  { name: "Azithromycin",               generic: "Azithromycin",                 category: "10kg/half", strength: "200 mg/tsf", frequency: "OD",     dailyDose: "10 mg/kg/day (Enteric 20)" },
  { name: "Cefixime",                   generic: "Cefixime",                     category: "10kg/half", strength: "100 mg/tsf", frequency: "BD",     dailyDose: "10 mg/kg/day (Enteric 20)" },
  { name: "Clarithromycin",             generic: "Clarithromycin",               category: "10kg/half", strength: "125 mg/tsf", frequency: "BD",     dailyDose: "15 mg/kg/day" },
  { name: "Clindamycin",                generic: "Clindamycin",                  category: "10kg/half", strength: "75 mg/tsf",  frequency: "TDS/QDS",dailyDose: "8–20 mg/kg/day" },
  { name: "Ciprofloxacin",              generic: "Ciprofloxacin",                category: "10kg/half", strength: "250 mg/tsf", frequency: "BD",     dailyDose: "15–30 mg/kg/day" },
  { name: "Metronidazole",              generic: "Metronidazole",                category: "10kg/half", strength: "200 mg/tsf", frequency: "TDS",    dailyDose: "15–30 mg/kg/day" },
  { name: "Carbamazepine",              generic: "Carbamazepine",                category: "10kg/half", strength: "100 mg/tsf", frequency: "BD",     dailyDose: "10 mg/kg/day" },
  { name: "Sodium Valproate",           generic: "Sodium Valproate",             category: "10kg/half", strength: "200 mg/tsf", frequency: "BD",     dailyDose: "10–20 mg/kg/day" },
  { name: "Theophylline",               generic: "Theophylline",                 category: "10kg/half", strength: "120 mg/tsf", frequency: "BD",     dailyDose: "10–20 mg/kg/day" },
  { name: "Doxophylline",               generic: "Doxophylline",                 category: "10kg/half", strength: "100 mg/tsf", frequency: "BD",     dailyDose: "12 mg/kg/day" },
  { name: "Iron (Polymaltose)",         generic: "Iron Polymaltose Complex",     category: "10kg/half", strength: "50 mg/tsf",  frequency: "OD",     dailyDose: "3–6 mg/kg/day" },
  { name: "Naproxen",                   generic: "Naproxen",                     category: "10kg/half", strength: "125 mg/tsf", frequency: "BD",     dailyDose: "5 mg/kg/dose" },
  { name: "Nitrofurantoin",             generic: "Nitrofurantoin",               category: "10kg/half", strength: "25 mg/tsf",  frequency: "QDS",    dailyDose: "3–7 mg/kg/day" },
  { name: "Piracetam",                  generic: "Piracetam",                    category: "10kg/half", strength: "500 mg/tsf", frequency: "BD/TDS", dailyDose: "50 mg/kg/day" },
  { name: "Salbutamol",                 generic: "Salbutamol",                   category: "10kg/half", strength: "2 mg/tsf",   frequency: "TDS",    dailyDose: "0.4 mg/kg/day" },
  { name: "Levosalbutamol",             generic: "Levosalbutamol",               category: "10kg/half", strength: "1 mg/tsf",   frequency: "TDS",    dailyDose: "0.1 mg/kg/day" },
  { name: "Ambroxol",                   generic: "Ambroxol HCl",                 category: "10kg/half", strength: "15 mg/tsf",  frequency: "BD/TDS" },
  { name: "Ketotifen",                  generic: "Ketotifen",                    category: "10kg/half", strength: "1 mg/tsf",   frequency: "BD" },
  { name: "Chlorpheniramine",           generic: "Chlorpheniramine Maleate",     category: "10kg/half", strength: "2 mg/tsf",   frequency: "BD/TDS" },
  { name: "Desloratadine",              generic: "Desloratadine",                category: "10kg/half", strength: "2.5 mg/tsf", frequency: "OD" },
  { name: "Rupatadine",                 generic: "Rupatadine",                   category: "10kg/half", strength: "5 mg/tsf",   frequency: "OD" },
  { name: "Phenoxymethyl Penicillin",   generic: "Phenoxymethyl Penicillin",     category: "10kg/half", strength: "250 mg/tsf", frequency: "QDS",    dailyDose: "50 mg/kg/day" },
  { name: "Baclofen",                   generic: "Baclofen",                     category: "10kg/half", strength: "5 mg/tsf",   frequency: "TDS",    dailyDose: "0.25 mg/kg/dose" },
  { name: "Sodium Picosulphate",        generic: "Sodium Picosulphate",          category: "10kg/half", strength: "5 mg/tsf",   frequency: "OD",     dailyDose: "0.25 mg/kg/day" },
  { name: "Butamirate Citrate",         generic: "Butamirate Citrate",           category: "10kg/half", strength: "7.5 mg/tsf", frequency: "TDS" },
  { name: "Deflazacort",                generic: "Deflazacort",                  category: "10kg/half", strength: "6 mg/tsf",   frequency: "BD",     dailyDose: "0.6 mg/kg/day" },

  // ---- 1 TSF per 10 kg / dose ----
  { name: "Acyclovir",                  generic: "Acyclovir",                    category: "10kg/tsf",  strength: "200 mg/tsf", frequency: "QDS",     dailyDose: "20 mg/kg/dose" },
  { name: "Ceftibuten",                 generic: "Ceftibuten",                   category: "10kg/tsf",  strength: "90 mg/tsf",  frequency: "OD",      dailyDose: "9 mg/kg/day" },
  { name: "Erythromycin",               generic: "Erythromycin",                 category: "10kg/tsf",  strength: "125 mg/tsf", frequency: "QDS",     dailyDose: "40–50 mg/kg/day" },
  { name: "Ibuprofen",                  generic: "Ibuprofen",                    category: "10kg/tsf",  strength: "100 mg/tsf", frequency: "BD/TDS",  dailyDose: "5–10 mg/kg/dose" },
  { name: "Levofloxacin",               generic: "Levofloxacin",                 category: "10kg/tsf",  strength: "125 mg/tsf", frequency: "OD",      dailyDose: "10–20 mg/kg/day" },
  { name: "Nitazoxanide",               generic: "Nitazoxanide",                 category: "10kg/tsf",  strength: "100 mg/tsf", frequency: "BD",      dailyDose: "10 mg/kg/dose" },
  { name: "Penicillin V",               generic: "Penicillin V",                 category: "10kg/tsf",  strength: "125 mg/tsf", frequency: "QDS",     dailyDose: "25–50 mg/kg/day" },
  { name: "Prednisolone",               generic: "Prednisolone",                 category: "10kg/tsf",  strength: "5 mg/tsf",   frequency: "BD/TDS",  dailyDose: "1–2 mg/kg/day" },
  { name: "Zinc",                       generic: "Zinc",                         category: "10kg/tsf",  strength: "10 mg/tsf",  frequency: "BD",      dailyDose: "0.5–1 mg/kg/dose" },
  { name: "Fluconazole",                generic: "Fluconazole",                  category: "10kg/tsf",  strength: "50 mg/tsf",  frequency: "OD",      dailyDose: "3–6 mg/kg/day" },
  { name: "Fexofenadine",               generic: "Fexofenadine HCl",             category: "10kg/tsf",  strength: "30 mg/tsf",  frequency: "OD" },
  { name: "Cetirizine",                 generic: "Cetirizine HCl",               category: "10kg/tsf",  strength: "5 mg/tsf",   frequency: "OD" },
  { name: "Domperidone",                generic: "Domperidone",                  category: "10kg/tsf",  strength: "5 mg/tsf",   frequency: "TDS",     dailyDose: "0.2–0.4 mg/kg/dose" },
  { name: "Linezolid",                  generic: "Linezolid",                    category: "10kg/tsf",  strength: "100 mg/tsf", frequency: "BD/TDS",  dailyDose: "10 mg/kg/dose" },
  { name: "Dicycloverine",              generic: "Dicycloverine",                category: "10kg/tsf",  strength: "10 mg/tsf",  frequency: "TDS" },
  { name: "Cephalexin",                 generic: "Cephalexin",                   category: "10kg/tsf",  strength: "125 mg/tsf", frequency: "BD" },

  // ---- Drops (per kg) ----
  { name: "Paracetamol (Drop)",         generic: "Paracetamol",                  category: "drop/kg",   strength: "80 mg/ml",   frequency: "TDS/QDS", dailyDose: "10–15 mg/kg/dose", dropRatio: 3 },
  { name: "Cefaclor (Drop)",            generic: "Cefaclor",                     category: "drop/kg",   strength: "100 mg/ml",  frequency: "BD/TDS",  dailyDose: "20–40 mg/kg/day",  dropRatio: 2 },
  { name: "Cefpodoxime (Drop)",         generic: "Cefpodoxime",                  category: "drop/kg",   strength: "20 mg/ml",   frequency: "BD",      dailyDose: "10 mg/kg/day",     dropRatio: 4 },
  { name: "Cefixime (Drop)",            generic: "Cefixime",                     category: "drop/kg",   strength: "25 mg/ml",   frequency: "BD",      dailyDose: "10 mg/kg/day",     dropRatio: 3 },
  { name: "Domperidone (Drop)",         generic: "Domperidone",                  category: "drop/kg",   strength: "5 mg/ml",    frequency: "TDS",     dailyDose: "0.2–0.4 mg/kg/day",dropRatio: 1 },
  { name: "Frusemide (Drop)",           generic: "Frusemide",                    category: "drop/kg",   strength: "8 mg/ml",    frequency: "OD",      dailyDose: "1–4 mg/kg/day",    dropRatio: 8 },
  { name: "Iron (Drop)",                generic: "Iron Polymaltose Complex",     category: "drop/kg",   strength: "50 mg/ml",   frequency: "OD",      dailyDose: "1–3 mg/kg/day",    dropRatio: 1 },
  { name: "Oxcarbazepine (Syp/Drop)",   generic: "Oxcarbazepine",                category: "drop/kg",   strength: "60 mg/ml",   frequency: "BD",      dailyDose: "10–20 mg/kg/day",  dropRatio: 1.5 },
  { name: "Phenobarbitone (Drop)",      generic: "Phenobarbital",                category: "drop/kg",   strength: "4 mg/ml",    frequency: "OD/BD",   dailyDose: "5 mg/kg/day",      dropRatio: 1 },
  { name: "Ranitidine (Drop)",          generic: "Ranitidine",                   category: "drop/kg",   strength: "15 mg/ml",   frequency: "BD",      dailyDose: "2–4 mg/kg/day",    dropRatio: 3 },
  { name: "Levetiracetam (Drop)",       generic: "Levetiracetam",                category: "drop/kg",   strength: "100 mg/ml",  frequency: "BD",      dailyDose: "20 mg/kg/day",     dropRatio: 1.5 },
  { name: "Ambroxol (Drop)",            generic: "Ambroxol HCl",                 category: "drop/kg",   strength: "6 mg/ml",    frequency: "BD",                                  dropRatio: 2 },
  { name: "Butamirate (Drop)",          generic: "Butamirate Citrate",           category: "drop/kg",   strength: "5 mg/ml",    frequency: "TDS/QDS",                              dropRatio: 2 },
  { name: "Desloratadine (Drop)",       generic: "Desloratadine",                category: "drop/kg",   strength: "0.5 mg/ml",  frequency: "OD",                                   dropRatio: 3 },
  { name: "Cetirizine (Drop)",          generic: "Cetirizine",                   category: "drop/kg",   strength: "2.5 mg/ml",  frequency: "OD",                                   dropRatio: 3 },
];

// Round to nearest 0.25 TSF
const roundQuarter = (n: number) => Math.max(0.25, Math.round(n * 4) / 4);

const formatTsf = (n: number) => {
  const r = roundQuarter(n);
  if (r === 0.25) return "¼ TSF";
  if (r === 0.5)  return "½ TSF";
  if (r === 0.75) return "¾ TSF";
  if (Number.isInteger(r)) return `${r} TSF`;
  const whole = Math.floor(r);
  const frac = r - whole;
  const fracTxt = frac === 0.25 ? "¼" : frac === 0.5 ? "½" : "¾";
  return `${whole}${fracTxt} TSF`;
};

export interface DoseResult {
  prescription: string;   // e.g. "1 TSF TDS/QDS"
  details: string;        // explanation
}

export const calculateDose = (drug: PediatricDrug, weightKg: number): DoseResult | null => {
  if (!weightKg || weightKg <= 0) return null;

  if (drug.category === "drop/kg") {
    const drops = Math.round((drug.dropRatio || 1) * weightKg);
    return {
      prescription: `${drops} drops ${drug.frequency}`,
      details: `${drug.dropRatio} drop(s) per kg × ${weightKg} kg = ${drops} drops per dose`,
    };
  }

  let tsf = 0;
  let rule = "";
  if (drug.category === "8kg/tsf")    { tsf = weightKg / 8;  rule = "1 TSF per 8 kg/dose"; }
  if (drug.category === "10kg/half")  { tsf = weightKg / 20; rule = "½ TSF per 10 kg/dose"; }
  if (drug.category === "10kg/tsf")   { tsf = weightKg / 10; rule = "1 TSF per 10 kg/dose"; }

  return {
    prescription: `${formatTsf(tsf)} ${drug.frequency}`,
    details: `${rule} • ${weightKg} kg → ${tsf.toFixed(2)} TSF (rounded)`,
  };
};
