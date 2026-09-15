import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  BookOpen,
  Users,
  Star,
  Filter,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Category, SeasonTag } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';
import { BOOKINGS_DATA } from '../data/bookingsData';
import { RATINGS_DATA } from '../data/ratingsData';
import { USERS_DATA } from '../data/usersData';

export const AnalyticsView: React.FC = () => {
  // Global Analytics Filter Bar State
  const [dateRange, setDateRange] = useState<string>('12m');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All');
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('All');

  // Filtered Bookings based on global bar
  const filteredBookings = useMemo(() => {
    return BOOKINGS_DATA.filter((b) => {
      const pkg = PACKAGES_DATA.find((p) => p.package_id === b.package_id);
      if (!pkg) return false;

      if (selectedDestination !== 'All' && pkg.destination !== selectedDestination) return false;
      if (selectedCategory !== 'All' && pkg.category !== selectedCategory) return false;
      if (selectedSeason !== 'All' && pkg.season_tag !== selectedSeason) return false;
      if (selectedTerritory === 'Domestic' && pkg.is_international) return false;
      if (selectedTerritory === 'International' && !pkg.is_international) return false;
      if (selectedGroupSize !== 'All' && b.group_size.toString() !== selectedGroupSize) return false;

      return true;
    });
  }, [selectedDestination, selectedCategory, selectedSeason, selectedTerritory, selectedGroupSize]);

  // Chart 1: Monthly Booking Trends
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    filteredBookings.forEach((b) => {
      const m = new Date(b.travel_date).getMonth();
      counts[m] += 1;
    });

    return months.map((name, i) => ({ month: name, count: counts[i] }));
  }, [filteredBookings]);

  // Chart 2: Destination Popularity Leaderboard (Top 5)
  const topDestinations = useMemo(() => {
    const destMap = new Map<string, { popularity: number; count: number }>();
    PACKAGES_DATA.forEach((p) => {
      if (!destMap.has(p.destination)) {
        destMap.set(p.destination, {
          popularity: p.destination_popularity,
          count: 0
        });
      }
    });

    filteredBookings.forEach((b) => {
      const pkg = PACKAGES_DATA.find((p) => p.package_id === b.package_id);
      if (pkg && destMap.has(pkg.destination)) {
        destMap.get(pkg.destination)!.count += 1;
      }
    });

    return Array.from(destMap.entries())
      .map(([destination, data]) => ({ destination, ...data }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);
  }, [filteredBookings]);

  // Chart 3: Category Distribution
  const categoryStats = useMemo(() => {
    const counts: { [k in Category]?: number } = {};
    filteredBookings.forEach((b) => {
      const pkg = PACKAGES_DATA.find((p) => p.package_id === b.package_id);
      if (pkg) {
        counts[pkg.category] = (counts[pkg.category] || 0) + 1;
      }
    });

    const total = filteredBookings.length || 1;
    const catList: { category: Category; count: number; pct: number; color: string }[] = [
      { category: 'Beach', count: counts['Beach'] || 0, pct: Math.round(((counts['Beach'] || 0) / total) * 100), color: '#06b6d4' },
      { category: 'Adventure', count: counts['Adventure'] || 0, pct: Math.round(((counts['Adventure'] || 0) / total) * 100), color: '#3b82f6' },
      { category: 'Cultural', count: counts['Cultural'] || 0, pct: Math.round(((counts['Cultural'] || 0) / total) * 100), color: '#8b5cf6' },
      { category: 'Honeymoon', count: counts['Honeymoon'] || 0, pct: Math.round(((counts['Honeymoon'] || 0) / total) * 100), color: '#ec4899' },
      { category: 'Leisure', count: counts['Leisure'] || 0, pct: Math.round(((counts['Leisure'] || 0) / total) * 100), color: '#10b981' },
      { category: 'Wildlife', count: counts['Wildlife'] || 0, pct: Math.round(((counts['Wildlife'] || 0) / total) * 100), color: '#f59e0b' },
      { category: 'Pilgrimage', count: counts['Pilgrimage'] || 0, pct: Math.round(((counts['Pilgrimage'] || 0) / total) * 100), color: '#6366f1' }
    ];

    return catList.sort((a, b) => b.count - a.count);
  }, [filteredBookings]);

  // Chart 4: Seasonality Distribution
  const seasonalityStats = useMemo(() => {
    const seasons: SeasonTag[] = ['Winter', 'Summer', 'Peak-Winter', 'Monsoon', 'All-Season', 'Off-Season'];
    const counts: { [k in SeasonTag]?: number } = {};

    filteredBookings.forEach((b) => {
      const pkg = PACKAGES_DATA.find((p) => p.package_id === b.package_id);
      if (pkg) {
        counts[pkg.season_tag] = (counts[pkg.season_tag] || 0) + 1;
      }
    });

    return seasons.map((s) => ({
      season: s,
      count: counts[s] || 0
    }));
  }, [filteredBookings]);

  // SVG parameters for trend chart
  const maxTrend = Math.max(...monthlyTrends.map((d) => d.count), 10);
  const trendPoints = monthlyTrends.map((d, i) => {
    const x = (i / (monthlyTrends.length - 1)) * 480 + 20;
    const y = 140 - (d.count / maxTrend) * 100;
    return `${x},${y}`;
  }).join(' ');

  const resetFilters = () => {
    setDateRange('12m');
    setSelectedDestination('All');
    setSelectedCategory('All');
    setSelectedSeason('All');
    setSelectedTerritory('All');
    setSelectedGroupSize('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cross-Dataset Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Data Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore insights from 4,000 bookings, 60 packages, 400 users and 2,500 ratings.
        </p>
      </div>

      {/* Top KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">4,000</div>
            <div className="text-xs text-slate-400">Total Bookings</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">60</div>
            <div className="text-xs text-slate-400">Curated Packages</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">400</div>
            <div className="text-xs text-slate-400">Active Profiles</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">2,500</div>
            <div className="text-xs text-slate-400">Verified Ratings</div>
          </div>
        </div>
      </div>

      {/* Global Filter Bar (matching Panel 6) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Global Filter Bar</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Destination */}
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Destinations</option>
            {Array.from(new Set(PACKAGES_DATA.map((p) => p.destination))).slice(0, 10).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>
            {['Beach', 'Adventure', 'Cultural', 'Honeymoon', 'Leisure', 'Pilgrimage', 'Wildlife'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Season */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Seasons</option>
            {['Winter', 'Summer', 'Peak-Winter', 'Monsoon', 'All-Season', 'Off-Season'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Territory */}
          <select
            value={selectedTerritory}
            onChange={(e) => setSelectedTerritory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Regions</option>
            <option value="Domestic">Domestic</option>
            <option value="International">International</option>
          </select>

          <button
            onClick={resetFilters}
            className="p-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Chart Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Booking Trends (Line chart) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Booking Trends</h3>
              <p className="text-xs text-slate-400">Monthly booking volumes over the past 12 months</p>
            </div>
          </div>

          <div className="w-full h-48">
            <svg viewBox="0 0 520 160" className="w-full h-full">
              <defs>
                <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="20" y1="90" x2="500" y2="90" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="20" y1="140" x2="500" y2="140" stroke="#1e293b" />

              {/* Area */}
              <polygon
                points={`20,140 ${trendPoints} 500,140`}
                fill="url(#trendGrad)"
              />

              {/* Polyline */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={trendPoints}
              />

              {/* Markers & Labels */}
              {monthlyTrends.map((d, i) => {
                const x = (i / (monthlyTrends.length - 1)) * 480 + 20;
                const y = 140 - (d.count / maxTrend) * 100;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="3" fill="#38bdf8" />
                    <text x={x} y="154" fontSize="8" fill="#94a3b8" textAnchor="middle">
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 2: Destination Popularity Leaderboard */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Destination Popularity</h3>
            <p className="text-xs text-slate-400">Ranked by historical customer preference index</p>
          </div>

          <div className="space-y-3 pt-2">
            {topDestinations.map((d, idx) => (
              <div key={d.destination} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="text-[10px] text-cyan-400 font-mono">0{idx + 1}</span>
                    {d.destination}
                  </span>
                  <span className="font-bold text-cyan-300">{d.popularity}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${d.popularity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Category Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Category Distribution</h3>
            <p className="text-xs text-slate-400">Share of booking demand across travel segments</p>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Donut representation */}
            <div className="flex justify-center">
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="16" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="16"
                  strokeDasharray="80 200"
                  strokeDashoffset="0"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="16"
                  strokeDasharray="56 200"
                  strokeDashoffset="-80"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="16"
                  strokeDasharray="42 200"
                  strokeDashoffset="-136"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs">
              {categoryStats.map((c) => (
                <div key={c.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-300">{c.category}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Seasonality Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Seasonality</h3>
            <p className="text-xs text-slate-400">Total departure volumes clustered by climate tag</p>
          </div>

          <div className="grid grid-cols-6 gap-2 items-end h-44 pt-4">
            {seasonalityStats.map((s) => {
              const maxS = Math.max(...seasonalityStats.map((item) => item.count), 1);
              const heightPct = Math.max(15, (s.count / maxS) * 100);
              return (
                <div key={s.season} className="flex flex-col items-center h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-500 hover:brightness-125"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {s.season}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
