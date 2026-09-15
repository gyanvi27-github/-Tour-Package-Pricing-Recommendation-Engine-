import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plane,
  Train,
  Car,
  Sparkles,
  ChevronRight,
  Share2,
  Download,
  CheckCircle2,
  FileText,
  DollarSign,
  Compass,
  AlertCircle,
  X,
  Search,
  Printer,
  CloudSun
} from 'lucide-react';
import { TourPackage, TripItinerary, ItineraryItem, UserProfile } from '../types';
import { PACKAGES_DATA } from '../data/packagesData';
import { predictTourPrice } from '../lib/mlEngine';
import { WeatherInsightWidget } from './WeatherInsightWidget';
import { exportItineraryToPDF } from '../lib/pdfExport';

interface TripTimelineProps {
  itinerary: TripItinerary;
  onUpdateItinerary: (updated: TripItinerary) => void;
  onSelectPackage: (pkg: TourPackage) => void;
  currentUser: UserProfile;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  itinerary,
  onUpdateItinerary,
  onSelectPackage,
  currentUser
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tripTitle, setTripTitle] = useState(itinerary.tripTitle);
  const [departureDate, setDepartureDate] = useState(itinerary.departureDate);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'summary'>('timeline');

  // Calculate Total Stats
  const totalDays = itinerary.items.reduce((sum, item) => sum + item.durationDays, 0);
  const totalBasePrice = itinerary.items.reduce((sum, item) => sum + item.package.base_price, 0);
  
  const totalEstimatedPrice = itinerary.items.reduce((sum, item) => {
    const pred = predictTourPrice({
      package_id: item.package.package_id,
      group_size: 2,
      lead_time_days: 30,
      travel_season: item.package.season_tag
    });
    return sum + pred.demandAdjustedEstimate;
  }, 0);

  // Helper to re-index day numbers and dates sequentially
  const recalculateSequence = (items: ItineraryItem[], baseDate: string): ItineraryItem[] => {
    let currentDay = 1;
    let currentDate = new Date(baseDate);

    return items.map((item, index) => {
      const startDay = currentDay;
      const formattedStartDate = currentDate.toISOString().split('T')[0];

      // Advance date by item's duration
      currentDate = new Date(currentDate.getTime() + item.durationDays * 24 * 60 * 60 * 1000);
      currentDay += item.durationDays;

      const transitTypes: ('Flight' | 'High-Speed Rail' | 'Scenic Coach' | 'Private Transfer')[] = [
        'Flight',
        'Scenic Coach',
        'High-Speed Rail',
        'Private Transfer'
      ];

      return {
        ...item,
        dayStart: startDay,
        startDate: formattedStartDate,
        transitInfo: index > 0 ? {
          type: transitTypes[(index - 1) % transitTypes.length],
          duration: `${2 + (index % 3)}h ${(index * 15) % 60}m`,
          detail: `Direct inter-city connection from ${items[index - 1].package.destination} to ${item.package.destination}`
        } : undefined
      };
    });
  };

  // Add a package to the itinerary
  const handleAddPackage = (pkg: TourPackage) => {
    const newItem: ItineraryItem = {
      id: `itin-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      package_id: pkg.package_id,
      package: pkg,
      dayStart: totalDays + 1,
      durationDays: pkg.duration_days,
      startDate: itinerary.departureDate,
      notes: `Custom travel stop at ${pkg.destination}. Pack essentials for ${pkg.category.toLowerCase()} activities.`,
      customActivities: [...pkg.highlights]
    };

    const newItems = recalculateSequence([...itinerary.items, newItem], departureDate);
    onUpdateItinerary({
      ...itinerary,
      items: newItems
    });
    setIsAddModalOpen(false);
  };

  // Remove package
  const handleRemoveItem = (id: string) => {
    const remaining = itinerary.items.filter((item) => item.id !== id);
    const updated = recalculateSequence(remaining, departureDate);
    onUpdateItinerary({
      ...itinerary,
      items: updated
    });
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...itinerary.items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    onUpdateItinerary({
      ...itinerary,
      items: recalculateSequence(newItems, departureDate)
    });
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === itinerary.items.length - 1) return;
    const newItems = [...itinerary.items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    onUpdateItinerary({
      ...itinerary,
      items: recalculateSequence(newItems, departureDate)
    });
  };

  // Update notes
  const handleUpdateNotes = (id: string, notes: string) => {
    const newItems = itinerary.items.map((item) =>
      item.id === id ? { ...item, notes } : item
    );
    onUpdateItinerary({
      ...itinerary,
      items: newItems
    });
  };

  // Update departure date
  const handleDepartureDateChange = (newDate: string) => {
    setDepartureDate(newDate);
    onUpdateItinerary({
      ...itinerary,
      departureDate: newDate,
      items: recalculateSequence(itinerary.items, newDate)
    });
  };

  // Save Title
  const handleSaveTitle = () => {
    setEditingTitle(false);
    onUpdateItinerary({
      ...itinerary,
      tripTitle: tripTitle.trim() || 'My Multi-Day Journey'
    });
  };

  // Export PDF Handler
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      exportItineraryToPDF(itinerary, currentUser);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
      setShowExportModal(false);
    }
  };

  // Curated Preset Loader
  const loadCuratedPreset = (type: 'coastAndPeaks' | 'grandHeritage') => {
    const pkg1 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-001') || PACKAGES_DATA[0]; // Goa
    const pkg2 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-002') || PACKAGES_DATA[1]; // Manali
    const pkg3 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-004') || PACKAGES_DATA[3]; // Bali

    const selected = type === 'coastAndPeaks' ? [pkg1, pkg2] : [pkg1, pkg2, pkg3];
    const items: ItineraryItem[] = selected.map((pkg, i) => ({
      id: `itin-preset-${i}`,
      package_id: pkg.package_id,
      package: pkg,
      dayStart: 1,
      durationDays: pkg.duration_days,
      startDate: departureDate,
      notes: `Curated stop at ${pkg.destination}. Verified seasonal match for ${currentUser.name}.`,
      customActivities: [...pkg.highlights]
    }));

    onUpdateItinerary({
      ...itinerary,
      tripTitle: type === 'coastAndPeaks' ? 'Coast to Himalayas Odyssey' : 'Grand Indo-Pacific Circuit',
      items: recalculateSequence(items, departureDate)
    });
  };

  // Filter available packages for modal
  const availablePackages = PACKAGES_DATA.filter((pkg) => {
    if (categoryFilter !== 'All' && pkg.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pkg.destination.toLowerCase().includes(q) ||
        pkg.title.toLowerCase().includes(q) ||
        pkg.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header with Editable Title & Meta Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#091527]/90 border border-cyan-500/20 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Day Itinerary &amp; Climate Intelligence</span>
            </div>

            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="text-2xl sm:text-3xl font-extrabold text-white bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  autoFocus
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight cursor-pointer hover:text-cyan-300 transition-colors group flex items-center gap-2"
                  title="Click to rename trip"
                >
                  <span>{itinerary.tripTitle}</span>
                  <span className="text-xs text-slate-500 group-hover:text-cyan-400 font-normal">
                    (Edit)
                  </span>
                </h2>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-400">
              Personalized multi-destination journey crafted for <strong className="text-slate-200">{currentUser.name}</strong>
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tour Package</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#0d1c33] hover:bg-[#152744] text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* 2. Key Itinerary Statistics Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Total Duration
            </div>
            <div className="text-2xl font-extrabold text-white">
              {totalDays} <span className="text-sm font-normal text-slate-400">Days</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {itinerary.items.length} destination stops
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Departure Date
            </div>
            <div className="relative">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => handleDepartureDateChange(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="text-[10px] text-slate-500">Sequential sync</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Base Price
            </div>
            <div className="text-2xl font-extrabold text-white">
              ₹{totalBasePrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500">Fixed catalog cost</div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
            <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Est. Demand Tariff
            </div>
            <div className="text-2xl font-extrabold text-cyan-300">
              ₹{totalEstimatedPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-cyan-400/70">
              Machine learning forecast
            </div>
          </div>
        </div>
      </div>

      {/* 3. Empty State or Active Timeline */}
      {itinerary.items.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#091527]/70 border border-cyan-500/20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Your Itinerary is Currently Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start building a customized multi-day vacation timeline with climate intelligence, or load one of our expertly curated itineraries.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Browse &amp; Add Tour Packages</span>
            </button>

            <button
              onClick={() => loadCuratedPreset('coastAndPeaks')}
              className="px-4 py-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load 'Coast &amp; Himalayas' (8 Days)</span>
            </button>

            <button
              onClick={() => loadCuratedPreset('grandHeritage')}
              className="px-4 py-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load 'Indo-Pacific Odyssey' (14 Days)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timeline View Track */}
          <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-blue-500 before:to-slate-800">
            {itinerary.items.map((item, index) => {
              const endDay = item.dayStart + item.durationDays - 1;

              return (
                <div key={item.id} className="relative space-y-6">
                  {/* Transit Card Between Stops */}
                  {item.transitInfo && (
                    <div className="relative my-2">
                      <div className="absolute -left-6 sm:-left-10 top-1/2 -translate-y-1/2 w-6 sm:w-10 flex justify-center">
                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-md">
                          <Plane className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-blue-500/20 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-300">
                            {item.transitInfo.type}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">{item.transitInfo.detail}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Est. Duration: {item.transitInfo.duration}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Day Node Marker on Vertical Line */}
                  <div className="absolute -left-6 sm:-left-10 top-6 -translate-y-1/2 w-6 sm:w-10 flex justify-center">
                    <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center shadow-lg shadow-cyan-500/40 border-2 border-slate-950">
                      {index + 1}
                    </div>
                  </div>

                  {/* Stop Container Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#091527]/95 border border-cyan-500/20 shadow-xl space-y-5 hover:border-cyan-500/40 transition-all">
                    {/* Top Row: Date Pill + Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          DAY {item.dayStart < 10 ? `0${item.dayStart}` : item.dayStart} – DAY {endDay < 10 ? `0${endDay}` : endDay}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          ({item.durationDays} Days • Starts {item.startDate})
                        </span>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Earlier in Journey"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === itinerary.items.length - 1}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Later in Journey"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove Stop from Itinerary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Destination Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* Destination Image */}
                      <div className="md:col-span-4 relative h-44 rounded-2xl overflow-hidden bg-slate-800">
                        <img
                          src={item.package.imageUrl}
                          alt={item.package.destination}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                          <span className="text-white font-bold text-sm">
                            {item.package.destination}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                            {item.package.category}
                          </span>
                        </div>
                      </div>

                      {/* Package Details & Highlights */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-white tracking-tight">
                              {item.package.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {item.package.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="text-base font-extrabold text-white">
                              ₹{item.package.base_price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-500">Base Catalog</div>
                          </div>
                        </div>

                        {/* Activities Checklist */}
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Planned Excursions &amp; Highlights:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {item.package.highlights.map((h, hIdx) => (
                              <div
                                key={hIdx}
                                className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span className="truncate">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* User Notes Input */}
                        <div className="pt-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Personal Traveler Notes for this Stop:
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                            placeholder="e.g. Schedule museum pass, pack trekking gear..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        {/* Details CTA */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => onSelectPackage(item.package)}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Package Intelligence &amp; Prices</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Weather Insight Widget */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <WeatherInsightWidget
                        destination={item.package.destination}
                        seasonTag={item.package.season_tag}
                        scheduledDate={item.startDate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Next Stop Footer Banner */}
          <div className="p-4 rounded-2xl bg-[#091527]/50 border border-dashed border-cyan-500/30 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                +
              </div>
              <div className="text-xs text-slate-400">
                Want to expand your journey? Add another destination or national park.
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0d1c33] hover:bg-[#152744] text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Another Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Add Package Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-[#091527] border border-cyan-500/30 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Add Tour Package to Itinerary</h3>
                <p className="text-xs text-slate-400">
                  Select from 60 verified tour destinations to insert into your multi-day timeline
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar inside Modal */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search destination, e.g. Kashmir, Bali, Goa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="All">All Categories</option>
                {['Beach', 'Adventure', 'Cultural', 'Honeymoon', 'Leisure', 'Pilgrimage', 'Wildlife'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Packages List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.package_id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.destination}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{pkg.destination}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-cyan-300 border border-slate-800">
                          {pkg.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{pkg.title}</p>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pkg.duration_days} Days • Season: {pkg.season_tag}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        ₹{pkg.base_price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">Base Catalog</div>
                    </div>

                    <button
                      onClick={() => handleAddPackage(pkg)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Export / PDF Download Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#091527] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Export Itinerary &amp; Climate Plan</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/20 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">TRIP MANIFEST:</span>
                <span className="text-cyan-300 font-bold">{itinerary.tripTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TRAVELER:</span>
                <span className="text-slate-200">{currentUser.name} ({currentUser.user_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">START DATE:</span>
                <span className="text-slate-200">{departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DURATION:</span>
                <span className="text-slate-200">{totalDays} Days ({itinerary.items.length} Stops)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STOPS:</span>
                <span className="text-cyan-400">
                  {itinerary.items.map((it) => it.package.destination).join(' ➔ ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CLIMATE ADVISORY:</span>
                <span className="text-emerald-400">Full Weather Insights Included</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                <span className="text-slate-300">ESTIMATED TOTAL:</span>
                <span className="text-cyan-300">₹{totalEstimatedPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF (.pdf)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

