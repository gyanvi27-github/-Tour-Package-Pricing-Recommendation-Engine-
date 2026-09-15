import React, { useState } from 'react';
import { ActivePage, TourPackage, UserProfile, TripItinerary, ItineraryItem } from './types';
import { USERS_DATA } from './data/usersData';
import { PACKAGES_DATA } from './data/packagesData';
import { Navbar } from './components/Navbar';
import { PackageDetailModal } from './components/PackageDetailModal';
import { CompareModal } from './components/CompareModal';
import { Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

// Views
import { HomeView } from './views/HomeView';
import { DiscoverView } from './views/DiscoverView';
import { RecommendationView } from './views/RecommendationView';
import { PlannerView } from './views/PlannerView';
import { PriceIntelligenceView } from './views/PriceIntelligenceView';
import { AnalyticsView } from './views/AnalyticsView';
import { ModelIntelligenceView } from './views/ModelIntelligenceView';
import { ProfileView } from './views/ProfileView';
import { AboutView } from './views/AboutView';
import { ChatView } from './views/ChatView';
import { FloatingAiWidget } from './components/FloatingAiWidget';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS_DATA[0]);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [compareList, setCompareList] = useState<TourPackage[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pre-seeded rich initial Multi-Day Itinerary showcasing the timeline immediately
  const [itinerary, setItinerary] = useState<TripItinerary>(() => {
    const pkg1 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-001') || PACKAGES_DATA[0]; // Goa
    const pkg2 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-002') || PACKAGES_DATA[1]; // Manali
    const pkg3 = PACKAGES_DATA.find((p) => p.package_id === 'PKG-004') || PACKAGES_DATA[3]; // Bali

    return {
      id: 'itin-001',
      userId: USERS_DATA[0].user_id,
      tripTitle: 'Grand Indo-Pacific & Alpine Odyssey',
      departureDate: '2024-11-15',
      targetBudget: 65000,
      items: [
        {
          id: 'itin-item-1',
          package_id: pkg1.package_id,
          package: pkg1,
          dayStart: 1,
          durationDays: pkg1.duration_days,
          startDate: '2024-11-15',
          notes: 'Check-in at beachside villa. Sunset cruise along Mandovi River scheduled.',
          customActivities: [...pkg1.highlights]
        },
        {
          id: 'itin-item-2',
          package_id: pkg2.package_id,
          package: pkg2,
          dayStart: 6,
          durationDays: pkg2.duration_days,
          startDate: '2024-11-20',
          notes: 'Transfer via scenic mountain flight. Pack warm alpine fleece for Solang valley paragliding.',
          customActivities: [...pkg2.highlights],
          transitInfo: {
            type: 'Flight',
            duration: '3h 25m',
            detail: 'Connecting flight from Goa (GOI) to Bhuntar Kullu (KUU) with private coach transfer'
          }
        },
        {
          id: 'itin-item-3',
          package_id: pkg3.package_id,
          package: pkg3,
          dayStart: 9,
          durationDays: pkg3.duration_days,
          startDate: '2024-11-23',
          notes: 'Tropical sanctuary in Seminyak & Ubud cultural rice terraces. Sunset seafood banquet at Jimbaran Bay.',
          customActivities: [...pkg3.highlights],
          transitInfo: {
            type: 'Flight',
            duration: '5h 45m',
            detail: 'International direct flight to Denpasar Bali (DPS) with fast-track VIP arrival lounge'
          }
        }
      ],
      createdDate: '2024-09-15'
    };
  });

  const itineraryPackageIds = itinerary.items.map((it) => it.package.package_id);

  // Add / Remove from itinerary
  const handleAddToItinerary = (pkg: TourPackage) => {
    const exists = itinerary.items.some((it) => it.package.package_id === pkg.package_id);
    if (exists) {
      // Remove
      const remaining = itinerary.items.filter((it) => it.package.package_id !== pkg.package_id);
      setItinerary((prev) => ({
        ...prev,
        items: remaining
      }));
      showToast(`Removed ${pkg.destination} from your itinerary.`);
    } else {
      // Append
      const lastItem = itinerary.items[itinerary.items.length - 1];
      const startDay = lastItem ? lastItem.dayStart + lastItem.durationDays : 1;
      
      const newItem: ItineraryItem = {
        id: `itin-item-${Date.now()}`,
        package_id: pkg.package_id,
        package: pkg,
        dayStart: startDay,
        durationDays: pkg.duration_days,
        startDate: itinerary.departureDate,
        notes: `Custom itinerary stop at ${pkg.destination}. Focus on ${pkg.category.toLowerCase()} highlights.`,
        customActivities: [...pkg.highlights],
        transitInfo: itinerary.items.length > 0 ? {
          type: 'Flight',
          duration: '2h 45m',
          detail: `Direct connecting transit to ${pkg.destination}`
        } : undefined
      };

      setItinerary((prev) => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      showToast(`Added ${pkg.destination} to your Multi-Day Itinerary!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleCompare = (pkg: TourPackage) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.package_id === pkg.package_id);
      if (exists) {
        return prev.filter((p) => p.package_id !== pkg.package_id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), pkg];
      }
      return [...prev, pkg];
    });
  };

  const comparedPackageIds = compareList.map((p) => p.package_id);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Sticky Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        itineraryCount={itinerary.items.length}
      />

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">{toastMessage}</span>
            <button
              onClick={() => {
                setActivePage('planner');
                setToastMessage(null);
              }}
              className="ml-2 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Page Dynamic View */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomeView
            setActivePage={setActivePage}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            onToggleCompare={handleToggleCompare}
            comparedPackageIds={comparedPackageIds}
            onAddToItinerary={handleAddToItinerary}
            itineraryPackageIds={itineraryPackageIds}
          />
        )}

        {activePage === 'discover' && (
          <DiscoverView
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            onToggleCompare={handleToggleCompare}
            comparedPackageIds={comparedPackageIds}
            onAddToItinerary={handleAddToItinerary}
            itineraryPackageIds={itineraryPackageIds}
          />
        )}

        {activePage === 'recommendations' && (
          <RecommendationView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            onToggleCompare={handleToggleCompare}
            comparedPackageIds={comparedPackageIds}
            onAddToItinerary={handleAddToItinerary}
            itineraryPackageIds={itineraryPackageIds}
          />
        )}

        {activePage === 'planner' && (
          <PlannerView
            itinerary={itinerary}
            onUpdateItinerary={setItinerary}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            currentUser={currentUser}
            onToggleCompare={handleToggleCompare}
            comparedPackageIds={comparedPackageIds}
            onAddToItinerary={handleAddToItinerary}
          />
        )}

        {activePage === 'pricing' && <PriceIntelligenceView />}

        {activePage === 'analytics' && <AnalyticsView />}

        {activePage === 'model' && <ModelIntelligenceView />}

        {activePage === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            onToggleCompare={handleToggleCompare}
            comparedPackageIds={comparedPackageIds}
            itinerary={itinerary}
            onUpdateItinerary={setItinerary}
            onAddToItinerary={handleAddToItinerary}
          />
        )}

        {activePage === 'about' && <AboutView />}
        {(activePage === 'chat' || activePage === 'voice') && (
          <ChatView
            itinerary={itinerary}
            selectedPackage={selectedPackage}
            onSelectPackage={(pkg) => setSelectedPackage(pkg)}
            currentUser={currentUser}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Persistent Floating Gemini AI Widget */}
      <FloatingAiWidget
        itinerary={itinerary}
        selectedPackage={selectedPackage}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onOpenFullPage={() => setActivePage('chat')}
      />

      {/* Package Detail Modal with Price Simulator */}
      <PackageDetailModal
        packageData={selectedPackage}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedPackage ? comparedPackageIds.includes(selectedPackage.package_id) : false}
        onAddToItinerary={handleAddToItinerary}
        isInItinerary={selectedPackage ? itineraryPackageIds.includes(selectedPackage.package_id) : false}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        packages={compareList}
        onRemovePackage={(id) => setCompareList((prev) => prev.filter((p) => p.package_id !== id))}
        onSelectPackage={(pkg) => {
          setIsCompareOpen(false);
          setSelectedPackage(pkg);
        }}
      />

      {/* Global Footer with Luxury Accents */}
      <footer className="bg-[#06080e] border-t border-slate-900 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                TripWise AI
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Next-generation travel intelligence, multi-day itinerary timeline planning, and tour package recommendation engine powered by machine learning demand pricing.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Lineage: RideWise ML Ecosystem
              </div>
            </div>

            <div>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
                Platform
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActivePage('planner')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Trip Planner &amp; Timeline
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('discover')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Explore Packages (60)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('recommendations')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    AI Match Engine
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('pricing')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Price Intelligence
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('analytics')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Data Analytics
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
                Intelligence
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActivePage('chat')} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                    <span>Gemini AI Chatbot</span>
                    <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300">New</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('voice')} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                    <span>Live Voice Assistant</span>
                    <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300">Live API</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('model')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                    XGBoost Architecture
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('about')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Story &amp; Evolution
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePage('profile')} className="hover:text-amber-400 transition-colors cursor-pointer">
                    Travel Profile &amp; Itinerary
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-1">
                Data Integrity
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-amber-300 font-medium">Synthetic Production Datasets</div>
                <div className="text-slate-400">60 Packages • 4,000 Bookings • 2,500 Ratings • 400 Profiles</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} TripWise AI. Transparent dynamic pricing and tour recommendations.</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer">Model Cards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
