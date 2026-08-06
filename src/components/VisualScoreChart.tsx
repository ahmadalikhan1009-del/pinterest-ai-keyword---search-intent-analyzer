import React from 'react';
import { VisualScores } from '../types';
import { Sparkles, Image, ShieldAlert, Eye, ThumbsUp, Palette } from 'lucide-react';

interface VisualScoreChartProps {
  scores: VisualScores;
}

export const VisualScoreChart: React.FC<VisualScoreChartProps> = ({ scores }) => {
  const metrics = [
    { label: 'Overall Quality', score: scores.imageQualityScore, icon: Image, color: 'from-emerald-500 to-teal-400' },
    { label: 'Pinterest-Friendly (2:3 Ratio)', score: scores.pinterestFriendlyScore, icon: ThumbsUp, color: 'from-rose-500 to-pink-500' },
    { label: 'Clickability Potential', score: scores.clickabilityScore, icon: Eye, color: 'from-amber-500 to-yellow-400' },
    { label: 'Color Harmony', score: scores.colorHarmony, icon: Palette, color: 'from-violet-500 to-purple-400' },
    { label: 'Brightness Balance', score: scores.brightness, icon: Sparkles, color: 'from-cyan-500 to-blue-400' },
    { label: 'Composition & Framing', score: scores.compositionScore, icon: ShieldAlert, color: 'from-indigo-500 to-sky-400' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            Visual Analysis & Pin Optimization Scores
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">AI evaluation of visual composition for Pinterest feed ranking</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
          Avg Score: {Math.round((scores.imageQualityScore + scores.pinterestFriendlyScore + scores.clickabilityScore) / 3)}/100
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-xs font-bold text-white">{item.score}/100</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {scores.visualNotes && (
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block mb-0.5">Visual Optimizer Recommendation</span>
            <p className="leading-relaxed text-slate-300">{scores.visualNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
};
