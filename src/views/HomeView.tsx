import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  TrendingUp,
  Package,
  BookOpen,
  Users,
  Star,
  ShieldCheck,
  Zap,
  MapPin,
  Calendar
} from 'lucide-react';
import { ActivePage, TourPackage } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';
import { HeroVisual } from '../components/HeroVisual';
import { PackageCard } from '../components/PackageCard';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  onSelectPackage: (pkg: TourPackage) => void;
  onToggleCompare: (pkg: TourPackage) => void;
  comparedPackageIds: string[];
  onAddToItinerary?: (pkg: TourPackage) => void;
  itineraryPackageIds?: string[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActivePage,
  onSelectPackage,
  onToggleCompare,
  comparedPackageIds,
  onAddToItinerary,
  itineraryPackageIds = []
}) => {
  const goaPkg = PACKAGES_DATA.find((p) => p.package_id === 'PKG-001') || PACKAGES_DATA[0];
  const baliPkg = PACKAGES_DATA.find((p) => p.package_id === 'PKG-004') || PACKAGES_DATA[3];
  const featuredPackages = PACKAGES_DATA.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Area */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Travel Intelligence • XGBoost Engine</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Travel smarter.{' '}
                  <span className="text-gradient-cyan block mt-1">
                    Choose better.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal pt-2">
                  Discover tour packages matched to your preferences, build multi-day timeline itineraries with climate insights, and understand how demand shifts pricing.
                </p>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center gap-3.5 pt-2 flex-wrap">
                <button
                  onClick={() => setActivePage('recommendations')}
                  className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Find My Perfect Tour</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActivePage('planner')}
                  className="px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm bg-[#0d1c33] hover:bg-[#152744] text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Build Trip Timeline</span>
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Verified Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Demand Pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Trip Planner</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Area */}
            <div className="lg:col-span-6">
              <HeroVisual
                onSelectPackage={onSelectPackage}
                goaPkg={goaPkg}
                baliPkg={baliPkg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Insight Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-3xl bg-[#091527]/80 border border-cyan-500/20 shadow-xl backdrop-blur-md">
          {/* 60 Tour Packages */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">60</div>
              <div className="text-xs text-slate-400 font-medium">Tour Packages</div>
            </div>
          </div>

          {/* 4,000+ Bookings */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">4,000+</div>
              <div className="text-xs text-slate-400 font-medium">Verified Bookings</div>
            </div>
          </div>

          {/* 400 Travel Profiles */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">400</div>
              <div className="text-xs text-slate-400 font-medium">Travel Profiles</div>
            </div>
          </div>

          {/* 2,500 Ratings */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">2,500</div>
              <div className="text-xs text-slate-400 font-medium">Traveller Ratings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destination Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Handpicked Collections
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Top Trending Travel Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curated by historical demand, traveler acclaim, and optimal seasonal timings
            </p>
          </div>

          <button
            onClick={() => setActivePage('discover')}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>View All 60 Packages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPackages.map((pkg) => (
            <PackageCard
              key={pkg.package_id}
              packageData={pkg}
              onSelect={onSelectPackage}
              onToggleCompare={onToggleCompare}
              isCompared={comparedPackageIds.includes(pkg.package_id)}
              onAddToItinerary={onAddToItinerary}
              isInItinerary={itineraryPackageIds.includes(pkg.package_id)}
            />
          ))}
        </div>
      </section>

      {/* Interactive Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Trip Planner & Timeline */}
          <div
            onClick={() => setActivePage('planner')}
            className="p-6 rounded-3xl bg-[#091527]/90 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
              Multi-Day Trip Planner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build sequential custom multi-city itineraries, customize stay durations, and review climate &amp; weather insights.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400">
              <span>Open itinerary builder</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Price Intelligence */}
          <div
            onClick={() => setActivePage('pricing')}
            className="p-6 rounded-3xl bg-[#091527]/90 border border-cyan-500/20 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors">
              Demand-Adjusted Pricing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              See how booking lead times, group volume, and high-season trends shift baseline package prices in real time.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400">
              <span>Explore price curves</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: AI Match Engine */}
          <div
            onClick={() => setActivePage('recommendations')}
            className="p-6 rounded-3xl bg-[#091527]/90 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer shadow-xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
              Personalized Matching
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-criteria algorithms pair you with packages matching your travel categories, group size, and custom budget.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400">
              <span>Find top matches</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
