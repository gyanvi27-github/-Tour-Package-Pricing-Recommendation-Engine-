import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  Users,
  Globe,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  CalendarPlus,
  Check
} from 'lucide-react';
import { TourPackage } from '../types';
import { getPackageRatingStats } from '../data/ratingsData';
import { getBookingsForPackage } from '../data/bookingsData';
import { predictTourPrice } from '../lib/mlEngine';

interface PackageDetailModalProps {
  packageData: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCompare?: (pkg: TourPackage) => void;
  isCompared?: boolean;
  onAddToItinerary?: (pkg: TourPackage) => void;
  isInItinerary?: boolean;
  onRunRecommendation?: (pkg: TourPackage) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onToggleCompare,
  isCompared = false,
  onAddToItinerary,
  isInItinerary = false,
  onRunRecommendation
}) => {
  if (!isOpen || !packageData) return null;

  const stats = getPackageRatingStats(packageData.package_id);
  const bookings = getBookingsForPackage(packageData.package_id);

  // Quick price prediction based on defaults
  const [selectedLeadTime, setSelectedLeadTime] = useState(14);
  const [selectedGroup, setSelectedGroup] = useState(2);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const prediction = predictTourPrice({
    package_id: packageData.package_id,
    group_size: selectedGroup,
    lead_time_days: selectedLeadTime,
    travel_season: packageData.season_tag
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image banner */}
        <div className="relative h-64 w-full shrink-0 bg-slate-800">
          <img
            src={packageData.imageUrl}
            alt={packageData.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 transition-all z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {packageData.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-300 border border-slate-700">
                  {packageData.season_tag}
                </span>
                {packageData.is_international ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> International
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700">
                    Domestic
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {packageData.destination}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">{packageData.title}</p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Base Price</div>
              <div className="text-2xl font-bold text-amber-400">
                ₹{packageData.base_price.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Dataset Attributes Matrix */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Package Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Duration
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {packageData.duration_days} Days / {packageData.duration_days - 1} Nights
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Group Size
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {packageData.group_size_range} Travelers
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Popularity
                </div>
                <div className="text-sm font-semibold text-amber-300 mt-1">
                  {packageData.destination_popularity}% Index
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Seasonality
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {packageData.season_tag}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Highlights */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview &amp; Experiences
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{packageData.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {packageData.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traveller Feedback / Ratings Breakdown */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Traveller Acclaim &amp; Ratings
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{stats.averageRating}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    out of 5.0 • {stats.totalRatings} verified reviews
                  </span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Trained from <span className="text-amber-400 font-medium">ratings.csv</span>
              </div>
            </div>

            {/* Rating distribution bars */}
            <div className="space-y-1.5 pt-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.breakdown[star] || 0;
                const pct = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-8 flex items-center gap-0.5 justify-end font-medium text-slate-300">
                      {star} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Intelligence Interactive Simulator */}
          <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  ML Price Estimate for Your Trip
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                XGBoost Regressor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  Lead Time: <span className="text-amber-300 font-semibold">{selectedLeadTime} days in advance</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={90}
                  value={selectedLeadTime}
                  onChange={(e) => setSelectedLeadTime(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Travelers: <span className="text-amber-300 font-semibold">{selectedGroup} people</span>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 4, 6, 8].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGroup(g)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selectedGroup === g
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price transformation row */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Base Catalog</div>
                <div className="text-sm font-semibold text-slate-300">
                  ₹{packageData.base_price.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-slate-600 font-bold">➔</span>
              <div>
                <div className="text-[10px] text-slate-400">Hist. Avg Paid</div>
                <div className="text-sm font-semibold text-slate-300">
                  ₹{prediction.historicalAvgPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-slate-600 font-bold">➔</span>
              <div>
                <div className="text-[10px] text-amber-400 font-semibold">Demand-Adjusted Est.</div>
                <div className="text-base font-bold text-amber-300">
                  ₹{prediction.demandAdjustedEstimate.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(packageData)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isCompared
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {isCompared ? 'In Compare List' : '+ Add to Compare'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAddToItinerary && (
              <button
                onClick={() => onAddToItinerary(packageData)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isInItinerary
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {isInItinerary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    In Itinerary
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                    Add to Trip Itinerary
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setBookingSuccess(true);
                setTimeout(() => setBookingSuccess(false), 3000);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {bookingSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  Reserved Successfully!
                </>
              ) : (
                <>
                  <Tag className="w-3.5 h-3.5" />
                  Lock In Rate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
