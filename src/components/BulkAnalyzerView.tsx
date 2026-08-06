import React, { useState, useRef } from 'react';
import { AnalysisRecord, PromptTemplate } from '../types';
import { Layers, Upload, Sparkles, Check, Trash2, Eye, FileSpreadsheet } from 'lucide-react';
import { exportKeywordsToCSV, downloadFile } from '../lib/export';

interface BulkAnalyzerViewProps {
  promptTemplates: PromptTemplate[];
  onAnalysisComplete: (record: AnalysisRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  customApiKey?: string;
}

interface BulkItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  record?: AnalysisRecord;
  errorMsg?: string;
}

export const BulkAnalyzerView: React.FC<BulkAnalyzerViewProps> = ({
  promptTemplates,
  onAnalysisComplete,
  onShowToast,
  customApiKey
}) => {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(promptTemplates[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      onShowToast('Please select valid image files.', 'error');
      return;
    }

    const newItems: BulkItem[] = fileArray.slice(0, 5).map(file => ({
      id: `bulk-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));

    setItems(prev => [...prev, ...newItems].slice(0, 10));
    onShowToast(`Added ${newItems.length} images to queue.`, 'info');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const processBulkQueue = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    const templateObj = promptTemplates.find(t => t.id === selectedTemplateId);
    const templateFocus = templateObj ? `${templateObj.name}: ${templateObj.systemFocus}` : '';

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (item.status === 'completed') continue;

      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(item.file);
        });

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            promptTemplate: templateFocus,
            customApiKey
          })
        });

        if (!res.ok) {
          throw new Error('Analysis request failed.');
        }

        const data = await res.json();
        const record: AnalysisRecord = {
          id: `analysis-bulk-${Date.now()}-${idx}`,
          title: data.imageAnalysis?.productName || item.file.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageDataUrl: base64,
          promptTemplate: templateObj?.name,
          imageAnalysis: data.imageAnalysis,
          visualScores: data.visualScores,
          keywords: (data.keywords || []).map((k: any, i: number) => ({
            ...k,
            id: `kw-bulk-${Date.now()}-${i}`,
            isFavorite: false
          })),
          seo: data.seo,
          contentIdeas: data.contentIdeas,
          hashtags: data.hashtags,
          competitors: data.competitors,
          trends: data.trends
        };

        onAnalysisComplete(record);

        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'completed', record } : i));
      } catch (err: any) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: err.message } : i));
      }
    }

    setIsProcessing(false);
    onShowToast('Bulk image processing finished!', 'success');
  };

  const handleExportAllBulkCSV = () => {
    const completedRecords = items.filter(i => i.status === 'completed' && i.record).map(i => i.record!);
    if (completedRecords.length === 0) return;

    const allKeywords = completedRecords.flatMap(r => r.keywords || []);
    const csv = exportKeywordsToCSV(allKeywords, 'bulk_pinterest_keywords');
    downloadFile(csv, `bulk_pinterest_keywords_${allKeywords.length}.csv`, 'text/csv');
    onShowToast(`Exported ${allKeywords.length} keywords from bulk queue!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              Batch Product Image Analysis Queue
            </h3>
            <p className="text-xs text-slate-400">Upload up to 5 product photos simultaneously for sequential AI keyword extraction</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              + Add Product Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              className="hidden"
            />

            <button
              onClick={processBulkQueue}
              disabled={isProcessing || items.length === 0}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all border ${
                isProcessing || items.length === 0
                  ? 'bg-slate-800 text-slate-500 border-slate-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/20 shadow-rose-950/40'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Run Bulk Analysis ({items.length})
            </button>
          </div>
        </div>

        {/* List of Queue items */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
              <Upload className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No images in bulk queue yet. Click "+ Add Product Photos" above to select multiple files.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 relative">
                  <img src={item.previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.file.name}</p>
                    <p className="text-[10px] text-slate-400">{(item.file.size / 1024).toFixed(0)} KB</p>

                    <div className="mt-2">
                      {item.status === 'pending' && <span className="text-[10px] text-amber-400 font-mono">Pending...</span>}
                      {item.status === 'processing' && <span className="text-[10px] text-rose-400 font-mono animate-pulse">Processing AI...</span>}
                      {item.status === 'completed' && <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Done ({item.record?.keywords?.length} KWs)</span>}
                      {item.status === 'error' && <span className="text-[10px] text-rose-500 font-mono">Error: {item.errorMsg}</span>}
                    </div>
                  </div>

                  {!isProcessing && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.some(i => i.status === 'completed') && (
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleExportAllBulkCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Combined Bulk CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
