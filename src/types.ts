/**
 * Bureau of Indian Standards (BIS) - BIS Sahayak
 * Shared API Contracts & Data Types for SIH PS26107
 */

export type UserRole = 'consumer' | 'industry';
export type LanguageCode = 'en' | 'hi' | 'or';

// --- API Request & Response Types (Exact Section 4 specification) ---

export interface SourceCitation {
  standard_number: string;
  title: string;
  clause?: string;
  source_url?: string;
}

export interface ChatMessageContext {
  sender: 'user' | 'assistant';
  text: string;
}

export interface ChatRequest {
  message: string;
  role: UserRole;
  lang: LanguageCode;
  session_id: string;
  page_context?: string;
  history?: ChatMessageContext[];
}

export interface ChatResponse {
  reply: string;
  sources: SourceCitation[];
  suggested_followups: string[];
}

export interface RecommendStandardRequest {
  product_description: string;
  category?: string;
}

export interface StandardRecommendation {
  standard_number: string;
  title: string;
  confidence: number;
  reasoning: string;
  mandatory?: boolean;
  applicable_scheme?: string;
  clause_summary?: string;
}

export interface RecommendStandardResponse {
  recommendations: StandardRecommendation[];
}

export interface CertificationScheme {
  id: string;
  name: string;
  short_name: string;
  eligibility: string;
  process_steps: string[];
  approx_timeline: string;
  applicable_products: string[];
  fee_structure?: string;
  document_checklist?: string[];
  badge_color?: string;
}

export interface CertificationSchemesResponse {
  schemes: CertificationScheme[];
}

export interface FindLabsRequest {
  product_category: string;
  state?: string;
  city?: string;
}

export interface TestingLab {
  name: string;
  address: string;
  accreditation: string;
  contact: { phone: string; email: string } | string;
  state: string;
  city: string;
  tested_products: string[];
  nabl_number?: string;
  lab_type?: 'BIS Central Lab' | 'BIS Regional Lab' | 'BIS Recognized (Private/Govt)';
}

export interface StandardItem {
  is_code: string;
  title: string;
  category: string;
  mandatory: boolean;
  applicable_scheme: string;
  key_clauses: Array<{
    clause_number: string;
    title: string;
    description: string;
  }>;
  testing_parameters: string[];
  qco_notification?: string;
}

export interface FindLabsResponse {
  labs: TestingLab[];
}

export interface HallmarkingSection {
  heading: string;
  body: string;
  sub_points?: string[];
  icon_name?: string;
}

export interface HallmarkingInfoResponse {
  sections: HallmarkingSection[];
}

export interface ComplaintGuideRequest {
  issue_description: string;
  product_name?: string;
}

export interface ComplaintGuideResponse {
  steps: string[];
  estimated_time: string;
  escalation_contact: string;
  required_documents: string[];
  portal_url: string;
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  standards_count: number;
  rag_engine: string;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
}

// --- Extended Phase 7 Types ---

export interface LicenseStatus {
  license_number: string;
  company_name: string;
  product_name: string;
  standard_number: string;
  applied_date: string;
  current_stage: 'Applied' | 'Verification' | 'Sample Testing' | 'Grant of License' | 'Operational';
  stage_history: Array<{
    stage: string;
    date: string;
    status: 'completed' | 'in_progress' | 'pending';
    remarks: string;
  }>;
  factory_location: string;
  valid_till?: string;
}

export interface HuidVerificationResult {
  valid_format: boolean;
  huid: string;
  details?: {
    purity: string;
    carat: string;
    ahc_name: string;
    jeweller_id: string;
    hallmarking_date: string;
    article_type: string;
    weight_approx: string;
  };
  explanation: string;
}

export interface ComplaintStatus {
  complaint_id: string;
  consumer_name: string;
  subject: string;
  product_brand: string;
  date_filed: string;
  status: 'Registered' | 'Assigned to Branch Officer' | 'Sample Verification' | 'Resolved';
  resolution_notes?: string;
}

export interface AdminMetrics {
  total_queries_served: number;
  top_asked_topics: Array<{ topic: string; count: number }>;
  top_searched_standards: Array<{ is_code: string; count: number }>;
  user_satisfaction_rate: number;
  total_feedback_count: number;
  positive_feedback: number;
  negative_feedback: number;
}
