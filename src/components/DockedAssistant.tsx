/**
 * Docked & Context-Aware AI Assistant for Industry Dashboard
 * Provides contextual guidance specific to the user's active tab
 */

import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, SourceCitation } from '../types';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, BookOpen, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DockedAssistantProps {
  lang: LanguageCode;
  highContrast: boolean;
  activeTab: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  injectedPrompt?: string | null;
  onClearInjectedPrompt?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  timestamp: string;
}

export const DockedAssistant: React.FC<DockedAssistantProps> = ({
  lang,
  highContrast,
  activeTab,
  isOpen,
  onToggleOpen,
  injectedPrompt,
  onClearInjectedPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`docked-${Date.now()}`);

  const getContextPrompts = (tab: string) => {
    switch (tab) {
      case 'find-standard':
        return [
          "Which standards have mandatory Quality Control Orders (QCO)?",
          "What is the difference between IS 14543 and IS 13428?",
          "How to identify if my electronic item needs CRS registration?"
        ];
      case 'schemes':
        return [
          "What is the timeline difference between Normal and Simplified Option for ISI?",
          "What are the marking fees for MSMEs under UDYAM?",
          "What is the process for Foreign Manufacturers (FMCS)?"
        ];
      case 'license-track':
        return [
          "What documents are checked during factory inspection?",
          "What happens if sample fails in Central Laboratory testing?",
          "How to apply for license renewal before expiry?"
        ];
      case 'labs':
        return [
          "Can private NABL labs test samples for BIS license grant?",
          "What is the validity period of an ERTL test report?",
          "Where is the Central Laboratory of BIS located?"
        ];
      case 'huid-verify':
        return [
          "Is HUID mandatory for 20K or 24K gold jewellery?",
          "What are the penalties for selling un-hallmarked gold?",
          "Can a consumer test jewellery at an AHC centre?"
        ];
      case 'complaints':
        return [
          "How does BIS penalize manufacturers misusing the ISI mark?",
          "Can I file an anonymous complaint on BIS CARE app?",
          "What compensation is awarded under Consumer Protection Act?"
        ];
      default:
        return [
          "How do I apply for a new ISI CML license?",
          "What are the mandatory QCO standards in 2025-2026?",
          "How to calculate marking fees for MSMEs?"
        ];
    }
  };

  useEffect(() => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `**BIS Industry & MSME AI Desk Active.**\n\nI am synced to your **${activeTab.replace('-', ' ').toUpperCase()}** screen. Ask any technical regulatory, testing, or compliance question:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeTab]);

  // Handle injected prompt from other components
  useEffect(() => {
    if (injectedPrompt) {
      if (!isOpen) onToggleOpen();
      setIsMinimized(false);
      handleSend(injectedPrompt);
      if (onClearInjectedPrompt) onClearInjectedPrompt();
    }
  }, [injectedPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role: 'industry',
          lang: lang,
          session_id: sessionId.current,
          page_context: `Active Tab: ${activeTab}`,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: "Connection to BIS Knowledge Base interrupted. Please retry shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="open-docked-ai-btn"
        onClick={onToggleOpen}
        className="fixed bottom-6 right-6 z-40 bg-[#0B3D6B] hover:bg-[#082d4f] text-white p-3.5 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2 cursor-pointer group"
        title="Open BIS AI Assistant"
      >
        <Bot className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">Ask BIS AI</span>
      </button>
    );
  }

  return (
    <div
      id="docked-ai-panel"
      className={`fixed right-4 z-40 transition-all duration-300 shadow-xl border overflow-hidden flex flex-col ${
        isMinimized
          ? 'bottom-4 w-72 h-12'
          : 'bottom-4 w-88 sm:w-96 h-[560px] max-h-[85vh]'
      } ${
        highContrast
          ? 'bg-black border-yellow-500 text-white'
          : 'bg-white border-gray-300'
      }`}
    >
      {/* Dock Header matching Clean Minimalism */}
      <div className="bg-[#0B3D6B] text-white p-3 flex items-center justify-between border-b border-[#082d4f] select-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="font-bold text-xs uppercase tracking-wider">
            BIS Sahayak AI ({activeTab.replace('-', ' ')})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#082d4f] text-slate-300 hover:text-white cursor-pointer"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1 hover:bg-[#082d4f] text-slate-300 hover:text-white cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Context Quick Questions */}
          <div className="bg-gray-100 p-2.5 border-b border-gray-200 text-[11px]">
            <div className="font-bold text-[#0B3D6B] flex items-center gap-1 mb-1.5 uppercase text-[10px] tracking-wider">
              <Sparkles className="w-3 h-3 text-[#FF9933]" />
              <span>Suggested Inquiries:</span>
            </div>
            <div className="space-y-1">
              {getContextPrompts(activeTab).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-[11px] p-1.5 bg-white hover:bg-gray-50 hover:border-[#0B3D6B] border border-gray-200 text-gray-700 font-medium truncate block cursor-pointer transition-colors"
                >
                  → {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 max-w-[90%] shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0B3D6B] text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="prose prose-xs whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Sources Accordion */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setExpandedSources(prev => ({
                            ...prev,
                            [msg.id]: !prev[msg.id]
                          }))
                        }
                        className="text-[10px] font-bold text-[#0B3D6B] flex items-center justify-between w-full uppercase tracking-wider"
                      >
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#138808]" />
                          <span>BIS Standards Cited ({msg.sources.length})</span>
                        </span>
                        {expandedSources[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-1.5 space-y-1 text-[10px] bg-gray-50 p-2 border-l-4 border-l-[#138808] border border-gray-200">
                          {msg.sources.map((s, sIdx) => (
                            <div key={sIdx} className="font-semibold text-gray-800">
                              • <strong>{s.standard_number}</strong>: {s.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="p-2.5 bg-white border border-gray-200 text-[11px] text-gray-600 flex items-center gap-2 shadow-xs">
                <Bot className="w-3.5 h-3.5 text-[#0B3D6B] animate-spin" />
                <span>Searching official BIS standards & gazettes...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5 border-t border-gray-300 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask standard, scheme, or audit question..."
                className="flex-1 border border-gray-300 px-3 py-2 text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-[#0B3D6B]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-2 bg-[#0B3D6B] hover:bg-[#082d4f] text-white text-xs font-bold uppercase tracking-wider disabled:bg-gray-300 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
