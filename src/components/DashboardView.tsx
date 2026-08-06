import React from 'react';
import { AnalysisRecord, NavView } from '../types';
import { 
  Sparkles, 
  ImagePlus, 
  Key, 
  BarChart3, 
  Tag, 
  Search, 
  History, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  Layers,
  Copy,
  Trash2,
  Eye,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onNavigate: (view: NavView) => void;
  onDeleteRecord: (id: string) => void;
  favoriteKeywordCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onSelectRecord,
  onNavigate,
  onDeleteRecord,
  favoriteKeywordCount
}) => {
  const totalAnalyses = records.length;
  const totalKeywords = records.reduce((acc, r) => acc + (r.keywords?.length || 0), 0);
  const latestRecord = records[0];

  // Calculate search intent breakdown across all analyses
  const intentCounts: Record<string, number> = {};
  records.forEach(r => {
    r.keywords?.forEach(k => {
      const intent = k.intent || 'Shopping';
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });
  });

  const topIntents = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121214] via-[#121214] to-rose-950/40 border border-white/5 p-6 md:p-8">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Pinterest SEO & Search Intent Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Analyze Product Images & Conquer Pinterest Search
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Upload any product photo to generate 100+ Pinterest keywords, search intent breakdown, visual quality scores, SEO titles, pin hooks, and competitor insights.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 border border-rose-400/20 transition-all transform active:scale-95"
            >
              <ImagePlus className="w-4 h-4" />
              Analyze Image Now
            </button>
            <button
              onClick={() => onNavigate('bulk')}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              Bulk Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Total Product Analyses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalAnalyses}</div>
          <p className="text-[11px] text-slate-400 mt-1">Saved in local storage archive</p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Keywords Generated</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalKeywords}</div>
          <p className="text-[11px] text-slate-400 mt-1">Categorized by search intent</p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Saved Keyword Vault</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400/20" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{favoriteKeywordCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Bookmarked high-converting terms</p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Top Niche Category</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white truncate">
            {latestRecord?.imageAnalysis?.category || 'E-Commerce'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {latestRecord?.imageAnalysis?.subCategory || 'General Product Analysis'}
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Analyses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-rose-400" />
              Recent Product Image Analyses
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              View All Archive <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {records.slice(0, 4).map((record) => (
              <div
                key={record.id}
                className="group bg-[#121214] border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 mb-3">
                    <img
                      src={record.imageDataUrl}
                      alt={record.title}
                      className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0 bg-[#0c0c0e]"
                    />
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                        {record.imageAnalysis?.category || 'Product'}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-rose-300 transition-colors">
                        {record.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {record.imageAnalysis?.productName || 'Product'}
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-[#0c0c0e] p-2.5 rounded-xl border border-white/5 my-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Keywords:</span>
                      <span className="text-emerald-400 font-bold">{record.keywords?.length || 0}+</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Visual Score:</span>
                      <span className="text-rose-400 font-bold">{record.visualScores?.imageQualityScore || 90}/100</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-slate-400">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Delete Analysis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-md border border-rose-500/20"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Intent Breakdown & Quick Tools */}
        <div className="space-y-6">
          {/* Intent Breakdown */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Top Search Intent Distribution
            </h3>

            <div className="space-y-2.5">
              {topIntents.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Analyze an image to view search intent analytics.</p>
              ) : (
                topIntents.map(([intent, count], i) => {
                  const pct = Math.round((count / totalKeywords) * 100) || 0;
                  return (
                    <div key={intent} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{intent} Intent</span>
                        <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#0c0c0e] h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                          style={{ width: `${Math.max(10, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Prompt Templates Quick Banner */}
          <div className="bg-gradient-to-tr from-[#121214] to-[#18181b] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-400" /> Custom Niche Tuning
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailor the AI keyword algorithm specifically for Etsy printables, fashion lookbooks, home decor, or craft tutorials.
            </p>
            <button
              onClick={() => onNavigate('templates')}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
            >
              Configure Niche Prompts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
