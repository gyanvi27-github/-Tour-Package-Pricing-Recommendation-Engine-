import React, { useState } from 'react';
import { Bot, Radio, X, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { GeminiChatbot } from './GeminiChatbot';
import { VoiceConversation } from './VoiceConversation';
import { TripItinerary, TourPackage } from '../types';

interface FloatingAiWidgetProps {
  itinerary: TripItinerary;
  selectedPackage: TourPackage | null;
  onSelectPackage: (pkg: TourPackage) => void;
  onOpenFullPage: () => void;
}

export const FloatingAiWidget: React.FC<FloatingAiWidgetProps> = ({
  itinerary,
  selectedPackage,
  onSelectPackage,
  onOpenFullPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');

  return (
    <>
      {/* Floating Action Pill / Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('voice');
              setIsOpen(true);
            }}
            title="Talk with Gemini Live Voice"
            className="p-3.5 rounded-2xl bg-[#091526] hover:bg-[#0e213b] text-cyan-300 border border-cyan-500/40 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-2 backdrop-blur-md"
          >
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold hidden sm:inline">Live Voice</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('chat');
              setIsOpen(true);
            }}
            title="Open Gemini Travel Chatbot"
            className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2.5"
          >
            <Bot className="w-5 h-5 text-slate-950" />
            <span>Ask Gemini AI</span>
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          </button>
        </div>
      )}

      {/* Floating Widget Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[480px] h-[640px] max-h-[92vh] flex flex-col rounded-3xl bg-[#070e1a] border border-cyan-500/40 shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Control Bar */}
          <div className="p-3.5 bg-[#0a1628] border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex p-1 rounded-xl bg-[#050b14] border border-cyan-500/20">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Chatbot</span>
                </button>
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'voice'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live Voice</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullPage();
                }}
                title="Expand to Full Page"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Assistant"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <GeminiChatbot
                itinerary={itinerary}
                selectedPackage={selectedPackage}
                onSelectPackage={onSelectPackage}
                isWidgetMode={true}
              />
            ) : (
              <div className="h-full p-2 flex flex-col">
                <VoiceConversation onClose={() => setIsOpen(false)} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
