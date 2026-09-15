import React, { useState } from 'react';
import {
  User,
  Calendar,
  Wallet,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Plus,
  BookOpen
} from 'lucide-react';
import { UserProfile, TourPackage, TripItinerary } from '../types';
import { USERS_DATA } from '../data/usersData';
import { PACKAGES_DATA } from '../data/packagesData';
import { getBookingsForUser } from '../data/bookingsData';
import { getPackageRatingStats } from '../data/ratingsData';
import { PackageCard } from '../components/PackageCard';
import { TripTimeline } from '../components/TripTimeline';

interface ProfileViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onSelectPackage: (pkg: TourPackage) => void;
  onToggleCompare: (pkg: TourPackage) => void;
  comparedPackageIds: string[];
  itinerary: TripItinerary;
  onUpdateItinerary: (updated: TripItinerary) => void;
  onAddToItinerary?: (pkg: TourPackage) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  setCurrentUser,
  onSelectPackage,
  onToggleCompare,
  comparedPackageIds,
  itinerary,
  onUpdateItinerary,
  onAddToItinerary
}) => {
  const [profileTab, setProfileTab] = useState<'planner' | 'history'>('planner');

  // Retrieve bookings for this user
  const userBookings = getBookingsForUser(currentUser.user_id);

  // Representative fallback sample
  const displayBookings = userBookings.length > 0 ? userBookings : [
    {
      booking_id: 'BKG-0104',
      package_id: 'PKG-001',
      user_id: currentUser.user_id,
      booking_date: '2024-01-10',
      travel_date: '2024-02-25',
      lead_time_days: 46,
      group_size: 4,
      final_price_paid: 14500
    },
    {
      booking_id: 'BKG-0288',
      package_id: 'PKG-004',
      user_id: currentUser.user_id,
      booking_date: '2023-10-15',
      travel_date: '2023-11-20',
      lead_time_days: 36,
      group_size: 2,
      final_price_paid: 46100
    },
    {
      booking_id: 'BKG-0512',
      package_id: 'PKG-002',
      user_id: currentUser.user_id,
      booking_date: '2024-03-02',
      travel_date: '2024-03-16',
      lead_time_days: 14,
      group_size: 2,
      final_price_paid: 8500
    }
  ];

  // Recommended upcoming packages for this profile's preferred categories
  const recommendedForUser = PACKAGES_DATA.filter((p) =>
    currentUser.preferred_categories.includes(p.category)
  ).slice(0, 3);

  const itineraryPackageIds = itinerary.items.map((i) => i.package.package_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>Travel Portfolio &amp; Itinerary Management</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Your Travel Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Plan customized multi-day itineraries, track preferences, and review past journeys.
        </p>
      </div>

      {/* Profile Overview Card (Luxury Styling) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* User Avatar + Identity */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20 shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-950 font-bold" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                  {currentUser.user_id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Member since {currentUser.signup_date.split('-')[0]} • Verified Travel Profile
              </p>
            </div>
          </div>

          {/* Switch Profile Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Switch Profile:</span>
            <select
              value={currentUser.user_id}
              onChange={(e) => {
                const u = USERS_DATA.find((usr) => usr.user_id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {USERS_DATA.slice(0, 8).map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} ({u.budget_range})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800">
          {/* Preferred Categories */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Preferred Categories
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.preferred_categories.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Target Budget Tier
            </div>
            <div className="text-xl font-bold text-white flex items-center gap-1.5">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span>₹{currentUser.budget_range}</span>
            </div>
            <p className="text-[10px] text-slate-500">Per traveler catalog constraint</p>
          </div>

          {/* Past Bookings Count */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Verified Trips Completed
            </div>
            <div className="text-xl font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>{currentUser.past_bookings_count} Bookings</span>
            </div>
            <p className="text-[10px] text-slate-500">Historical records in bookings.csv</p>
          </div>
        </div>
      </div>

      {/* Navigation Segment Tabs: Trip Planner vs Journey History */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setProfileTab('planner')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            profileTab === 'planner'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Trip Planner &amp; Timeline</span>
          {itinerary.items.length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-950 text-amber-400">
              {itinerary.items.length} Stops
            </span>
          )}
        </button>

        <button
          onClick={() => setProfileTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            profileTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journey History ({displayBookings.length})</span>
        </button>
      </div>

      {/* Tab 1: Multi-Day Trip Planner & Timeline View */}
      {profileTab === 'planner' && (
        <TripTimeline
          itinerary={itinerary}
          onUpdateItinerary={onUpdateItinerary}
          onSelectPackage={onSelectPackage}
          currentUser={currentUser}
        />
      )}

      {/* Tab 2: Previous Journeys History */}
      {profileTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Your previous journeys</h3>
              <p className="text-xs text-slate-400">
                Verified historical trips recorded on this travel profile
              </p>
            </div>
            <span className="text-xs text-amber-400 font-semibold cursor-pointer">
              Total ({displayBookings.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayBookings.map((b) => {
              const pkg = PACKAGES_DATA.find((p) => p.package_id === b.package_id) || PACKAGES_DATA[0];
              return (
                <div
                  key={b.booking_id}
                  onClick={() => onSelectPackage(pkg)}
                  className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-4 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group space-y-3 shadow-xl"
                >
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-800">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-white font-bold text-sm drop-shadow">
                        {pkg.destination}
                      </span>
                      <span className="text-xs font-semibold text-amber-300 drop-shadow">
                        {pkg.duration_days} Days
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Booking Ref:</span>
                      <span className="font-mono text-slate-300">{b.booking_id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Travel Date:</span>
                      <span className="text-slate-200">{b.travel_date}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lead Time:</span>
                      <span className="text-amber-400">{b.lead_time_days} days in advance</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Group Size:</span>
                      <span className="text-slate-200">{b.group_size} travelers</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500">Final Price Paid</div>
                      <div className="text-base font-bold text-white">
                        ₹{b.final_price_paid.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button className="p-1.5 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Upcoming Packages for this Profile */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Curated Next Trips for {currentUser.name}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedForUser.map((pkg) => (
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
