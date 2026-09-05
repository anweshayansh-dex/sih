/**
 * BIS Sahayak - Multilingual Translations (English, Hindi, Odia)
 * Phase 6 i18n support
 */

import { LanguageCode } from './types';

export interface TranslationDictionary {
  appName: string;
  subTitle: string;
  govOfIndia: string;
  ministryName: string;
  nationalEmblem: string;
  helpline: string;
  bisCareApp: string;
  skipToContent: string;
  screenReader: string;
  fontSize: string;
  highContrast: string;
  normalContrast: string;
  roleConsumer: string;
  roleIndustry: string;
  roleConsumerDesc: string;
  roleIndustryDesc: string;
  switchToIndustry: string;
  switchToConsumer: string;
  consumerHeader: string;
  industryHeader: string;
  navDashboard: string;
  navFindStandard: string;
  navSchemes: string;
  navLicenseTrack: string;
  navLabs: string;
  navHuidVerify: string;
  navComplaints: string;
  navCompare: string;
  navAdmin: string;
  navAskAi: string;
  chatPlaceholder: string;
  send: string;
  sources: string;
  suggestedQuestions: string;
  explainSimply: string;
  feedbackHelpful: string;
  feedbackNotHelpful: string;
  disclaimer: string;
  lastUpdated: string;
  allRightsReserved: string;
  quickQuestions: string;
  findStandardTitle: string;
  findStandardDesc: string;
  productDescPlaceholder: string;
  searchBtn: string;
  clearBtn: string;
  loadingAi: string;
  officialClause: string;
  voiceInputTooltip: string;
  listeningVoice: string;
  stopVoiceInput: string;
  voiceNotSupported: string;
  printRecord: string;
  printRecordDesc: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "BIS Sahayak",
    subTitle: "Intelligent AI Assistant for Indian Standards & Conformity",
    govOfIndia: "Government of India",
    ministryName: "Ministry of Consumer Affairs, Food & Public Distribution",
    nationalEmblem: "Bureau of Indian Standards",
    helpline: "National Consumer Helpline: 1915 | BIS Toll-Free: 1800-11-4000",
    bisCareApp: "BIS CARE App Verified",
    skipToContent: "Skip to Main Content",
    screenReader: "Screen Reader Access",
    fontSize: "Font Size",
    highContrast: "High Contrast",
    normalContrast: "Standard",
    roleConsumer: "Consumer Sahayak",
    roleIndustry: "Manufacturer & Industry Portal",
    roleConsumerDesc: "Ask questions on ISI marks, gold hallmark purity, HUID, consumer rights, and complaint filing.",
    roleIndustryDesc: "Explore Indian Standards (IS Codes), certification schemes (ISI, CRS, FMCS), license tracker, and NABL labs.",
    switchToIndustry: "Switch to Industry Portal",
    switchToConsumer: "Switch to Consumer Mode",
    consumerHeader: "BIS Consumer Sahayak",
    industryHeader: "BIS Industry & MSME Facilitation Desk",
    navDashboard: "Overview",
    navFindStandard: "Find My Standard",
    navSchemes: "Certification Schemes",
    navLicenseTrack: "Apply / Track License",
    navLabs: "Testing Laboratories",
    navHuidVerify: "HUID Hallmark Check",
    navComplaints: "Consumer Grievances",
    navCompare: "Compare Standards",
    navAdmin: "Admin & Analytics",
    navAskAi: "Docked Assistant",
    chatPlaceholder: "Ask anything about Indian Standards (IS), ISI marks, Gold Hallmarking, or certification...",
    send: "Send",
    sources: "Official BIS Standards & Document Sources",
    suggestedQuestions: "Suggested Inquiries",
    explainSimply: "Explain more simply",
    feedbackHelpful: "Helpful",
    feedbackNotHelpful: "Not Helpful",
    disclaimer: "Disclaimer: This is AI-assisted regulatory guidance grounded in official BIS documentation. For binding legal certification decisions, consult official BIS branches or manakonline.in.",
    lastUpdated: "Website Last Updated: 01 September 2026",
    allRightsReserved: "© Bureau of Indian Standards (BIS), Government of India. All Rights Reserved.",
    quickQuestions: "Frequently Asked Questions",
    findStandardTitle: "AI-Powered Indian Standard Identifier",
    findStandardDesc: "Describe your product or material to identify the applicable IS Codes, mandatory Quality Control Orders (QCO), and required certification schemes.",
    productDescPlaceholder: "e.g., We manufacture 5-stage RO water purifiers with UV disinfection for domestic households...",
    searchBtn: "Identify Standards",
    clearBtn: "Reset",
    loadingAi: "Consulting BIS Knowledge Base...",
    officialClause: "Key Technical & Safety Clause",
    voiceInputTooltip: "Ask with voice (Speech Recognition)",
    listeningVoice: "Listening... Speak your question now",
    stopVoiceInput: "Stop listening",
    voiceNotSupported: "Voice recognition is not supported in this browser. Please try Chrome or Edge.",
    printRecord: "Print / Save PDF",
    printRecordDesc: "Official Record & PDF Export"
  },
  hi: {
    appName: "बीआईएस सहायक",
    subTitle: "भारतीय मानकों और प्रमाणन के लिए बुद्धिमान एआई सहायक",
    govOfIndia: "भारत सरकार",
    ministryName: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    nationalEmblem: "भारतीय मानक ब्यूरो (BIS)",
    helpline: "राष्ट्रीय उपभोक्ता हेल्पलाइन: 1915 | बीआईएस टोल-फ्री: 1800-11-4000",
    bisCareApp: "बीआईएस केयर ऐप द्वारा सत्यापित",
    skipToContent: "मुख्य सामग्री पर जाएं",
    screenReader: "स्क्रीन रीडर पहुंच",
    fontSize: "फ़ॉन्ट आकार",
    highContrast: "उच्च कंट्रास्ट",
    normalContrast: "सामान्य",
    roleConsumer: "उपभोक्ता सहायक",
    roleIndustry: "उद्योग एवं विनिर्माता पोर्टल",
    roleConsumerDesc: "आईएसआई मार्क, सोने की हॉलमार्किंग (HUID), उपभोक्ता अधिकार और शिकायत दर्ज करने के बारे में पूछें।",
    roleIndustryDesc: "भारतीय मानक (IS कोड), प्रमाणन योजनाएं (ISI, CRS, FMCS), लाइसेंस ट्रैकर और परीक्षण प्रयोगशालाएं खोजें।",
    switchToIndustry: "उद्योग पोर्टल पर जाएं",
    switchToConsumer: "उपभोक्ता मोड में जाएं",
    consumerHeader: "बीआईएस उपभोक्ता सहायक",
    industryHeader: "बीआईएस उद्योग एवं एमएसएमई सुविधा डेस्क",
    navDashboard: "अवलोकन",
    navFindStandard: "मानक खोजें (IS Code)",
    navSchemes: "प्रमाणन योजनाएं",
    navLicenseTrack: "लाइसेंस ट्रैक करें",
    navLabs: "परीक्षण प्रयोगशालाएं",
    navHuidVerify: "HUID हॉलमार्क जांच",
    navComplaints: "उपभोक्ता शिकायतें",
    navCompare: "मानक तुलना",
    navAdmin: "प्रशासन एवं विश्लेषण",
    navAskAi: "एआई सहायक",
    chatPlaceholder: "भारतीय मानक (IS), आईएसआई मार्क, सोने की शुद्धता या लाइसेंस के बारे में पूछें...",
    send: "भेजें",
    sources: "आधिकारिक बीआईएस मानक एवं स्रोत",
    suggestedQuestions: "सुझाए गए प्रश्न",
    explainSimply: "सरल भाषा में समझाएं",
    feedbackHelpful: "उपयोगी",
    feedbackNotHelpful: "अनुपयोगी",
    disclaimer: "अस्वीकरण: यह एआई-सहायक मार्गदर्शन आधिकारिक बीआईएस दस्तावेजों पर आधारित है। बाध्यकारी निर्णयों के लिए आधिकारिक बीआईएस कार्यालय से संपर्क करें।",
    lastUpdated: "वेबसाइट अंतिम अद्यतन: 01 सितंबर 2026",
    allRightsReserved: "© भारतीय मानक ब्यूरो (BIS), भारत सरकार। सर्वाधिकार सुरक्षित।",
    quickQuestions: "अक्सर पूछे जाने वाले प्रश्न",
    findStandardTitle: "एआई मानक पहचानकर्ता",
    findStandardDesc: "अपने उत्पाद का विवरण दें और लागू होने वाले आईएस कोड और गुणवत्ता नियंत्रण आदेश जानें।",
    productDescPlaceholder: "उदा. हम घरेलू उपयोग के लिए 5-चरणीय आरओ वाटर प्यूरीफायर बनाते हैं...",
    searchBtn: "मानक पहचानें",
    clearBtn: "रीसेट",
    loadingAi: "बीआईएस ज्ञानकोष से जानकारी ली जा रही है...",
    officialClause: "प्रमुख तकनीकी और सुरक्षा खंड",
    voiceInputTooltip: "आवाज से प्रश्न पूछें (स्पीच रिकग्निशन)",
    listeningVoice: "सुन रहा हूँ... अब अपना प्रश्न बोलें",
    stopVoiceInput: "आवाज इनपुट रोकें",
    voiceNotSupported: "इस ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है। कृपया Chrome या Edge आज़माएं।",
    printRecord: "प्रिंट / पीडीएफ सेव करें",
    printRecordDesc: "आधिकारिक रिकॉर्ड और पीडीएफ निर्यात"
  },
  or: {
    appName: "BIS ସହାୟକ",
    subTitle: "ଭାରତୀୟ ମାନକ ଏବଂ ପ୍ରମାଣୀକରଣ ପାଇଁ AI ସହାୟକ",
    govOfIndia: "ଭାରତ ସରକାର",
    ministryName: "ଉପଭୋକ୍ତା ବ୍ୟାପାର, ଖାଦ୍ୟ ଏବଂ ସାଧାରଣ ବଣ୍ଟନ ମନ୍ତ୍ରଣାଳୟ",
    nationalEmblem: "ଭାରତୀୟ ମାନକ ବ୍ୟୁରୋ (BIS)",
    helpline: "ଜାତୀୟ ଉପଭୋକ୍ତା ହେଲ୍ପଲାଇନ୍: 1915 | BIS ଟୋଲ୍-ଫ୍ରି: 1800-11-4000",
    bisCareApp: "BIS CARE ଆପ୍ ଦ୍ୱାରା ପ୍ରମାଣିତ",
    skipToContent: "ମୁଖ୍ୟ ବିଷୟବସ୍ତୁକୁ ଯାଆନ୍ତୁ",
    screenReader: "ସ୍କ୍ରିନ୍ ରିଡର୍ ସୁବିଧା",
    fontSize: "ଅକ୍ଷର ଆକାର",
    highContrast: "ଉଚ୍ଚ କଣ୍ଟ୍ରାଷ୍ଟ",
    normalContrast: "ସାଧାରଣ",
    roleConsumer: "ଉପଭୋକ୍ତା ସହାୟକ",
    roleIndustry: "ଶିଳ୍ପ ଓ ଉତ୍ପାଦକ ପୋର୍ଟାଲ",
    roleConsumerDesc: "ISI ମାର୍କ, ସୁନା ହଲମାର୍କିଂ (HUID), ଗ୍ରାହକଙ୍କ ଅଧିକାର ଏବଂ ଅଭିଯୋଗ ଦାଖଲ ସମ୍ପର୍କରେ ପଚାରନ୍ତୁ।",
    roleIndustryDesc: "ଭାରତୀୟ ମାନକ (IS କୋଡ୍), ପ୍ରମାଣପତ୍ର ଯୋଜନା (ISI, CRS, FMCS), ଲାଇସେନ୍ସ ଟ୍ରାକର୍ ଏବଂ ଟେଷ୍ଟିଂ ଲାବ୍ ଖୋଜନ୍ତୁ।",
    switchToIndustry: "ଶିଳ୍ପ ପୋର୍ଟାଲ୍ ବ୍ୟବହାର କରନ୍ତୁ",
    switchToConsumer: "ଉପଭୋକ୍ତା ମୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ",
    consumerHeader: "BIS ଉପଭୋକ୍ତା ସହାୟକ",
    industryHeader: "BIS ଶିଳ୍ପ ଓ MSME ସୁବିଧା ଡେସ୍କ",
    navDashboard: "ସଂକ୍ଷିପ୍ତ ବିବରଣୀ",
    navFindStandard: "ମୋର ମାନକ ଖୋଜନ୍ତୁ",
    navSchemes: "ପ୍ରମାଣୀକରଣ ଯୋଜନା",
    navLicenseTrack: "ଲାଇସେନ୍ସ ଟ୍ରାକ୍ କରନ୍ତୁ",
    navLabs: "ପରୀକ୍ଷାଗାର (Labs)",
    navHuidVerify: "HUID ଯାଞ୍ଚ",
    navComplaints: "ଗ୍ରାହକ ଅଭିଯୋଗ",
    navCompare: "ମାନକ ତୁଳନା",
    navAdmin: "ବିଶ୍ଳେଷଣ ଓ ପ୍ରଶାସନ",
    navAskAi: "AI ସହାୟକ",
    chatPlaceholder: "ଭାରତୀୟ ମାନକ (IS), ISI ମାର୍କ କିମ୍ବା ସୁନା ହଲମାର୍କ ବିଷୟରେ ପଚାରନ୍ତୁ...",
    send: "ପଠାନ୍ତୁ",
    sources: "ସରକାରୀ BIS ମାନକ ଏବଂ ଦସ୍ତାବେଜ ଉତ୍ସ",
    suggestedQuestions: "ପ୍ରସ୍ତାବିତ ପ୍ରଶ୍ନ",
    explainSimply: "ସରଳ ଭାଷାରେ ବୁଝାନ୍ତୁ",
    feedbackHelpful: "ଉପଯୋଗୀ",
    feedbackNotHelpful: "ଅନୁପଯୋଗୀ",
    disclaimer: "ଦାୟିତ୍ୱମୁକ୍ତି: ଏହା BIS ସରକାରୀ ଦସ୍ତାବେଜ ଉପରେ ଆଧାରିତ AI ମାର୍ଗଦର୍ଶନ। ସଠିକ ନିଷ୍ପତ୍ତି ପାଇଁ BIS ଶାଖା କାର୍ଯ୍ୟାଳୟ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    lastUpdated: "ୱେବସାଇଟ୍ ଶେଷ ଅପଡେଟ୍: 01 ସେପ୍ଟେମ୍ବର 2026",
    allRightsReserved: "© ଭାରତୀୟ ମାନକ ବ୍ୟୁରୋ (BIS), ଭାରତ ସରକାର। ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।",
    quickQuestions: "ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ",
    findStandardTitle: "AI ମାନକ ଚିହ୍ନଟକାରୀ",
    findStandardDesc: "ଆପଣଙ୍କ ଉତ୍ପାଦର ବିବରଣୀ ପ୍ରଦାନ କରି ପ୍ରଯୁଜ୍ୟ IS କୋଡ୍ ଏବଂ ଯୋଜନା ଜାଣନ୍ତୁ।",
    productDescPlaceholder: "ଉଦାହରଣ: ଆମେ ଘରୋଇ ବ୍ୟବହାର ପାଇଁ RO ୱାଟର ଫିଲ୍ଟର ତିଆରି କରୁ...",
    searchBtn: "ମାନକ ଖୋଜନ୍ତୁ",
    clearBtn: "ରିସେଟ୍",
    loadingAi: "BIS ତଥ୍ୟ ସଂଗ୍ରହ ଚାଲିଛି...",
    officialClause: "ପ୍ରମୁଖ ବୈଷୟିକ ଏବଂ ସୁରକ୍ଷା ନିୟମ",
    voiceInputTooltip: "ଭଏସ୍ ମାଧ୍ୟମରେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ",
    listeningVoice: "ଶୁଣୁଛି... ବର୍ତ୍ତମାନ ଆପଣଙ୍କ ପ୍ରଶ୍ନ କୁହନ୍ତୁ",
    stopVoiceInput: "ଭଏସ୍ ରେକର୍ଡିଂ ବନ୍ଦ କରନ୍ତୁ",
    voiceNotSupported: "ଏହି ବ୍ରାଉଜରରେ ଭଏସ୍ ରିକଗ୍ନିସନ୍ ସମର୍ଥିତ ନୁହେଁ। ଦୟାକରି Chrome କିମ୍ବା Edge ବ୍ୟବହାର କରନ୍ତୁ।",
    printRecord: "ପ୍ରିଣ୍ଟ / PDF ସେଭ୍ କରନ୍ତୁ",
    printRecordDesc: "ସରକାରୀ ରେକର୍ଡ ଏବଂ PDF ଡାଉନଲୋଡ୍"
  }
};
