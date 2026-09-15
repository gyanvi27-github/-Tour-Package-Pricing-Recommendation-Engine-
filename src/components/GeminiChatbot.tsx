import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  Zap,
  BrainCircuit,
  Compass,
  Paperclip,
  Check,
  Copy,
  Info,
  RefreshCw,
} from 'lucide-react';
import { TripItinerary, TourPackage } from '../types';

export type TaskComplexity = 'general' | 'fast' | 'complex';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  taskType?: TaskComplexity;
}

interface GeminiChatbotProps {
  itinerary?: TripItinerary;
  selectedPackage?: TourPackage | null;
  onSelectPackage?: (pkg: TourPackage) => void;
  isWidgetMode?: boolean;
}

const MODEL_INFO: Record<
  TaskComplexity,
  {
    name: string;
    modelId: string;
    roleTitle: string;
    tagline: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    bg: string;
  }
> = {
  general: {
    name: 'General Concierge',
    modelId: 'gemini-3.5-flash',
    roleTitle: 'General Trip Concierge',
    tagline: 'Balanced travel advice, destination highlights, dining & seasonal suggestions',
    icon: <Compass className="w-4 h-4 text-cyan-400" />,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
  fast: {
    name: 'Fast Assistant',
    modelId: 'gemini-3.1-flash-lite',
    roleTitle: 'Rapid Travel Assistant',
    tagline: 'Ultra-low latency replies, packing lists, emergency numbers & fast facts',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  complex: {
    name: 'Complex Strategist',
    modelId: 'gemini-3.1-pro-preview',
    roleTitle: 'Itinerary & Financial Specialist',
    tagline: 'Deep multi-city routing, budget breakdowns, demand pricing & logistics',
    icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
};

const SUGGESTED_PROMPTS: Record<TaskComplexity, string[]> = {
  general: [
    'What are the best off-beat spots to visit in Goa during winter?',
    'Recommend a 5-day mountain escape package under ₹25,000.',
    'What should I eat and experience in Bali on a leisure trip?',
  ],
  fast: [
    'Quick beach vacation packing checklist in 5 bullets.',
    'What is the standard tipping etiquette and currency in Indonesia?',
    'Direct flight duration between Delhi and Bhuntar (Kullu)?',
  ],
  complex: [
    'Analyze connecting transit between Goa, Manali, and Bali in sequence with cost estimates.',
    'How does holiday demand pricing affect hotel rates in Himachal and how can I negotiate or time it?',
    'Break down a ₹65,000 total trip budget across accommodation, flights, activities, and emergency buffer.',
  ],
};

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  itinerary,
  selectedPackage,
  isWidgetMode = false,
}) => {
  const [taskType, setTaskType] = useState<TaskComplexity>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Hello! I am your **TripWise Gemini Travel Assistant**.
      
I can assist you with:
- **General Tasks (gemini-3.5-flash)**: Destination guides, tour packages, and travel recommendations.
- **Fast Tasks (gemini-3.1-flash-lite)**: Instant answers, fast packing lists, and quick tips.
- **Complex Tasks (gemini-3.1-pro-preview)**: In-depth itinerary route logistics and demand budget strategies.

How may I assist your journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      taskType: 'general',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Conversation reset. Switched to **${MODEL_INFO[taskType].roleTitle}** (${MODEL_INFO[taskType].modelId}). What would you like to plan?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: MODEL_INFO[taskType].modelId,
        taskType,
      },
    ]);
    setErrorMsg(null);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Prepare context
    let tripContext: any = null;
    if (includeContext) {
      tripContext = {
        activeItineraryStops: itinerary?.items.map((i) => ({
          destination: i.package.destination,
          category: i.package.category,
          duration: `${i.durationDays} days`,
          basePrice: i.package.base_price,
        })),
        targetBudget: itinerary?.targetBudget,
        departureDate: itinerary?.departureDate,
        selectedPackage: selectedPackage
          ? {
              destination: selectedPackage.destination,
              category: selectedPackage.category,
              basePrice: selectedPackage.base_price,
              duration: selectedPackage.duration_days,
            }
          : undefined,
      };
    }

    try {
      // Build conversation payload for backend proxy
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          taskType,
          tripContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || MODEL_INFO[taskType].modelId,
        taskType,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat request failed:', err);
      setErrorMsg(err.message || 'Failed to communicate with Gemini. Please try again.');
      // Add local error response
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content: `⚠️ **Unable to complete request:** ${err.message || 'Network or API error'}.\n\n*Note: Please verify your Gemini API key in the AI Studio environment or try a different task complexity mode.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: MODEL_INFO[taskType].modelId,
          taskType,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#08111e] rounded-3xl border border-cyan-500/20 shadow-2xl overflow-hidden backdrop-blur-xl ${
        isWidgetMode ? 'max-h-[640px]' : 'min-h-[650px]'
      }`}
    >
      {/* Header with Model & Role Selector */}
      <div className="p-4 sm:p-5 bg-[#0a1628] border-b border-cyan-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  TripWise AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Multi-Turn
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Powered by Google Gemini Models • Intelligent Travel Guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer border border-slate-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Complexity & Model Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#050b14] border border-cyan-500/20">
          {(['general', 'fast', 'complex'] as TaskComplexity[]).map((type) => {
            const info = MODEL_INFO[type];
            const isActive = taskType === type;
            return (
              <button
                key={type}
                onClick={() => setTaskType(type)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-left transition-all cursor-pointer flex flex-col items-start gap-0.5 ${
                  isActive
                    ? 'bg-[#0e213d] text-white shadow-md border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  {info.icon}
                  <span className="text-xs font-bold truncate">{info.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono hidden sm:block truncate">
                  {info.modelId}
                </div>
              </button>
            );
          })}
        </div>

        {/* Role & System Instruction Overview Banner */}
        <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              <strong className="text-white">{MODEL_INFO[taskType].roleTitle}:</strong>{' '}
              {MODEL_INFO[taskType].tagline}
            </span>
          </div>

          {itinerary && itinerary.items.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] text-cyan-300 hover:text-cyan-200 shrink-0 ml-2">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-3.5 h-3.5"
              />
              <Paperclip className="w-3 h-3" />
              <span>Itinerary Context</span>
            </label>
          )}
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-[#0e223d] border border-cyan-500/30 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="flex flex-col space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-cyan-500/20'
                      : 'bg-[#0a1628] text-slate-100 rounded-tl-none border border-cyan-500/20 shadow-xl'
                  }`}
                >
                  {msg.content}
                </div>

                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      {msg.modelUsed}
                    </span>
                  )}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-0.5 ml-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#0e223d] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#0a1628] border border-cyan-500/20 text-slate-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 ml-1">
                Thinking with {MODEL_INFO[taskType].modelId}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Starters */}
      <div className="px-4 py-2 bg-[#060e1a] border-t border-cyan-500/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold shrink-0">
          Suggested:
        </span>
        {SUGGESTED_PROMPTS[taskType].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-[#0c1a2e] hover:bg-[#132845] text-slate-300 hover:text-cyan-300 border border-cyan-500/20 transition-all shrink-0 cursor-pointer text-left truncate max-w-[280px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-[#0a1628] border-t border-cyan-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${MODEL_INFO[taskType].name} about itineraries, pricing, packages...`}
              rows={1}
              className="w-full px-4 py-3 rounded-2xl bg-[#060e1a] border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-xs sm:text-sm resize-none outline-none transition-all"
              style={{ minHeight: '46px', maxHeight: '120px' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/25 shrink-0 cursor-pointer flex items-center justify-center"
            title="Send message"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="font-mono">Model: {MODEL_INFO[taskType].modelId}</span>
        </div>
      </div>
    </div>
  );
};
