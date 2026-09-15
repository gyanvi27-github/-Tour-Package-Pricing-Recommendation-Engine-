import React from 'react';
import { Calendar, Compass, Sparkles, MapPin, Plus } from 'lucide-react';
import { TourPackage, TripItinerary, UserProfile } from '../types';
import { TripTimeline } from '../components/TripTimeline';
import { PACKAGES_DATA } from '../data/packagesData';
import { PackageCard } from '../components/PackageCard';

interface PlannerViewProps {
  itinerary: TripItinerary;
  onUpdateItinerary: (updated: TripItinerary) => void;
  onSelectPackage: (pkg: TourPackage) => void;
  currentUser: UserProfile;
  onToggleCompare: (pkg: TourPackage) => void;
  comparedPackageIds: string[];
  onAddToItinerary: (pkg: TourPackage) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  itinerary,
  onUpdateItinerary,
  onSelectPackage,
  currentUser,
  onToggleCompare,
  comparedPackageIds,
  onAddToItinerary
}) => {
  const itineraryPackageIds = itinerary.items.map((i) => i.package.package_id);

  // Recommendations that pair well with current itinerary
  const suggestedNextStops = PACKAGES_DATA.filter(
    (p) => !itineraryPackageIds.includes(p.package_id)
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* View Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Multi-Day Timeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Trip Planner &amp; Itinerary Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Construct an end-to-end multi-destination vacation timeline. Reorder stops, track estimated demand pricing, and plan sequential inter-city connections.
        </p>
      </div>

      {/* Main Interactive Timeline Component */}
      <TripTimeline
        itinerary={itinerary}
        onUpdateItinerary={onUpdateItinerary}
        onSelectPackage={onSelectPackage}
        currentUser={currentUser}
      />

      {/* Recommended Stops to Add to Timeline */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Recommended Next Stops to Enrich Your Journey
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click '+ Add to Trip Itinerary' on any card
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedNextStops.map((pkg) => (
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
      </div>
    </div>
  );
};
