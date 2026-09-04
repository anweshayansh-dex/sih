/**
 * BIS Consumer Sahayak - Full-Screen Conversational Experience with Persistent Chat History
 */

import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, SourceCitation, ChatMessageContext } from '../types';
import { translations } from '../translations';
import { Conversation, getMessages, saveMessageRecord, createConversation } from '../lib/supabase';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { TypewriterText } from './TypewriterText';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  X
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  suggestedFollowups?: string[];
  timestamp: string;
  feedback?: 'positive' | 'negative';
  isSimplified?: boolean;
  animateTyping?: boolean;
}

interface ConsumerViewProps {
  lang: LanguageCode;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  onSwitchToIndustry: () => void;
  currentUser: { id: string; email: string } | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isLoadingHistory: boolean;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  onToggleMobileSidebar: () => void;
  onRefreshConversations: () => void;
}

export const ConsumerView: React.FC<ConsumerViewProps> = ({
  lang,
  highContrast,
  fontSize,
  onSwitchToIndustry,
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoadingHistory,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  onToggleMobileSidebar,
  onRefreshConversations,
}) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageHistory, setMessageHistory] = useState<ChatMessageContext[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [completedTypingMsgs, setCompletedTypingMsgs] = useState<Record<string, boolean>>({});
  const lastScrollTimeRef = useRef<number>(0);

  const handleCharacterTyped = () => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current > 100) {
      lastScrollTimeRef.current = now;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTypingComplete = (msgId: string) => {
    setCompletedTypingMsgs(prev => ({ ...prev, [msgId]: true }));
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // SpeechRecognition Voice Command State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  // Check SpeechRecognition browser support on mount
  useEffect(() => {
    const hasSupport =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setIsVoiceSupported(hasSupport);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const suggestionChips = [
    {
      en: "Is my LPG cylinder BIS certified?",
      hi: "क्या मेरा एलपीजी सिलेंडर बीआईएस प्रमाणित है?",
      or: "ମୋର LPG ସିଲିଣ୍ଡର BIS ପ୍ରମାଣିତ କି?"
    },
    {
      en: "How do I check gold hallmark purity & 6-digit HUID?",
      hi: "सोने की शुद्धता और 6-अंकीय HUID की जांच कैसे करें?",
      or: "ସୁନାର ଶୁଦ୍ଧତା ଏବଂ ୬-ଅଙ୍କିଆ HUID କିପରି ଯାଞ୍ଚ କରିବେ?"
    },
    {
      en: "How to file a consumer complaint against fake ISI mark?",
      hi: "नकली आईएसआई मार्क के खिलाफ शिकायत कैसे दर्ज करें?",
      or: "ନକଲି ISI ମାର୍କ ବିରୁଦ୍ଧରେ ଅଭିଯୋଗ କିପରି କରିବେ?"
    },
    {
      en: "What is the mandatory standard for Packaged Drinking Water?",
      hi: "पैकेज्ड पेयजल (Packaged Drinking Water) के लिए मानक क्या है?",
      or: "ପ୍ୟାକେଜ୍ଡ ପାନୀୟ ଜଳ ପାଇଁ ବାଧ୍ୟତାମୂଳକ ମାନକ କ'ଣ?"
    },
    {
      en: "Why is ISI mark mandatory for two-wheeler helmets?",
      hi: "हेलमेट के लिए आईएसआई मार्क (IS 4151) क्यों अनिवार्य है?",
      or: "ହେଲମେଟ ପାଇଁ ISI ମାର୍କ କାହିଁକି ବାଧ୍ୟତାମୂଳକ?"
    },
    {
      en: "Find a BIS testing lab near me",
      hi: "मेरे निकटतम बीआईएस परीक्षण प्रयोगशाला (Testing Lab) खोजें",
      or: "ମୋ ନିକଟରେ ଥିବା BIS ଟେଷ୍ଟିଂ ଲ୍ୟାବ୍ ଖୋଜନ୍ତୁ"
    }
  ];

  // Load messages when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) {
      loadWelcomeMessage();
    } else {
      loadConversationMessages(activeConversationId);
    }
  }, [activeConversationId, lang]);

  const loadWelcomeMessage = () => {
    const getWelcomeText = () => {
      if (lang === 'hi') {
        return `**नमस्ते! मैं बीआईएस उपभोक्ता सहायक (BIS Consumer Sahayak) हूँ।**\n\nमैं भारतीय मानक ब्यूरो (BIS) द्वारा प्रमाणित उत्पादों, आईएसआई मार्क, सोने की 6-अंकीय HUID हॉलमार्किंग, और उपभोक्ता अधिकारों से संबंधित आपके प्रश्नों का उत्तर देने के लिए उपलब्ध हूँ।\n\nआप नीचे दिए गए त्वरित प्रश्नों में से चुन सकते हैं या अपना प्रश्न टाइप कर सकते हैं।`;
      }
      if (lang === 'or') {
        return `**ନମସ୍କାର! ମୁଁ BIS ଉପଭୋକ୍ତା ସହାୟକ।**\n\nମୁଁ ଭାରତୀୟ ମାନକ ବ୍ୟୁରୋ (BIS) ପ୍ରମାଣିତ ସାମଗ୍ରୀ, ISI ମାର୍କ, ସୁନା ହଲମାର୍କିଂ (HUID) ଏବଂ ଗ୍ରାହକ ସୁରକ୍ଷା ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବା ପାଇଁ ପ୍ରସ୍ତୁତ।\n\nଆପଣ ତଳେ ଥିବା ପ୍ରଶ୍ନ ବାଛିପାରିବେ କିମ୍ବା ନିଜ ପ୍ରଶ୍ନ ଲେଖିପାରିବେ।`;
      }
      return `**Namaste! I am BIS Consumer Sahayak (बीआईएस उपभोक्ता सहायक).**\n\nI am your official AI guide for verifying Indian Standards (IS), genuine ISI certified products, Gold & Silver Hallmarking (6-digit HUID codes), and filing complaints against spurious goods.\n\nSelect any topic below or type your question:`;
    };

    const welcomeText = getWelcomeText();

    setMessageHistory([
      {
        sender: 'assistant',
        text: welcomeText
      }
    ]);

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: welcomeText,
        sources: [
          {
            standard_number: 'BIS Act 2016',
            title: 'Bureau of Indian Standards Act & Consumer Rights Regulations',
            source_url: 'https://www.bis.gov.in'
          }
        ],
        suggestedFollowups: [
          suggestionChips[0][lang] || suggestionChips[0].en,
          suggestionChips[1][lang] || suggestionChips[1].en,
          suggestionChips[2][lang] || suggestionChips[2].en
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        animateTyping: true
      }
    ]);
  };

  const loadConversationMessages = async (convId: string) => {
    setIsLoading(true);
    try {
      const records = await getMessages(convId);
      if (records.length === 0) {
        loadWelcomeMessage();
        return;
      }

      const loadedMsgs: ChatMessage[] = records.map(r => ({
        id: r.id,
        sender: r.role,
        text: r.content,
        timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        animateTyping: false
      }));

      const loadedHistory: ChatMessageContext[] = records.map(r => ({
        sender: r.role,
        text: r.content
      }));

      setMessages(loadedMsgs);
      setMessageHistory(loadedHistory);
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
      loadWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    // If voice recognition is active, stop it gracefully
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }

    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    let currentConvId = activeConversationId;

    // If no active conversation, create one automatically
    if (!currentConvId) {
      try {
        const userId = currentUser?.id || 'guest-user-12345';
        const title = query.length > 45 ? query.substring(0, 45) + '...' : query;
        const newConv = await createConversation(userId, title);
        currentConvId = newConv.id;
        onSelectConversation(newConv.id);
        onRefreshConversations();
      } catch (err) {
        console.error('Failed to create conversation:', err);
      }
    }

    const industryKeywords = ['manufacturing unit', 'factory inspection', 'apply for cml', 'cml license', 'udyam', 'marking fee', 'simplified option', 'form-v', 'foreign manufacturer', 'fmcs', 'bulk testing'];
    const isIndustryIntent = industryKeywords.some(k => query.toLowerCase().includes(k));

    const userMsgContext: ChatMessageContext = {
      sender: 'user',
      text: query
    };

    const updatedHistory = [...messageHistory, userMsgContext];
    setMessageHistory(updatedHistory);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message to database
    if (currentConvId) {
      saveMessageRecord(currentConvId, 'user', query).catch(err => console.error('Error saving user msg:', err));
    }

    try {
      const historyContextToSend = updatedHistory.slice(-10);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role: 'consumer',
          lang: lang,
          session_id: sessionId.current,
          history: historyContextToSend
        })
      });

      const data = await response.json();
      let replyText = data.reply || "I couldn't locate specific information for this query. Please check with official BIS portals.";

      if (isIndustryIntent) {
        replyText += `\n\n💡 *Tip: It looks like you are asking about industrial manufacturing or license procedures. You can switch to the **Industry & MSME Portal** from the top bar for interactive license tracking and factory checklists.*`;
      }

      setMessageHistory(prev => [...prev, { sender: 'assistant', text: replyText }]);

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        sources: data.sources || [],
        suggestedFollowups: data.suggested_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        animateTyping: true
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant response to database
      if (currentConvId) {
        saveMessageRecord(currentConvId, 'assistant', replyText).then(() => {
          onRefreshConversations();
        }).catch(err => console.error('Error saving assistant msg:', err));
      }
    } catch (err) {
      const errorText = "I am having temporary difficulty connecting to the BIS Knowledge Base. You can reach the National Consumer Helpline directly at 1915.";
      setMessageHistory(prev => [...prev, { sender: 'assistant', text: errorText }]);

      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        animateTyping: true
      };
      setMessages(prev => [...prev, errorMsg]);

      if (currentConvId) {
        saveMessageRecord(currentConvId, 'assistant', errorText).catch(e => {});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainSimply = async (msg: ChatMessage) => {
    setIsLoading(true);
    try {
      const simplifyPrompt = `Please explain this in very simple, non-technical layman terms for a regular citizen in short sentences:\n\n${msg.text}`;
      const updatedHistory: ChatMessageContext[] = [...messageHistory, { sender: 'user', text: simplifyPrompt }];
      setMessageHistory(updatedHistory);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: simplifyPrompt,
          role: 'consumer',
          lang: lang,
          session_id: sessionId.current,
          history: updatedHistory.slice(-10)
        })
      });

      const data = await response.json();
      const replyText = `**Simplified Plain-Language Explanation:**\n\n${data.reply}`;
      setMessageHistory(prev => [...prev, { sender: 'assistant', text: replyText }]);

      const simplifiedMsg: ChatMessage = {
        id: `msg-simplified-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimplified: true,
        animateTyping: true
      };

      setMessages(prev => [...prev, simplifiedMsg]);

      if (activeConversationId) {
        saveMessageRecord(activeConversationId, 'user', simplifyPrompt).catch(e => {});
        saveMessageRecord(activeConversationId, 'assistant', replyText).catch(e => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, feedback: type } : m))
    );
    setFeedbackToast(type === 'positive' ? 'Thank you for your positive feedback!' : 'Feedback recorded. We will improve our responses.');
    setTimeout(() => setFeedbackToast(null), 3000);

    // Call backend feedback endpoint
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    }).catch(e => {});
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionClass) {
      setVoiceError(t.voiceNotSupported);
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Tailor language code based on current language
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'or' ? 'or-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const spoken = (final || interim).trim();
        if (spoken) {
          setInputMessage(spoken);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser address bar.');
        } else if (event.error === 'network') {
          setVoiceError('Speech recognition network error. Please check your internet connection.');
        } else if (event.error === 'no-speech') {
          // Graceful silence timeout
        } else {
          setVoiceError(`Voice input notice: ${event.error}`);
        }
        setTimeout(() => setVoiceError(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      setIsListening(false);
      setVoiceError('Unable to access microphone.');
      setTimeout(() => setVoiceError(null), 5000);
    }
  };

  const speakText = (text: string, msgId: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'or' ? 'or-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable or blocked:', err);
      setSpeakingMsgId(null);
    }
  };

  const toggleSourceAccordion = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const textSizeClass =
    fontSize === 'xlarge' ? 'text-base sm:text-lg' : fontSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm';

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-130px)]">
      {/* ChatGPT-style Chat History Sidebar */}
      <ChatHistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        onNewChat={onNewChat}
        onDeleteConversation={onDeleteConversation}
        isLoading={isLoadingHistory}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={onCloseMobileSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto p-2 sm:p-4 overflow-hidden">
        {feedbackToast && (
          <div className="fixed top-20 right-6 z-50 bg-[#0B3D6B] text-white text-xs px-4 py-2 rounded shadow-lg border border-amber-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        <div
          id="consumer-chat-box"
          className={`flex-1 flex flex-col border shadow-xs overflow-hidden transition-colors ${
            highContrast
              ? 'bg-black border-yellow-500 text-white'
              : 'bg-white border-gray-300'
          }`}
        >
          {/* Chat Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              highContrast
                ? 'bg-[#111] border-yellow-500'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0B3D6B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0B3D6B] flex items-center gap-2">
                  <span>{t.consumerHeader}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Grounded in 20,000+ Indian Standards, QCOs & BIS Act 2016
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNewChat}
                className="text-xs text-gray-600 hover:text-[#0B3D6B] p-1.5 hover:bg-gray-200 flex items-center gap-1 cursor-pointer font-medium"
                title="Start New Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Suggestion Chips Banner */}
          <div
            className={`px-3 py-2 border-b overflow-x-auto whitespace-nowrap flex items-center gap-2 scrollbar-thin ${
              highContrast ? 'bg-[#181818] border-yellow-600' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1 pl-1">
              <Sparkles className="w-3 h-3 text-[#FF9933]" />
              {t.quickQuestions}:
            </span>
            {suggestionChips.map((chip, idx) => {
              const chipText = chip[lang] || chip.en;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chipText)}
                  className={`text-xs px-2.5 py-1 border transition-colors cursor-pointer shrink-0 font-medium ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-500 hover:bg-yellow-950'
                      : 'bg-white hover:border-[#0B3D6B] hover:text-[#0B3D6B] text-gray-700 border-gray-300 shadow-xs'
                  }`}
                >
                  {chipText}
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map(msg => {
              const isTypingDone = msg.sender !== 'assistant' || !msg.animateTyping || !!completedTypingMsgs[msg.id];

              return (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 bg-[#0B3D6B] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] p-3.5 shadow-xs border ${textSizeClass} ${
                    msg.sender === 'user'
                      ? highContrast
                        ? 'bg-yellow-950 text-yellow-200 border-yellow-500'
                        : 'bg-[#0B3D6B] text-white border-[#082d4f]'
                      : highContrast
                      ? 'bg-black text-yellow-300 border-yellow-500'
                      : 'bg-white text-gray-800 border-gray-200'
                  }`}
                >
                  {/* Message Header / Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-black/10 text-[10px] opacity-75">
                    <span className="font-semibold uppercase tracking-wider">
                      {msg.sender === 'user' ? 'You' : 'BIS Sahayak AI'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content with Typewriter Animation for Assistant */}
                  {msg.sender === 'assistant' ? (
                    <TypewriterText
                      text={msg.text}
                      animate={msg.animateTyping ?? false}
                      highContrast={highContrast}
                      onCharacterTyped={handleCharacterTyped}
                      onComplete={() => handleTypingComplete(msg.id)}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                  )}

                  {/* Assistant Actions Bar */}
                  {msg.sender === 'assistant' && isTypingDone && (
                    <div className="mt-3 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs transition-opacity duration-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExplainSimply(msg)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          title="Explain in simple layman terms"
                        >
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>Explain Simply</span>
                        </button>
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`p-1.5 border rounded transition ${
                            speakingMsgId === msg.id
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                          title="Read Aloud (TTS)"
                        >
                          {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span className="text-[10px]">Helpful?</span>
                        <button
                          onClick={() => handleFeedback(msg.id, 'positive')}
                          className={`p-1 hover:bg-emerald-100 cursor-pointer ${
                            msg.feedback === 'positive' ? 'text-emerald-700 bg-emerald-100 font-bold' : ''
                          }`}
                          title="Yes, helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'negative')}
                          className={`p-1 hover:bg-rose-100 cursor-pointer ${
                            msg.feedback === 'negative' ? 'text-rose-700 bg-rose-100 font-bold' : ''
                          }`}
                          title="No, not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sources Accordion */}
                  {msg.sources && msg.sources.length > 0 && isTypingDone && (
                    <div className="mt-3 border-t border-gray-200 pt-2 transition-opacity duration-300">
                      <button
                        onClick={() => toggleSourceAccordion(msg.id)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-[#0B3D6B] hover:underline py-1 cursor-pointer uppercase tracking-wider"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#138808]" />
                          <span>{t.sources} ({msg.sources.length})</span>
                        </span>
                        {expandedSources[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-1.5 space-y-1.5 text-[11px] bg-gray-50 p-2.5 border-l-4 border-l-[#138808] border border-gray-200">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-1.5 bg-white border border-gray-200"
                            >
                              <div className="font-bold text-[#0B3D6B] flex items-center justify-between">
                                <span>{src.standard_number}</span>
                                {src.source_url && (
                                  <a
                                    href={src.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-700 hover:underline flex items-center gap-0.5 text-[10px]"
                                  >
                                    <span>View BIS Portal</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <div className="text-gray-700">{src.title}</div>
                              {src.clause && (
                                <div className="text-gray-500 italic mt-0.5">
                                  Clause: {src.clause}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up Question Chips */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && isTypingDone && (
                    <div className="mt-3 pt-2 border-t border-gray-200 transition-opacity duration-300">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t.suggestedQuestions}:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-xs text-left px-2.5 py-1 bg-white hover:border-[#0B3D6B] text-[#0B3D6B] border border-gray-300 transition-colors cursor-pointer shadow-xs"
                          >
                            → {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 bg-gray-700 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 bg-[#0B3D6B] text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 p-3 text-xs text-gray-600 flex items-center gap-2 shadow-xs">
                  <span className="inline-block w-2 h-2 bg-[#FF9933] animate-ping"></span>
                  <span>{t.loadingAi}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div
            className={`p-3 border-t ${
              highContrast
                ? 'bg-[#111] border-yellow-500'
                : 'bg-white border-gray-300'
            }`}
          >
            {/* Live Listening Status Banner */}
            {isListening && (
              <div
                id="voice-listening-banner"
                className="mb-2 px-3 py-2 bg-rose-50 border border-rose-300 flex items-center justify-between text-xs text-rose-900 rounded-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span className="font-semibold">{t.listeningVoice}</span>
                  <span className="text-[11px] text-rose-700 font-medium px-1.5 py-0.5 bg-white border border-rose-200">
                    {lang === 'hi' ? 'हिंदी' : lang === 'or' ? 'ଓଡ଼ିଆ' : 'Indian English'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceRecognition}
                  className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MicOff className="w-3 h-3" />
                  <span>{t.stopVoiceInput}</span>
                </button>
              </div>
            )}

            {/* Voice Error Notification */}
            {voiceError && (
              <div
                id="voice-error-banner"
                className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between rounded-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="text-amber-800 hover:text-amber-950 font-bold p-1 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="consumer-chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t.chatPlaceholder}
                disabled={isLoading}
                className={`flex-1 border px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#0B3D6B] ${
                  highContrast
                    ? 'bg-black text-white border-yellow-500'
                    : 'bg-gray-50 focus:bg-white text-gray-900 border-gray-300'
                }`}
              />

              {/* Voice Command SpeechRecognition Button */}
              <button
                id="consumer-voice-input-btn"
                type="button"
                onClick={toggleVoiceRecognition}
                disabled={isLoading}
                aria-label={isListening ? t.stopVoiceInput : t.voiceInputTooltip}
                title={!isVoiceSupported ? t.voiceNotSupported : isListening ? t.stopVoiceInput : t.voiceInputTooltip}
                className={`px-3 py-2 border font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer relative shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400 animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-white" />
                    <span className="hidden sm:inline font-bold text-white text-xs uppercase tracking-wider">Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#0B3D6B]" />
                    <span className="hidden sm:inline text-xs text-gray-700 font-medium">Voice</span>
                  </>
                )}
              </button>

              <button
                id="consumer-send-btn"
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`px-5 py-2 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                  !inputMessage.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#0B3D6B] hover:bg-[#082d4f] text-white'
                }`}
              >
                <span>{t.send}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5 px-1">
              <span>Powered by Bureau of Indian Standards Seed RAG Knowledge Base</span>
              <span className="text-[#138808] font-bold">National Consumer Helpline (NCH): 1915</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
