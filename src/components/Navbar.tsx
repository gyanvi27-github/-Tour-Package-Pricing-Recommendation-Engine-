import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  TrendingUp,
  BarChart3,
  User,
  Cpu,
  Info,
  Layers,
  Calendar,
  Menu,
  X,
  ChevronDown,
  Bot,
  Radio
} from 'lucide-react';
import { ActivePage, UserProfile } from '../types';
import { USERS_DATA } from '../data/usersData';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  compareCount: number;
  onOpenCompare: () => void;
  itineraryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  setCurrentUser,
  compareCount,
  onOpenCompare,
  itineraryCount = 0
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover', icon: <Search className="w-4 h-4" /> },
    { id: 'recommendations', label: 'AI Match', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'chat', label: 'AI Concierge', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
    { id: 'planner', label: 'Trip Planner', icon: <Calendar className="w-4 h-4 text-cyan-400" />, badge: itineraryCount },
    { id: 'pricing', label: 'Price Intel', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'My Trips', icon: <User className="w-4 h-4" /> },
    { id: 'model', label: 'Architecture', icon: <Cpu className="w-4 h-4" /> },
    { id: 'about', label: 'Story', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#070d19]/92 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-300 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">TripWise</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                Tour Pricing &amp; Itinerary
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mid-sized Navigation (md to xl) */}
          <div className="hidden md:flex xl:hidden items-center gap-1">
            {navItems.slice(0, 6).map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full text-[9px] font-bold bg-cyan-400 text-slate-950 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Live Voice Button */}
            <button
              onClick={() => setActivePage('chat')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
              title="Talk or Chat with Gemini AI"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini AI</span>
            </button>

            {/* Compare Badge / Button */}
            {compareCount > 0 && (
              <button
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#091527] border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
                title="Compare selected tour packages"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare</span>
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                  {compareCount}
                </span>
              </button>
            )}

            {/* User Profile Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#091527] border border-cyan-500/25 hover:border-cyan-500/50 text-xs text-slate-200 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-950 font-bold" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-semibold text-slate-200 leading-none">{currentUser.name}</div>
                  <div className="text-[9px] text-cyan-400 mt-0.5">{currentUser.user_id}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#091527] border border-cyan-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Travel Profile
                  </div>
                  <div className="max-h-56 overflow-y-auto mt-1 space-y-1">
                    {USERS_DATA.slice(0, 8).map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => {
                          setCurrentUser(user);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                          user.user_id === currentUser.user_id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-950 font-bold bg-cyan-400">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.preferred_categories.join(', ')} • {user.budget_range}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1 mt-1 border-t border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setActivePage('planner');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-cyan-300 hover:bg-slate-800 font-medium flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Open Trip Planner ({itineraryCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        setActivePage('profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 font-medium flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Manage Profile &amp; History</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800/80 space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
