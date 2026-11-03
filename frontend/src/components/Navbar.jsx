import React from 'react';
import { 
  ShieldAlert, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Train, 
  Compass, 
  Briefcase, 
  Newspaper, 
  Shield, 
  LifeBuoy,
  Server
} from 'lucide-react';
import { isLiveRailwayApiActive } from '../config/railwayApi';

export default function Navbar({ 
  user, 
  currentTab, 
  setCurrentTab, 
  isDarkMode, 
  setIsDarkMode, 
  onOpenMe, 
  onLogout,
  onOpenSOS,
  onOpenApiConfig
}) {
  const tabs = [
    { id: 'book', label: 'Book', icon: Train },
    { id: 'mytrips', label: 'My Trips', icon: Briefcase },
    { id: 'journey', label: 'Journey', icon: Compass },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'safety', label: 'Safety', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      {/* Upper Task Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-railway-900 via-railway-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-railway-900/20">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-railway-900 dark:text-white">
                  Rail<span className="text-emerald-600 dark:text-emerald-400">Raksha</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Govt. of India Shield
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Smart Booking & Passenger Safety Ecosystem
              </p>
            </div>
          </div>

          {/* User Taskbar Section (Hello User Name!, Theme, ME, Logout, SOS) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Greeting in Task Bar */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Hello <span className="text-railway-700 dark:text-railway-400 font-bold">{user.fullName || 'User'}</span>!
                </span>
              </div>
            )}

            {/* Quick SOS Siren Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all animate-pulse"
              title="Emergency SOS Medical & Police Dispatch"
            >
              <LifeBuoy className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-extrabold tracking-wider">SOS</span>
            </button>

            {/* Railway API Mode & Key Indicator Button */}
            <button
              onClick={onOpenApiConfig}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isLiveRailwayApiActive()
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
              title="Railways API Key & Engine Config"
            >
              <Server className={`w-3.5 h-3.5 ${isLiveRailwayApiActive() ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>{isLiveRailwayApiActive() ? 'API: Live' : 'API: Mock'}</span>
              <span className={`w-2 h-2 rounded-full ${isLiveRailwayApiActive() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* ME Profile Option */}
            {user && (
              <button
                onClick={onOpenMe}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-railway-50 dark:bg-slate-800 text-railway-900 dark:text-slate-100 hover:bg-railway-100 dark:hover:bg-slate-700 border border-railway-200 dark:border-slate-700 font-semibold text-xs transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-railway-600 dark:text-railway-400" />
                <span>ME</span>
              </button>
            )}

            {/* Logout Option */}
            {user && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Below Task Bar: Navigation Options (Book, My Trips, Journey, News, Safety) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-railway-900 text-white dark:bg-emerald-600 dark:text-white shadow-md shadow-railway-900/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'safety' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
