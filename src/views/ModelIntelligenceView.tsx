import React from 'react';
import {
  Cpu,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  BrainCircuit,
  Award
} from 'lucide-react';

export const ModelIntelligenceView: React.FC = () => {
  const pipelineNodes = [
    { id: 1, label: 'User Profile', icon: <Layers className="w-3.5 h-3.5" />, sub: 'users.csv' },
    { id: 2, label: 'Package Data', icon: <FileSpreadsheet className="w-3.5 h-3.5" />, sub: 'packages.csv' },
    { id: 3, label: 'Booking History', icon: <Database className="w-3.5 h-3.5" />, sub: 'bookings.csv' },
    { id: 4, label: 'Ratings', icon: <Award className="w-3.5 h-3.5" />, sub: 'ratings.csv' },
    { id: 5, label: 'Feature Engineering', icon: <Sliders className="w-3.5 h-3.5" />, sub: 'lead time, ratios' },
    { id: 6, label: 'XGBoost Model', icon: <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />, sub: 'Gradient Boost' },
    { id: 7, label: 'Price Prediction', icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />, sub: 'Tariff regression' },
    { id: 8, label: 'Package Ranking', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />, sub: 'Multi-criteria' },
    { id: 9, label: 'Personalized Recommendation', icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />, sub: 'Top Match + score' }
  ];

  const featureImportance = [
    { feature: 'Booking Lead Time', weight: 28, desc: 'High variance between last-minute surge (<7d) and early bird stability' },
    { feature: 'Destination Popularity', weight: 22, desc: 'Visitor density index and peak capacity constraints' },
    { feature: 'Group Size', weight: 18, desc: 'Scale economies across vehicle, guide, and room booking' },
    { feature: 'Seasonality', weight: 14, desc: 'Peak winter / summer surges vs monsoon concessionary pricing' },
    { feature: 'Base Price', weight: 10, desc: 'Catalog baseline package tariff anchor' },
    { feature: 'Category & Duration', weight: 8, desc: 'Niche activity intensity (e.g. Scuba, High Altitude Trekking)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Machine Learning Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How the Intelligence Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          From multi-table data ingestion to personalized tour matching and demand pricing — powered by gradient-boosted decision trees.
        </p>
      </div>

      {/* Visual Pipeline Flow (Matching Panel 7) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          End-to-End Prediction &amp; Recommendation Pipeline
        </h3>

        {/* Pipeline Nodes Flow */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex items-center min-w-[900px] justify-between">
            {pipelineNodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-all w-28 shrink-0 group">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {node.icon}
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 leading-tight">
                    {node.label}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    {node.sub}
                  </div>
                </div>

                {i < pipelineNodes.length - 1 && (
                  <div className="flex items-center px-1 text-slate-600 shrink-0">
                    <ArrowRight className="w-4 h-4 text-cyan-500/50" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Separation & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Key Model Features Comparison */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-bold text-white tracking-tight">
            Key Model Features
          </h3>

          {/* Pricing Model Features */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Pricing Model Features (XGBoost Inputs)
            </div>
            <div className="space-y-2">
              {[
                { name: 'Booking Lead Time', detail: 'Days elapsed between transaction & departure' },
                { name: 'Seasonality Index', detail: 'Climate demand window classification' },
                { name: 'Destination Popularity', detail: 'Acclaim & capacity density (0–100%)' },
                { name: 'Group Size', detail: 'Passenger count economies of scale' },
                { name: 'Base Price Anchor', detail: 'Fixed starting rate from packages.csv' }
              ].map((f) => (
                <div key={f.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">{f.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{f.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Features */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Recommendation Engine Features
            </div>
            <div className="space-y-2">
              {[
                { name: 'User Preferred Categories', detail: 'Jaccard affinity matching user taste vectors' },
                { name: 'Budget Range Match', detail: 'Strict bounds vs elasticity scoring' },
                { name: 'Historical Rating Score', detail: 'Calculated average from ratings.csv' },
                { name: 'Duration Compatibility', detail: 'Length of stay vs group capability' }
              ].map((f) => (
                <div key={f.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">{f.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{f.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Importance Chart (Matching Panel 7) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">
                Feature Importance (XGBoost Regressor)
              </h3>
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                R² = 0.924
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Relative gain attribution across 100 boosted regression trees trained on 4,000 bookings
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {featureImportance.map((f) => (
              <div key={f.feature} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{f.feature}</span>
                  <span className="font-mono font-bold text-cyan-400">{f.weight}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${f.weight * 3}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Model Explainability Callout */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Model Explainability Guarantee
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              No price or recommendation in TripWise AI is generated as an ungrounded black box. Every price adjustment directly references measurable historical lead times, seasonal multipliers, or group efficiency indices present in the raw data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
