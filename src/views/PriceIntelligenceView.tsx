import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Users,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { TourPackage, SeasonTag } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';
import { BOOKINGS_DATA, getBookingsForPackage } from '../data/bookingsData';
import { predictTourPrice, predictTourPriceLive } from '../lib/mlEngine';
import type { PricePredictionResult } from '../types';

export const PriceIntelligenceView: React.FC = () => {
  // Simulator State
  const [selectedPkgId, setSelectedPkgId] = useState<string>('PKG-001'); // Goa default
  const [groupSize, setGroupSize] = useState<number>(4);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [season, setSeason] = useState<SeasonTag>('Winter');

  const selectedPkg = useMemo(
    () => PACKAGES_DATA.find((p) => p.package_id === selectedPkgId) || PACKAGES_DATA[0],
    [selectedPkgId]
  );

  // Local simulated prediction — shown instantly while the real model call
  // is in flight, and used as a fallback if the Python backend is down.
  const simulatedPrediction = useMemo(() => {
    return predictTourPrice({
      package_id: selectedPkg.package_id,
      group_size: groupSize,
      lead_time_days: leadTimeDays,
      travel_season: season
    });
  }, [selectedPkg, groupSize, leadTimeDays, season]);

  // Real prediction from the trained XGBoost model served by ml_server.py.
  const [prediction, setPrediction] = useState<PricePredictionResult>(simulatedPrediction);
  const [isLivePricing, setIsLivePricing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLivePricing(false);

    predictTourPriceLive({
      package_id: selectedPkg.package_id,
      group_size: groupSize,
      lead_time_days: leadTimeDays,
      travel_season: season
    }).then((result) => {
      if (cancelled) return;
      setPrediction(result);
      // confidenceScore is set to 97.0 by predictTourPriceLive only on a
      // successful real-model call — use it to flag "live" vs "simulated".
      setIsLivePricing(result.confidenceScore === 97.0);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedPkg, groupSize, leadTimeDays, season]);

  // Chart 1: Price Over Time (Monthly average of historical bookings)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Filter bookings for this package or category
    const relevant = BOOKINGS_DATA.filter((b) => b.package_id === selectedPkg.package_id);
    const groups: { [month: string]: { sum: number; count: number } } = {};

    months.forEach((m) => {
      groups[m] = { sum: 0, count: 0 };
    });

    relevant.forEach((b) => {
      const mIdx = new Date(b.travel_date).getMonth();
      const mName = months[mIdx];
      groups[mName].sum += b.final_price_paid;
      groups[mName].count += 1;
    });

    return months.map((m) => {
      const avg = groups[m].count > 0 ? Math.round(groups[m].sum / groups[m].count) : selectedPkg.base_price;
      return { month: m, avgPrice: avg };
    });
  }, [selectedPkg]);

  // Chart 2: Lead Time vs Final Price Scatter Samples
  const leadTimeScatter = useMemo(() => {
    const pkgBookings = BOOKINGS_DATA.filter((b) => b.package_id === selectedPkg.package_id).slice(0, 50);
    return pkgBookings.map((b) => ({
      leadTime: b.lead_time_days,
      price: b.final_price_paid
    }));
  }, [selectedPkg]);

  // Chart 3: Group Size Distribution
  const groupSizeAverages = useMemo(() => {
    const sizes = [1, 2, 4, 6, 8, 10];
    return sizes.map((s) => {
      const pred = predictTourPrice({
        package_id: selectedPkg.package_id,
        group_size: s,
        lead_time_days: leadTimeDays,
        travel_season: season
      });
      return { groupSize: s, price: pred.demandAdjustedEstimate };
    });
  }, [selectedPkg, leadTimeDays, season]);

  // Compute SVG coordinates for Price Over Time
  const maxPrice = Math.max(...monthlyData.map((d) => d.avgPrice), selectedPkg.base_price * 1.5);
  const minPrice = Math.min(...monthlyData.map((d) => d.avgPrice), selectedPkg.base_price * 0.8);
  const chartHeight = 160;
  const chartWidth = 520;

  const points = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((d.avgPrice - minPrice) / (maxPrice - minPrice || 1)) * (chartHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dynamic Pricing Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Price Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Understand how demand, lead time, seasonality and group size influence final booking prices.
        </p>
      </div>

      {/* Hero Visual Flow: Base Price -> Historical Paid -> Demand-Adjusted Estimate */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Node 1: Base Price */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Base Price
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ₹{prediction.basePrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">Fixed catalog starting rate</p>
          </div>

          {/* Node 2: Historical Paid Price */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 relative">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Historical Paid Price
            </div>
            <div className="text-3xl font-extrabold text-slate-200 tracking-tight">
              ₹{prediction.historicalAvgPrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">Average of 4,000 bookings</p>
          </div>

          {/* Node 3: Demand-Adjusted Estimate (Highlighted) */}
          <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 space-y-1 shadow-lg shadow-cyan-950/30">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                Demand-Adjusted Estimate
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950">
                {prediction.differencePct > 0 ? `+${prediction.differencePct}%` : `${prediction.differencePct}%`}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-cyan-400 tracking-tight">
              ₹{prediction.demandAdjustedEstimate.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-cyan-300/80">
              {prediction.differenceAmount >= 0 ? `+₹${prediction.differenceAmount.toLocaleString('en-IN')} surge` : `-₹${Math.abs(prediction.differenceAmount).toLocaleString('en-IN')} savings`}
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Package Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Select Package
          </label>
          <select
            value={selectedPkgId}
            onChange={(e) => setSelectedPkgId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            {PACKAGES_DATA.map((pkg) => (
              <option key={pkg.package_id} value={pkg.package_id}>
                {pkg.destination} ({pkg.category} • ₹{pkg.base_price})
              </option>
            ))}
          </select>
        </div>

        {/* Lead Time Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-400">Booking Lead Time</span>
            <span className="text-cyan-400 font-bold">{leadTimeDays} days</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(Number(e.target.value))}
            className="w-full accent-cyan-400 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Last-minute (1d)</span>
            <span>Advance (100d)</span>
          </div>
        </div>

        {/* Group Size Buttons */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Group Size ({groupSize} travelers)
          </label>
          <div className="flex gap-1">
            {[1, 2, 4, 6, 8, 10].map((s) => (
              <button
                key={s}
                onClick={() => setGroupSize(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  groupSize === s
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Season Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Travel Season
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as SeasonTag)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="Winter">Winter</option>
            <option value="Summer">Summer</option>
            <option value="Monsoon">Monsoon</option>
            <option value="Peak-Winter">Peak-Winter</option>
            <option value="All-Season">All-Season</option>
            <option value="Off-Season">Off-Season</option>
          </select>
        </div>
      </div>

      {/* Influencing Factor Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Model Factor Attribution for this Prediction
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {prediction.influencingFactors.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{f.factor}</span>
                <span className="font-bold text-cyan-400">{f.impact}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Price Over Time (Line Chart) */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Price over time</h3>
              <p className="text-xs text-slate-400">
                Final paid prices recorded across 12-month travel departures for {selectedPkg.destination}
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Destination: <span className="text-cyan-400 font-semibold">{selectedPkg.destination}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 sm:h-56">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((pct, i) => (
                <line
                  key={i}
                  x1="20"
                  y1={chartHeight * pct}
                  x2={chartWidth - 20}
                  y2={chartHeight * pct}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area Fill */}
              <polygon
                points={`20,${chartHeight - 20} ${points} ${chartWidth - 20},${chartHeight - 20}`}
                fill="url(#lineGrad)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                points={points}
              />

              {/* Points */}
              {monthlyData.map((d, i) => {
                const x = (i / (monthlyData.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - ((d.avgPrice - minPrice) / (maxPrice - minPrice || 1)) * (chartHeight - 40) - 20;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="3.5" fill="#06b6d4" />
                    <text x={x} y={chartHeight - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 2: Does booking earlier matter? (Scatter/Trend) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Does booking earlier matter?</h3>
            <p className="text-xs text-slate-400">
              Lead Time (Days) vs Final Price Paid (Showing surge window under 10 days)
            </p>
          </div>

          <div className="w-full h-48 relative">
            <svg viewBox="0 0 400 160" className="w-full h-full">
              {/* Axis */}
              <line x1="30" y1="130" x2="380" y2="130" stroke="#334155" />
              <line x1="30" y1="20" x2="30" y2="130" stroke="#334155" />

              {/* Scatter dots */}
              {leadTimeScatter.map((pt, i) => {
                const x = 30 + (pt.leadTime / 100) * 340;
                const y = 130 - ((pt.price - selectedPkg.base_price * 0.8) / (selectedPkg.base_price * 0.8)) * 100;
                return (
                  <circle
                    key={i}
                    cx={Math.min(370, Math.max(35, x))}
                    cy={Math.min(125, Math.max(25, y))}
                    r="3"
                    fill={pt.leadTime <= 10 ? '#f43f5e' : '#38bdf8'}
                    opacity="0.8"
                  />
                );
              })}

              {/* Trend curve */}
              <path
                d="M 35 35 Q 120 110, 360 105"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              <text x="30" y="148" fontSize="9" fill="#94a3b8">0d (Rush)</text>
              <text x="200" y="148" fontSize="9" fill="#94a3b8">50d</text>
              <text x="360" y="148" fontSize="9" fill="#94a3b8">100d (Advance)</text>
            </svg>
          </div>
        </div>

        {/* Chart 3: How group size affects pricing */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">How group size affects pricing</h3>
            <p className="text-xs text-slate-400">
              Per-person pricing scale efficiency as group size increases
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {groupSizeAverages.map((item) => {
              const maxVal = Math.max(...groupSizeAverages.map((g) => g.price));
              const pct = (item.price / maxVal) * 100;
              return (
                <div key={item.groupSize} className="flex items-center text-xs">
                  <span className="w-16 text-slate-400">{item.groupSize} Travelers</span>
                  <div className="flex-1 mx-3 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-slate-200">
                    ₹{item.price.toLocaleString('en-IN')}
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
