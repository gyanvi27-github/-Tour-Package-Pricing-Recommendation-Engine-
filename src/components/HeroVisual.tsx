import React from 'react';
import { Star, Sparkles, Globe, MapPin } from 'lucide-react';
import { TourPackage } from '../types';

interface HeroVisualProps {
  onSelectPackage: (pkg: TourPackage) => void;
  goaPkg: TourPackage;
  baliPkg: TourPackage;
}

export const HeroVisual: React.FC<HeroVisualProps> = ({
  onSelectPackage,
  goaPkg,
  baliPkg
}) => {
  return (
    <div className="relative w-full h-[400px] lg:h-[460px] rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-[#0b172a]/95 via-[#071120] to-[#050b16] shadow-2xl flex items-center justify-center">
      {/* Background Route Map Grid with Electric Cyan & Azure Vectors */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="nodeGlowCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Grid Pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Curved Flight / Travel Routes */}
        <path
          d="M 120 320 Q 280 180, 480 260 T 800 150"
          fill="none"
          stroke="url(#routeGradientCyan)"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-pulse"
        />
        <path
          d="M 220 120 Q 420 240, 620 140 T 920 300"
          fill="none"
          stroke="url(#routeGradientCyan)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 300 360 C 450 280, 600 320, 750 210"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Glowing Waypoint Nodes */}
        <circle cx="280" cy="220" r="16" fill="url(#nodeGlowCyan)" />
        <circle cx="280" cy="220" r="4" fill="#00e5ff" />

        <circle cx="620" cy="180" r="16" fill="url(#nodeGlowCyan)" />
        <circle cx="620" cy="180" r="4" fill="#60a5fa" />

        <circle cx="480" cy="260" r="20" fill="url(#nodeGlowCyan)" />
        <circle cx="480" cy="260" r="5" fill="#38bdf8" />

        <circle cx="750" cy="210" r="16" fill="url(#nodeGlowCyan)" />
        <circle cx="750" cy="210" r="4" fill="#00e5ff" />
      </svg>

      {/* Center Ambient Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Interactive Card 1: GOA */}
      <div
        onClick={() => onSelectPackage(goaPkg)}
        className="absolute top-8 left-4 sm:left-10 md:left-14 w-60 sm:w-64 rounded-3xl bg-[#091527]/95 backdrop-blur-xl border border-cyan-500/30 p-3 shadow-2xl shadow-black/70 hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer group z-20"
      >
        <div className="relative h-28 rounded-2xl overflow-hidden mb-2.5">
          <img
            src={goaPkg.imageUrl}
            alt="Goa"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-transparent to-transparent" />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-lg shadow-cyan-400/30">
            <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
            93% Match
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>4.4</span>
            <span className="text-slate-300 font-normal text-[10px]">(320)</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              GOA
            </h4>
            <p className="text-[10px] text-slate-400">5 days • Beach Haven</p>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase">Base Price</div>
            <div className="text-sm font-bold text-cyan-300">₹14,500</div>
          </div>
        </div>
      </div>

      {/* Floating Interactive Card 2: BALI */}
      <div
        onClick={() => onSelectPackage(baliPkg)}
        className="absolute bottom-8 right-4 sm:right-10 md:right-14 w-60 sm:w-64 rounded-3xl bg-[#091527]/95 backdrop-blur-xl border border-blue-500/30 p-3 shadow-2xl shadow-black/70 hover:scale-105 hover:border-blue-400 transition-all duration-300 cursor-pointer group z-20"
      >
        <div className="relative h-28 rounded-2xl overflow-hidden mb-2.5">
          <img
            src={baliPkg.imageUrl}
            alt="Bali"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-transparent to-transparent" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center gap-1">
            <Globe className="w-2.5 h-2.5" />
            Intl
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
            Trending
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>4.8</span>
            <span className="text-slate-300 font-normal text-[10px]">(480)</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              BALI
            </h4>
            <p className="text-[10px] text-slate-400">6 days • Tropical Ubud</p>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase">Base Price</div>
            <div className="text-sm font-bold text-slate-200">₹46,100</div>
          </div>
        </div>
      </div>

      {/* Decorative Center Intelligence Tag */}
      <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-[#071324]/90 backdrop-blur-md border border-cyan-500/25 text-center z-10 shadow-xl">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="text-xs font-bold text-white">Demand Intelligence</div>
        <div className="text-[11px] text-cyan-300 font-semibold">4,000 Verified Bookings</div>
        <div className="text-[10px] text-slate-400 mt-0.5">R² Accuracy: 92.4%</div>
      </div>
    </div>
  );
};

