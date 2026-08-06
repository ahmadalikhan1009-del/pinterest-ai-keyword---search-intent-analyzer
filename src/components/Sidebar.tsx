import React from 'react';
import { NavView } from '../types';
import { 
  Sparkles, 
  LayoutDashboard, 
  ImagePlus, 
  Layers, 
  History, 
  Bookmark, 
  Sliders, 
  Settings,
  Flame,
  Search,
  HardDrive
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  analysisCount: number;
  favoriteKeywordCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  analysisCount,
  favoriteKeywordCount
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer' as NavView, label: 'Analyze Product Image', icon: ImagePlus, badge: 'AI' },
    { id: 'bulk' as NavView, label: 'Bulk Analysis', icon: Layers },
    { id: 'history' as NavView, label: 'History Archive', icon: History, count: analysisCount },
    { id: 'favorites' as NavView, label: 'Saved Keywords', icon: Bookmark, count: favoriteKeywordCount },
    { id: 'templates' as NavView, label: 'Prompt Tuning', icon: Sliders },
    { id: 'settings' as NavView, label: 'Settings & API', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0c0c0e] border-r border-white/5 flex flex-col justify-between select-none shrink-0 z-20">
      <div>
        {/* Logo Header */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-none flex items-center gap-1.5">
              PinKeywords <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">Pinterest Intent Analyzer</p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="p-3">
          <button
            onClick={() => onSelectView('analyzer')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all duration-200 border border-rose-400/20 active:scale-95"
          >
            <ImagePlus className="w-4 h-4" />
            New Image Analysis
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-slate-400 border border-white/10">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 bg-[#09090b]/60 text-slate-400 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Storage
          </span>
          <span className="font-mono text-emerald-400 text-[10px]">Local Indexed</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-1/4 rounded-full" />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Personal Workflow</span>
          <span>v2.5 Pro</span>
        </div>
      </div>
    </aside>
  );
};
