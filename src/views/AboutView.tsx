import React from 'react';
import {
  Compass,
  Car,
  Plane,
  Sparkles,
  Database,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Award,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Project Genesis &amp; Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          The Story Behind the Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          How our research in urban mobility algorithms evolved into an end-to-end travel recommendation and dynamic tariff engine.
        </p>
      </div>

      {/* Story Narrative: From RideWise to TripWise (Panel 9) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
          System Lineage
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          From RideWise to TripWise AI
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            The journey started with <strong className="text-white">RideWise</strong>, our intelligent transportation engine built to demystify real-time taxi surges, ETA uncertainty, and urban commuter traffic patterns. By deploying gradient boosting on thousands of urban trip telemetry points, RideWise proved that algorithmic pricing could be fair, explainable, and predictive.
          </p>
          <p>
            <strong className="text-cyan-400">TripWise AI</strong> takes that exact algorithmic discipline and expands the horizon from minutes and kilometers to weeks and global destinations. We asked: why should vacationers suffer from erratic, opaque tour pricing when predictive machine learning can reveal seasonal demand curves and match travelers with verified value?
          </p>
        </div>

        {/* Comparison: RideWise vs TripWise AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">RideWise</h3>
                <span className="text-[11px] text-slate-400">Urban Transit Intelligence</span>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Real-time demand spikes (15-minute horizons)</li>
              <li>• Point-to-point urban routing and traffic congestion</li>
              <li>• Dynamic surge multiplier regression</li>
              <li>• Driver-commuter bilateral allocation</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">TripWise AI</h3>
                <span className="text-[11px] text-cyan-300">Vacation Planning Intelligence</span>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>• 1 to 120-day booking lead time price sensitivity</li>
              <li>• Multi-factor package recommendation matching</li>
              <li>• Destination popularity &amp; seasonal climate indices</li>
              <li>• Group size economies of scale across 60 destinations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The 4 Synthesized Real-World Datasets */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">The 4 Core Datasets</h3>
          <p className="text-xs text-slate-400">
            A look into the relational data structure powering our ML training models
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">packages.csv</h4>
            <div className="text-xs text-cyan-400 font-mono font-semibold">60 Tour Packages</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated domestic and international destinations spanning 7 categories, base catalog prices, duration, and popularity indices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">bookings.csv</h4>
            <div className="text-xs text-blue-400 font-mono font-semibold">4,000 Bookings</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transactional records capturing booking dates, departure dates, lead time, group size, and actual final paid price.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">users.csv</h4>
            <div className="text-xs text-indigo-400 font-mono font-semibold">400 Travel Profiles</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diverse traveler personas with preference vectors, budget tiers, past booking counts, and signup cohorts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">ratings.csv</h4>
            <div className="text-xs text-amber-400 font-mono font-semibold">2,500 Ratings</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post-trip user feedback with 1–5 star ratings and reviews reflecting real traveler sentiment across all categories.
            </p>
          </div>
        </div>
      </div>

      {/* Model Transparency Commitment */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Core Ethical Principle</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Transparent Algorithms. Zero Dark Patterns.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            TripWise AI does not use artificial countdown timers or simulated scarcity cookies. All price curves and recommendation matches are derived directly from verified data models.
          </p>
        </div>
      </div>
    </div>
  );
};
