import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Calendar,
  Users,
  Check,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Category,
  SeasonTag,
  BudgetRange,
  UserProfile,
  TourPackage,
  RecommendationResultItem
} from '../types';
import { USERS_DATA } from '../data/usersData';
import { generateRecommendations } from '../lib/mlEngine';
import { PackageCard } from '../components/PackageCard';

interface RecommendationViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onSelectPackage: (pkg: TourPackage) => void;
  onToggleCompare: (pkg: TourPackage) => void;
  comparedPackageIds: string[];
  onAddToItinerary?: (pkg: TourPackage) => void;
  itineraryPackageIds?: string[];
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  currentUser,
  setCurrentUser,
  onSelectPackage,
  onToggleCompare,
  comparedPackageIds,
  onAddToItinerary,
  itineraryPackageIds = []
}) => {
  // Recommendation Form State
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(currentUser.preferred_categories);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange>(currentUser.budget_range);
  const [groupSize, setGroupSize] = useState<number>(2);

  // Dates & Lead Time
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTravelDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [travelDate, setTravelDate] = useState<string>(defaultTravelDate);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(45);

  const [selectedSeason, setSelectedSeason] = useState<SeasonTag>('Winter');
  const [isInternationalOnly, setIsInternationalOnly] = useState<boolean>(false);

  // Execution & Loading States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<RecommendationResultItem[] | null>(null);

  // Sync state when currentUser changes
  useEffect(() => {
    setSelectedCategories(currentUser.preferred_categories);
    setSelectedBudget(currentUser.budget_range);
  }, [currentUser]);

  // Recalculate lead time whenever dates change
  useEffect(() => {
    const bDate = new Date(bookingDate).getTime();
    const tDate = new Date(travelDate).getTime();
    const diffDays = Math.max(1, Math.round((tDate - bDate) / (1000 * 60 * 60 * 24)));
    setLeadTimeDays(diffDays);
  }, [bookingDate, travelDate]);

  const categoriesList: Category[] = [
    'Adventure',
    'Beach',
    'Cultural',
    'Honeymoon',
    'Leisure',
    'Pilgrimage',
    'Wildlife'
  ];

  const budgetOptions: BudgetRange[] = ['<10k', '10k–25k', '25k–50k', '50k–100k', '100k+'];

  const seasonOptions: SeasonTag[] = [
    'All-Season',
    'Summer',
    'Winter',
    'Monsoon',
    'Peak-Winter',
    'Off-Season'
  ];

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Run Recommendation Analysis Flow
  const handleGenerateRecommendations = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Multi-phase intelligence step animation
    setTimeout(() => setAnalysisStep(2), 350);
    setTimeout(() => setAnalysisStep(3), 700);
    setTimeout(() => setAnalysisStep(4), 1050);
    setTimeout(() => {
      const results = generateRecommendations({
        userId: currentUser.user_id,
        preferredCategories: selectedCategories,
        budgetRange: selectedBudget,
        groupSize,
        bookingDate,
        travelDate,
        leadTimeDays,
        season: selectedSeason,
        isInternationalOnly
      });
      setRecommendations(results);
      setIsAnalyzing(false);
    }, 1400);
  };

  const topMatch = recommendations ? recommendations[0] : null;
  const secondaryMatches = recommendations ? recommendations.slice(1, 5) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Area */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Multi-Factor Recommendation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {recommendations ? 'Your best matches' : 'Find your perfect tour'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          {recommendations
            ? 'Based on your preferences, timing and package characteristics evaluated across 60 destinations.'
            : 'Tell us what you’re looking for. We’ll match you with the most suitable packages using historical demand and satisfaction metrics.'}
        </p>
      </div>

      {/* 2. Form Mode (When recommendations not yet generated or resetting) */}
      {!recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Input Form */}
          <div className="lg:col-span-8 rounded-3xl bg-slate-900/85 border border-slate-800 p-6 sm:p-8 space-y-7 shadow-2xl backdrop-blur-md">
            {/* Step 1: User Profile Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  1
                </span>
                Your Profile
              </label>
              <select
                value={currentUser.user_id}
                onChange={(e) => {
                  const u = USERS_DATA.find((usr) => usr.user_id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-500"
              >
                {USERS_DATA.slice(0, 8).map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.preferred_categories.join(', ')} • {u.budget_range})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Travel Preferences (Multi-Select Pills) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  2
                </span>
                Travel Preferences (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-950/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Budget Range Segmented */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  3
                </span>
                Budget Range (Per Person)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {budgetOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      selectedBudget === b
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Group Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  4
                </span>
                Group Size
              </label>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[
                  { label: '2', val: 2 },
                  { label: '2–4', val: 3 },
                  { label: '4–6', val: 5 },
                  { label: '6–10', val: 8 },
                  { label: '10+', val: 12 }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setGroupSize(item.val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      groupSize === item.val
                        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Travel Timing (Booking Date & Travel Date) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                    5
                  </span>
                  Travel Timing
                </label>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                  Lead Time: {leadTimeDays} days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Booking Date</span>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Travel Date</span>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Season */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  6
                </span>
                Preferred Season
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {seasonOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSeason(s)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all truncate cursor-pointer ${
                      selectedSeason === s
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleGenerateRecommendations}
                disabled={isAnalyzing}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>{isAnalyzing ? 'Analyzing Travel Intelligence...' : 'Generate My Recommendations'}</span>
              </button>
            </div>
          </div>

          {/* Right Decorative Travel Compass Banner */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between items-center text-center space-y-6">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/20">
                <Compass className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Better recommendations through smarter data.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Our model doesn’t just match keywords — it evaluates historical booking tariffs, seasonal capacity, and verified traveller satisfaction to find genuine value.
              </p>
            </div>

            {/* Dataset Coverage Stats Mini Card */}
            <div className="w-full bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-left">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Model Inputs
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Available Packages:</span>
                <span className="text-white font-medium">60</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Trained Bookings:</span>
                <span className="text-cyan-400 font-medium">4,000+</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">User Ratings:</span>
                <span className="text-amber-400 font-medium">2,500</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Multi-Step Analysis Loading State Animation */}
      {isAnalyzing && (
        <div className="max-w-2xl mx-auto py-12 px-6 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Understanding your travel profile</h3>
            <p className="text-xs text-slate-400 mt-1">
              Executing multi-criteria XGBoost matching and ranking pipeline...
            </p>
          </div>

          {/* Steps checklist */}
          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
              analysisStep >= 1 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span>Analyzing travel profile &amp; preferred categories</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
              analysisStep >= 2 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span>Matching destination compatibility &amp; duration</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
              analysisStep >= 3 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span>Evaluating demand signals &amp; lead time curve</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
              analysisStep >= 4 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 4 ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span>Ranking packages by weighted composite match score</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Recommendation Results Screen (Panel 4 - The WOW Screen) */}
      {recommendations && topMatch && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Hero Recommendation Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl shadow-cyan-950/40 overflow-hidden backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Image Banner + Big Circular Match Ring */}
              <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[320px] bg-slate-800 overflow-hidden">
                <img
                  src={topMatch.package.imageUrl}
                  alt={topMatch.package.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Circular Ring Match Badge in top corner */}
                <div className="absolute top-4 right-4 flex items-center justify-center">
                  <div className="relative w-20 h-20 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-500/60 flex flex-col items-center justify-center shadow-xl">
                    <span className="text-xl font-extrabold text-cyan-300 leading-none">
                      {topMatch.matchScore}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Match
                    </span>
                  </div>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500 text-slate-950 uppercase tracking-wider">
                    Top Recommendation #1
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
                    {topMatch.package.destination} Escape
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      4.5 (320 ratings)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {topMatch.package.duration_days} Days
                    </span>
                    <span>•</span>
                    <span>{topMatch.package.category}</span>
                    <span>•</span>
                    <span>{topMatch.package.season_tag}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Reasoning & Breakdown Meters */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                {/* Why we recommend this */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Why we recommend this
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topMatch.whyWeRecommend.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800"
                      >
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation Breakdown Bar Meters */}
                <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Recommendation Breakdown
                  </h4>

                  <div className="space-y-2">
                    {[
                      { label: 'Category Match', val: topMatch.breakdown.categoryMatch },
                      { label: 'Budget Fit', val: topMatch.breakdown.budgetFit },
                      { label: 'Destination Popularity', val: topMatch.breakdown.destinationPopularity },
                      { label: 'Group Fit', val: topMatch.breakdown.groupFit }
                    ].map((meter) => (
                      <div key={meter.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 w-36">{meter.label}</span>
                        <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{ width: `${meter.val}%` }}
                          />
                        </div>
                        <span className="text-slate-200 font-semibold text-[11px] w-10 text-right">
                          {meter.val}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & Call to Action */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Listed Base Price
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">
                        ₹{topMatch.package.base_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-cyan-400 font-medium">
                        (Est. Demand: ₹{topMatch.predictedPrice.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRecommendations(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Adjust Inputs
                    </button>

                    <button
                      onClick={() => onSelectPackage(topMatch.package)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5"
                    >
                      <span>View Full Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Great Options (Ranked 2, 3, 4) */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Other great options</h3>
                <p className="text-xs text-slate-400">
                  Alternative recommendations meeting your travel preferences
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {secondaryMatches.map((item) => (
                <PackageCard
                  key={item.package.package_id}
                  packageData={item.package}
                  onSelect={onSelectPackage}
                  onToggleCompare={onToggleCompare}
                  isCompared={comparedPackageIds.includes(item.package.package_id)}
                  matchScore={item.matchScore}
                  onAddToItinerary={onAddToItinerary}
                  isInItinerary={itineraryPackageIds.includes(item.package.package_id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
