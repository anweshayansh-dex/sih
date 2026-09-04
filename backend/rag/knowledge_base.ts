/**
 * BIS Sahayak - In-Process RAG & Knowledge Retrieval Engine
 * For Smart India Hackathon PS26107
 * SAMPLE DATA FOR DEMO - Designed for zero external database dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SourceCitation } from '../../src/types';

let __filename = '';
let __dirname = '';
try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    // @ts-ignore
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  }
} catch (e) {}

if (!__dirname) {
  __dirname = process.cwd();
  __filename = path.join(__dirname, 'knowledge_base.ts');
}

function loadJsonSafe(filename: string): any {
  const possiblePaths = [
    path.join(process.cwd(), 'backend', 'data', filename),
    path.join(__dirname, 'data', filename),
    path.join(__dirname, '../backend/data', filename),
    path.join(__dirname, '../../backend/data', filename)
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      // continue
    }
  }
  return [];
}

const standardsData = loadJsonSafe('standards.json');
const schemesData = loadJsonSafe('schemes.json');
const labsData = loadJsonSafe('labs.json');
const hallmarkingData: any = loadJsonSafe('hallmarking.json');
const complaintsData = loadJsonSafe('complaints.json');

export interface DocumentChunk {
  id: string;
  doc_type: 'standard' | 'scheme' | 'lab' | 'hallmarking' | 'complaint';
  title: string;
  standard_number?: string;
  clause?: string;
  source_url?: string;
  content: string;
  keywords: string[];
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  citation: SourceCitation;
}

// Build indexed corpus in-memory
class KnowledgeBaseEngine {
  private chunks: DocumentChunk[] = [];
  private isInitialized = false;

  constructor() {
    this.initCorpus();
  }

  private initCorpus() {
    if (this.isInitialized) return;

    // 1. Ingest Standards
    for (const std of (standardsData as any[])) {
      const category = std.category || 'General Indian Standard';
      const scheme = std.scheme || 'ISI Mark (Scheme I)';
      const stdNum = std.standard_number || 'IS Reference';
      const desc = std.description || `Indian Standard ${stdNum} covering ${std.title}.`;
      const keywords = [
        ...(std.keywords || []),
        stdNum.toLowerCase(),
        category.toLowerCase(),
        scheme.toLowerCase()
      ].filter(Boolean);

      // Chunk 1: Overview
      this.chunks.push({
        id: `std-${stdNum}-overview`,
        doc_type: 'standard',
        title: std.title,
        standard_number: stdNum,
        source_url: std.source_url || 'https://www.services.bis.gov.in',
        content: `Standard: ${stdNum}\nTitle: ${std.title}\nCategory: ${category}\nMandatory Certification: ${std.mandatory ? 'Yes (Quality Control Order)' : 'No (Voluntary)'}\nCertification Scheme: ${scheme}\nDescription: ${desc}`,
        keywords: keywords
      });

      // Chunk 2: Key Clauses & Specifications
      if (std.key_clauses && std.key_clauses.length > 0) {
        this.chunks.push({
          id: `std-${stdNum}-clauses`,
          doc_type: 'standard',
          title: `${std.title} - Clauses & Technical Specs`,
          standard_number: stdNum,
          clause: 'Key Technical & Safety Clauses',
          source_url: std.source_url || 'https://www.services.bis.gov.in',
          content: `Standard: ${stdNum} (${std.title})\nTechnical Clauses & Requirements:\n` + std.key_clauses.join('\n'),
          keywords: [...keywords, 'clause', 'specifications', 'test', 'safety']
        });
      }
    }

    // 2. Ingest Certification Schemes
    for (const scheme of schemesData) {
      this.chunks.push({
        id: `scheme-${scheme.id}`,
        doc_type: 'scheme',
        title: scheme.name,
        source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/schemes',
        content: `Scheme Name: ${scheme.name} (${scheme.short_name})\nEligibility: ${scheme.eligibility}\nProcess Steps:\n${scheme.process_steps.join('\n')}\nApprox Timeline: ${scheme.approx_timeline}\nApplicable Products: ${scheme.applicable_products.join(', ')}\nFee Structure: ${scheme.fee_structure || 'Standard BIS schedule'}`,
        keywords: [scheme.id, scheme.short_name.toLowerCase(), 'scheme', 'certification', 'license', 'apply', 'cml', ...scheme.applicable_products.map(p => p.toLowerCase())]
      });
    }

    // 3. Ingest Testing Labs
    for (const lab of labsData) {
      this.chunks.push({
        id: `lab-${lab.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        doc_type: 'lab',
        title: lab.name,
        source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/labs',
        content: `Testing Laboratory: ${lab.name}\nLocation: ${lab.address}, State: ${lab.state}, City: ${lab.city}\nAccreditation: ${lab.accreditation} (NABL: ${lab.nabl_number || 'N/A'})\nContact: ${lab.contact}\nTested Products & Scope: ${lab.tested_products.join(', ')}`,
        keywords: ['lab', 'testing', 'laboratory', 'nabl', lab.state.toLowerCase(), lab.city.toLowerCase(), ...lab.tested_products.map(p => p.toLowerCase())]
      });
    }

    // 4. Ingest Hallmarking Details
    for (const [lang, data] of Object.entries(hallmarkingData) as [string, any][]) {
      if (lang === 'en' && data.sections) {
        for (let i = 0; i < data.sections.length; i++) {
          const sec = data.sections[i];
          const sub = sec.sub_points ? '\n' + sec.sub_points.join('\n') : '';
          this.chunks.push({
            id: `hallmark-sec-${i}`,
            doc_type: 'hallmarking',
            title: `BIS Hallmarking - ${sec.heading}`,
            standard_number: 'IS 1417:2016',
            clause: 'Gold & Silver Hallmarking Regulations',
            source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/hallmarking',
            content: `Topic: ${sec.heading}\nStandard Reference: IS 1417:2016 / IS 2112\nInformation:\n${sec.body}${sub}`,
            keywords: ['hallmark', 'huid', 'gold', 'silver', 'jewellery', 'purity', '22k', '18k', 'ahc', 'bis care', 'assaying']
          });
        }
      }
    }

    // 5. Ingest Complaint Workflow
    const compWorkflow = complaintsData.general_workflow;
    this.chunks.push({
      id: 'complaint-workflow',
      doc_type: 'complaint',
      title: 'BIS Consumer Complaint & Enforcement Procedure',
      source_url: compWorkflow.portal_url,
      content: `Procedure for Consumer Complaints & Misuse of ISI/Hallmark:\nSteps:\n${compWorkflow.steps.join('\n')}\nEstimated Resolution Time: ${compWorkflow.estimated_time}\nEscalation & Helpline: ${compWorkflow.escalation_contact}\nRequired Documents: ${compWorkflow.required_documents.join(', ')}`,
      keywords: ['complaint', 'fake isi', 'spurious', 'fraud', 'report', 'grievance', 'bis care app', 'helpline', '1915', 'enforcement']
    });

    // 6. Ingest Dedicated ISI Number / CM/L License System Chunk
    this.chunks.push({
      id: 'isi-cml-license-system',
      doc_type: 'scheme',
      title: 'ISI Mark & CM/L License Number Verification Guide',
      standard_number: 'BIS Scheme I (ISI Mark)',
      clause: 'Product Certification & License Numbering System',
      source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards',
      content: `ISI Mark & CM/L License Number System:
- What is an ISI Number / CM/L Number: Under the BIS Product Certification Scheme (Scheme I), every authorized manufacturer is granted a unique 7-digit to 8-digit Certification Marks License (CM/L) number in the format "CM/L-XXXXXXX" (e.g. CM/L-8472910).
- Anatomy of the ISI Mark:
  1. Indian Standard Number (e.g., IS 14543, IS 3196, IS 4151) is printed ABOVE the ISI monogram.
  2. The ISI monogram symbol is in the center.
  3. The CM/L License number (e.g., CM/L-8472910) is printed directly BELOW the ISI monogram.
- How Consumers Can Verify Authenticity:
  1. Open the official BIS CARE Mobile App or visit manakonline.in.
  2. Tap on "Verify License Details" (CM/L).
  3. Enter the 7-digit CM/L number printed on the product.
  4. The system instantly reveals: Manufacturer/Company Name, Factory Address, Brand Name, Validity Status (Operative/Suspended/Expired), and Scope of certified product models.
  5. If the brand or product on the label does not match the BIS record, the product is counterfeit/spurious.
- Key Mandatory Products requiring ISI Mark: Packaged Drinking Water (IS 14543), LPG Cylinders (IS 3196), Two-Wheeler Helmets (IS 4151), Cattle Feed, Milk Powder, Infant Food, Pressure Cookers, Electrical Cables, Cement, and Steel TMT Bars.`,
      keywords: ['isi', 'isi mark', 'isi number', 'cml', 'cm/l', 'license number', 'cml number', 'verify isi', 'fake isi', 'isi certificate', 'manufacturer license', 'isi check']
    });

    // 7. Ingest Dedicated HUID Gold Hallmarking System Chunk
    this.chunks.push({
      id: 'huid-gold-hallmark-system',
      doc_type: 'hallmarking',
      title: 'Gold & Silver Hallmarking - 6-Digit HUID Code System',
      standard_number: 'IS 1417:2016',
      clause: 'Hallmark Unique Identification (HUID) Guidelines',
      source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/hallmarking',
      content: `Gold Hallmarking & 6-Digit HUID (Hallmark Unique Identification) System:
- What is HUID: A 6-digit alphanumeric unique identification code (e.g., "AY786K", "AB1234", "9K4M2P") laser-etched onto every piece of hallmarked gold jewellery in India under Indian Standard IS 1417:2016.
- The 3 Mandatory Hallmarking Marks on genuine gold jewellery:
  1. BIS Logo (official triangular Bureau of Indian Standards mark).
  2. Purity Grade & Fineness in Karats and Parts-per-Thousand:
     • 24K999 (99.9% pure gold - bullion/coins)
     • 23K958 (95.8% pure gold)
     • 22K916 (91.6% pure gold - most common traditional jewellery)
     • 20K833 (83.3% pure gold)
     • 18K750 (75.0% pure gold - diamond studded jewellery)
     • 14K585 (58.5% pure gold - lightweight/modern jewellery)
     • 9K375 (37.5% pure gold)
  3. 6-Digit Alphanumeric HUID (laser-etched unique ID for individual article traceability).
- Why HUID is Crucial:
  • Eliminates fraudulent claims of gold purity and under-karatage.
  • Gives complete end-to-end traceability to the certified Assaying & Hallmarking Centre (AHC) and registered jeweller.
  • Prevents misuse and unauthorized replication of hallmark stamps.
- How Consumers Can Verify HUID in seconds:
  1. Open the official BIS CARE Mobile App.
  2. Tap on "Verify HUID".
  3. Type the 6-digit alphanumeric code stamped on your jewellery.
  4. The app instantly displays: Jeweller Registration Number & Name, Assaying & Hallmarking Centre (AHC) details, Hallmarking Date, Article Type (Ring, Bangle, Necklace, etc.), and Certified Purity Grade.`,
      keywords: ['huid', 'huid number', 'hallmark', 'hallmarking', 'gold', 'gold purity', '22k916', '18k750', '24k999', 'jewellery', 'gold hallmark', 'ahc', 'assaying', 'six digit', 'gold verification']
    });

    // 8. Ingest BIS Overview Chunk for Greetings & General Queries
    this.chunks.push({
      id: 'bis-overview-mission',
      doc_type: 'standard',
      title: 'Bureau of Indian Standards (BIS) Overview & Services',
      standard_number: 'BIS Act 2016',
      clause: 'National Standards Body Functions & Citizen Services',
      source_url: 'https://www.bis.gov.in',
      content: `Bureau of Indian Standards (BIS):
- Role: The National Standards Body of India established under the Bureau of Indian Standards Act, 2016, operating under the Ministry of Consumer Affairs, Food & Public Distribution, Government of India.
- Core Pillars:
  1. Formulation of Indian Standards (over 21,000+ IS Codes across Food, Chemicals, Civil, Electronics, Mechanical, Textiles, etc.).
  2. Product Certification (ISI Mark Scheme I for domestic, FMCS Scheme X for foreign manufacturers).
  3. Compulsory Registration Scheme (CRS Scheme II) for Electronics & IT Goods.
  4. Mandatory Gold & Silver Hallmarking (IS 1417 with 6-digit HUID).
  5. Laboratory Testing & Recognition (NABL accredited test facilities).
  6. Consumer Safety, Quality Control Orders (QCOs), and Grievance Enforcement.
- Citizen Help Channels:
  • Official Portals: bis.gov.in and manakonline.in
  • Official Mobile App: "BIS CARE" (available on Android & iOS)
  • National Consumer Helpline: 1915 or 1800-11-4000
  • Enforcement & Fake Mark Grievances: complaints@bis.gov.in`,
      keywords: ['bis', 'bureau of indian standards', 'overview', 'sahayak', 'help', 'services', 'schemes', 'helpline', '1915', 'bis care', 'ministry of consumer affairs', 'hi', 'hello', 'namaste']
    });

    // 9. Ingest Platinum Jewellery Standards & Composition Guidance (IS 14127:2010)
    this.chunks.push({
      id: 'platinum-jewellery-standards',
      doc_type: 'hallmarking',
      title: 'Platinum Jewellery - Fineness, Composition & Hallmarking Standards (IS 14127:2010)',
      standard_number: 'IS 14127:2010',
      clause: 'Precious Metals Fineness & Hallmarking Specifications',
      source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/hallmarking',
      content: `Platinum Jewellery Buying Guide & BIS Composition Standards (IS 14127:2010):
- Overview: Platinum in India is governed under Indian Standard IS 14127:2010 for platinum jewellery fineness and hallmarking standards.
- Official Purity & Composition Grades (Parts per Thousand of Pure Platinum):
  1. Pt 950 (95.0% Pure Platinum): The gold standard for fine platinum jewellery and diamond settings. Contains 950 parts pure platinum per thousand, alloyed with 50 parts (5%) of other platinum-group metals (like ruthenium, cobalt, or copper) to achieve optimal ductility and durability. Highly hypoallergenic and recommended for daily wear and engagement rings.
  2. Pt 900 (90.0% Pure Platinum): Contains 900 parts pure platinum and 100 parts (10%) alloy. Slightly harder and more scratch-resistant, preferred for heavy wedding bands and men's signet rings.
  3. Pt 850 (85.0% Pure Platinum): Contains 850 parts pure platinum and 150 parts (15%) alloy. Denser and harder, used for specific structural mountings.
- Mandatory Hallmark Stamps on Platinum:
  1. BIS Triangular Mark
  2. Fineness Mark (e.g. Pt 950 or Pt 900)
  3. Assaying & Hallmarking Centre (AHC) mark & Jeweller's identification.
- Sound Consumer Purchase Tips in India:
  • Density & Weight: Platinum is ~60% heavier than 14K gold and nearly twice as dense as silver. When buying, ensure you check the physical weight against the price.
  • Natural Patina: Unlike white gold (which is yellow gold plated with rhodium), platinum is naturally white and never loses its color. Over time, it develops a soft, velvety patina of tiny micro-scratches, which many connoisseurs value as authentic character.
  • Hypoallergenic: Ideal for individuals with sensitive skin who get rashes from gold/silver alloy metals.
  • Always demand an invoice and purity certificate confirming the exact fineness (Pt 950) and weight.`,
      keywords: ['platinum', 'buy platinum', 'composition', 'fineness', 'pt 950', 'pt 900', 'is 14127', 'jewellery', 'hallmark', 'purity', 'alloy', 'ruthenium', 'cobalt', 'white gold', 'patina', 'hypoallergenic']
    });

    // 10. Ingest Individual Granular FAQ Chunks (Covering all 6 categories and comprehensive consumer/manufacturer queries)
    const faqList = [
      {
        id: 'faq-gold-purity-money',
        title: 'Buying Gold Jewellery & Ensuring Purity in India',
        keywords: ['gold', 'jewellery', 'purity', 'money', 'karat', 'hallmark', 'huid', 'right purity'],
        content: `How to ensure right purity when buying gold jewellery in India:
1. Always look for the 3 mandatory hallmark symbols: BIS triangular logo, Purity/Fineness grade (e.g., 22K916, 18K750), and the 6-digit alphanumeric HUID code.
2. Demand a proper tax invoice specifying gold weight, purity grade, making charges separately, and HUID number.
3. Verify the HUID code instantly using the official BIS CARE app to confirm the jeweller and assaying center.`
      },
      {
        id: 'faq-gold-ring-everyday',
        title: 'Gold Ring Purity for Everyday Use',
        keywords: ['gold ring', 'everyday use', 'purity', 'durability', '18k', '22k', 'wear and tear'],
        content: `Gold Purity for Everyday Use:
- For daily wear rings or heavy use, **18K (750 fineness)** or **14K (585 fineness)** is recommended because 22K gold is softer and more prone to scratching or bending over time.
- 18K gold contains 75% pure gold alloyed with 25% other metals (silver, copper, zinc) providing superior structural durability and scratch resistance.`
      },
      {
        id: 'faq-silver-jewellery',
        title: 'Silver Jewellery Purity Standards (IS 2112)',
        keywords: ['silver jewellery', 'purity', 'sterling silver', '925', 'is 2112'],
        content: `Silver Jewellery Purity Standards:
- Look for **Sterling Silver (92.5% pure silver)**, officially marked as **925** under Indian Standards (IS 2112).
- Genuine silver jewellery carries BIS hallmarking marks including the BIS logo, silver fineness grade (925, 900, 835, or 800), and assaying center mark.`
      },
      {
        id: 'faq-silver-coin-investment',
        title: 'Silver Coin Investment Purity & Markings',
        keywords: ['silver coin', 'investment', 'purity', 'markings', '999', 'fineness'],
        content: `Silver Coin Investment Guidelines:
- For investment coins/bars, check for **999 fineness (99.9% pure silver)** stamped on the coin along with the mint mark or refiner hallmarking stamp.
- Ensure you purchase sealed blister packs with certified weight and purity guarantees.`
      },
      {
        id: 'faq-gold-coin-verification',
        title: 'Gold Coin Purity and Authenticity Verification',
        keywords: ['gold coin', 'verify purity', 'authenticity', 'blister pack', '24k'],
        content: `Gold Coin Verification:
- Certified gold coins usually carry 24K 999 fineness and are hallmarked with HUID if sold by certified jewellers.
- Check that the coin is encased in tamper-proof tamper-evident blister packaging with assay certificate matching the stamped serial number.`
      },
      {
        id: 'faq-first-time-buyer-markings',
        title: 'First-Time Buyer Checklist for Jewellery BIS Markings',
        keywords: ['first time buyer', 'jewellery', 'bis markings', 'before paying'],
        content: `First-Time Jewellery Buyer BIS Checklist:
Before making payment, verify:
1. BIS triangular logo stamped on the piece.
2. Purity grade (e.g., 22K916 for 22 Karat).
3. 6-digit alphanumeric HUID code (verify on BIS CARE app).
4. Detailed invoice breaking down gold weight, purity, and making charges.`
      },
      {
        id: 'faq-pressure-cooker',
        title: 'Pressure Cooker Safety & Quality Standards (IS 2347 / IS 1660)',
        keywords: ['pressure cooker', 'safety', 'quality standards', 'is 2347', 'isi mark'],
        content: `Pressure Cooker BIS Requirements:
- Pressure cookers are under mandatory BIS certification (IS 2347 for domestic pressure cookers).
- Must bear the ISI mark, unique CM/L license number, safety valve rating, and manufacturer identification.`
      },
      {
        id: 'faq-helmet-compliance',
        title: 'Two-Wheeler Helmet BIS Compliance (IS 4151)',
        keywords: ['helmet', 'bis compliant', 'is 4151', 'isi mark', 'two wheeler'],
        content: `Two-Wheeler Helmet Compliance (IS 4151:2015):
- Helmets sold in India must mandatorily bear the ISI mark with IS 4151 standard.
- Check for the ISI certification mark, CM/L number, proper chin strap, and impact-absorption lining.`
      },
      {
        id: 'faq-electrical-appliance-bis',
        title: 'Electrical Appliance BIS Certification & CRS Requirements',
        keywords: ['electrical appliance', 'bis certification', 'crs', 'qco', 'is 302'],
        content: `Electrical Appliance Certification:
- Most electrical appliances require BIS certification under IS 302 safety standards or the Compulsory Registration Scheme (CRS) for electronic goods.
- Look for the ISI mark or BIS registration 'R-number' on the rating plate.`
      },
      {
        id: 'faq-electric-cable',
        title: 'Electric Cable BIS Standards for Houses (IS 694)',
        keywords: ['electric cable', 'house wiring', 'is 694', 'pvc insulated', 'isi mark'],
        content: `Electric Cable BIS Standards (IS 694):
- Household electrical wiring cables must comply with IS 694 for PVC insulated cables.
- Verify the ISI mark printed on the cable sheath along with voltage grade and manufacturer CM/L license number.`
      },
      {
        id: 'faq-packaged-drinking-water',
        title: 'Packaged Drinking Water BIS Requirements (IS 14543)',
        keywords: ['packaged drinking water', 'mineral water', 'is 14543', 'bottle water', 'isi mark'],
        content: `Packaged Drinking Water Requirements (IS 14543:2016):
- Packaged drinking water is strictly under mandatory BIS certification.
- Must display the ISI mark with IS 14543 and valid CM/L number. You can verify the bottler on the BIS CARE app.`
      },
      {
        id: 'faq-water-bottle',
        title: 'Water Bottle Material & BIS Standards',
        keywords: ['water bottle', 'material', 'food grade', 'is 10146', 'is 1530'],
        content: `Water Bottle Standards:
- Reusable plastic bottles must comply with food-grade plastic standards (IS 10146), while stainless steel bottles comply with IS 1530 specifications for hygienic food contact.`
      },
      {
        id: 'faq-cement-construction',
        title: 'Cement BIS Requirements for Construction (IS 269 / IS 1489)',
        keywords: ['cement', 'house construction', 'opc', 'ppc', 'is 269', 'is 1489', 'isi mark'],
        content: `Cement BIS Requirements:
- Cement is under mandatory certification (IS 269 for Ordinary Portland Cement, IS 1489 for Portland Pozzolana Cement).
- Bags must carry the ISI mark, grade designation, manufacturing week/year, and CM/L license number.`
      },
      {
        id: 'faq-steel-bars',
        title: 'Steel TMT Bars BIS Compliance (IS 1786)',
        keywords: ['steel bars', 'tmt bars', 'construction', 'is 1786', 'isi mark'],
        content: `Steel TMT Bars Compliance (IS 1786):
- TMT steel bars used in construction require mandatory ISI certification under IS 1786.
- Check for grade stamping (e.g., Fe 500D), manufacturer brand, and CM/L number on test certificates.`
      },
      {
        id: 'faq-children-toy',
        title: 'Children Toy BIS Safety Requirements (IS 9873)',
        keywords: ['children toy', 'toys safety', 'is 9873', 'qco', 'isi mark'],
        content: `Children's Toy Safety (IS 9873 Series & IS 15644):
- Toys sold in India are under mandatory BIS certification Quality Control Orders.
- Must display the ISI mark and age-safety compliance warnings.`
      },
      {
        id: 'faq-gas-stove',
        title: 'Gas Stove Safety & BIS Certification (IS 4246)',
        keywords: ['gas stove', 'lpg stove', 'is 4246', 'isi mark', 'burner safety'],
        content: `Gas Stove Certification (IS 4246):
- Domestic gas stoves must carry the ISI mark certifying gas leakage safety, burner efficiency, and robust structural durability.`
      },
      {
        id: 'faq-mixer-grinder',
        title: 'Mixer Grinder BIS Compliance (IS 4250)',
        keywords: ['mixer grinder', 'food processor', 'is 4250', 'isi mark', 'motor safety'],
        content: `Mixer Grinder Compliance (IS 4250):
- Household electrical food grinders/mixers require mandatory ISI certification ensuring electrical insulation safety and mechanical stability.`
      },
      {
        id: 'faq-vehicle-battery',
        title: 'Automotive Battery BIS Requirements',
        keywords: ['vehicle battery', 'car battery', 'storage battery', 'is 14257', 'isi mark'],
        content: `Automotive Storage Batteries:
- Lead-acid storage batteries for vehicles must comply with relevant Indian Standards (IS 14257 / IS 7372) and carry the ISI mark.`
      },
      {
        id: 'faq-power-bank',
        title: 'Power Bank BIS Certification & CRS Requirements',
        keywords: ['power bank', 'portable charger', 'crs', 'is 16105', 'is 13252'],
        content: `Power Bank Certification:
- Power banks require mandatory BIS registration under the Compulsory Registration Scheme (CRS) (IS 13252 / IS 16105) for lithium-ion battery safety and surge protection.`
      },
      {
        id: 'faq-led-bulb',
        title: 'LED Bulbs BIS Requirements (IS 16102)',
        keywords: ['led bulbs', 'home lighting', 'is 16102', 'safety', 'performance'],
        content: `LED Bulb Standards (IS 16102):
- Self-ballasted LED lamps for general lighting require BIS registration (CRS / ISI mark) ensuring safety, lumen output, and voltage fluctuation tolerance.`
      },
      {
        id: 'faq-verify-isi-genuine',
        title: 'Verifying Genuine ISI Mark on Products',
        keywords: ['verify isi mark', 'genuine isi', 'cml number', 'bis care app'],
        content: `How to verify a genuine ISI mark:
1. Locate the 7-digit CM/L number printed directly below the ISI mark.
2. Open the official BIS CARE mobile app and enter the CM/L number.
3. Confirm that the company name, brand name, and product scope match the physical product packaging.`
      },
      {
        id: 'faq-seller-claims-certified',
        title: 'Independent Verification of BIS Certification Claims',
        keywords: ['seller claims', 'independently verify', 'manakonline', 'licence check'],
        content: `Independent verification of seller certification claims:
- Ask the seller for their CM/L licence number or CRS registration number.
- Search the number on the Manakonline portal (manakonline.in) under "Verify Licensee" to check active validity.`
      },
      {
        id: 'faq-check-licence-validity',
        title: 'Checking BIS Licence Validity',
        keywords: ['check bis licence validity', 'licence status', 'expired licence', 'suspended'],
        content: `Checking BIS Licence Validity:
- A BIS licence has a limited validity (usually 1-2 years). You can check if a licence is active, expired, or suspended by querying the CM/L number on the Manakonline portal or BIS CARE app.`
      },
      {
        id: 'faq-missing-licence-number',
        title: 'Handling ISI Mark with Missing Licence Number',
        keywords: ['missing licence number', 'isi mark without cml', 'fake mark warning'],
        content: `What to do if ISI mark lacks a licence number:
- An ISI mark without a unique 7-digit CM/L number printed below it is illegal and likely counterfeit. Report it via the BIS CARE app or complaints@bis.gov.in.`
      },
      {
        id: 'faq-compare-two-products',
        title: 'Comparing Two Products with Different BIS Markings',
        keywords: ['compare two products', 'different bis markings', 'compliant product'],
        content: `Comparing two competing products:
- Check both products on the BIS CARE app using their CM/L or R-numbers. Ensure neither licence is suspended or expired, and verify that the product description matches the certified scope.`
      },
      {
        id: 'faq-seller-says-bis-approved',
        title: 'What to Ask Sellers Claiming "BIS Approved"',
        keywords: ['bis approved', 'seller claim', 'proof of certification', 'documents'],
        content: `What to ask sellers claiming "BIS approved":
1. Request the exact 7-digit CM/L licence number or CRS registration number.
2. Ask for a copy of the valid BIS licence certificate.
3. Verify the details instantly on the BIS CARE app.`
      },
      {
        id: 'faq-verify-huid-before-buying',
        title: 'Verifying Jewellery HUID Before Purchase',
        keywords: ['verify huid', 'before buying', 'jewellery hallmark', 'bis care app'],
        content: `Verifying HUID before buying jewellery:
- Use the "Verify HUID" feature on the BIS CARE mobile app to enter the 6-digit alphanumeric code stamped on the ornament and confirm its purity and jeweller registration.`
      },
      {
        id: 'faq-invalid-huid',
        title: 'Action for Invalid or Mismatched HUID',
        keywords: ['invalid huid', 'mismatched huid', 'fake hallmark report'],
        content: `Action for invalid HUID:
- If the BIS CARE app reports an unrecognized or mismatched HUID, do not purchase the item. Report the jeweller immediately to BIS authorities for investigation.`
      },
      {
        id: 'faq-distinguish-genuine-fake-isi',
        title: 'Distinguishing Genuine vs Fake ISI Standard Mark',
        keywords: ['genuine vs fake isi', 'distinguish', 'fraudulent mark'],
        content: `Distinguishing genuine vs fake ISI mark:
- Genuine ISI marks adhere to strict typographic proportions with the IS standard number on top and CM/L number below. Spurious products often print generic "ISI" without any CM/L number.`
      },
      {
        id: 'faq-verify-manufacturer-licensed',
        title: 'Verifying if a Manufacturer is Licensed by BIS',
        keywords: ['verify manufacturer', 'licensed by bis', 'manufacturer directory'],
        content: `Verifying licensed manufacturers:
- Use the "Search Licensee" directory on the Manakonline portal (manakonline.in) by typing the manufacturer's company name or brand name.`
      },
      {
        id: 'faq-manufacture-packaged-water',
        title: 'BIS Requirements for Manufacturing Packaged Drinking Water',
        keywords: ['manufacture packaged drinking water', 'factory requirements', 'is 14543 plant'],
        content: `Requirements for manufacturing packaged drinking water:
- Must set up an in-house testing laboratory complying with IS 14543, obtain factory inspection clearance, and secure a BIS product license under Scheme I.`
      },
      {
        id: 'faq-manufacture-helmets',
        title: 'Manufacturing Helmets - Indian Standard Guidance',
        keywords: ['manufacture helmets', 'is 4151 plant', 'helmet factory license'],
        content: `Helmet Manufacturing Guidance:
- Manufacturers must comply with IS 4151:2015, install impact testing equipment, and secure a BIS manufacturing licence before commercial distribution.`
      },
      {
        id: 'faq-manufacture-electrical-switches',
        title: 'BIS Certification for Electrical Switches (IS 3854)',
        keywords: ['manufacture electrical switches', 'is 3854', 'switch licence'],
        content: `Electrical Switch Manufacturing:
- Electrical switches are under compulsory certification (IS 3854). Manufacturers must test samples in NABL labs and undergo BIS factory inspection.`
      },
      {
        id: 'faq-jewellery-business',
        title: 'BIS Hallmarking Compliance for Jewellery Businesses',
        keywords: ['jewellery business', 'hallmarking registration', 'jeweller registration'],
        content: `Jewellery Business BIS Compliance:
- Every jeweller selling gold or silver jewellery must obtain BIS hallmarking registration online via the BIS portal and source articles exclusively from registered assaying and hallmarking centers.`
      },
      {
        id: 'faq-manufacture-toys',
        title: 'Toy Manufacturing Certification Requirements (IS 9873)',
        keywords: ['manufacture toys', 'toy license', 'is 9873 compliance'],
        content: `Toy Manufacturing Requirements:
- Toy manufacturers in India must obtain BIS certification under IS 9873 series covering mechanical, physical, and chemical safety parameters.`
      },
      {
        id: 'faq-import-electrical-product',
        title: 'Importing Electrical Products into India - BIS Rules',
        keywords: ['import electrical product', 'fmcs scheme x', 'crs import'],
        content: `Importing Electrical Products:
- Foreign manufacturers must obtain a Foreign Manufacturers Certification Scheme (FMCS) licence or CRS registration through an Authorized Indian Representative (AIR) before importing into India.`
      },
      {
        id: 'faq-sell-imported-product',
        title: 'Determining Mandatory BIS Certification for Imported Goods',
        keywords: ['sell imported product', 'mandatory certification import', 'qco import'],
        content: `Selling Imported Goods:
- Check if the imported product falls under a Quality Control Order (QCO). If so, customs clearance and sale in India require valid BIS certification numbers.`
      },
      {
        id: 'faq-small-manufacturing-business',
        title: 'Checking Compulsory Certification for Small Businesses',
        keywords: ['small manufacturing business', 'compulsory certification check'],
        content: `Checking Compulsory Certification:
- Visit the BIS portal under "Product Certification / QCO list" or consult BIS Sahayak with your product category to verify if mandatory licensing applies.`
      },
      {
        id: 'faq-new-product-no-standard',
        title: 'Developing New Products Without Existing Indian Standard',
        keywords: ['new product', 'no standard', 'new standard formulation'],
        content: `New Products Without Standard:
- If no Indian Standard exists, manufacturers can approach the relevant BIS Sectional Committee to request formulation of a new Indian Standard or interim guidelines.`
      },
      {
        id: 'faq-isi-licence-factory-process',
        title: 'Factory ISI Licence Application Process',
        keywords: ['isi licence factory process', 'apply for isi', 'manakonline steps'],
        content: `ISI Licence Factory Process:
1. Register on Manakonline portal.
2. Submit application with factory layout, machinery list, and calibration records.
3. Arrange sample testing at BIS-recognized lab.
4. Host BIS inspecting officer for factory audit and sample drawal.`
      },
      {
        id: 'faq-explain-standard-simple',
        title: 'Explaining Indian Standards in Simple Language',
        keywords: ['explain standard simple', 'plain language', 'technical clauses summary'],
        content: `Explaining Indian Standards:
- BIS standards define precise dimensions, raw material purity, safety test limits, and performance benchmarks. BIS Sahayak translates these technical clauses into plain language upon request.`
      },
      {
        id: 'faq-technical-parameters',
        title: 'Focus Technical Parameters for BIS Manufacturing',
        keywords: ['technical parameters', 'manufacturing compliance', 'testing parameters'],
        content: `Key Technical Parameters:
- Focus on raw material quality control, dimensional tolerances, electrical insulation strength, chemical composition limits, and destructive/non-destructive sample testing specified in the IS code.`
      },
      {
        id: 'faq-identify-applicable-standard',
        title: 'Identifying Applicable Indian Standard for Products',
        keywords: ['identify applicable standard', 'find is code', 'product search'],
        content: `Identifying Applicable Standards:
- Search the product keyword on the BIS portal "Search Standards" directory or ask BIS Sahayak by describing your product features and application.`
      },
      {
        id: 'faq-mandatory-vs-voluntary',
        title: 'Difference Between Mandatory and Voluntary Standards',
        keywords: ['mandatory vs voluntary standard', 'qco notification'],
        content: `Mandatory vs Voluntary Standards:
- Standards are voluntary by default unless enforced by the Central Government via a Quality Control Order (QCO) for public safety or environmental protection, making certification legally compulsory.`
      },
      {
        id: 'faq-standard-vs-scheme',
        title: 'Difference Between BIS Standard and Certification Scheme',
        keywords: ['standard vs certification scheme', 'is specification vs scheme i'],
        content: `Difference Between Standard and Scheme:
- An Indian Standard (IS) is the technical document defining product specifications. A BIS Certification Scheme (like Scheme I ISI or CRS) is the regulatory mechanism granting permission to use conformity marks after testing and factory inspection.`
      },
      {
        id: 'faq-testing-requirements',
        title: 'Product Testing Requirements Under Indian Standards',
        keywords: ['testing requirements', 'indian standard test protocols', 'lab test'],
        content: `Testing Requirements:
- Testing includes physical stress tests, chemical purity analysis, thermal endurance, electrical safety tests, and dimensional checks conducted in NABL/BIS-recognized laboratories.`
      },
      {
        id: 'faq-documents-required',
        title: 'Documents Required for BIS Certification',
        keywords: ['documents required bis certification', 'checklist', 'factory proof'],
        content: `Documents Required for BIS Certification:
- Factory registration proof, machinery list, test equipment calibration certificates, raw material test reports, factory plot layout, and authorized signatory details.`
      },
      {
        id: 'faq-standard-revision',
        title: 'BIS Standard Revision Cycle',
        keywords: ['standard revision', 'periodic review', '5 years update'],
        content: `Standard Revision Cycle:
- BIS reviews and revises Indian Standards periodically (typically every 5 years) to incorporate technological advancements, safety upgrades, and international harmonization.`
      },
      {
        id: 'faq-latest-version',
        title: 'Ensuring Compliance with Latest Standard Version',
        keywords: ['latest version of indian standard', 'check revision', 'standards catalog'],
        content: `Checking Latest Standard Versions:
- Manufacturers must verify the current active year of publication on the BIS Standards Catalog (bis.gov.in) to ensure compliance with the latest amendments.`
      },
      {
        id: 'faq-non-compliance-consequences',
        title: 'Consequences of Product Non-Compliance with Standards',
        keywords: ['non compliance consequences', 'penalties', 'licence suspension'],
        content: `Consequences of Non-Compliance:
- Violations lead to immediate licence suspension, product recalls, heavy financial penalties, and prosecution under the BIS Act 2016 resulting in imprisonment of up to 2 years.`
      },
      {
        id: 'faq-poor-quality-isi',
        title: 'What to Do When ISI-Marked Product is Poor Quality',
        keywords: ['poor quality isi product', 'defective certified product', 'grievance'],
        content: `Action for Poor Quality ISI Product:
- Preserve the purchase bill and defective item. File an official grievance through the BIS CARE app or National Consumer Helpline (1915) for market surveillance investigation.`
      },
      {
        id: 'faq-report-fake-isi',
        title: 'Reporting Suspected Fake ISI Marks',
        keywords: ['report fake isi', 'suspect spurious mark', 'enforcement raid'],
        content: `Reporting Fake ISI Marks:
- Report suspected fake marks immediately via the BIS CARE app or email complaints@bis.gov.in with store location, photos, and invoice. BIS enforcement conducts surprise raids.`
      },
      {
        id: 'faq-uncertified-product-sale',
        title: 'Reporting Sale of Uncertified Mandatory Products',
        keywords: ['uncertified product sale', 'mandatory qco violation', 'report illegal sale'],
        content: `Reporting Uncertified Mandatory Products:
- If a manufacturer sells QCO-notified goods without a BIS licence, report the violation to BIS regional enforcement cells for legal prosecution and seizure.`
      },
      {
        id: 'faq-product-failure',
        title: 'Raising Complaints for Certified Product Failure',
        keywords: ['product failure during use', 'certified product broke', 'investigation'],
        content: `Complaint for Certified Product Failure:
- Raise a formal complaint via BIS CARE app providing batch number and purchase details. BIS will draw independent market samples for laboratory re-testing.`
      },
      {
        id: 'faq-gold-purity-misrepresentation',
        title: 'Steps for Gold Purity Misrepresentation by Jewellers',
        keywords: ['gold purity misrepresentation', 'jeweller cheating', 'under karatage'],
        content: `Steps for Gold Purity Misrepresentation:
1. Verify the HUID code on BIS CARE app.
2. If discrepancy is found, test the article at a BIS-recognized Assaying & Hallmarking Centre.
3. File a formal complaint with BIS and consumer forums.`
      },
      {
        id: 'faq-misleading-packaging',
        title: 'Reporting Misleading Packaging Claims on Certified Goods',
        keywords: ['misleading packaging claims', 'false standard claim', 'bis complaint'],
        content: `Reporting Misleading Packaging:
- Misrepresenting IS standards or printing unauthorized conformity logos on packaging violates the BIS Act and can be reported via the BIS CARE app for penal action.`
      },
      {
        id: 'faq-incorrect-mark',
        title: 'Procedure for Incorrect BIS Mark on Products',
        keywords: ['incorrect bis mark', 'wrong standard number printed', 'proceed'],
        content: `Procedure for Incorrect BIS Mark:
- Report products carrying wrong standard numbers or mismatched license details through the BIS CARE portal for regulatory verification.`
      },
      {
        id: 'faq-refuses-certification',
        title: 'What to Do When Sellers Refuse Certification Details',
        keywords: ['seller refuses certification details', 'withholds licence info', 'avoid purchase'],
        content: `When Sellers Refuse Certification Details:
- Exercise consumer caution and avoid purchasing regulated products from vendors who refuse to provide valid BIS licence numbers or tax invoices.`
      },
      {
        id: 'faq-counterfeit-evidence',
        title: 'Evidence Preservation for Counterfeit BIS Product Complaints',
        keywords: ['counterfeit bis product evidence', 'preserve bill photo batch', 'complaint prep'],
        content: `Evidence Preservation for Complaints:
- Keep the original purchase invoice, clear photos of the product and packaging labels, batch number, store address, and contact details when filing a counterfeit complaint.`
      }
    ];

    for (const faq of faqList) {
      this.chunks.push({
        id: faq.id,
        doc_type: 'scheme',
        title: faq.title,
        standard_number: 'BIS Act 2016 & Rules',
        clause: 'Frequently Asked Questions',
        source_url: 'https://www.bis.gov.in',
        content: faq.content,
        keywords: faq.keywords
      });
    }

    this.isInitialized = true;
  }

  /**
   * Tokenizes text into searchable word stems/terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  /**
   * Hybrid RAG Retrieval with Synonym Expansion & Precise Scoring:
   * Combines lexical keyword scoring + exact phrase boosts + standard number match + synonym mapping
   */
  public search(query: string, topK = 4): RetrievalResult[] {
    if (!query || query.trim().length === 0) {
      return this.getDefaultOverviewResults(topK);
    }

    const queryLower = query.toLowerCase().trim();

    // Check for conversational greetings
    const isGreeting = /^(hi|hello|hey|namaste|namaskar|good\s+morning|good\s+afternoon|good\s+evening|greetings|help|who\s+are\s+you|what\s+can\s+you\s+do)[\s!.]*$/i.test(queryLower);
    if (isGreeting) {
      return this.getDefaultOverviewResults(topK);
    }

    // Synonym & intent expansion
    let expandedQuery = queryLower;
    if (queryLower.includes('huid') || queryLower.includes('hallmark')) expandedQuery += ' gold purity 22k 18k is 1417';
    if (queryLower.includes('isi') || queryLower.includes('cml') || queryLower.includes('license')) expandedQuery += ' certification scheme i cml number';
    if (queryLower.includes('water') || queryLower.includes('tds')) expandedQuery += ' is 14543 packaged drinking water';
    if (queryLower.includes('helmet')) expandedQuery += ' is 4151 two wheeler safety';
    if (queryLower.includes('cylinder') || queryLower.includes('lpg')) expandedQuery += ' is 3196 gas pressure vessel';

    const queryTokens = this.tokenize(expandedQuery);

    // Check for explicit standard numbers like "IS 14543", "IS 3196", "1417", "13252"
    const isCodeMatch = queryLower.match(/is\s*([0-9]{3,5})/i);
    const targetCode = isCodeMatch ? `is ${isCodeMatch[1]}` : null;

    const scored: Array<{ chunk: DocumentChunk; score: number }> = [];

    for (const chunk of this.chunks) {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.title.toLowerCase();

      // 1. Direct standard number exact boost
      if (targetCode && chunk.standard_number && chunk.standard_number.toLowerCase().includes(targetCode)) {
        score += 100;
      }

      // 2. Exact phrase match in content or title
      if (contentLower.includes(queryLower)) {
        score += 60;
      }
      if (titleLower.includes(queryLower)) {
        score += 55;
      }

      // 3. Keyword / Token overlap scoring with frequency weighting
      for (const token of queryTokens) {
        if (chunk.keywords.some(k => k === token || k.includes(token) || token.includes(k))) {
          score += 25;
        }
        if (titleLower.includes(token)) {
          score += 18;
        }
        if (contentLower.includes(token)) {
          score += 10;
        }
      }

      // 4. Boost for specific domain intents
      if (queryLower.includes('isi') || queryLower.includes('cml') || queryLower.includes('license number') || queryLower.includes('isi number')) {
        if (chunk.id === 'isi-cml-license-system' || chunk.doc_type === 'scheme') {
          score += 50;
        }
      }
      if (queryLower.includes('gold') || queryLower.includes('hallmark') || queryLower.includes('huid') || queryLower.includes('purity') || queryLower.includes('22k')) {
        if (chunk.id === 'huid-gold-hallmark-system' || chunk.doc_type === 'hallmarking' || (chunk.standard_number && chunk.standard_number.includes('1417'))) {
          score += 50;
        }
      }
      // If query is about silver, skip platinum chunks entirely
      if (queryLower.includes('silver') && (chunk.id === 'platinum-jewellery-standards' || chunk.standard_number === 'IS 14127:2010')) {
        continue;
      }

      if (queryLower.includes('platinum') || queryLower.includes('pt 950') || queryLower.includes('pt 900')) {
        if (chunk.id === 'platinum-jewellery-standards' || chunk.standard_number === 'IS 14127:2010') {
          score += 90;
        }
      }
      if (queryLower.includes('silver') || queryLower.includes('sterling')) {
        if (chunk.id === 'faq-silver-jewellery' || chunk.id === 'faq-silver-coin-investment' || chunk.standard_number?.includes('2112') || chunk.title.toLowerCase().includes('silver')) {
          score += 160;
        }
      }
      if (queryLower.includes('water') || queryLower.includes('drinking water') || queryLower.includes('bottled')) {
        if (chunk.standard_number && chunk.standard_number.includes('14543')) {
          score += 45;
        }
      }
      if (queryLower.includes('cylinder') || queryLower.includes('lpg') || queryLower.includes('gas')) {
        if (chunk.standard_number && chunk.standard_number.includes('3196')) {
          score += 45;
        }
      }
      if (queryLower.includes('helmet') || queryLower.includes('two wheeler')) {
        if (chunk.standard_number && chunk.standard_number.includes('4151')) {
          score += 45;
        }
      }
      if (queryLower.includes('complaint') || queryLower.includes('fake') || queryLower.includes('fraud') || queryLower.includes('spurious') || queryLower.includes('grievance')) {
        if (chunk.doc_type === 'complaint') {
          score += 45;
        }
      }
      if (queryLower.includes('lab') || queryLower.includes('testing') || queryLower.includes('nabl') || queryLower.includes('test near')) {
        if (chunk.doc_type === 'lab') {
          score += 45;
        }
      }
      if (queryLower.includes('scheme') || queryLower.includes('crs') || queryLower.includes('fmcs') || queryLower.includes('license process')) {
        if (chunk.doc_type === 'scheme') {
          score += 40;
        }
      }

      if (score > 6) {
        scored.push({ chunk, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    // If query returned no direct hits, return default overview corpus results
    if (scored.length === 0) {
      return this.getDefaultOverviewResults(topK);
    }

    return scored.slice(0, topK).map(item => ({
      chunk: item.chunk,
      score: item.score,
      citation: {
        standard_number: item.chunk.standard_number || (item.chunk.doc_type === 'scheme' ? item.chunk.title : 'BIS Portal Reference'),
        title: item.chunk.title,
        clause: item.chunk.clause || (item.chunk.doc_type === 'standard' ? 'Official IS Specification' : undefined),
        source_url: item.chunk.source_url
      }
    }));
  }

  private getDefaultOverviewResults(topK = 4): RetrievalResult[] {
    const overviewChunkIds = ['bis-overview-mission', 'isi-cml-license-system', 'huid-gold-hallmark-system', 'complaint-workflow'];
    const selected = this.chunks.filter(c => overviewChunkIds.includes(c.id));
    return selected.slice(0, topK).map(chunk => ({
      chunk,
      score: 50,
      citation: {
        standard_number: chunk.standard_number || 'BIS Reference',
        title: chunk.title,
        clause: chunk.clause || 'Overview Guidance',
        source_url: chunk.source_url
      }
    }));
  }

  public getAllStandards() {
    return standardsData;
  }

  public getAllSchemes() {
    return schemesData;
  }

  public getAllLabs() {
    return labsData;
  }

  public getHallmarkingData(lang: string = 'en') {
    const selected = (hallmarkingData as Record<string, { sections: any[] }>)[lang] || hallmarkingData['en'];
    return selected;
  }

  public getComplaintWorkflow() {
    return complaintsData;
  }
}

export const knowledgeBase = new KnowledgeBaseEngine();
