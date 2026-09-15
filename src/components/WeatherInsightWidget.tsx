import React, { useState } from 'react';
import {
  CloudSun,
  Thermometer,
  CalendarCheck,
  Sun,
  CloudRain,
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Luggage,
  Wind
} from 'lucide-react';
import { SeasonTag } from '../types';
import { getDestinationWeatherInsight } from '../data/weatherData';

interface WeatherInsightWidgetProps {
  destination: string;
  seasonTag: SeasonTag;
  scheduledDate?: string;
  className?: string;
}

export const WeatherInsightWidget: React.FC<WeatherInsightWidgetProps> = ({
  destination,
  seasonTag,
  scheduledDate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const insight = getDestinationWeatherInsight(destination, seasonTag, scheduledDate);

  return (
    <div
      className={`rounded-2xl bg-[#091527]/90 border border-cyan-500/25 p-4 sm:p-4.5 space-y-3.5 backdrop-blur-md shadow-lg shadow-cyan-950/20 transition-all ${className}`}
    >
      {/* Header Row: Title, Climate Type & Status Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white tracking-tight">
                Weather &amp; Climate Insight
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                {insight.climateType}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Climate guidance for {insight.destination}
            </div>
          </div>
        </div>

        {/* Timing Alignment Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${insight.timingBadgeClass}`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{insight.timingStatus}</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-cyan-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse climate details' : 'Expand seasonal breakdown'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Recommended Window Highlight */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Best Time to Visit</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-white">
            {insight.bestTimeToVisit}
          </div>
        </div>

        <div className="text-[11px] text-slate-300 max-w-sm sm:text-right leading-snug">
          {insight.climateSummary}
        </div>
      </div>

      {/* Key Climate Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
        {/* Temperature */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-0.5">
          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            <span>Avg. Temp</span>
          </div>
          <div className="text-xs font-bold text-white tracking-tight">
            {insight.avgTempRange}
          </div>
        </div>

        {/* Sunshine */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-0.5">
          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Daily Sunshine</span>
          </div>
          <div className="text-xs font-bold text-white tracking-tight">
            {insight.sunshineDaily}
          </div>
        </div>

        {/* Rainfall / Conditions */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-0.5">
          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1">
            <Wind className="w-3 h-3 text-blue-400" />
            <span>Conditions</span>
          </div>
          <div className="text-xs font-bold text-cyan-300 tracking-tight truncate" title={insight.rainfallStatus}>
            {insight.rainfallStatus}
          </div>
        </div>
      </div>

      {/* Scheduled Timing Note */}
      <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
        <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{insight.timingAdvice}</span>
      </div>

      {/* Expandable Deep Seasonal Breakdown & Packing Insights */}
      {isExpanded && (
        <div className="pt-2 space-y-3 border-t border-slate-800/90 animate-in fade-in duration-200">
          {/* Packing Recommendations */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Luggage className="w-3 h-3 text-cyan-400" />
              <span>Recommended Packing Essentials:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {insight.packingRecommendations.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-500/25"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Seasonal Windows Comparison */}
          <div className="space-y-1.5 text-[11px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Year-Round Seasonal Windows:
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-slate-300">
                <span className="font-bold text-emerald-400">Peak Window:</span>{' '}
                {insight.seasonalHighlights.peak}
              </div>
              <div className="text-slate-300">
                <span className="font-bold text-cyan-400">Shoulder Season:</span>{' '}
                {insight.seasonalHighlights.shoulder}
              </div>
              <div className="text-slate-300">
                <span className="font-bold text-amber-400">Off-Peak Period:</span>{' '}
                {insight.seasonalHighlights.offPeak}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
