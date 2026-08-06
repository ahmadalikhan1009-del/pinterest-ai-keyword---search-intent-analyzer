import React, { useState } from 'react';
import { AnalysisRecord } from '../types';
import { History, Search, Eye, Trash2, Copy, Edit2, FileSpreadsheet, Download, Check } from 'lucide-react';
import { exportKeywordsToCSV, downloadFile } from '../lib/export';

interface HistoryViewProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (id: string) => void;
  onRenameRecord: (id: string, newTitle: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onRenameRecord,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.imageAnalysis?.productName?.toLowerCase().includes(q) ||
      r.imageAnalysis?.category?.toLowerCase().includes(q)
    );
  });

  const handleStartRename = (record: AnalysisRecord) => {
    setEditingId(record.id);
    setTempTitle(record.title);
  };

  const handleSaveRename = (id: string) => {
    if (tempTitle.trim()) {
      onRenameRecord(id, tempTitle.trim());
      onShowToast('Analysis renamed', 'info');
    }
    setEditingId(null);
  };

  const handleExportCSV = (record: AnalysisRecord) => {
    const csv = exportKeywordsToCSV(record.keywords, record.title);
    downloadFile(csv, `${record.title.replace(/\s+/g, '_')}_keywords.csv`, 'text/csv');
    onShowToast('CSV exported!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-rose-400" />
              Local Analysis History ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-400">All past product image analyses saved locally in browser storage</p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter history..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No analysis records found matching search.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-all">
                <div className="flex gap-3">
                  <img src={record.imageDataUrl} alt={record.title} className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0" />
                  <div className="min-w-0 flex-1">
                    {editingId === record.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white w-full"
                        />
                        <button onClick={() => handleSaveRename(record.id)} className="p-1 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{record.title}</h4>
                        <button onClick={() => handleStartRename(record)} className="text-slate-500 hover:text-slate-300">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">{record.imageAnalysis?.category || 'E-Commerce'}</p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1">
                      {record.keywords?.length || 0} Keywords
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleExportCSV(record)} className="p-1.5 text-slate-400 hover:text-emerald-400" title="Export CSV">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDuplicateRecord(record.id)} className="p-1.5 text-slate-400 hover:text-cyan-400" title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDeleteRecord(record.id)} className="p-1.5 text-slate-400 hover:text-rose-400" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onSelectRecord(record)} className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs hover:bg-rose-500">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
