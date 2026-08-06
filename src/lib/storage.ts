import { AnalysisRecord, UserSettings, PromptTemplate, KeywordItem } from '../types';
import { DEFAULT_PROMPT_TEMPLATES } from './templates';

const STORAGE_KEYS = {
  ANALYSES: 'pinterest_ai_analyses_v2',
  SETTINGS: 'pinterest_ai_settings_v1',
  TEMPLATES: 'pinterest_ai_templates_v1',
  FAVORITE_KEYWORDS: 'pinterest_ai_fav_keywords_v1'
};

export const DEFAULT_SETTINGS: UserSettings = {
  customApiKey: '',
  pinterestAccessToken: '',
  pinterestAccounts: [],
  themeAccent: 'emerald',
  defaultExportFormat: 'csv',
  autoSaveHistory: true,
  defaultKeywordCount: 100
};

// Seed sample analysis for initial clean view
const SAMPLE_ANALYSIS: AnalysisRecord = {
  id: 'sample-analysis-1',
  title: 'Minimalist Oak Wood Coffee Table',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  imageDataUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
  promptTemplate: 'Home Decor & Interior Design',
  isFavorite: true,
  imageAnalysis: {
    productName: 'Scandi Solid Oak Round Coffee Table',
    mainObject: 'Oak Wood Coffee Table',
    objectsDetected: ['Ceramic Vase', 'Linen Runner', 'Dried Pampas Grass', 'Coffee Table Book'],
    materials: ['Solid European Oak', 'Natural Linen', 'Matte Ceramic'],
    colors: [
      { name: 'Warm Oak', hex: '#D4A373' },
      { name: 'Cream Linen', hex: '#FAEDCD' },
      { name: 'Soft Olive', hex: '#CCD5AE' },
      { name: 'Matte Charcoal', hex: '#2B2D42' }
    ],
    patterns: ['Natural Wood Grain', 'Minimalist Solid'],
    designStyle: 'Japandi & Scandinavian Minimalist',
    targetAudience: 'Homeowners aged 25-45, Interior Design Enthusiasts, Home Stylists',
    productUse: 'Living Room Centerpiece, Decorative Coffee Table Display',
    category: 'Home Decor',
    subCategory: 'Living Room Furniture',
    season: 'All Season',
    occasion: 'Home Remodel & Living Room Refresh',
    aesthetic: 'Japandi Modern Farmhouse',
    interiorStyle: 'Scandinavian Organic Modern',
    searchIntent: 'Inspirational & Shopping Intent',
    emotionalAppeal: 'Serene, Warm, Cozy & Sophisticated Minimalist Home',
    trendingNiche: 'Organic Modern Living Room Furniture',
    pinterestNiche: 'Home Decor & Living Room Aesthetics',
    visualQualityScore: 94,
    commercialPotential: 96,
    estimatedPinterestDemand: 'Viral'
  },
  visualScores: {
    imageQualityScore: 95,
    brightness: 88,
    contrast: 85,
    colorHarmony: 96,
    backgroundQuality: 92,
    compositionScore: 94,
    clickabilityScore: 91,
    pinterestFriendlyScore: 97,
    visualNotes: 'High brightness neutral backdrop with strong contrast between warm wood tones and cream textiles. Perfect 2:3 vertical composition for Pinterest Pins.'
  },
  keywords: Array.from({ length: 100 }).map((_, i) => {
    const list: Partial<KeywordItem>[] = [
      { keyword: 'organic modern coffee table', category: 'Primary', intent: 'Shopping', popularityScore: 95, competitionScore: 62, competitionLevel: 'Medium', difficulty: 58, estimatedSearchVolume: '45.2k/mo', trendScore: 92, evergreenScore: 88, commercialValue: 96, clickPotential: 94, savePotential: 92, rankingOpportunity: 'Moderate' },
      { keyword: 'japandi living room decor', category: 'Primary', intent: 'Inspirational', popularityScore: 98, competitionScore: 71, competitionLevel: 'High', difficulty: 68, estimatedSearchVolume: '82.0k/mo', trendScore: 96, evergreenScore: 90, commercialValue: 91, clickPotential: 90, savePotential: 97, rankingOpportunity: 'Moderate' },
      { keyword: 'scandinavian oak round table', category: 'Long Tail', intent: 'Shopping', popularityScore: 88, competitionScore: 42, competitionLevel: 'Low', difficulty: 38, estimatedSearchVolume: '14.8k/mo', trendScore: 84, evergreenScore: 92, commercialValue: 94, clickPotential: 88, savePotential: 86, rankingOpportunity: 'Easy' },
      { keyword: 'minimalist living room ideas', category: 'High Volume', intent: 'Inspirational', popularityScore: 99, competitionScore: 85, competitionLevel: 'High', difficulty: 82, estimatedSearchVolume: '120k/mo', trendScore: 90, evergreenScore: 98, commercialValue: 85, clickPotential: 89, savePotential: 99, rankingOpportunity: 'Hard' },
      { keyword: 'how to style a round coffee table', category: 'Informational', intent: 'Tutorial', popularityScore: 91, competitionScore: 48, competitionLevel: 'Medium', difficulty: 42, estimatedSearchVolume: '28.1k/mo', trendScore: 86, evergreenScore: 95, commercialValue: 88, clickPotential: 92, savePotential: 95, rankingOpportunity: 'Easy' },
      { keyword: 'solid wood coffee table decor', category: 'Secondary', intent: 'Decor', popularityScore: 86, competitionScore: 52, competitionLevel: 'Medium', difficulty: 45, estimatedSearchVolume: '19.4k/mo', trendScore: 82, evergreenScore: 91, commercialValue: 92, clickPotential: 87, savePotential: 89, rankingOpportunity: 'Easy' },
      { keyword: 'cozy warm neutral living room', category: 'Evergreen', intent: 'Inspirational', popularityScore: 94, competitionScore: 64, competitionLevel: 'Medium', difficulty: 56, estimatedSearchVolume: '54.0k/mo', trendScore: 94, evergreenScore: 89, commercialValue: 87, clickPotential: 91, savePotential: 96, rankingOpportunity: 'Moderate' },
      { keyword: 'best coffee table for small sectional', category: 'Buyer Intent', intent: 'Shopping', popularityScore: 82, competitionScore: 35, competitionLevel: 'Low', difficulty: 32, estimatedSearchVolume: '11.2k/mo', trendScore: 80, evergreenScore: 93, commercialValue: 97, clickPotential: 89, savePotential: 84, rankingOpportunity: 'Easy' },
      { keyword: 'aesthetic living room furniture', category: 'Short Tail', intent: 'Shopping', popularityScore: 93, competitionScore: 78, competitionLevel: 'High', difficulty: 74, estimatedSearchVolume: '68.5k/mo', trendScore: 89, evergreenScore: 87, commercialValue: 92, clickPotential: 86, savePotential: 91, rankingOpportunity: 'Hard' },
      { keyword: 'natural wood home accessories', category: 'Evergreen', intent: 'Decor', popularityScore: 84, competitionScore: 40, competitionLevel: 'Low', difficulty: 36, estimatedSearchVolume: '13.1k/mo', trendScore: 78, evergreenScore: 96, commercialValue: 90, clickPotential: 83, savePotential: 88, rankingOpportunity: 'Easy' }
    ];

    const base = list[i % list.length];
    const prefixOptions = ['chic', 'luxury', 'modern', 'affordable', 'handcrafted', 'warm', 'custom', 'unique'];
    const suffixOptions = ['inspiration', 'styling tips', 'aesthetic', 'buying guide', 'setup', 'lookbook', 'must-haves'];
    
    const pref = prefixOptions[i % prefixOptions.length];
    const suff = suffixOptions[(i * 3) % suffixOptions.length];
    const kw = i < list.length ? base.keyword! : `${pref} ${base.keyword} ${suff}`;

    return {
      id: `kw-${i + 1}`,
      keyword: kw,
      category: (base.category || 'Secondary') as any,
      intent: (base.intent || 'Shopping') as any,
      popularityScore: Math.max(30, Math.min(99, (base.popularityScore || 75) + ((i * 7) % 21) - 10)),
      competitionScore: Math.max(15, Math.min(95, (base.competitionScore || 50) + ((i * 5) % 31) - 15)),
      competitionLevel: (i % 3 === 0 ? 'Low' : i % 3 === 1 ? 'Medium' : 'High') as any,
      difficulty: Math.max(20, Math.min(90, (base.difficulty || 45) + ((i * 4) % 25) - 12)),
      estimatedSearchVolume: `${(5 + (i * 1.8)).toFixed(1)}k/mo`,
      trendScore: Math.max(40, Math.min(98, 70 + ((i * 9) % 28))),
      evergreenScore: Math.max(50, Math.min(99, 80 + ((i * 3) % 20))),
      commercialValue: Math.max(55, Math.min(98, 75 + ((i * 6) % 24))),
      clickPotential: Math.max(60, Math.min(97, 78 + ((i * 8) % 20))),
      savePotential: Math.max(65, Math.min(99, 82 + ((i * 2) % 18))),
      rankingOpportunity: (i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Moderate' : 'Hard') as any,
      isFavorite: i < 5
    };
  }),
  seo: {
    titles: [
      'How to Style an Organic Modern Oak Coffee Table | Japandi Living Room',
      'The Ultimate Guide to Japandi Living Room Decor & Wood Table Setup',
      '10 Ways to Decorate a Round Oak Coffee Table for a Cozy Aesthetic',
      'Minimalist Solid Wood Coffee Table Ideas for Warm Neutral Homes',
      'Organic Modern Coffee Table Styling Hacks | Shopping & Decor Guide'
    ],
    descriptions: [
      'Transform your living room with organic modern Japandi coffee table decor. Discover round oak wood coffee tables, ceramic vases, linen textures, and warm neutral living room furniture ideas. Save this pin for your home renovation inspiration!',
      'Looking for Scandinavian minimalist coffee table styling tips? Explore solid European oak tables paired with natural textures, dried pampas grass, and coffee table books for a calm, serene living room atmosphere.',
      'Upgrade your living space with warm wood coffee table aesthetics. Simple, elegant, and functional Japandi home decor ideas that bring warmth and character into modern living rooms.',
      'Discover top-rated round wood coffee tables for small or large sectional sofas. Complete guide to styling ceramic accents, candles, and book trays.',
      'Inspirational Japandi living room coffee table setups featuring natural materials, warm neutral color palettes, and minimalist interior design trends.'
    ],
    altText: [
      'Solid oak round coffee table styled with cream ceramic vase and linen runner in a warm neutral Japandi living room.',
      'Organic modern coffee table decor featuring natural wood grain, coffee table book, and dried florals.',
      'Minimalist Scandinavian living room with round wood coffee table center piece and soft sunlight.'
    ],
    boardSuggestions: [
      { boardName: 'Japandi Living Room Decor', category: 'Home Decor', description: 'Inspiration for Japandi, Scandinavian, and organic modern home styling.', targetPins: 45 },
      { boardName: 'Coffee Table Styling Ideas', category: 'Home Decor', description: 'Trays, books, vases, and wood table arrangements.', targetPins: 30 },
      { boardName: 'Organic Modern Home Aesthetics', category: 'Home Decor', description: 'Warm neutrals, wood textures, and minimalist furniture.', targetPins: 60 },
      { boardName: 'Living Room Furniture & Remodel', category: 'Home Decor', description: 'Sofa pairings, centerpieces, and cozy room layouts.', targetPins: 50 },
      { boardName: 'Warm Neutral Interiors', category: 'Home Decor', description: 'Beige, oak, cream, and olive home color palettes.', targetPins: 40 }
    ],
    categories: ['Home Decor', 'Living Room', 'Furniture', 'Interior Design', 'Scandinavian Style'],
    topicIdeas: ['Japandi Style', 'Coffee Table Decor', 'Organic Modern', 'Living Room Ideas', 'Wood Furniture', 'Warm Neutrals', 'Home Makeover', 'Minimalist Home'],
    richPinSuggestions: [
      { type: 'Product', title: 'Scandi Solid Oak Round Coffee Table', priceOrAvailability: 'In Stock - $349', structuredData: 'Product Schema (Name, Image, Offers, Availability, PriceCurrency)' },
      { type: 'Article', title: '5 Rules of Coffee Table Decoration by Interior Stylists', priceOrAvailability: 'Blog Post Guide', structuredData: 'Article Schema (Headline, Author, Image, DatePublished)' },
      { type: 'Product', title: 'Handcrafted Ceramic Textured Vase Accent', priceOrAvailability: 'In Stock - $45', structuredData: 'Product Schema' }
    ],
    pinStyleRecommendation: {
      format: 'Vertical Standard Pin (2:3 aspect ratio, 1000x1500px)',
      ratio: '2:3',
      textOverlayTip: 'Use bold sans-serif font in top 1/3 with high-contrast semi-transparent backdrop badge (e.g. "COFFEE TABLE STYLING GUIDE").',
      colorTip: 'Pair warm oak hex #D4A373 with cream #FAEDCD text overlays for high visual harmony.'
    }
  },
  contentIdeas: {
    pinterestTitles: [
      'How to Style a Round Coffee Table Like a Designer',
      'Japandi Living Room Essentials: The Oak Coffee Table',
      '5 Organic Modern Decor Rules You Need to Know',
      'The Secret to a Warm & Cozy Minimalist Living Room',
      'Coffee Table Makeover: From Cluttered to Serene',
      '10 Round Wood Coffee Tables Under $400',
      'How to Pair a Wood Table with a Linen Sofa',
      'Organic Modern vs Scandinavian: Decor Breakdown',
      '3 Tray Formulas for Perfect Coffee Table Styling',
      'The Ultimate Neutral Living Room Shopping Guide'
    ],
    pinterestDescriptions: [
      'Learn the exact 3-item formula to style your round coffee table using height, texture, and natural materials. Tap to read the step-by-step guide!',
      'Want a calm, peaceful living room? See how organic wood textures and Japandi furniture create instant cozy vibes.',
      'Discover how to mix ceramic vases, linen runners, and books on your coffee table for effortless elegance.',
      'Stop making these 5 common coffee table styling mistakes! Read our full interior stylist review now.',
      'Explore our curated collection of solid oak coffee tables designed for warm modern homes.',
      'Minimalist coffee table decor that feels high-end without breaking the bank. Click to view product links!',
      'Find the perfect coffee table shape for your sectional sofa setup. Full size & ratio breakdown inside.',
      'Love Japandi decor? Here are 10 subtle details that turn a standard living room into a luxury retreat.',
      'Easy weekend living room refresh ideas starting with your coffee table centerpiece.',
      'Save this pin to your home decor board for your next living room remodel!'
    ],
    ctaIdeas: [
      'Tap to Shop the Look',
      'Save for Your Next Home Remodel',
      'Click to Read the Styling Guide',
      'Explore Product Details & Pricing',
      'Get 10% Off Your First Order',
      'Pin This to Your Home Board',
      'Discover More Japandi Ideas',
      'Shop Natural Wood Furniture',
      'Read Full Interior Design Blog',
      'Download Free Room Layout Checklist'
    ],
    pinHooks: [
      '5 Ways to Style This Table',
      'Before & After Coffee Table Makeover',
      'Does Your Coffee Table Look Like This?',
      '3 Items Every Coffee Table Needs',
      'Organic Modern Decor on a Budget',
      'The #1 Rule of Japandi Styling',
      'Which Coffee Table Style Are You?',
      'How to Make a Small Living Room Feel Luxurious',
      'Stop Decorating Your Table Wrong!',
      'The Ultimate Neutral Home Hack'
    ],
    blogIdeas: Array.from({ length: 20 }).map((_, i) => `Organic Modern Home Styling Guide #${i + 1}: How to Style Wood Furniture in Neutral Spaces`),
    articleIdeas: Array.from({ length: 20 }).map((_, i) => `Interior Stylist Review #${i + 1}: Selecting the Right Coffee Table Proportion for Your Living Room`),
    socialMediaCaptions: Array.from({ length: 20 }).map((_, i) => `✨ Transform your space with organic modern wood accents! Swipe left to see how we styled this solid oak centerpiece with natural ceramics and linen textures. What’s your favorite coffee table detail? Drop a comment below! 👇 #japandidecor #livingroomideas #${i + 1}`)
  },
  hashtags: {
    highVolume: ['#homedecor', '#livingroom', '#interiordesign', '#homeinspiration', '#cozyhome', '#furniture', '#decor', '#japandi', '#scandinavianhome', '#homeinspo', '#homedesign', '#interiorstyling', '#livingroomdecor', '#aesthetic', '#archdigest'],
    mediumVolume: ['#organicmodern', '#cozystyle', '#woodfurniture', '#coffeetablestyling', '#coffeetable', '#japandistyle', '#neutralhome', '#neutraldecor', '#livingroomideas', '#homemakeover', '#farmhousedecor', '#modernfarmhouse', '#roomdecor', '#aestheticdecor', '#homefinds', '#interiortrends', '#bohohome', '#minimalisthome', '#oakfurniture', '#homeaccents'],
    lowCompetition: ['#organicoaktable', '#japandicoffeetable', '#roundwoodcoffeetable', '#coffeetabletrayideas', '#neutralaestheticlivingroom', '#scandioakfurniture', '#warmneutralsinteriors', '#scandinaviandiningdecor', '#organicmodernfinds', '#japandilivingroominspo', '#customwoodfurniture', '#minimalistcoffeetable', '#handcraftedwoodtable', '#cozyjapandihome', '#warmwooddecor']
  },
  competitors: {
    popularWording: ['Organic Modern Living', 'Styling Hacks', 'Serene Japandi Space', 'Warm Neutrals Lookbook', 'Designer Coffee Table Setup', 'Effortless Home Decor', 'Solid Oak Craftsmanship', 'Minimalist Luxury'],
    popularKeywords: ['japandi living room', 'wood coffee table styling', 'organic modern furniture', 'ceramic vase decor', 'warm neutral living room'],
    popularCategories: ['Home Decor', 'Living Room Furniture', 'Interior Styling', 'DIY Home'],
    popularThemes: ['Japandi Minimalist', 'Warm Organic Modern', 'Cozy Earth Tones'],
    popularAesthetics: ['Organic Modern', 'Japandi', 'Scandinavian', 'Modern Farmhouse'],
    competitorInsights: 'Top competitors focus on 2:3 vertical pins featuring high natural lighting, subtle warm overlays, and direct benefit text hooks like "3 Rules for Styling a Round Table". Using warm neutral color overlays and high-contrast headlines will help outrank competing pins.'
  },
  trends: {
    currentSeasonRelevance: 'Peak interest during Autumn & Winter home cozying seasons, with steady year-round demand during spring home remodeling.',
    imageStyleMatch: '98% match with top trending Pinterest pins in Home Decor category (Organic Modern & Japandi aesthetics).',
    pinterestTrends: [
      'Organic Modern Furniture (+140% YoY)',
      'Japandi Living Room Ideas (+85% YoY)',
      'Warm Neutral Color Palettes (+110% YoY)',
      'Round Oak Coffee Tables (+65% YoY)',
      'Textured Ceramic Vases (+95% YoY)',
      'Minimalist Home Decor Hacks (+120% YoY)'
    ],
    evergreenTrends: [
      'Living Room Remodel',
      'Coffee Table Decor Ideas',
      'Small Space Storage Hacks',
      'Scandinavian Furniture',
      'Neutral Paint & Decor Pairs',
      'Cozy Home Inspiration'
    ],
    growthPrediction: 'Strong upward search volume projected for the next 12 months as Japandi and Organic Modern styles dominate interior design queries.'
  }
};

/**
 * Get all stored analyses
 */
export function getStoredAnalyses(): AnalysisRecord[] {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.ANALYSES);
    if (!json) {
      return [];
    }
    return JSON.parse(json);
  } catch (err) {
    console.error('Error reading stored analyses:', err);
    return [];
  }
}

/**
 * Save analysis record
 */
export function saveAnalysis(record: AnalysisRecord): void {
  try {
    const list = getStoredAnalyses();
    const existingIdx = list.findIndex(a => a.id === record.id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving analysis:', err);
  }
}

/**
 * Delete analysis by ID
 */
export function deleteAnalysis(id: string): void {
  try {
    const list = getStoredAnalyses().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(list));
  } catch (err) {
    console.error('Error deleting analysis:', err);
  }
}

/**
 * Duplicate analysis by ID
 */
export function duplicateAnalysis(id: string): AnalysisRecord | null {
  const list = getStoredAnalyses();
  const target = list.find(a => a.id === id);
  if (!target) return null;

  const newRecord: AnalysisRecord = {
    ...JSON.parse(JSON.stringify(target)),
    id: `analysis-${Date.now()}`,
    title: `${target.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  list.unshift(newRecord);
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(list));
  return newRecord;
}

/**
 * Get User Settings
 */
export function getUserSettings(): UserSettings {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!json) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save User Settings
 */
export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

/**
 * Get Prompt Templates
 */
export function getPromptTemplates(): PromptTemplate[] {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!json) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_PROMPT_TEMPLATES));
      return DEFAULT_PROMPT_TEMPLATES;
    }
    return JSON.parse(json);
  } catch (err) {
    return DEFAULT_PROMPT_TEMPLATES;
  }
}

/**
 * Save Custom Prompt Template
 */
export function savePromptTemplate(template: PromptTemplate): void {
  try {
    const list = getPromptTemplates();
    const idx = list.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      list[idx] = template;
    } else {
      list.push(template);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving template:', err);
  }
}

/**
 * Delete Custom Prompt Template
 */
export function deletePromptTemplate(id: string): void {
  try {
    const list = getPromptTemplates().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
  } catch (err) {
    console.error('Error deleting template:', err);
  }
}

/**
 * Favorite Keywords Management
 */
export function getFavoriteKeywords(): KeywordItem[] {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.FAVORITE_KEYWORDS);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    return [];
  }
}

export function toggleFavoriteKeyword(keyword: KeywordItem): void {
  try {
    const favs = getFavoriteKeywords();
    const idx = favs.findIndex(k => k.keyword.toLowerCase() === keyword.keyword.toLowerCase());
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.unshift({ ...keyword, isFavorite: true });
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITE_KEYWORDS, JSON.stringify(favs));
  } catch (err) {
    console.error('Error toggling favorite keyword:', err);
  }
}
