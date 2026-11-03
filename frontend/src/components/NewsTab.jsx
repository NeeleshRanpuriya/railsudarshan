import React from 'react';
import { Newspaper, Bell, ShieldCheck, Flame, ExternalLink, Calendar, Train } from 'lucide-react';

export default function NewsTab() {
  const newsItems = [
    {
      id: 1,
      title: 'Indian Railways Expands "Meri Saheli" All-Women Security Teams Across 450+ Major Express Trains',
      category: 'Women Safety',
      date: '28 Oct 2026',
      readTime: '3 min read',
      summary: 'Under the enhanced safety guidelines, female RPF officers will now interact with solo women travelers at origin stations and maintain digital watch throughout the transit till the destination.',
      badge: 'Hot Advisory',
      color: 'pink',
    },
    {
      id: 2,
      title: 'Kavach 4.0 Automatic Train Protection (ATP) Activated Across 3,000 km Golden Quadrilateral',
      category: 'Railway Tech',
      date: '26 Oct 2026',
      readTime: '4 min read',
      summary: 'Minister of Railways inspected deployment of indigenous Kavach 4.0 system ensuring automatic brake application to prevent collisions, signal passing at danger, and over-speeding.',
      badge: 'Infrastructure',
      color: 'emerald',
    },
    {
      id: 3,
      title: 'Instant Refund Pipeline Activated: Online Cancellations Credited Within 2-4 Hours',
      category: 'Passenger Policy',
      date: '24 Oct 2026',
      readTime: '2 min read',
      summary: 'Indian Railways clarifies revised refund slabs for >48h, 12-48h, and 4-12h cancellation requests with direct source-bank settlement via automated UPI and net banking rails.',
      badge: 'Policy Update',
      color: 'blue',
    },
    {
      id: 4,
      title: 'Winter Fog Safety Protocol: Real-Time GPS Tracking & Station Ambulance Desks Operational',
      category: 'Seasonal Safety',
      date: '21 Oct 2026',
      readTime: '3 min read',
      summary: 'To counter winter delays, loco-pilots equipped with FOG-PASS navigation devices and divisional railway hospitals activate 24/7 emergency ambulance platforms along major trunk corridors.',
      badge: 'Safety Alert',
      color: 'amber',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-emerald-400">
            Press Releases & Bulletins
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Railway Safety & Journey News
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official announcements, passenger safety updates, and travel guidelines from the Ministry of Railways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            <span>4 New Advisories</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.color === 'pink' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' :
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  item.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {item.badge}
                </span>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{item.category} • {item.readTime}</span>
              <span className="text-railway-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                Read Circular <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
