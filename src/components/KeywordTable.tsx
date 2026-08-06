import React, { useState, useMemo } from 'react';
import { KeywordItem } from '../types';
import { 
  Search, 
  Filter, 
  Star, 
  Copy, 
  Download, 
  Check, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  FileSpreadsheet,
  Tag,
  Edit2
} from 'lucide-react';
import { exportKeywordsToCSV, exportKeywordsToTXT, copyToClipboard } from '../lib/export';

interface KeywordTableProps {
  keywords: KeywordItem[];
  onToggleFavorite: (kw: KeywordItem) => void;
  onUpdateNotes?: (kwId: string, notes: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type SortField = 'popularityScore' | 'competitionScore' | 'difficulty' | 'commercialValue' | 'clickPotential' | 'savePotential' | 'keyword';

export const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  onToggleFavorite,
  onUpdateNotes,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIntent, setSelectedIntent] = useState<string>('ALL');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('ALL');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [sortField, setSortField] = useState<SortField>('popularityScore');
  const [sortAsc, setSortAsc] = useState(false);

  const [copiedKwId, setCopiedKwId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Extract unique categories & intents for filters
  const categories = useMemo(() => {
    const set = new Set(keywords.map(k => k.category));
    return Array.from(set).filter(Boolean);
  }, [keywords]);

  const intents = useMemo(() => {
    const set = new Set(keywords.map(k => k.intent));
    return Array.from(set).filter(Boolean);
  }, [keywords]);

  // Filter & Sort
  const filteredKeywords = useMemo(() => {
    return keywords.filter(k => {
      if (favoritesOnly && !k.isFavorite) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchKw = k.keyword.toLowerCase().includes(query);
        const matchCat = k.category?.toLowerCase().includes(query);
        const matchIntent = k.intent?.toLowerCase().includes(query);
        if (!matchKw && !matchCat && !matchIntent) return false;
      }

      if (selectedCategory !== 'ALL' && k.category !== selectedCategory) return false;
      if (selectedIntent !== 'ALL' && k.intent !== selectedIntent) return false;
      if (selectedCompetition !== 'ALL' && k.competitionLevel !== selectedCompetition) return false;
      if (selectedOpportunity !== 'ALL' && k.rankingOpportunity !== selectedOpportunity) return false;

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [keywords, searchTerm, selectedCategory, selectedIntent, selectedCompetition, selectedOpportunity, favoritesOnly, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCopySingle = async (kw: KeywordItem) => {
    const success = await copyToClipboard(kw.keyword);
    if (success) {
      setCopiedKwId(kw.id);
      onShowToast(`Copied "${kw.keyword}" to clipboard!`, 'success');
      setTimeout(() => setCopiedKwId(null), 2000);
    }
  };

  const handleCopyAllFiltered = async () => {
    const text = filteredKeywords.map(k => k.keyword).join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      onShowToast(`Copied ${filteredKeywords.length} keywords to clipboard!`, 'success');
    }
  };

  const handleExportCSV = () => {
    const csv = exportKeywordsToCSV(filteredKeywords);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinterest_keywords_${filteredKeywords.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported ${filteredKeywords.length} keywords as CSV!`, 'success');
  };

  const handleSaveNote = (kwId: string) => {
    if (onUpdateNotes) {
      onUpdateNotes(kwId, tempNoteText);
      onShowToast('Keyword note saved', 'info');
    }
    setEditingNoteId(null);
  };

  return (
    <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Table Controls Header */}
      <div className="p-5 border-b border-white/5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400" />
              Generated Pinterest Keywords ({filteredKeywords.length} of {keywords.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter by search intent, difficulty, competition, or export directly to CSV</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllFiltered}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              Copy All ({filteredKeywords.length})
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/40 border border-rose-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword..."
              className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0c0c0e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500/50"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Intent */}
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="bg-[#0c0c0e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500/50"
          >
            <option value="ALL">All Search Intents</option>
            {intents.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          {/* Competition */}
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="bg-[#0c0c0e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500/50"
          >
            <option value="ALL">All Competition</option>
            <option value="Low">Low Competition</option>
            <option value="Medium">Medium Competition</option>
            <option value="High">High Competition</option>
          </select>

          {/* Opportunity */}
          <div className="flex items-center gap-2">
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500/50"
            >
              <option value="ALL">All Opportunities</option>
              <option value="Easy">Easy Ranking</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>

            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`p-2 rounded-xl border transition-all ${
                favoritesOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-[#0c0c0e] border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Show Bookmarked Keywords Only"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0c0c0e] sticky top-0 z-10 text-[11px] uppercase tracking-wider text-slate-400 font-mono border-b border-white/10">
            <tr>
              <th className="py-3 px-4 w-10 text-center">Fav</th>
              <th className="py-3 px-4 min-w-[200px] cursor-pointer hover:text-white" onClick={() => handleSort('keyword')}>
                <div className="flex items-center gap-1">
                  Keyword <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Intent</th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('popularityScore')}>
                <div className="flex items-center justify-center gap-1">
                  Pop. Score <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Search Vol</th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('competitionScore')}>
                <div className="flex items-center justify-center gap-1">
                  Comp. <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('commercialValue')}>
                <div className="flex items-center justify-center gap-1">
                  Commercial <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Opportunity</th>
              <th className="py-3 px-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No keywords match the current search filters.
                </td>
              </tr>
            ) : (
              filteredKeywords.map((kw) => {
                const isCopied = copiedKwId === kw.id;
                return (
                  <tr key={kw.id} className="hover:bg-slate-850/50 transition-colors group">
                    {/* Star Favorite */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleFavorite(kw)}
                        className={`transition-colors ${
                          kw.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Keyword Name */}
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{kw.keyword}</span>
                      </div>
                      {kw.notes && (
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">{kw.notes}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {kw.category}
                      </span>
                    </td>

                    {/* Intent */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {kw.intent}
                      </span>
                    </td>

                    {/* Popularity Score */}
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${
                        kw.popularityScore >= 80 ? 'text-emerald-400' : kw.popularityScore >= 50 ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {kw.popularityScore}
                      </span>
                    </td>

                    {/* Search Volume */}
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {kw.estimatedSearchVolume}
                    </td>

                    {/* Competition */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        kw.competitionLevel === 'Low' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                        kw.competitionLevel === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}>
                        {kw.competitionLevel} ({kw.competitionScore})
                      </span>
                    </td>

                    {/* Commercial Value */}
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {kw.commercialValue}/100
                    </td>

                    {/* Ranking Opportunity */}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold ${
                        kw.rankingOpportunity === 'Easy' ? 'text-emerald-400' :
                        kw.rankingOpportunity === 'Moderate' ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>
                        {kw.rankingOpportunity}
                      </span>
                    </td>

                    {/* Copy action */}
                    <td className="py-3 px-4 text-right pr-6">
                      <button
                        onClick={() => handleCopySingle(kw)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy Keyword"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
