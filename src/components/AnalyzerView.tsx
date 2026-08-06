import React, { useState, useRef } from 'react';
import { AnalysisRecord, KeywordItem, PromptTemplate, NavView, PinterestAccount } from '../types';
import { 
  ImagePlus, 
  Sparkles, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Copy, 
  Download, 
  Check, 
  Star, 
  Tag, 
  Sliders, 
  Eye, 
  Palette, 
  ShoppingBag, 
  HelpCircle, 
  Flame, 
  TrendingUp, 
  Printer, 
  Layers,
  ArrowRight,
  Info,
  Send,
  ChevronDown,
  ExternalLink,
  Link2
} from 'lucide-react';
import { KeywordTable } from './KeywordTable';
import { VisualScoreChart } from './VisualScoreChart';
import { exportKeywordsToCSV, exportKeywordsToTXT, exportAnalysisToMarkdown, downloadFile, copyToClipboard } from '../lib/export';

interface AnalyzerViewProps {
  promptTemplates: PromptTemplate[];
  selectedRecord: AnalysisRecord | null;
  onAnalysisComplete: (record: AnalysisRecord) => void;
  onToggleFavoriteKeyword: (kw: KeywordItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  customApiKey?: string;
  pinterestAccessToken?: string;  // legacy
  pinterestAccounts?: PinterestAccount[];
}

type TabType = 'overview' | 'keywords' | 'pin_generator' | 'seo' | 'content' | 'hashtags' | 'competitors' | 'visual';

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  promptTemplates,
  selectedRecord,
  onAnalysisComplete,
  onToggleFavoriteKeyword,
  onShowToast,
  customApiKey,
  pinterestAccessToken,
  pinterestAccounts = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [imagePreview, setImagePreview] = useState<string | null>(selectedRecord?.imageDataUrl || null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(promptTemplates[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(selectedRecord);

  // Pinterest publish state
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [pinterestBoards, setPinterestBoards] = useState<{id: string; name: string}[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [affiliateLink, setAffiliateLink] = useState<string>('');
  const [isFetchingBoards, setIsFetchingBoards] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [boardsLoaded, setBoardsLoaded] = useState(false);

  // Resolve the token to use: prefer selected account from pinterestAccounts, fall back to legacy single token
  const allAccounts: PinterestAccount[] = pinterestAccounts.length > 0
    ? pinterestAccounts
    : (pinterestAccessToken ? [{ id: 'legacy', name: 'My Pinterest Account', accessToken: pinterestAccessToken }] : []);
  const activeToken = allAccounts.find(a => a.id === selectedAccountId)?.accessToken || '';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Pinterest boards for the currently selected account
  const handleFetchBoards = async () => {
    if (!activeToken) {
      onShowToast('Please select a Pinterest account first.', 'error');
      return;
    }
    setIsFetchingBoards(true);
    setBoardsLoaded(false);
    setPinterestBoards([]);
    setSelectedBoardId('');
    try {
      const res = await fetch('/api/pinterest/boards', {
        headers: { 'x-pinterest-token': activeToken }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const boards = (data.items || []).map((b: any) => ({ id: b.id, name: b.name }));
      setPinterestBoards(boards);
      if (boards.length > 0) setSelectedBoardId(boards[0].id);
      setBoardsLoaded(true);
    } catch (err: any) {
      onShowToast('Failed to load boards: ' + err.message, 'error');
    } finally {
      setIsFetchingBoards(false);
    }
  };

  // Publish pin to Pinterest
  const handlePublishPin = async (title: string, description: string, altText: string) => {
    if (!activeToken) {
      onShowToast('Please select a Pinterest account in Settings.', 'error');
      return;
    }
    if (!selectedBoardId) {
      onShowToast('Please select a Pinterest board first.', 'error');
      return;
    }
    if (!currentRecord?.imageDataUrl) {
      onShowToast('No image available to publish.', 'error');
      return;
    }
    setIsPublishing(true);
    setPublishSuccess(null);
    setPublishError(null);
    try {
      const imageBase64 = currentRecord.imageDataUrl;
      const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
      const res = await fetch('/api/pinterest/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pinterest-token': activeToken
        },
        body: JSON.stringify({ boardId: selectedBoardId, title, description, altText, imageBase64, mimeType, affiliateLink })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPublishSuccess(`https://pinterest.com/pin/${data.pin?.id}`);
      onShowToast('Pin published to Pinterest!', 'success');
    } catch (err: any) {
      setPublishError(err.message);
      onShowToast('Failed to publish: ' + err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Synchronize when parent passes a new record
  React.useEffect(() => {
    if (selectedRecord) {
      setCurrentRecord(selectedRecord);
      setImagePreview(selectedRecord.imageDataUrl);
    }
  }, [selectedRecord]);

  // Image Upload Handler with client-side compression
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Run AI Analysis
  const runAnalysis = async () => {
    if (!imagePreview) {
      onShowToast('Please upload a product image first.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress('Uploading image to AI Vision Engine...');

    try {
      const templateObj = promptTemplates.find(t => t.id === selectedTemplateId);
      const templateFocus = templateObj ? `${templateObj.name}: ${templateObj.systemFocus}` : '';

      setAnalysisProgress('Extracting materials, design style, and color palette...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          promptTemplate: templateFocus,
          customApiKey
        })
      });

      setAnalysisProgress('Generating 50 Pinterest keywords & intent metrics...');

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze product image.');
      }

      const resultData = await response.json();

      setAnalysisProgress('Finalizing SEO titles, board ideas, and hashtags...');

      const newRecord: AnalysisRecord = {
        id: `analysis-${Date.now()}`,
        title: resultData.imageAnalysis?.productName || 'Product Image Analysis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageDataUrl: imagePreview,
        promptTemplate: templateObj?.name,
        imageAnalysis: resultData.imageAnalysis,
        visualScores: resultData.visualScores,
        keywords: (resultData.keywords || []).map((k: any, i: number) => ({
          ...k,
          id: `kw-${Date.now()}-${i}`,
          isFavorite: false
        })),
        seo: resultData.seo,
        contentIdeas: resultData.contentIdeas,
        hashtags: resultData.hashtags,
        competitors: resultData.competitors,
        trends: resultData.trends
      };

      setCurrentRecord(newRecord);
      onAnalysisComplete(newRecord);
      setActiveTab('overview');
      onShowToast('Image Analysis Complete! 50 Keywords generated.', 'success');
    } catch (err: any) {
      console.error('Analysis error:', err);
      const msg = err.message || 'Error occurred during AI image analysis.';
      setAnalysisError(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  // Export actions
  const handleExportCSV = () => {
    if (!currentRecord) return;
    const csv = exportKeywordsToCSV(currentRecord.keywords, currentRecord.title);
    downloadFile(csv, `${currentRecord.title.replace(/\s+/g, '_')}_keywords.csv`, 'text/csv');
    onShowToast('Exported CSV successfully!', 'success');
  };

  const handleExportJSON = () => {
    if (!currentRecord) return;
    const jsonStr = JSON.stringify(currentRecord, null, 2);
    downloadFile(jsonStr, `${currentRecord.title.replace(/\s+/g, '_')}_analysis.json`, 'application/json');
    onShowToast('Exported JSON file!', 'success');
  };

  const handleExportMD = () => {
    if (!currentRecord) return;
    const md = exportAnalysisToMarkdown(currentRecord);
    downloadFile(md, `${currentRecord.title.replace(/\s+/g, '_')}_report.md`, 'text/markdown');
    onShowToast('Exported Markdown report!', 'success');
  };

  const handleExportTXT = () => {
    if (!currentRecord) return;
    const txt = exportKeywordsToTXT(currentRecord.keywords);
    downloadFile(txt, `${currentRecord.title.replace(/\s+/g, '_')}_keywords.txt`, 'text/plain');
    onShowToast('Exported TXT keywords file!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySection = async (textArray: string[], sectionName: string) => {
    const text = textArray.join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      onShowToast(`Copied ${sectionName} to clipboard!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Setup Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Drag Drop Area */}
          <div className="lg:col-span-7">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                imagePreview
                  ? 'border-rose-500/50 bg-slate-950/80 hover:border-rose-400'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {imagePreview ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-slate-700 shadow-xl bg-slate-900 shrink-0"
                  />
                  <div className="space-y-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                      Product Photo Loaded
                    </span>
                    <h3 className="text-sm font-bold text-white">Ready for AI Pinterest Analysis</h3>
                    <p className="text-xs text-slate-400">Click or drag a new image to replace the current photo.</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Add new image for analysis</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WebP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls & Run Button */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Select Niche Prompt Tuning
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
              >
                {promptTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.niche})</option>
                ))}
              </select>
            </div>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !imagePreview}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all duration-200 border ${
                isAnalyzing || !imagePreview
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white border-rose-400/20 hover:from-rose-500 hover:to-amber-400 active:scale-95 shadow-rose-950/50'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  Analyzing Image with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Generate 50 Pinterest Keywords & SEO
                </>
              )}
            </button>

            {isAnalyzing && (
              <div className="p-3 rounded-xl bg-[#0c0c0e] border border-white/10 text-xs text-slate-300 space-y-1.5 animate-pulse">
                <div className="flex justify-between font-mono text-[11px] text-rose-400 font-bold">
                  <span>AI Engine Status</span>
                  <span>Processing...</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">{analysisProgress}</p>
              </div>
            )}

            {analysisError && !isAnalyzing && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <Info className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Analysis Error</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{analysisError}</p>
                <button
                  onClick={runAnalysis}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Output Section */}
      {currentRecord && (
        <div className="space-y-6">
          {/* Export Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white truncate">{currentRecord.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {currentRecord.keywords?.length || 0} Keywords
              </span>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
              </button>
              <button
                onClick={handleExportTXT}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" /> TXT
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" /> JSON
              </button>
              <button
                onClick={handleExportMD}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-violet-400" /> Markdown
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" /> Print/PDF
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
            {[
              { id: 'overview' as TabType, label: 'Overview & Attributes', icon: Eye },
              { id: 'keywords' as TabType, label: `50 Keywords (${currentRecord.keywords?.length || 0})`, icon: Tag },
              { id: 'pin_generator' as TabType, label: 'Best Pin Generator', icon: Sparkles },
              { id: 'seo' as TabType, label: 'SEO & Board Suggestions', icon: Sparkles },
              { id: 'content' as TabType, label: 'Content Ideas & Hooks', icon: Layers },
              { id: 'hashtags' as TabType, label: '50 Pinterest Hashtags', icon: Tag },
              { id: 'competitors' as TabType, label: 'Competitors & Trends', icon: TrendingUp },
              { id: 'visual' as TabType, label: 'Visual Quality Scores', icon: Palette }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Info Card */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-rose-400" />
                    Product & Visual Attributes
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    currentRecord.imageAnalysis?.estimatedPinterestDemand === 'Viral'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    Pinterest Demand: {currentRecord.imageAnalysis?.estimatedPinterestDemand || 'High'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Product Name</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.productName}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Category / Sub-Category</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.category} &gt; {currentRecord.imageAnalysis?.subCategory}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Target Customer Persona</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.targetAudience}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Primary Search Intent</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.searchIntent}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Aesthetic & Style</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.aesthetic} ({currentRecord.imageAnalysis?.designStyle})</p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Season & Occasion</span>
                    <p className="font-bold text-white">{currentRecord.imageAnalysis?.season} | {currentRecord.imageAnalysis?.occasion}</p>
                  </div>
                </div>

                {/* Detected Materials & Objects */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Detected Physical Materials & Elements:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRecord.imageAnalysis?.materials?.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs">
                        {m}
                      </span>
                    ))}
                    {currentRecord.imageAnalysis?.objectsDetected?.map((o, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Color Palette Swatches */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-slate-300 block">Extracted Image Color Palette:</span>
                  <div className="flex flex-wrap gap-3">
                    {currentRecord.imageAnalysis?.colors?.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <div
                          className="w-6 h-6 rounded-lg shadow-inner border border-white/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{c.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Scores */}
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Commercial & Visual Scores
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Commercial Value</span>
                        <span className="font-mono font-bold text-emerald-400">{currentRecord.imageAnalysis?.commercialPotential}/100</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentRecord.imageAnalysis?.commercialPotential}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Visual Quality Score</span>
                        <span className="font-mono font-bold text-rose-400">{currentRecord.imageAnalysis?.visualQualityScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${currentRecord.imageAnalysis?.visualQualityScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Pinterest Clickability</span>
                        <span className="font-mono font-bold text-amber-400">{currentRecord.visualScores?.clickabilityScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentRecord.visualScores?.clickabilityScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: 50 KEYWORDS */}
          {activeTab === 'keywords' && (
            <KeywordTable
              keywords={currentRecord.keywords || []}
              onToggleFavorite={onToggleFavoriteKeyword}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB CONTENT 3: PIN GENERATOR */}
          {activeTab === 'pin_generator' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-xl">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    Optimized Pin Generator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on AI analysis, here is the ultimate ready-to-post Pinterest Pin for your product.
                  </p>
                </div>

                {(() => {
                  // Find the best High Volume + Low Competition/Easy keyword for beginners
                  const easyKeywords = currentRecord.keywords?.filter(k => k.rankingOpportunity === 'Easy' || k.competitionLevel === 'Low') || [];
                  const bestObj = easyKeywords.length > 0 
                    ? easyKeywords.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))[0] 
                    : (currentRecord.keywords?.slice().sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))[0]);
                  const bestKeyword = bestObj?.keyword || 'N/A';
                  
                  const capitalize = (str: string) => str.replace(/\b\w/g, l => l.toUpperCase());
                  const formattedKeyword = capitalize(bestKeyword);

                  // Inject the easy keyword into SEO elements
                  const originalTitle = currentRecord.seo?.titles?.[0] || '';
                  const title = originalTitle.toLowerCase().includes(bestKeyword.toLowerCase()) 
                    ? originalTitle 
                    : `${formattedKeyword} | ${originalTitle}`;
                  
                  // Combine description and hashtags, ensuring we don't exceed limits
                  const originalDesc = currentRecord.seo?.descriptions?.[0] || '';
                  const baseDesc = originalDesc.toLowerCase().includes(bestKeyword.toLowerCase())
                    ? originalDesc
                    : `Looking for ${bestKeyword}? ${originalDesc}`;

                  // Use low competition & high volume hashtags for beginners
                  const easyHashtags = [
                    ...(currentRecord.hashtags?.lowCompetition || []),
                    ...(currentRecord.hashtags?.highVolume || [])
                  ].slice(0, 5).join(' ');
                  
                  const fullDesc = `${baseDesc}\n\n${easyHashtags}`;
                  
                  const originalTags = currentRecord.seo?.topicIdeas?.join(', ') || '';
                  const tags = originalTags.toLowerCase().includes(bestKeyword.toLowerCase())
                    ? originalTags
                    : `${formattedKeyword}, ${originalTags}`;

                  const originalAlt = currentRecord.seo?.altText?.[0] || '';
                  const altText = originalAlt.toLowerCase().includes(bestKeyword.toLowerCase())
                    ? originalAlt
                    : `${formattedKeyword} - ${originalAlt}`;

                  return (
                    <div className="space-y-6">
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
                        <Flame className="w-5 h-5 text-rose-400" />
                        <div>
                          <p className="text-xs text-rose-200">Top Recommended Keyword to Target:</p>
                          <p className="text-sm font-bold text-rose-400 uppercase tracking-wide">{bestKeyword}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Title Section */}
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-300">1. Pin Title</span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(title);
                                onShowToast('Pin Title copied!', 'success');
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <p className="text-sm text-white font-medium">{title}</p>
                        </div>

                        {/* Description Section */}
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-300">2. Pin Description (with Hashtags)</span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(fullDesc);
                                onShowToast('Description copied!', 'success');
                              }}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{fullDesc}</p>
                          <p className="text-[10px] text-slate-500 text-right mt-1">{fullDesc.length} characters (Recommended: &lt; 800)</p>
                        </div>

                        {/* Tags Section */}
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-300">3. Tag Topics (Comma separated)</span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(tags);
                                onShowToast('Tags copied!', 'success');
                              }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{tags}</p>
                        </div>

                        {/* Alt Text Section */}
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-300">4. Image Alt Text (Accessibility)</span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(altText);
                                onShowToast('Alt text copied!', 'success');
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{altText}</p>
                        </div>

                        {/* Publish to Pinterest Section */}
                        <div className="bg-gradient-to-br from-rose-950/40 to-slate-950 border border-rose-500/30 p-5 rounded-xl space-y-4">
                          {/* Header */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                              <Send className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Publish to Pinterest</p>
                              <p className="text-[10px] text-slate-400">Choose account → select board → add link → publish</p>
                            </div>
                            {allAccounts.length === 0 && (
                              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30">
                                ⚠ Add account in Settings
                              </span>
                            )}
                          </div>

                          {/* Step 1: Account Selector */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[9px] font-bold flex items-center justify-center">1</span>
                              Select Pinterest Account
                            </label>
                            {allAccounts.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">No Pinterest accounts found. Go to Settings to add your accounts.</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {allAccounts.map((acc, idx) => (
                                  <button
                                    key={acc.id}
                                    onClick={() => {
                                      setSelectedAccountId(acc.id);
                                      setBoardsLoaded(false);
                                      setPinterestBoards([]);
                                      setSelectedBoardId('');
                                      setPublishSuccess(null);
                                      setPublishError(null);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                      selectedAccountId === acc.id
                                        ? 'border-rose-500/60 bg-rose-500/10 ring-1 ring-rose-500/30'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      selectedAccountId === acc.id ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-white truncate">{acc.name || `Account ${idx + 1}`}</p>
                                      <p className="text-[10px] text-slate-500">••••••••••••{acc.accessToken.slice(-6)}</p>
                                    </div>
                                    {selectedAccountId === acc.id && (
                                      <Check className="w-4 h-4 text-rose-400 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Step 2: Affiliate Link */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[9px] font-bold flex items-center justify-center">2</span>
                              <Link2 className="w-3 h-3 text-rose-400" /> Affiliate / Destination Link (Optional)
                            </label>
                            <input
                              type="url"
                              value={affiliateLink}
                              onChange={(e) => setAffiliateLink(e.target.value)}
                              placeholder="https://your-affiliate-link.com/product..."
                              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-colors"
                            />
                            {affiliateLink && (
                              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> This link will be embedded in your Pinterest pin
                              </p>
                            )}
                          </div>

                          {/* Step 3: Board Selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[9px] font-bold flex items-center justify-center">3</span>
                              Select Board
                            </label>
                            {!boardsLoaded ? (
                              <button
                                onClick={handleFetchBoards}
                                disabled={isFetchingBoards || !selectedAccountId}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 transition-colors"
                              >
                                {isFetchingBoards ? (
                                  <><span className="animate-spin">⟳</span> Loading boards...</>
                                ) : (
                                  <><ChevronDown className="w-3.5 h-3.5" /> {selectedAccountId ? 'Load boards for selected account' : 'Select an account first'}</>
                                )}
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <select
                                  value={selectedBoardId}
                                  onChange={(e) => setSelectedBoardId(e.target.value)}
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500/60"
                                >
                                  {pinterestBoards.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={handleFetchBoards}
                                  className="px-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                                  title="Reload boards"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Publish Button */}
                          <button
                            onClick={() => handlePublishPin(title, fullDesc, altText)}
                            disabled={isPublishing || !activeToken || !selectedBoardId}
                            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-rose-950/50 active:scale-95"
                          >
                            {isPublishing ? (
                              <><span className="animate-spin text-lg">⟳</span> Publishing to Pinterest...</>
                            ) : (
                              <><Send className="w-4 h-4" /> Publish Pin to Pinterest</>
                            )}
                          </button>

                          {/* Success */}
                          {publishSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-emerald-300">Pin Published Successfully!</p>
                                <a href={publishSuccess} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline flex items-center gap-1 mt-0.5">
                                  <ExternalLink className="w-3 h-3" /> View on Pinterest
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Error */}
                          {publishError && (
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                              <p className="text-xs font-bold text-rose-300">Publishing Failed</p>
                              <p className="text-[10px] text-rose-400 mt-0.5">{publishError}</p>
                            </div>
                          )}
                        </div>


                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: SEO & BOARDS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Titles & Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SEO Titles */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      Pinterest SEO Titles
                    </h3>
                    <button
                      onClick={() => handleCopySection(currentRecord.seo?.titles || [], 'SEO Titles')}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentRecord.seo?.titles?.map((title, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex justify-between items-center gap-2">
                        <span>{title}</span>
                        <button
                          onClick={async () => {
                            await copyToClipboard(title);
                            onShowToast('Title copied!', 'success');
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Descriptions */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      Pinterest SEO Descriptions
                    </h3>
                    <button
                      onClick={() => handleCopySection(currentRecord.seo?.descriptions || [], 'SEO Descriptions')}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentRecord.seo?.descriptions?.map((desc, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <p>{desc}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span>{desc.length}/500 chars</span>
                          <button
                            onClick={async () => {
                              await copyToClipboard(desc);
                              onShowToast('Description copied!', 'success');
                            }}
                            className="text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Board Suggestions */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Recommended Pinterest Board Architecture
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentRecord.seo?.boardSuggestions?.map((board, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{board.boardName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          ~{board.targetPins} Pins
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{board.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: CONTENT IDEAS */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pin Text Hooks */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" /> 10 Pin Overlay Hooks
                    </h3>
                    <button onClick={() => handleCopySection(currentRecord.contentIdeas?.pinHooks || [], 'Hooks')} className="text-xs text-rose-400">Copy All</button>
                  </div>
                  <div className="space-y-1.5">
                    {currentRecord.contentIdeas?.pinHooks?.map((hook, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold">
                        {i + 1}. {hook}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Ideas */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" /> 10 Call-To-Action Phrases
                    </h3>
                    <button onClick={() => handleCopySection(currentRecord.contentIdeas?.ctaIdeas || [], 'CTAs')} className="text-xs text-emerald-400">Copy All</button>
                  </div>
                  <div className="space-y-1.5">
                    {currentRecord.contentIdeas?.ctaIdeas?.map((cta, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono">
                        👉 {cta}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Captions & Blog Headlines */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" /> 20 Blog Headlines & Captions
                  </h3>
                  <button onClick={() => handleCopySection(currentRecord.contentIdeas?.blogIdeas || [], 'Blog Ideas')} className="text-xs text-amber-400">Copy All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {currentRecord.contentIdeas?.blogIdeas?.map((blog, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      {i + 1}. {blog}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 5: HASHTAGS */}
          {activeTab === 'hashtags' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-400" />
                    50 Categorized Pinterest Hashtags
                  </h3>
                  <p className="text-xs text-slate-400">High volume, medium niche, and low competition hashtags for maximum reach</p>
                </div>

                <button
                  onClick={() => {
                    const allTags = [
                      ...(currentRecord.hashtags?.highVolume || []),
                      ...(currentRecord.hashtags?.mediumVolume || []),
                      ...(currentRecord.hashtags?.lowCompetition || [])
                    ].join(' ');
                    copyToClipboard(allTags);
                    onShowToast('Copied all 50 hashtags to clipboard!', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40"
                >
                  <Copy className="w-4 h-4" /> Copy All 50 Hashtags
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* High Volume */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> High Volume (15)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRecord.hashtags?.highVolume?.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medium Volume */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Medium Niche (20)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRecord.hashtags?.mediumVolume?.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Low Competition */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Low Competition (15)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRecord.hashtags?.lowCompetition?.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 6: COMPETITORS & TRENDS */}
          {activeTab === 'competitors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Competitor Insights */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" /> Competitor Wording & Aesthetics
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {currentRecord.competitors?.competitorInsights}
                  </p>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300">Popular Competitor Phrases:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentRecord.competitors?.popularWording?.map((p, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs">
                          "{p}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trends */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Active Pinterest Trends
                  </h3>
                  <div className="space-y-2">
                    {currentRecord.trends?.pinterestTrends?.map((trend, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> {trend}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 7: VISUAL SCORES */}
          {activeTab === 'visual' && currentRecord.visualScores && (
            <VisualScoreChart scores={currentRecord.visualScores} />
          )}
        </div>
      )}
    </div>
  );
};
