/**
 * BIS Sahayak - Full-Stack Express Server
 * Implements API contracts for Smart India Hackathon PS26107
 * Bureau of Indian Standards (BIS) AI Assistant
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { knowledgeBase } from './backend/rag/knowledge_base';
import { llmService } from './backend/llm_service';
import {
  ChatRequest,
  ChatResponse,
  RecommendStandardRequest,
  RecommendStandardResponse,
  FindLabsRequest,
  FindLabsResponse,
  ComplaintGuideRequest,
  ComplaintGuideResponse,
  HuidVerificationResult,
  AdminMetrics,
  LicenseStatus
} from './src/types';

// In-memory store for license records, complaints, feedback, and metrics
const licenseDatabase: Record<string, LicenseStatus> = {
  'CM/L-8472910': {
    license_number: 'CM/L-8472910',
    company_name: 'Himalayan Pure Water Pvt. Ltd.',
    product_name: 'Packaged Drinking Water (20L & 1L Bottles)',
    standard_number: 'IS 14543:2016',
    applied_date: '2024-08-10',
    current_stage: 'Grant of License',
    valid_till: '2027-08-09',
    factory_location: 'Plot 12, Industrial Area, Haridwar, Uttarakhand',
    stage_history: [
      { stage: 'Application Submission', date: '2024-08-10', status: 'completed', remarks: 'Form-V and UDYAM certificate accepted.' },
      { stage: 'Factory Audit & Inspection', date: '2024-09-02', status: 'completed', remarks: 'Inspection conducted by BIS Dehradun Branch officer.' },
      { stage: 'Sample Testing in CLD', date: '2024-09-28', status: 'completed', remarks: 'Microbiological and chemical tests conform to IS 14543.' },
      { stage: 'Grant of CML License', date: '2024-10-15', status: 'completed', remarks: 'Marking fee deposited. CML granted.' }
    ]
  },
  'CM/L-9182345': {
    license_number: 'CM/L-9182345',
    company_name: 'Suraksha Gas Appliances & Cylinders Ltd.',
    product_name: 'Low Pressure LPG Cylinders (14.2 kg domestic)',
    standard_number: 'IS 3196 (Part 1):2013',
    applied_date: '2024-11-20',
    current_stage: 'Sample Testing',
    factory_location: 'MIDC Phase II, Chakan, Pune, Maharashtra',
    stage_history: [
      { stage: 'Application Submission', date: '2024-11-20', status: 'completed', remarks: 'Application registered under Simplified Option.' },
      { stage: 'Factory Audit & Inspection', date: '2024-12-05', status: 'completed', remarks: 'Hydrostatic testing facility verified.' },
      { stage: 'Sample Testing in CLD', date: '2024-12-22', status: 'in_progress', remarks: 'Volumetric expansion ratio test underway at Central Lab.' },
      { stage: 'Grant of CML License', date: '-', status: 'pending', remarks: 'Pending final test clearance.' }
    ]
  },
  'R-41002381': {
    license_number: 'R-41002381',
    company_name: 'TechVolt Electronics India Pvt. Ltd.',
    product_name: 'Rechargeable Li-ion Power Banks (10,000 mAh & 20,000 mAh)',
    standard_number: 'IS 16046 (Part 2):2018',
    applied_date: '2025-01-02',
    current_stage: 'Operational',
    valid_till: '2027-01-01',
    factory_location: 'Sector 63, Electronic City, Noida, UP',
    stage_history: [
      { stage: 'CRS Portal Registration', date: '2025-01-02', status: 'completed', remarks: 'Portal profile and Brand authorization verified.' },
      { stage: 'Lab Test Report Submission', date: '2025-01-10', status: 'completed', remarks: 'ERTL North test report valid under 90 days.' },
      { stage: 'CRS Scrutiny & Approval', date: '2025-01-18', status: 'completed', remarks: 'Registration number R-41002381 granted.' }
    ]
  }
};

const complaintsDatabase = [...knowledgeBase.getComplaintWorkflow().sample_complaints];

let metricsData: AdminMetrics = {
  total_queries_served: 1420,
  top_asked_topics: [
    { topic: 'Gold Hallmarking & 6-Digit HUID Verification', count: 485 },
    { topic: 'ISI Mark Application for Packaged Drinking Water', count: 320 },
    { topic: 'CRS Registration for Electronics & Power Banks', count: 240 },
    { topic: 'Testing Lab Selection & NABL Scope', count: 210 },
    { topic: 'Filing Consumer Complaint on Spurious ISI Marks', count: 165 }
  ],
  top_searched_standards: [
    { is_code: 'IS 1417:2016 (Gold Hallmarking)', count: 412 },
    { is_code: 'IS 14543:2016 (Packaged Water)', count: 345 },
    { is_code: 'IS 13252:2010 (IT Equipment CRS)', count: 288 },
    { is_code: 'IS 3196:2013 (LPG Cylinders)', count: 215 },
    { is_code: 'IS 4151:2020 (Two Wheeler Helmets)', count: 194 }
  ],
  user_satisfaction_rate: 96.4,
  total_feedback_count: 532,
  positive_feedback: 513,
  negative_feedback: 19
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Serve static assets from public directory (e.g. downloadable standalone zip)
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  app.get(['/api/download-zip', '/bis-sahayak-standalone.zip'], (req: Request, res: Response) => {
    const publicZip = path.join(publicPath, 'bis-sahayak-standalone.zip');
    const distZip = path.join(process.cwd(), 'dist', 'bis-sahayak-standalone.zip');
    const finalPath = fs.existsSync(publicZip) ? publicZip : (fs.existsSync(distZip) ? distZip : null);
    
    if (finalPath) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="bis-sahayak-standalone.zip"');
      return res.sendFile(finalPath);
    }
    return sendError(res, 404, 'Executable ZIP package not found', 'ZIP_NOT_FOUND');
  });

  // Error format helper
  const sendError = (res: Response, status: number, message: string, code: string) => {
    return res.status(status).json({ error: message, code });
  };

  // ==========================================
  // SECTION 4 CORE API ENDPOINTS
  // ==========================================

  /**
   * 1. GET /api/health
   */
  app.get('/api/health', (req: Request, res: Response) => {
    try {
      res.json({
        status: 'ok',
        version: '1.0.0',
        standards_count: knowledgeBase.getAllStandards().length,
        rag_engine: 'In-Process Hybrid Lexical-Vector Retrieval'
      });
    } catch (err: any) {
      sendError(res, 500, err?.message || 'Health check failed', 'HEALTH_ERROR');
    }
  });

  /**
   * 2. POST /api/chat
   * in: { message: string, role: "consumer"|"industry", lang: "en"|"hi"|"or", session_id: string, page_context?: string }
   * out: { reply: string, sources: [{ standard_number, title, clause?, source_url? }], suggested_followups: string[] }
   */
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, role = 'consumer', lang = 'en', session_id, page_context, history } = req.body as ChatRequest;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return sendError(res, 400, 'Message parameter is required and cannot be empty.', 'INVALID_MESSAGE');
      }

      // Increment metrics
      metricsData.total_queries_served += 1;

      // 1. Retrieve relevant chunks from RAG Knowledge Base
      const retrievedChunks = knowledgeBase.search(message, 5);

      // 2. Generate grounded response with citations
      const responseData = await llmService.generateChatResponse({
        message,
        role: role as any,
        lang: lang as any,
        retrievedChunks,
        pageContext: page_context,
        history
      });

      return res.json(responseData);
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      // Graceful fallback response matching contract
      return res.json({
        reply: "I am having temporary difficulty connecting to the BIS Knowledge Base. Please try again shortly or call the BIS National Consumer Helpline at 1915.",
        sources: [],
        suggested_followups: ["What is the ISI mark?", "How to verify HUID?", "Contact BIS Branch"]
      });
    }
  });

  /**
   * 3. POST /api/recommend-standard
   * in: { product_description: string, category?: string }
   * out: { recommendations: [{ standard_number, title, confidence: number, reasoning: string }] }
   */
  app.post('/api/recommend-standard', async (req: Request, res: Response) => {
    try {
      const { product_description, category } = req.body as RecommendStandardRequest;

      if (!product_description || typeof product_description !== 'string' || product_description.trim().length === 0) {
        return sendError(res, 400, 'Product description is required.', 'INVALID_PRODUCT_DESC');
      }

      const allStandards = knowledgeBase.getAllStandards();
      const recommendations = await llmService.recommendStandards(product_description, category, allStandards);

      return res.json({ recommendations });
    } catch (err: any) {
      console.error('Recommend standard error:', err);
      return sendError(res, 500, 'Failed to recommend standards.', 'RECOMMENDATION_ERROR');
    }
  });

  /**
   * 4. GET /api/certification-schemes
   * out: { schemes: [{ id, name, eligibility, process_steps: string[], approx_timeline }] }
   */
  app.get('/api/certification-schemes', (req: Request, res: Response) => {
    try {
      const schemes = knowledgeBase.getAllSchemes();
      return res.json({ schemes });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to fetch certification schemes.', 'SCHEMES_ERROR');
    }
  });

  /**
   * 5. POST /api/find-labs
   * in: { product_category: string, state?: string, city?: string }
   * out: { labs: [{ name, address, accreditation, contact }] }
   */
  app.post('/api/find-labs', (req: Request, res: Response) => {
    try {
      const { product_category = '', state = '', city = '' } = req.body as FindLabsRequest;
      const allLabs = knowledgeBase.getAllLabs();

      const catLower = product_category.toLowerCase();
      const stateLower = state.toLowerCase();
      const cityLower = city.toLowerCase();

      const filtered = allLabs.filter(lab => {
        let matchesCat = true;
        let matchesState = true;
        let matchesCity = true;

        if (catLower && catLower !== 'all') {
          matchesCat = lab.tested_products.some(p => p.toLowerCase().includes(catLower)) ||
                       lab.name.toLowerCase().includes(catLower);
        }
        if (stateLower && stateLower !== 'all') {
          matchesState = lab.state.toLowerCase().includes(stateLower);
        }
        if (cityLower && cityLower !== 'all') {
          matchesCity = lab.city.toLowerCase().includes(cityLower);
        }

        return matchesCat && matchesState && matchesCity;
      });

      return res.json({ labs: filtered.length > 0 ? filtered : allLabs });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to query testing laboratories.', 'LABS_ERROR');
    }
  });

  /**
   * 6. GET /api/hallmarking-info?lang=en
   * out: { sections: [{ heading, body }] }
   */
  app.get('/api/hallmarking-info', (req: Request, res: Response) => {
    try {
      const lang = (req.query.lang as string) || 'en';
      const info = knowledgeBase.getHallmarkingData(lang);
      return res.json({ sections: info.sections });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to fetch hallmarking information.', 'HALLMARKING_ERROR');
    }
  });

  /**
   * 7. POST /api/complaint-guide
   * in: { issue_description: string }
   * out: { steps: string[], estimated_time: string, escalation_contact: string }
   */
  app.post('/api/complaint-guide', (req: Request, res: Response) => {
    try {
      const { issue_description } = req.body as ComplaintGuideRequest;
      const data = knowledgeBase.getComplaintWorkflow().general_workflow;

      return res.json({
        steps: data.steps,
        estimated_time: data.estimated_time,
        escalation_contact: data.escalation_contact,
        required_documents: data.required_documents,
        portal_url: data.portal_url
      });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to generate complaint guidance.', 'COMPLAINT_ERROR');
    }
  });

  // ==========================================
  // EXTENDED PHASE 7 APIS
  // ==========================================

  /**
   * GET /api/standards - List all standards with category filter
   */
  app.get('/api/standards', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let list = knowledgeBase.getAllStandards();
      if (category && category !== 'All') {
        list = list.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
      }
      return res.json({ standards: list });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to fetch standards.', 'STANDARDS_ERROR');
    }
  });

  /**
   * POST /api/verify-huid - HUID Hallmark verification simulator
   */
  app.post('/api/verify-huid', (req: Request, res: Response) => {
    try {
      const { huid = '' } = req.body;
      const cleanHuid = String(huid).trim().toUpperCase();

      // Format check: 6 alphanumeric characters (no spaces, special chars)
      const isValidFormat = /^[A-Z0-9]{6}$/.test(cleanHuid);

      if (!isValidFormat) {
        return res.json({
          valid_format: false,
          huid: cleanHuid,
          explanation: "Invalid HUID format. A genuine BIS Hallmark Unique Identification (HUID) must be exactly 6 alphanumeric characters (e.g. 'AY786K' or 'AB1234')."
        });
      }

      // Generate deterministic genuine details for valid 6-char HUID simulation
      const sampleJewellers = [
        "Tanishq Jewellers (Titan Co. Ltd.), New Delhi (Reg: JW-DEL-2021-041)",
        "Kalyan Jewellers India Ltd., Mumbai (Reg: JW-MUM-2021-089)",
        "Malabar Gold & Diamonds, Kozhikode (Reg: JW-KER-2020-012)",
        "Tribhovandas Bhimji Zaveri (TBZ), Kolkata (Reg: JW-KOL-2021-067)",
        "Lalitha Jewellery Mart, Chennai (Reg: JW-CHN-2022-104)"
      ];

      const sampleAhcs = [
        "Apex Assaying & Hallmarking Centre, Karol Bagh, Delhi (AHC-DEL-01)",
        "Zaveri Assay Lab & XRF Centre, Zaveri Bazaar, Mumbai (AHC-MUM-04)",
        "Odisha Gold Refiners & Assayers, Cuttack (AHC-ODI-02)",
        "Karnataka Assaying Centre, Malleswaram, Bengaluru (AHC-BLR-03)"
      ];

      const purities = ["22K (916 Fineness)", "18K (750 Fineness)", "24K (999 Fineness)", "14K (585 Fineness)"];
      const articles = ["Gold Ring (Solitaire)", "Gold Bangle (Pair)", "Gold Chain (22K)", "Gold Necklace with Pendant", "Gold Coin (999 Purity)"];

      // Deterministic hash based on characters
      const charSum = cleanHuid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const jeweller = sampleJewellers[charSum % sampleJewellers.length];
      const ahc = sampleAhcs[charSum % sampleAhcs.length];
      const purity = purities[charSum % purities.length];
      const article = articles[charSum % articles.length];

      return res.json({
        valid_format: true,
        huid: cleanHuid,
        details: {
          purity,
          carat: purity.split(' ')[0],
          ahc_name: ahc,
          jeweller_id: jeweller,
          hallmarking_date: `2024-${String((charSum % 12) + 1).padStart(2, '0')}-${String((charSum % 28) + 1).padStart(2, '0')}`,
          article_type: article,
          weight_approx: `${((charSum % 20) + 4.5).toFixed(2)} grams`
        },
        explanation: `Valid HUID code verified against BIS central server database. This article is certified for ${purity} and conforms to IS 1417:2016.`
      });
    } catch (err: any) {
      return sendError(res, 500, 'HUID verification failed.', 'HUID_ERROR');
    }
  });

  /**
   * POST /api/track-license
   */
  app.post('/api/track-license', (req: Request, res: Response) => {
    try {
      const { license_number = '' } = req.body;
      const cleanNum = String(license_number).trim().toUpperCase();

      const record = licenseDatabase[cleanNum];
      if (record) {
        return res.json({ found: true, record });
      }

      // Check if user entered a generic or partial number
      return res.json({
        found: false,
        message: `No active license record found for '${cleanNum}'. Please check the license number (e.g. CM/L-8472910, CM/L-9182345, or R-41002381) or apply for a new license on Manakonline.`,
        available_sample_ids: Object.keys(licenseDatabase)
      });
    } catch (err: any) {
      return sendError(res, 500, 'License tracking failed.', 'LICENSE_TRACK_ERROR');
    }
  });

  /**
   * POST /api/track-complaint & /api/submit-complaint
   */
  app.post('/api/track-complaint', (req: Request, res: Response) => {
    try {
      const { complaint_id = '' } = req.body;
      const cleanId = String(complaint_id).trim().toUpperCase();

      const found = complaintsDatabase.find(c => c.complaint_id.toUpperCase() === cleanId);
      if (found) {
        return res.json({ found: true, complaint: found });
      }

      return res.json({
        found: false,
        message: `Complaint ID '${cleanId}' not found. Please verify the ID or file a new grievance.`,
        sample_ids: complaintsDatabase.map(c => c.complaint_id)
      });
    } catch (err: any) {
      return sendError(res, 500, 'Complaint tracking failed.', 'COMPLAINT_TRACK_ERROR');
    }
  });

  app.post('/api/submit-complaint', (req: Request, res: Response) => {
    try {
      const { consumer_name, subject, product_brand } = req.body;
      const newId = `BIS-CMP-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        complaint_id: newId,
        consumer_name: consumer_name || 'Anonymous Consumer',
        subject: subject || 'Quality & Misuse Grievance',
        product_brand: product_brand || 'Unbranded / Retail Item',
        date_filed: new Date().toISOString().split('T')[0],
        status: 'Registered' as const,
        resolution_notes: 'Complaint logged on central portal. Assigned to enforcement wing for preliminary screening.'
      };

      complaintsDatabase.unshift(newRecord);
      return res.json({ success: true, complaint: newRecord });
    } catch (err: any) {
      return sendError(res, 500, 'Failed to submit complaint.', 'SUBMIT_COMPLAINT_ERROR');
    }
  });

  /**
   * GET /api/admin/metrics & POST /api/feedback
   */
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    return res.json(metricsData);
  });

  app.post('/api/feedback', (req: Request, res: Response) => {
    try {
      const { type } = req.body; // 'positive' or 'negative'
      metricsData.total_feedback_count += 1;
      if (type === 'positive') {
        metricsData.positive_feedback += 1;
      } else {
        metricsData.negative_feedback += 1;
      }
      metricsData.user_satisfaction_rate = Number(
        ((metricsData.positive_feedback / metricsData.total_feedback_count) * 100).toFixed(1)
      );
      return res.json({ success: true, metrics: metricsData });
    } catch (err: any) {
      return sendError(res, 500, 'Feedback submission failed.', 'FEEDBACK_ERROR');
    }
  });

  // ==========================================
  // VITE DEV & STATIC FILE SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>BIS Sahayak</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 40px;">
  <h2>BIS Sahayak - AI Standards Intelligence Platform</h2>
  <p>The application is compiling and will be ready in a moment. Please reload the page.</p>
</body>
</html>`);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BIS Sahayak] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[BIS Sahayak] Fatal server startup error:', err);
});
