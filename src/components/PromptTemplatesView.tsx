import React, { useState } from 'react';
import { PromptTemplate } from '../types';
import { Sliders, Plus, Trash2, Check, Edit2 } from 'lucide-react';

interface PromptTemplatesViewProps {
  templates: PromptTemplate[];
  onSaveTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PromptTemplatesView: React.FC<PromptTemplatesViewProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onShowToast
}) => {
  const [editingTemplate, setEditingTemplate] = useState<Partial<PromptTemplate> | null>(null);

  const handleAddNew = () => {
    setEditingTemplate({
      id: `tmpl-${Date.now()}`,
      name: '',
      description: '',
      niche: 'E-Commerce',
      systemFocus: ''
    });
  };

  const handleSave = () => {
    if (!editingTemplate?.name || !editingTemplate?.systemFocus) {
      onShowToast('Please provide a template name and instructions.', 'error');
      return;
    }
    onSaveTemplate(editingTemplate as PromptTemplate);
    onShowToast('Prompt template saved!', 'success');
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              Niche Prompt Tuning Templates ({templates.length})
            </h3>
            <p className="text-xs text-slate-400">Instruct Gemini AI to focus on specific niche search terms (e.g., Etsy SVGs, Lookbooks, Home decor)</p>
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
          >
            <Plus className="w-4 h-4" /> Create Custom Template
          </button>
        </div>

        {/* Modal/Form if editing */}
        {editingTemplate && (
          <div className="bg-slate-950 border border-slate-700 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-white">
              {editingTemplate.id ? 'Edit Template' : 'New Template'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder="e.g., Etsy SVG Cut Files Focus"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Niche</label>
                <input
                  type="text"
                  value={editingTemplate.niche || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, niche: e.target.value })}
                  placeholder="e.g., Crafts & Digital"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="Short summary of what this template targets"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">System Instruction Focus for AI</label>
                <textarea
                  value={editingTemplate.systemFocus || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, systemFocus: e.target.value })}
                  rows={3}
                  placeholder="Instructions for Gemini on keyword priorities, search intents, and tone..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Save Template
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{tmpl.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {tmpl.niche}
                </span>
              </div>
              <p className="text-xs text-slate-400">{tmpl.description}</p>
              <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 font-mono italic">
                "{tmpl.systemFocus}"
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingTemplate(tmpl)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteTemplate(tmpl.id)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
