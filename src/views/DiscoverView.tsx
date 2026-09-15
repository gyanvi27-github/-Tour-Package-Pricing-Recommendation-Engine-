import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { TourPackage, Category, SeasonTag, BudgetRange } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';
import { getPackageRatingStats } from '../data/ratingsData';
import { PackageCard } from '../components/PackageCard';

interface DiscoverViewProps {
  onSelectPackage: (pkg: TourPackage) => void;
  onToggleCompare: (pkg: TourPackage) => void;
  comparedPackageIds: string[];
  onAddToItinerary?: (pkg: TourPackage) => void;
  itineraryPackageIds?: string[];
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onSelectPackage,
  onToggleCompare,
  comparedPackageIds,
  onAddToItinerary,
  itineraryPackageIds = []
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All'); // 'All' | 'Domestic' | 'International'
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories: (Category | 'All')[] = [
    'All',
    'Beach',
    'Adventure',
    'Cultural',
    'Honeymoon',
    'Leisure',
    'Pilgrimage',
    'Wildlife'
  ];

  const seasons: (SeasonTag | 'All')[] = [
    'All',
    'Winter',
    'Summer',
    'Monsoon',
    'Peak-Winter',
    'Off-Season',
    'All-Season'
  ];

  const budgetOptions = [
    { label: 'All Budgets', value: 'All' },
    { label: '< ₹10k', value: '<10k' },
    { label: '₹10k–25k', value: '10k–25k' },
    { label: '₹25k–50k', value: '25k–50k' },
    { label: '₹50k–100k', value: '50k–100k' },
    { label: '₹100k+', value: '100k+' }
  ];

  const durationOptions = [
    { label: 'All Durations', value: 'All' },
    { label: '1–3 Days', value: '1-3' },
    { label: '4–6 Days', value: '4-6' },
    { label: '7–10 Days', value: '7-10' }
  ];

  const groupSizeOptions = [
    { label: 'All Sizes', value: 'All' },
    { label: '2 Travelers', value: '2' },
    { label: '2–4 Travelers', value: '2–4' },
    { label: '4–6 Travelers', value: '4–6' },
    { label: '6–10 Travelers', value: '6–10' }
  ];

  // Filtering logic
  const filteredPackages = useMemo(() => {
    return PACKAGES_DATA.filter((pkg) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDest = pkg.destination.toLowerCase().includes(q);
        const matchesTitle = pkg.title.toLowerCase().includes(q);
        const matchesCat = pkg.category.toLowerCase().includes(q);
        if (!matchesDest && !matchesTitle && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== 'All' && pkg.category !== selectedCategory) {
        return false;
      }

      // Budget
      if (selectedBudget !== 'All') {
        const price = pkg.base_price;
        if (selectedBudget === '<10k' && price >= 10000) return false;
        if (selectedBudget === '10k–25k' && (price < 10000 || price > 25000)) return false;
        if (selectedBudget === '25k–50k' && (price < 25000 || price > 50000)) return false;
        if (selectedBudget === '50k–100k' && (price < 50000 || price > 100000)) return false;
        if (selectedBudget === '100k+' && price < 100000) return false;
      }

      // Duration
      if (selectedDuration !== 'All') {
        const days = pkg.duration_days;
        if (selectedDuration === '1-3' && (days < 1 || days > 3)) return false;
        if (selectedDuration === '4-6' && (days < 4 || days > 6)) return false;
        if (selectedDuration === '7-10' && (days < 7 || days > 10)) return false;
      }

      // Season
      if (selectedSeason !== 'All' && pkg.season_tag !== selectedSeason) {
        return false;
      }

      // Territory (Intl / Domestic)
      if (selectedTerritory === 'Domestic' && pkg.is_international) return false;
      if (selectedTerritory === 'International' && !pkg.is_international) return false;

      // Group size
      if (selectedGroupSize !== 'All' && pkg.group_size_range !== selectedGroupSize) {
        return false;
      }

      // Rating
      if (minRating > 0) {
        const stats = getPackageRatingStats(pkg.package_id);
        if (stats.averageRating < minRating) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedBudget,
    selectedDuration,
    selectedSeason,
    selectedTerritory,
    selectedGroupSize,
    minRating
  ]);

  // Sorting logic
  const sortedPackages = useMemo(() => {
    const list = [...filteredPackages];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.base_price - b.base_price);
      case 'price-desc':
        return list.sort((a, b) => b.base_price - a.base_price);
      case 'rating':
        return list.sort((a, b) => {
          const rA = getPackageRatingStats(a.package_id).averageRating;
          const rB = getPackageRatingStats(b.package_id).averageRating;
          return rB - rA;
        });
      case 'popularity':
        return list.sort((a, b) => b.destination_popularity - a.destination_popularity);
      case 'duration-asc':
        return list.sort((a, b) => a.duration_days - b.duration_days);
      case 'duration-desc':
        return list.sort((a, b) => b.duration_days - a.duration_days);
      case 'recommended':
      default:
        // Score based on blend of popularity and rating
        return list.sort((a, b) => {
          const rA = getPackageRatingStats(a.package_id).averageRating;
          const rB = getPackageRatingStats(b.package_id).averageRating;
          const scoreA = a.destination_popularity * 0.6 + (rA / 5) * 40;
          const scoreB = b.destination_popularity * 0.6 + (rB / 5) * 40;
          return scoreB - scoreA;
        });
    }
  }, [filteredPackages, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBudget('All');
    setSelectedDuration('All');
    setSelectedSeason('All');
    setSelectedTerritory('All');
    setSelectedGroupSize('All');
    setMinRating(0);
    setSortBy('recommended');
  };

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedBudget !== 'All' ? 1 : 0) +
    (selectedDuration !== 'All' ? 1 : 0) +
    (selectedSeason !== 'All' ? 1 : 0) +
    (selectedTerritory !== 'All' ? 1 : 0) +
    (selectedGroupSize !== 'All' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Explore your next journey
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {PACKAGES_DATA.length} Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified tour packages with transparent base pricing, traveler feedback, and popularity indices
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center gap-2 text-xs font-medium text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Filters ({activeFilterCount})</span>
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Filter Sidebar (Desktop or Mobile Accordion) */}
        <aside
          className={`lg:block ${
            isMobileFilterOpen ? 'block' : 'hidden'
          } bg-slate-900/90 rounded-2xl border border-slate-800/80 p-5 space-y-6 backdrop-blur-md sticky top-20`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Filter: Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Category
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Price Range */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Price Range
            </label>
            <div className="grid grid-cols-1 gap-1">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedBudget(opt.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedBudget === opt.value
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Duration */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs text-center transition-colors ${
                    selectedDuration === opt.value
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Season */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Season
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`px-2 py-1.5 rounded-lg text-xs text-center truncate transition-colors ${
                    selectedSeason === s
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: International / Domestic */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Territory
            </label>
            <div className="grid grid-cols-3 gap-1">
              {['All', 'Domestic', 'International'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTerritory(t)}
                  className={`py-1.5 rounded-lg text-xs font-medium text-center truncate transition-colors ${
                    selectedTerritory === t
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t === 'International' ? 'Intl' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Group Size */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Group Size
            </label>
            <div className="space-y-1">
              {groupSizeOptions.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGroupSize(g.value)}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedGroupSize === g.value
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Minimum Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 3.5, 4.0, 4.5].map((val) => (
                <button
                  key={val}
                  onClick={() => setMinRating(val)}
                  className={`py-1 rounded-lg text-xs font-medium text-center transition-colors ${
                    minRating === val
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  {val === 0 ? 'All' : `${val}★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Main Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Results Count + Sort Dropdown */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex-wrap gap-2">
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{sortedPackages.length}</span> of {PACKAGES_DATA.length} packages
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="recommended">Recommended</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Shortest First</option>
                <option value="duration-desc">Duration: Longest First</option>
              </select>
            </div>
          </div>

          {/* Packages Grid */}
          {sortedPackages.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No matching packages found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try loosening your filters or resetting your category and budget range.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedPackages.map((pkg) => (
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
          )}
        </div>
      </div>
    </div>
  );
};
