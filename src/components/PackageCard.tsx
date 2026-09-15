import React from 'react';
import { Star, Clock, Users, Globe, TrendingUp, Sparkles, Check, Plus, CalendarPlus } from 'lucide-react';
import { TourPackage } from '../types';
import { getPackageRatingStats } from '../data/ratingsData';

interface PackageCardProps {
  packageData: TourPackage;
  onSelect: (pkg: TourPackage) => void;
  onToggleCompare?: (pkg: TourPackage) => void;
  isCompared?: boolean;
  onAddToItinerary?: (pkg: TourPackage) => void;
  isInItinerary?: boolean;
  matchScore?: number;
  featured?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  packageData,
  onSelect,
  onToggleCompare,
  isCompared = false,
  onAddToItinerary,
  isInItinerary = false,
  matchScore,
  featured = false
}) => {
  const stats = getPackageRatingStats(packageData.package_id);

  return (
    <div
      className={`group relative rounded-2xl bg-[#091527]/90 border transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-2xl ${
        featured
          ? 'border-cyan-500/50 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/25'
          : 'border-slate-800/90 hover:border-cyan-500/40 hover:shadow-cyan-950/20'
      }`}
    >
      {/* Image Header with Gradient & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={packageData.imageUrl}
          alt={packageData.destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-[#050b16]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
              {packageData.category}
            </span>
            {packageData.is_international && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-blue-950/70 backdrop-blur-md text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" /> Intl
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-950/70 backdrop-blur-md text-slate-300 border border-slate-800">
              {packageData.season_tag}
            </span>
          </div>

          {/* Compare Button */}
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(packageData);
              }}
              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              className={`p-1.5 rounded-lg text-xs font-medium backdrop-blur-md transition-all ${
                isCompared
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-400 font-bold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] px-1 font-semibold">Compare</span>}
            </button>
          )}
        </div>

        {/* Match Score Badge (if in recommendation mode) */}
        {matchScore !== undefined && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-lg shadow-cyan-400/30">
            <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
            <span>{matchScore}% Match</span>
          </div>
        )}

        {/* Destination & Title Overlay */}
        <div className="absolute bottom-3 left-3 right-20">
          <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-md truncate">
            {packageData.destination}
          </h3>
          <p className="text-xs text-slate-300 truncate drop-shadow">
            {packageData.duration_days} Days • {packageData.category}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Rating and Group Size */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.averageRating}</span>
            <span className="text-slate-400 font-normal text-[11px]">({stats.totalRatings})</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Users className="w-3 h-3 text-slate-400" />
            <span>For {packageData.group_size_range} travelers</span>
          </div>
        </div>

        {/* Destination Popularity Gauge */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" /> Popularity Score
            </span>
            <span className="font-semibold text-cyan-300">{packageData.destination_popularity}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-400 transition-all duration-700"
              style={{ width: `${packageData.destination_popularity}%` }}
            />
          </div>
        </div>

        {/* Pricing Strip & Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Base Catalog
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">
                ₹{packageData.base_price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">/ pers</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onAddToItinerary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToItinerary(packageData);
                }}
                title={isInItinerary ? "Already in Itinerary" : "Add to Trip Itinerary"}
                className={`p-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isInItinerary
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-cyan-400'
                }`}
              >
                {isInItinerary ? <Check className="w-4 h-4 text-cyan-400" /> : <CalendarPlus className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={() => onSelect(packageData)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-cyan-400 transition-all duration-200 cursor-pointer shrink-0"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
