import { AnalysisRecord, KeywordItem } from '../types';

/**
 * Download a string content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format keywords into CSV format
 */
export function exportKeywordsToCSV(keywords: KeywordItem[], title: string = 'pinterest_keywords'): string {
  const headers = [
    'Keyword',
    'Category',
    'Search Intent',
    'Popularity Score (1-100)',
    'Competition Score (1-100)',
    'Competition Level',
    'Pinterest Difficulty',
    'Est. Search Volume',
    'Trend Score',
    'Evergreen Score',
    'Commercial Value',
    'Click Potential',
    'Save Potential',
    'Ranking Opportunity',
    'Notes'
  ];

  const rows = keywords.map(k => [
    `"${(k.keyword || '').replace(/"/g, '""')}"`,
    `"${k.category || ''}"`,
    `"${k.intent || ''}"`,
    k.popularityScore,
    k.competitionScore,
    `"${k.competitionLevel || ''}"`,
    k.difficulty,
    `"${k.estimatedSearchVolume || ''}"`,
    k.trendScore,
    k.evergreenScore,
    k.commercialValue,
    k.clickPotential,
    k.savePotential,
    `"${k.rankingOpportunity || ''}"`,
    `"${(k.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export full analysis to formatted Markdown
 */
export function exportAnalysisToMarkdown(record: AnalysisRecord): string {
  const { imageAnalysis, visualScores, keywords, seo, contentIdeas, hashtags, competitors, trends } = record;

  let md = `# Pinterest SEO Analysis: ${record.title}\n\n`;
  md += `*Generated on: ${new Date(record.createdAt).toLocaleString()}*\n\n`;

  md += `## 📷 Product Overview\n`;
  md += `- **Product Name**: ${imageAnalysis.productName}\n`;
  md += `- **Main Object**: ${imageAnalysis.mainObject}\n`;
  md += `- **Category**: ${imageAnalysis.category} > ${imageAnalysis.subCategory}\n`;
  md += `- **Target Audience**: ${imageAnalysis.targetAudience}\n`;
  md += `- **Aesthetic & Style**: ${imageAnalysis.aesthetic} | ${imageAnalysis.designStyle}\n`;
  md += `- **Season & Occasion**: ${imageAnalysis.season} | ${imageAnalysis.occasion}\n`;
  md += `- **Visual Quality**: ${imageAnalysis.visualQualityScore}/100 | **Commercial Potential**: ${imageAnalysis.commercialPotential}/100\n`;
  md += `- **Pinterest Demand**: ${imageAnalysis.estimatedPinterestDemand}\n\n`;

  md += `### Color Palette\n`;
  imageAnalysis.colors?.forEach(c => {
    md += `- \`${c.hex}\` **${c.name}**\n`;
  });
  md += `\n`;

  md += `## 🎨 Visual Quality Scores\n`;
  md += `- Quality Score: ${visualScores.imageQualityScore}/100\n`;
  md += `- Brightness: ${visualScores.brightness}/100 | Contrast: ${visualScores.contrast}/100\n`;
  md += `- Color Harmony: ${visualScores.colorHarmony}/100 | Background: ${visualScores.backgroundQuality}/100\n`;
  md += `- Clickability: ${visualScores.clickabilityScore}/100 | Pinterest-Friendly: ${visualScores.pinterestFriendlyScore}/100\n`;
  md += `> **Visual Tip**: ${visualScores.visualNotes}\n\n`;

  md += `## 🔑 Top Keywords (${keywords.length} Total)\n\n`;
  md += `| Keyword | Category | Intent | Search Vol | Pop. Score | Comp. Level | Rank Opp |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  keywords.forEach(k => {
    md += `| ${k.keyword} | ${k.category} | ${k.intent} | ${k.estimatedSearchVolume} | ${k.popularityScore} | ${k.competitionLevel} | ${k.rankingOpportunity} |\n`;
  });
  md += `\n`;

  md += `## 🚀 Pinterest SEO Suggestions\n\n`;
  md += `### SEO Titles\n`;
  seo.titles?.forEach(t => md += `- ${t}\n`);
  md += `\n### SEO Descriptions\n`;
  seo.descriptions?.forEach(d => md += `- ${d}\n\n`);
  md += `### Recommended Board Names\n`;
  seo.boardSuggestions?.forEach(b => md += `- **${b.boardName}** (${b.category}): ${b.description}\n`);
  md += `\n`;

  md += `## 💡 Content Ideas\n\n`;
  md += `### Pin Headlines (Text Overlay Hooks)\n`;
  contentIdeas.pinHooks?.forEach(h => md += `- ${h}\n`);
  md += `\n### Blog Post Ideas\n`;
  contentIdeas.blogIdeas?.forEach(b => md += `- ${b}\n`);
  md += `\n### Call to Action (CTA) Ideas\n`;
  contentIdeas.ctaIdeas?.forEach(c => md += `- ${c}\n`);
  md += `\n`;

  md += `## #️⃣ Pinterest Hashtags\n\n`;
  md += `**High Volume**: ${hashtags.highVolume?.join(' ')}\n\n`;
  md += `**Medium Volume**: ${hashtags.mediumVolume?.join(' ')}\n\n`;
  md += `**Low Competition**: ${hashtags.lowCompetition?.join(' ')}\n\n`;

  md += `## 📈 Competitor & Trend Insights\n\n`;
  md += `**Competitor Phrases**: ${competitors.popularWording?.join(', ')}\n\n`;
  md += `**Pinterest Trends**: ${trends.pinterestTrends?.join(', ')}\n\n`;
  md += `> **Growth Prediction**: ${trends.growthPrediction}\n`;

  return md;
}

/**
 * Format keywords into simple line-separated text
 */
export function exportKeywordsToTXT(keywords: KeywordItem[]): string {
  return keywords.map(k => `${k.keyword} [Intent: ${k.intent}, Cat: ${k.category}, Vol: ${k.estimatedSearchVolume}]`).join('\n');
}

/**
 * Copy text to clipboard and trigger optional callback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
