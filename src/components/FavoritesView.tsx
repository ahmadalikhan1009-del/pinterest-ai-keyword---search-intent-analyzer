import React from 'react';
import { KeywordItem } from '../types';
import { Bookmark, Star, FileSpreadsheet, Copy, Trash2 } from 'lucide-react';
import { exportKeywordsToCSV, copyToClipboard } from '../lib/export';

interface FavoritesViewProps {
  favoriteKeywords: KeywordItem[];
  onToggleFavorite: (kw: KeywordItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteKeywords,
  onToggleFavorite,
  onShowToast
}) => {
  const handleExportCSV = () => {
    const csv = exportKeywordsToCSV(favoriteKeywords, 'favorite_pinterest_keywords');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorite_pinterest_keywords_${favoriteKeywords.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported ${favoriteKeywords.length} bookmarked keywords!`, 'success');
  };

  const handleCopyAll = async () => {
    const text = favoriteKeywords.map(k => k.keyword).join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      onShowToast(`Copied ${favoriteKeywords.length} keywords to clipboard!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              Saved Favorite Keywords Vault ({favoriteKeywords.length})
            </h3>
            <p className="text-xs text-slate-400">High-converting search terms you starred for your Pinterest campaigns</p>
          </div>

          {favoriteKeywords.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" /> Copy List
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Favorites CSV
              </button>
            </div>
          )}
        </div>

        {favoriteKeywords.length === 0 ? (
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
            <Star className="w-8 h-8 text-amber-500/40 mx-auto" />
            <p>No favorite keywords saved yet. Star keywords in any analysis table to bookmark them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteKeywords.map(kw => (
              <div key={kw.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{kw.keyword}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {kw.intent}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Pop: {kw.popularityScore}</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(kw)}
                  className="text-amber-400 fill-amber-400 hover:text-rose-400 p-1 transition-colors"
                  title="Remove from favorites"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
