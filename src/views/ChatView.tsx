import React, { useState } from 'react';
import {
  Bot,
  Radio,
  Sparkles,
  Zap,
  BrainCircuit,
  Compass,
  MapPin,
  Calendar,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { GeminiChatbot, TaskComplexity } from '../components/GeminiChatbot';
import { VoiceConversation } from '../components/VoiceConversation';
import { TripItinerary, TourPackage, UserProfile } from '../types';

interface ChatViewProps {
  itinerary: TripItinerary;
  selectedPackage: TourPackage | null;
  onSelectPackage: (pkg: TourPackage) => void;
  currentUser: UserProfile;
  setActivePage: (page: any) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  itinerary,
  selectedPackage,
  onSelectPackage,
  currentUser,
  setActivePage,
}) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'voice'>('chat');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Travel AI Agents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Gemini Travel Intelligence &amp; Voice
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Multi-turn contextual trip planning, budget strategy, and real-time voice conversations powered by Google Gemini models.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#07101d] border border-cyan-500/20 self-start md:self-auto shadow-lg">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Text Chat (3 Models)</span>
          </button>

          <button
            onClick={() => setActiveMode('voice')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'voice'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Voice (Live API)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Module + Context Sidecards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main AI Area (8 cols on lg) */}
        <div className="lg:col-span-8">
          {activeMode === 'chat' ? (
            <GeminiChatbot
              itinerary={itinerary}
              selectedPackage={selectedPackage}
              onSelectPackage={onSelectPackage}
            />
          ) : (
            <VoiceConversation isFullPageView={true} />
          )}
        </div>

        {/* Sidebar Context & Model Specifications (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Itinerary Mini-Card */}
          <div className="p-5 rounded-3xl bg-[#091424] border border-cyan-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Itinerary Context
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {itinerary.items.length} Stops
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="text-sm font-bold text-white truncate">{itinerary.tripTitle}</div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Departure Date:</span>
                <span className="text-slate-200 font-medium">{itinerary.departureDate}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Target Budget:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{itinerary.targetBudget?.toLocaleString('en-IN') || '65,000'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Stops in sequence:
                </div>
                {itinerary.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#060e1a] border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-white font-medium">{item.package.destination}</span>
                    </div>
                    <span className="text-slate-400">{item.durationDays} Days</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActivePage('planner')}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-[#0c1c33] hover:bg-[#11294d] text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Multi-Day Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Model Architecture Matrix */}
          <div className="p-5 rounded-3xl bg-[#091424] border border-cyan-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-cyan-500/15 pb-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Model Allocation Strategy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#050b14] border border-cyan-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>General Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">gemini-3.5-flash</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  General destination queries, package recommendations, attraction highlights, and multi-turn conversation.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#050b14] border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Fast Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">gemini-3.1-flash-lite</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Instantaneous packing lists, flight time checks, emergency facts, and ultra-snappy facts.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#050b14] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Complex Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">gemini-3.1-pro-preview</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deep multi-destination routing, demand curve pricing negotiation, and financial budget breakdown.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#050b14] border border-blue-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Voice Conversations</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">gemini-3.1-flash-live-preview</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time bidirectional Web Audio with low latency voice turns and natural barge-in interruption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
