import React, { useState, useEffect } from 'react';
import { 
  AnalysisRecord, 
  KeywordItem, 
  PromptTemplate, 
  UserSettings,
  NavView 
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { AnalyzerView } from './components/AnalyzerView';
import { BulkAnalyzerView } from './components/BulkAnalyzerView';
import { HistoryView } from './components/HistoryView';
import { FavoritesView } from './components/FavoritesView';
import { PromptTemplatesView } from './components/PromptTemplatesView';
import { SettingsModal } from './components/SettingsModal';
import { 
  getStoredAnalyses, 
  saveAnalysis, 
  deleteAnalysis, 
  duplicateAnalysis, 
  getUserSettings, 
  saveUserSettings, 
  getPromptTemplates, 
  savePromptTemplate, 
  deletePromptTemplate, 
  getFavoriteKeywords, 
  toggleFavoriteKeyword 
} from './lib/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [favoriteKeywords, setFavoriteKeywords] = useState<KeywordItem[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Data Load
  useEffect(() => {
    const loadedRecords = getStoredAnalyses();
    setRecords(loadedRecords);
    if (loadedRecords.length > 0) {
      setSelectedRecord(loadedRecords[0]);
    }
    setFavoriteKeywords(getFavoriteKeywords());
    setPromptTemplates(getPromptTemplates());
    setUserSettings(getUserSettings());
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Record Handlers
  const handleAnalysisComplete = (newRecord: AnalysisRecord) => {
    saveAnalysis(newRecord);
    setRecords(getStoredAnalyses());
    setSelectedRecord(newRecord);
  };

  const handleDeleteRecord = (id: string) => {
    deleteAnalysis(id);
    const updated = getStoredAnalyses();
    setRecords(updated);
    if (selectedRecord?.id === id) {
      setSelectedRecord(updated[0] || null);
    }
    showToast('Analysis deleted', 'info');
  };

  const handleDuplicateRecord = (id: string) => {
    const dup = duplicateAnalysis(id);
    if (dup) {
      setRecords(getStoredAnalyses());
      setSelectedRecord(dup);
      showToast('Analysis duplicated', 'success');
    }
  };

  const handleRenameRecord = (id: string, newTitle: string) => {
    const target = records.find(r => r.id === id);
    if (target) {
      const updated = { ...target, title: newTitle };
      saveAnalysis(updated);
      setRecords(getStoredAnalyses());
      if (selectedRecord?.id === id) {
        setSelectedRecord(updated);
      }
    }
  };

  const handleSelectRecord = (record: AnalysisRecord) => {
    setSelectedRecord(record);
    setCurrentView('analyzer');
  };

  // Favorite Keywords Handler
  const handleToggleFavoriteKeyword = (kw: KeywordItem) => {
    toggleFavoriteKeyword(kw);
    const updatedFavs = getFavoriteKeywords();
    setFavoriteKeywords(updatedFavs);

    // Update state in active record
    if (selectedRecord) {
      const isFavNow = updatedFavs.some(f => f.keyword.toLowerCase() === kw.keyword.toLowerCase());
      const updatedKws = selectedRecord.keywords.map(k => 
        k.keyword.toLowerCase() === kw.keyword.toLowerCase() ? { ...k, isFavorite: isFavNow } : k
      );
      const updatedRecord = { ...selectedRecord, keywords: updatedKws };
      setSelectedRecord(updatedRecord);
      saveAnalysis(updatedRecord);
      setRecords(getStoredAnalyses());
    }
  };

  // Prompt Templates Handler
  const handleSavePromptTemplate = (template: PromptTemplate) => {
    savePromptTemplate(template);
    setPromptTemplates(getPromptTemplates());
  };

  const handleDeletePromptTemplate = (id: string) => {
    deletePromptTemplate(id);
    setPromptTemplates(getPromptTemplates());
    showToast('Prompt template deleted', 'info');
  };

  // User Settings Handler
  const handleSaveSettings = (newSettings: UserSettings) => {
    saveUserSettings(newSettings);
    setUserSettings(newSettings);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setRecords([]);
    setSelectedRecord(null);
    setFavoriteKeywords([]);
    showToast('All local storage data cleared.', 'info');
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-200 font-sans antialiased overflow-hidden">
      {/* Toast Manager */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        analysisCount={records.length}
        favoriteKeywordCount={favoriteKeywords.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <Header
          currentView={currentView}
          onSelectView={setCurrentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasCustomKey={!!userSettings.customApiKey}
        />

        {/* View Router Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentView === 'dashboard' && (
            <DashboardView
              records={records}
              onSelectRecord={handleSelectRecord}
              onNavigate={setCurrentView}
              onDeleteRecord={handleDeleteRecord}
              favoriteKeywordCount={favoriteKeywords.length}
            />
          )}

          {currentView === 'analyzer' && (
            <AnalyzerView
              promptTemplates={promptTemplates}
              selectedRecord={selectedRecord}
              onAnalysisComplete={handleAnalysisComplete}
              onToggleFavoriteKeyword={handleToggleFavoriteKeyword}
              onShowToast={showToast}
              customApiKey={userSettings.customApiKey}
              pinterestAccessToken={userSettings.pinterestAccessToken}
              pinterestAccounts={userSettings.pinterestAccounts || []}
            />
          )}

          {currentView === 'bulk' && (
            <BulkAnalyzerView
              promptTemplates={promptTemplates}
              onAnalysisComplete={handleAnalysisComplete}
              onShowToast={showToast}
              customApiKey={userSettings.customApiKey}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onDuplicateRecord={handleDuplicateRecord}
              onRenameRecord={handleRenameRecord}
              onShowToast={showToast}
            />
          )}

          {currentView === 'favorites' && (
            <FavoritesView
              favoriteKeywords={favoriteKeywords}
              onToggleFavorite={handleToggleFavoriteKeyword}
              onShowToast={showToast}
            />
          )}

          {currentView === 'templates' && (
            <PromptTemplatesView
              templates={promptTemplates}
              onSaveTemplate={handleSavePromptTemplate}
              onDeleteTemplate={handleDeletePromptTemplate}
              onShowToast={showToast}
            />
          )}

          {currentView === 'settings' && (
            <SettingsModal
              settings={userSettings}
              onSaveSettings={handleSaveSettings}
              onClearAllData={handleClearAllData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
