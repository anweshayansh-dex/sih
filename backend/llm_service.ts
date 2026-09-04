/**
 * BIS Sahayak - LLM Service Abstraction Layer
 * Interfaces with Google Gemini 3.7 Flash for RAG grounded answers
 * with multi-turn conversation support and intelligent fallback.
 */

import { GoogleGenAI } from "@google/genai";
import { RetrievalResult } from "./rag/knowledge_base";
import { UserRole, LanguageCode, SourceCitation, ChatMessageContext } from "../src/types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export interface ChatGenerateResult {
  reply: string;
  sources: SourceCitation[];
  suggested_followups: string[];
}

// Candidate models in order of preference
const PRIMARY_MODELS = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-2.5-flash"];

/**
 * Execute Gemini content generation with multi-model fallback and transient error retry
 */
async function generateWithFallback(client: GoogleGenAI, requestPayload: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  for (const model of PRIMARY_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: requestPayload.contents,
          config: requestPayload.config
        });
        const text = response.text || '';
        if (text.trim().length > 0) {
          return text;
        }
      } catch (err: any) {
        const status = err?.status || err?.code || err?.statusCode || (err?.message && err.message.includes('503') ? 503 : 0);
        const isUnavailable = status === 503 || status === 429 || err?.message?.includes('high demand') || err?.message?.includes('UNAVAILABLE');

        if (isUnavailable && attempt === 0) {
          // Brief pause before trying fallback or retry
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        // Try next model in cascade
        break;
      }
    }
  }
  return null;
}

export class LlmService {
  /**
   * Generates grounded, conversational response using retrieved RAG context and Gemini 3.7 Flash
   */
  public async generateChatResponse(params: {
    message: string;
    role: UserRole;
    lang: LanguageCode;
    retrievedChunks: RetrievalResult[];
    pageContext?: string;
    history?: ChatMessageContext[];
  }): Promise<ChatGenerateResult> {
    const { message, role, lang, retrievedChunks, pageContext, history = [] } = params;

    // Deduplicate citations from chunks
    const sources: SourceCitation[] = [];
    const seenStd = new Set<string>();

    for (const res of retrievedChunks) {
      const key = `${res.citation.standard_number}-${res.citation.title}`;
      if (!seenStd.has(key)) {
        seenStd.add(key);
        sources.push(res.citation);
      }
    }

    // Build context string from retrieved chunks
    const contextText = retrievedChunks.length > 0
      ? retrievedChunks
          .map((r, idx) => `[Source ${idx + 1}: ${r.citation.standard_number || r.citation.title}]\n${r.chunk.content}`)
          .join('\n\n---\n\n')
      : 'Bureau of Indian Standards (BIS) official regulations, ISI Mark certification under Scheme I, IS 1417:2016 Gold Hallmarking with 6-digit HUID, and BIS CARE citizen verification.';

    const languageInstruction =
      lang === 'hi'
        ? 'Respond entirely in natural, polite, authentic Hindi (Devanagari script).'
        : lang === 'or'
        ? 'Respond entirely in authentic, respectful, polite Odia (ଓଡ଼ିଆ script).'
        : 'Respond in clear, engaging, professional English.';

    const roleToneInstruction =
      role === 'consumer'
        ? 'Audience: Indian citizen / consumer. Use warm, user-friendly language, clear markdown headings, bullet points, step-by-step instructions, and mention consumer empowerment tools (BIS CARE App, 1915 toll-free helpline).'
        : 'Audience: Manufacturer / Industrialist / MSME. Use technical, regulatory depth, specify exact IS standards, clauses, testing requirements, fee structures, compliance timelines, and Manakonline / CRS portal filing steps.';

    const systemPrompt = `You are "BIS Sahayak" (बीआईएस सहायक), the official Intelligent AI Assistant for the Bureau of Indian Standards (BIS), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

CORE BEHAVIOR & REASONING GUIDELINES:
1. Conversational, Focused & Responsive:
   - When the user sends a greeting, greet them warmly and offer key areas of assistance.
   - **Crucial Focus Rule**: Answer *only* the specific question asked by the user. Do not dump unrelated answers or all stored FAQ knowledge at once.
   - **Alternative Recommendations**: If a user's question is unclear, outside known BIS scope, or if context is limited, politely clarify and recommend 2-3 alternative questions you *can* answer (e.g., *"If you need information on certification costs or timelines, you can ask: 'How much does BIS certification cost?' or 'How long does BIS certification take?'"*).
2. Grounding & Accuracy:
   - Anchor your facts in official BIS standards and regulations. Use the provided Knowledge Base context below.
   - Never invent standard numbers or clauses. If referencing gold hallmarking, cite IS 1417:2016; for packaged drinking water, cite IS 14543:2016; for LPG cylinders, cite IS 3196:2013; for helmets, cite IS 4151:2015.
3. Structure & Formatting:
   - Use clean Markdown formatting with clear section headers, bulleted lists, and step-by-step numbered instructions.
   - Keep answers comprehensive yet easy to scan.
4. Language: ${languageInstruction}
5. Tone: ${roleToneInstruction}
${pageContext ? `6. Active Interface Context: User is currently on the ${pageContext} tab.` : ''}

OFFICIAL BIS KNOWLEDGE BASE CONTEXT:
${contextText}

OUTPUT REQUIREMENT:
At the very end of your response, ALWAYS include exactly 3 relevant, highly specific follow-up questions formatted on a single line starting with:
SUGGESTIONS: question1 | question2 | question3`;

    const client = getAiClient();

    if (client) {
      try {
        // Build conversation turns from history
        const contentsPayload: Array<{ role?: string; text?: string; parts?: Array<{ text: string }> }> = [];

        // System prompt as first instruction
        contentsPayload.push({ text: systemPrompt });

        // Add last 6 turns of conversation history for context
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          contentsPayload.push({
            text: `${h.sender === 'user' ? 'User' : 'Assistant (BIS Sahayak)'}: ${h.text}`
          });
        }

        // Add current user query
        contentsPayload.push({
          text: `User Question: ${message}\n\nPlease provide a helpful, intelligent, grounded answer as BIS Sahayak:`
        });

        const rawText = await generateWithFallback(client, {
          contents: contentsPayload
        });

        if (rawText && rawText.trim().length > 0) {
          return this.parseModelOutput(rawText, sources, lang, role);
        }
      } catch (err) {
        // Fall through to local synthesis engine
      }
    }

    // High-quality local deterministic synthesizer fallback
    return this.synthesizeLocalResponse(message, retrievedChunks, sources, lang, role);
  }

  /**
   * Recommends applicable standards based on product description
   */
  public async recommendStandards(
    productDescription: string,
    category?: string,
    allStandards: any[] = []
  ): Promise<any[]> {
    const descLower = productDescription.toLowerCase();
    const catLower = (category || '').toLowerCase();

    const client = getAiClient();
    if (client) {
      try {
        const prompt = `You are a BIS technical officer. Analyze this product description and identify applicable Indian Standards (IS Codes).
Product Description: "${productDescription}"
Category: "${category || 'General'}"

Available BIS Standards Catalog:
${allStandards.map(s => `- ${s.standard_number}: ${s.title} (Category: ${s.category}, Mandatory: ${s.mandatory}) - ${s.description}`).join('\n')}

Return a valid JSON array of up to 4 recommendations with format:
[
  {
    "standard_number": "IS XXXX:YYYY",
    "title": "Exact standard title",
    "confidence": 95,
    "reasoning": "Clear explanation of why this standard applies to the described product and safety/compliance parameters.",
    "mandatory": true,
    "applicable_scheme": "ISI Mark / CRS / FMCS",
    "clause_summary": "Key test or safety clause summary"
  }
]`;

        const rawText = await generateWithFallback(client, {
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        // Fallback to local semantic scoring below
      }
    }

    // Local semantic scoring
    const matched: any[] = [];
    for (const std of allStandards) {
      let score = 0;
      const content = `${std.standard_number} ${std.title} ${std.category} ${std.description} ${(std.keywords || []).join(' ')}`.toLowerCase();
      
      const words = descLower.split(/\s+/).filter(w => w.length > 2);
      for (const w of words) {
        if (content.includes(w)) score += 15;
      }
      if (catLower && std.category.toLowerCase().includes(catLower)) {
        score += 25;
      }
      if (std.keywords && std.keywords.some((k: string) => descLower.includes(k))) {
        score += 35;
      }

      if (score >= 20) {
        const confidence = Math.min(98, Math.max(70, score));
        matched.push({
          standard_number: std.standard_number,
          title: std.title,
          confidence,
          reasoning: `Matched based on product characteristics (${std.category}). Governed by ${std.scheme} with mandatory quality control specifications under ${std.standard_number}.`,
          mandatory: std.mandatory,
          applicable_scheme: std.scheme,
          clause_summary: std.key_clauses ? std.key_clauses[0] : 'Safety and Quality compliance'
        });
      }
    }

    matched.sort((a, b) => b.confidence - a.confidence);

    if (matched.length === 0 && allStandards.length > 0) {
      // Default top standard if vague
      const std = allStandards[0];
      return [{
        standard_number: std.standard_number,
        title: std.title,
        confidence: 72,
        reasoning: "Relevant general manufacturing baseline under Bureau of Indian Standards product certification framework.",
        mandatory: std.mandatory,
        applicable_scheme: std.scheme,
        clause_summary: std.key_clauses ? std.key_clauses[0] : 'Quality standards'
      }];
    }

    return matched.slice(0, 4);
  }

  private parseModelOutput(rawText: string, sources: SourceCitation[], lang: LanguageCode, role: UserRole): ChatGenerateResult {
    let cleanReply = rawText;
    let followups: string[] = [];

    const suggestionMatch = rawText.match(/SUGGESTIONS:\s*(.+)$/im);
    if (suggestionMatch) {
      cleanReply = rawText.replace(/SUGGESTIONS:\s*.+$/im, '').trim();
      followups = suggestionMatch[1]
        .split('|')
        .map(s => s.trim().replace(/^[-*•0-9.]+\s*/, ''))
        .filter(s => s.length > 3);
    }

    if (followups.length === 0) {
      followups = this.getDefaultFollowups(lang, role);
    }

    return {
      reply: cleanReply,
      sources,
      suggested_followups: followups.slice(0, 3)
    };
  }

  /**
   * High-intelligence local intent synthesizer fallback
   */
  private synthesizeLocalResponse(
    message: string,
    chunks: RetrievalResult[],
    sources: SourceCitation[],
    lang: LanguageCode,
    role: UserRole
  ): ChatGenerateResult {
    const qLower = message.toLowerCase().trim();

    // 1. Greeting Intent
    const isGreeting = /^(hi|hello|hey|namaste|namaskar|good\s+morning|good\s+afternoon|good\s+evening|greetings|help)[\s!.]*$/i.test(qLower);
    if (isGreeting) {
      if (lang === 'hi') {
        return {
          reply: `**नमस्ते! मैं बीआईएस सहायक (BIS Sahayak) हूँ — भारतीय मानक ब्यूरो का आधिकारिक AI सहायक।**\n\nमैं भारतीय मानकों (Indian Standards), प्रमाणित उत्पादों, और उपभोक्ता अधिकारों से संबंधित आपकी सहायता के लिए तैयार हूँ।\n\nआप मुझसे निम्न विषयों के बारे में पूछ सकते हैं:\n• **सोने की शुद्धता एवं 6-अंकीय HUID हॉलमार्क** की जांच कैसे करें\n• **आईएसआई मार्क एवं सीएम/एल (CM/L) लाइसेंस नंबर** की प्रामाणिकता की पुष्टि\n• पैकेज्ड पेयजल, एलपीजी सिलेंडर, या हेलमेट के अनिवार्य मानक\n• बीआईएस केयर (BIS CARE) ऐप पर नकली उत्पाद की शिकायत दर्ज करना\n\nआप क्या जानना चाहते हैं?`,
          sources: [
            {
              standard_number: 'BIS Act 2016',
              title: 'Bureau of Indian Standards - Citizen Services & Quality Control',
              source_url: 'https://www.bis.gov.in'
            }
          ],
          suggested_followups: [
            "सोने के गहनों पर HUID कैसे चेक करें?",
            "आईएसआई मार्क और CM/L नंबर क्या है?",
            "पैकेज्ड पानी के लिए अनिवार्य मानक क्या है?"
          ]
        };
      } else if (lang === 'or') {
        return {
          reply: `**ନମସ୍କାର! ମୁଁ BIS ସହାୟକ — ଭାରତୀୟ ମାନକ ବ୍ୟୁରୋର ଅଫିସିଆଲ୍ AI ସହାୟକ।**\n\nମୁଁ ଭାରତୀୟ ମାନକ (IS Codes), ISI ପ୍ରମାଣପତ୍ର, ଏବଂ ସୁନା ହଲମାର୍କିଂ (HUID) ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ ନିମ୍ନଲିଖିତ ବିଷୟରେ ପଚାରିପାରିବେ:\n• **ସୁନା ହଲମାର୍କିଂ ଏବଂ ୬-ଅଙ୍କିଆ HUID କୋଡ୍ ଯାଞ୍ଚ**\n• **ISI ମାର୍କ ଏବଂ CM/L ଲାଇସେନ୍ସ ନମ୍ବର ଯାଞ୍ଚ**\n• BIS CARE ଆପ୍ ମାଧ୍ୟମରେ ଅଭିଯୋଗ ଦାଖଲ\n\nଆପଣ କିପରି ସାହାଯ୍ୟ ଆବଶ୍ୟକ କରନ୍ତି?`,
          sources: [
            {
              standard_number: 'BIS Act 2016',
              title: 'Bureau of Indian Standards Act',
              source_url: 'https://www.bis.gov.in'
            }
          ],
          suggested_followups: [
            "HUID କିପରି ଯାଞ୍ଚ କରିବେ?",
            "ISI ମାର୍କ ଯାଞ୍ଚ କରିବାର ପ୍ରଣାଳୀ",
            "ପାନୀୟ ଜଳ ମାନକ କ'ଣ?"
          ]
        };
      } else {
        return {
          reply: `**Namaste! I am BIS Sahayak (बीआईएस सहायक) — the official AI Intelligent Assistant for the Bureau of Indian Standards (BIS), Government of India.**\n\nI am here to assist you with authentic information on Indian Standards (IS Codes), product quality certifications, Gold Hallmarking, and consumer safety.\n\n### How I can assist you today:\n• **Gold & Silver Hallmarking:** Understand the 6-digit alphanumeric HUID code & purity standards (22K916, 18K750, 24K999) under **IS 1417:2016**.\n• **ISI Mark & CM/L Verification:** Learn how to verify the 7-digit CM/L license number printed under the ISI mark on appliances, helmets, and packaged water.\n• **Standards & Quality Control Orders:** Look up mandatory safety requirements for everyday goods.\n• **Consumer Protection & Grievance:** Step-by-step guidance on reporting spurious or counterfeit products using the **BIS CARE App**.\n\nHow can I help you today? Feel free to ask any question or select a suggested topic below.`,
          sources: [
            {
              standard_number: 'BIS Act 2016',
              title: 'Bureau of Indian Standards - Citizen Services & Quality Assurance',
              source_url: 'https://www.bis.gov.in'
            }
          ],
          suggested_followups: [
            "How do I verify 6-digit HUID for gold?",
            "What is the difference between ISI mark and CM/L number?",
            "Is my LPG cylinder BIS certified?"
          ]
        };
      }
    }

    // 2. ISI Numbers & HUID Numbers Intent
    if (
      (qLower.includes('isi') && qLower.includes('huid')) ||
      qLower.includes('isi number') ||
      qLower.includes('huid number') ||
      qLower.includes('isi or huid') ||
      qLower.includes('isi numbers or huid') ||
      qLower.includes('difference between isi and huid')
    ) {
      if (lang === 'hi') {
        return {
          reply: `### **आईएसआई (ISI) नंबर और एचयूआईडी (HUID) नंबर की पूरी जानकारी**\n\nभारतीय मानक ब्यूरो (BIS) द्वारा उपभोक्ताओं की सुरक्षा और प्रामाणिकता सुनिश्चित करने के लिए दो प्रमुख पहचान प्रणालियाँ लागू की गई हैं:\n\n---\n\n### **1. आईएसआई नंबर (CM/L लाइसेंस नंबर)**\n• **यह क्या है:** औद्योगिक और उपभोक्ता उत्पादों (जैसे पानी की बोतल, एलपीजी सिलेंडर, हेलमेट, सीमेंट) पर बने **ISI मार्क के ठीक नीचे** 7 या 8 अंकों का लाइसेंस नंबर होता है, जिसे **CM/L नंबर (Certification Marks License)** कहा जाता है (उदा. \`CM/L-8472910\`)।\n• **इसका क्या अर्थ है:** यह साबित करता है कि निर्माता की फैक्ट्री BIS द्वारा प्रमाणित है और उत्पाद संबंधित भारतीय मानक (जैसे पैकेज्ड पानी के लिए IS 14543) की सभी जांचों में खरा उतरा है।\n• **जांचने का तरीका:** **BIS CARE मोबाइल ऐप** खोलें ➔ **"Verify License Details (CM/L)"** पर क्लिक करें ➔ 7-अंकीय CM/L नंबर दर्ज करें ➔ आपको निर्माता का नाम, पता, ब्रांड, और वैधता तुरंत दिखाई देगी।\n\n---\n\n### **2. एचयूआईडी नंबर (HUID - Hallmark Unique Identification)**\n• **यह क्या है:** सोने के प्रत्येक गहने पर लेजर द्वारा उकेरा गया **6-अक्षरों व अंकों का विशिष्ट कोड** (जैसे \`AY786K\`, \`AB1234\`) होता है। यह **IS 1417:2016** के तहत अनिवार्य है।\n• **असली हॉलमार्क के 3 अनिवार्य चिह्न:**\n  1. **BIS त्रिकोण लोगो**\n  2. **शुद्धता ग्रेड** (उदा. \`22K916\` = 91.6% शुद्ध सोना, \`18K750\` = 75% सोना)\n  3. **6-अंकीय HUID कोड**\n• **जांचने का तरीका:** **BIS CARE ऐप** में **"Verify HUID"** विकल्प चुनें ➔ 6-अंकीय कोड दर्ज करें ➔ ऐप में ज्वेलर का नाम, हॉलमार्किंग केंद्र (AHC), तिथि और प्रमाणित शुद्धता स्पष्ट आ जाएगी।\n\n💡 *क्या आपके पास कोई विशिष्ट ISI CM/L नंबर या HUID कोड है जिसे आप सत्यापित करना चाहते हैं?*`,
          sources: [
            {
              standard_number: 'IS 1417:2016',
              title: 'Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking',
              clause: 'Clause 5.1 - Hallmark Unique Identification (HUID) Specification',
              source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/hallmarking'
            },
            {
              standard_number: 'BIS Scheme I',
              title: 'Product Certification Scheme - ISI Mark & CM/L License System',
              clause: 'Grant of License & Marking Regulations',
              source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards'
            }
          ],
          suggested_followups: [
            "BIS CARE ऐप पर HUID कैसे सत्यापित करें?",
            "क्या बिना HUID वाला सोना बेचना कानूनी है?",
            "नकली ISI मार्क की शिकायत कैसे करें?"
          ]
        };
      } else {
        return {
          reply: `### **Understanding ISI Numbers vs. HUID Numbers**\n\nThe Bureau of Indian Standards (BIS) administers two distinct, robust identification and traceability systems to protect consumers and ensure product quality:\n\n---\n\n### **1. ISI Number (CM/L License Number)**\n• **What it is:** The unique 7 to 8-digit **Certification Marks License (CM/L)** number printed directly **below the ISI monogram** on industrial and consumer products (e.g., \`CM/L-8472910\`).\n• **How it works:** \n  - The **IS Standard Number** (e.g., \`IS 14543\` for Packaged Drinking Water, \`IS 3196\` for LPG Cylinders, \`IS 4151\` for Helmets) is printed **above** the ISI logo.\n  - The **CM/L Number** is printed **below** the ISI logo, representing the specific manufacturing factory's operational license.\n• **How to Verify:**\n  1. Download and open the official **BIS CARE Mobile App** (or visit *manakonline.in*).\n  2. Select **"Verify License Details (CM/L)"**.\n  3. Enter the 7-digit CM/L number.\n  4. The system instantly reveals: Manufacturer Name, Factory Address, Brand, License Validity Status, and covered product scope.\n\n---\n\n### **2. HUID Number (Hallmark Unique Identification)**\n• **What it is:** A 6-digit alphanumeric unique identifier (e.g., \`AY786K\`, \`AB1234\`, \`9K4M2P\`) laser-etched onto every piece of hallmarked gold jewellery in India under **IS 1417:2016**.\n• **The 3 Mandatory Marks of Genuine Hallmarked Gold:**\n  1. **BIS Standard Logo** (triangular mark).\n  2. **Purity in Karat and Fineness** (e.g., \`22K916\` for 91.6% pure gold, \`18K750\` for 75.0% pure gold, \`14K585\` for 58.5% pure gold, \`24K999\` for coins/bullion).\n  3. **6-Digit Alphanumeric HUID Code** (unique to that individual jewellery piece).\n• **How to Verify in Seconds:**\n  1. Open the **BIS CARE App** and tap **"Verify HUID"**.\n  2. Type the 6-digit code etched on your jewellery.\n  3. Instantly view: Registered Jeweller Name, Assaying & Hallmarking Centre (AHC) details, Hallmarking Date, Article Type, and Certified Purity.\n\n---\n\n### **Quick Comparison:**\n| Feature | ISI CM/L Number | Gold HUID Number |\n| :--- | :--- | :--- |\n| **Applies To** | Industrial & Consumer Manufactured Goods | Gold & Silver Jewellery / Artefacts |\n| **Format** | 7–8 Numeric Digits (\`CM/L-XXXXXXX\`) | 6 Alphanumeric Characters (\`AY786K\`) |\n| **Governing Standard** | Specific IS code (e.g. IS 14543, IS 3196) | IS 1417:2016 (Hallmarking) |\n| **Verification Tool** | BIS CARE App ➔ *Verify License (CM/L)* | BIS CARE App ➔ *Verify HUID* |\n\n💡 *Do you have a specific ISI license number or HUID code you would like to test or verify?*`,
          sources: [
            {
              standard_number: 'IS 1417:2016',
              title: 'Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking Specification',
              clause: 'Clause 5.1 - Hallmarking Marks & 6-digit HUID',
              source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/hallmarking'
            },
            {
              standard_number: 'BIS Scheme I',
              title: 'Product Certification Scheme - ISI Mark & CM/L Numbering Regulations',
              clause: 'Scheme I Operating Guidelines',
              source_url: 'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards'
            }
          ],
          suggested_followups: [
            "How to check 6-digit HUID on BIS CARE App?",
            "What to do if an ISI mark has no CM/L number?",
            "What are the mandatory ISI certified products?"
          ]
        };
      }
    }

    // Default rich chunk response
    const topChunk = chunks[0]?.chunk;
    if (topChunk) {
      let reply = `### **Bureau of Indian Standards (BIS) Official Information**\n\n${topChunk.content}\n\n### **Key Guidance & Verification Steps:**\n• **Standard Reference:** ${topChunk.standard_number || 'BIS Regulatory Framework'}\n• **Subject / Scope:** ${topChunk.title}\n• **Verification:** You can verify certification validity anytime through the **BIS CARE Mobile App** or on **manakonline.in**.\n• **Consumer Helpline:** Call **1915** or toll-free **1800-11-4000** for direct assistance.`;
      
      return {
        reply,
        sources,
        suggested_followups: this.getDefaultFollowups(lang, role)
      };
    }

    return this.handleNoContextResponse(message, lang, role);
  }

  private handleNoContextResponse(query: string, lang: LanguageCode, role: UserRole): ChatGenerateResult {
    let reply = "";
    let followups: string[] = [];

    if (lang === 'hi') {
      reply = `**नमस्ते! मैं बीआईएस सहायक हूँ।**\n\nआपके प्रश्न: "${query}" के संबंध में, आप भारतीय मानक ब्यूरो के आधिकारिक डेटाबेस में सीधे खोज सकते हैं या उपभोक्ता हेल्पलाइन पर संपर्क कर सकते हैं:\n\n• **आधिकारिक पोर्टल:** www.services.bis.gov.in / manakonline.in\n• **बीआईएस केयर मोबाइल ऐप:** गूगल प्ले एवं ऐप स्टोर पर उपलब्ध\n• **राष्ट्रीय उपभोक्ता हेल्पलाइन:** 1915 या 1800-11-4000\n• **ईमेल:** complaints@bis.gov.in`;
      followups = ["सोने के गहनों पर HUID कैसे चेक करें?", "आईएसआई मार्क की जांच कैसे करें?", "पैकेज्ड पेयजल का आईएसआई मानक"];
    } else if (lang === 'or') {
      reply = `**ନମସ୍କାର! ମୁଁ BIS ସହାୟକ।**\n\nଆପଣଙ୍କ ପ୍ରଶ୍ନ ପାଇଁ ଆପଣ ନିମ୍ନ ମାଧ୍ୟମରେ ଯୋଗାଯୋଗ କରିପାରିବେ:\n• **ଅଫିସିଆଲ୍ ୱେବସାଇଟ୍:** www.services.bis.gov.in\n• **ଟୋଲ୍-ଫ୍ରି ହେଲ୍ପଲାଇନ୍:** 1915 / 1800-11-4000\n• **ଇମେଲ୍:** complaints@bis.gov.in`;
      followups = ["HUID ଯାଞ୍ଚ କରିବାର ପ୍ରଣାଳୀ କ'ଣ?", "ISI ମାର୍କ ପ୍ରକ୍ରିୟା", "ପାନୀୟ ଜଳ ମାନକ"];
    } else {
      reply = `**Hello! I am BIS Sahayak, your AI guide for Indian Standards and Product Certification.**\n\nFor your inquiry regarding "${query}", you can explore official BIS services:\n\n• **Central Standards Portal:** [manakonline.in](https://www.manakonline.in) / [bis.gov.in](https://www.bis.gov.in)\n• **BIS CARE Mobile App:** Verify CM/L license numbers, check 6-digit Gold HUID codes, and file complaints.\n• **National Consumer Helpline:** **1915** or **1800-11-4000**\n• **Enforcement Division:** complaints@bis.gov.in`;
      followups = ["How do I verify 6-digit HUID for gold?", "What is the ISI CM/L license number?", "What are mandatory ISI mark products?"];
    }

    return {
      reply,
      sources: [
        {
          standard_number: 'BIS Act 2016',
          title: 'Bureau of Indian Standards - Citizen Services & Quality Assurance',
          source_url: 'https://www.bis.gov.in'
        }
      ],
      suggested_followups: followups
    };
  }

  private getDefaultFollowups(lang: LanguageCode, role: UserRole): string[] {
    if (lang === 'hi') {
      return role === 'consumer'
        ? ["सोने के गहनों पर HUID कैसे चेक करें?", "आईएसआई मार्क और CM/L नंबर क्या है?", "बीआईएस केयर ऐप पर शिकायत कैसे दर्ज करें?"]
        : ["लाइसेंस आवेदन के लिए आवश्यक दस्तावेज", "परीक्षण प्रयोगशालाएं (Labs) खोजें", "वार्षिक अंकन शुल्क (Marking Fee) क्या है?"];
    }
    if (lang === 'or') {
      return role === 'consumer'
        ? ["HUID ଯାଞ୍ଚ କରିବାର ପ୍ରଣାଳୀ କ'ଣ?", "ISI ମାର୍କ ଯାଞ୍ଚ କରିବାର ପ୍ରଣାଳୀ", "BIS CARE ଆପ୍ କିପରି ବ୍ୟବହାର କରିବେ?"]
        : ["ISI ଲାଇସେନ୍ସ ପାଇଁ ଆବେଦନ କିପରି କରିବେ?", "ଟେଷ୍ଟିଂ ଲାବୋରେଟୋରୀ ତାଲିକା", "CRS ପଞ୍ଜୀକରଣ ପ୍ରକ୍ରିୟା"];
    }
    return role === 'consumer'
      ? ["How do I check 6-digit HUID for gold?", "How to verify ISI CM/L license number?", "How to file a consumer complaint on BIS CARE?"]
      : ["What is the fee and timeline for ISI license?", "Which testing labs are recognized near me?", "What are the required documents for factory audit?"];
  }
}

export const llmService = new LlmService();

