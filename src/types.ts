export type NavView = 'dashboard' | 'analyzer' | 'bulk' | 'history' | 'favorites' | 'templates' | 'settings';

export interface KeywordItem {
  id: string;
  keyword: string;
  category: 
    | 'Primary'
    | 'Secondary'
    | 'Long Tail'
    | 'Short Tail'
    | 'Seasonal'
    | 'Evergreen'
    | 'Trending'
    | 'Low Competition'
    | 'High Volume'
    | 'Buyer Intent'
    | 'Informational'
    | 'Commercial'
    | 'Brand-safe';
  intent: 
    | 'Informational'
    | 'Inspirational'
    | 'Shopping'
    | 'DIY'
    | 'Tutorial'
    | 'Gift'
    | 'Decor'
    | 'Fashion'
    | 'Hair'
    | 'Lifestyle'
    | 'Seasonal'
    | 'Event'
    | 'Holiday'
    | 'Wedding'
    | 'Home'
    | 'Kids'
    | 'Women\'s Fashion'
    | 'Men\'s Fashion'
    | 'Digital Product'
    | 'Printable'
    | 'SVG'
    | 'PNG'
    | 'Craft';
  popularityScore: number; // 1-100
  competitionScore: number; // 1-100
  competitionLevel: 'Low' | 'Medium' | 'High';
  difficulty: number; // 1-100
  estimatedSearchVolume: string; // e.g., "24.5k/mo"
  trendScore: number; // 1-100
  evergreenScore: number; // 1-100
  commercialValue: number; // 1-100
  clickPotential: number; // 1-100
  savePotential: number; // 1-100
  rankingOpportunity: 'Easy' | 'Moderate' | 'Hard';
  isFavorite?: boolean;
  notes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ImageAnalysisData {
  productName: string;
  mainObject: string;
  objectsDetected: string[];
  materials: string[];
  colors: ColorSwatch[];
  patterns: string[];
  designStyle: string;
  targetAudience: string;
  productUse: string;
  category: string;
  subCategory: string;
  season: string;
  occasion: string;
  aesthetic: string;
  interiorStyle?: string;
  fashionStyle?: string;
  hairStyle?: string;
  searchIntent: string;
  emotionalAppeal: string;
  trendingNiche: string;
  pinterestNiche: string;
  visualQualityScore: number; // 1-100
  commercialPotential: number; // 1-100
  estimatedPinterestDemand: 'Low' | 'Medium' | 'High' | 'Viral';
}

export interface VisualScores {
  imageQualityScore: number;
  brightness: number;
  contrast: number;
  colorHarmony: number;
  backgroundQuality: number;
  compositionScore: number;
  clickabilityScore: number;
  pinterestFriendlyScore: number;
  visualNotes: string;
}

export interface BoardSuggestion {
  boardName: string;
  category: string;
  description: string;
  targetPins: number;
}

export interface RichPinSuggestion {
  type: string;
  title: string;
  priceOrAvailability?: string;
  structuredData: string;
}

export interface PinStyleRecommendation {
  format: string;
  ratio: string;
  textOverlayTip: string;
  colorTip: string;
}

export interface SeoSuggestions {
  titles: string[];
  descriptions: string[];
  altText: string[];
  boardSuggestions: BoardSuggestion[];
  categories: string[];
  topicIdeas: string[];
  richPinSuggestions: RichPinSuggestion[];
  pinStyleRecommendation: PinStyleRecommendation;
}

export interface ContentIdeas {
  pinterestTitles: string[]; // 10
  pinterestDescriptions: string[]; // 10
  ctaIdeas: string[]; // 10
  pinHooks: string[]; // 10
  blogIdeas: string[]; // 20
  articleIdeas: string[]; // 20
  socialMediaCaptions: string[]; // 20
}

export interface HashtagItem {
  tag: string;
  volumeCategory: 'High' | 'Medium' | 'Low';
}

export interface HashtagData {
  highVolume: string[];
  mediumVolume: string[];
  lowCompetition: string[];
}

export interface CompetitorAnalysis {
  popularWording: string[];
  popularKeywords: string[];
  popularCategories: string[];
  popularThemes: string[];
  popularAesthetics: string[];
  competitorInsights: string;
}

export interface TrendAnalysis {
  currentSeasonRelevance: string;
  imageStyleMatch: string;
  pinterestTrends: string[];
  evergreenTrends: string[];
  growthPrediction: string;
}

export interface AnalysisRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  imageDataUrl: string;
  promptTemplate?: string;
  imageAnalysis: ImageAnalysisData;
  visualScores: VisualScores;
  keywords: KeywordItem[];
  seo: SeoSuggestions;
  contentIdeas: ContentIdeas;
  hashtags: HashtagData;
  competitors: CompetitorAnalysis;
  trends: TrendAnalysis;
  isFavorite?: boolean;
  customNotes?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  niche: string;
  systemFocus: string;
}

export interface PinterestAccount {
  id: string;       // unique local ID (uuid)
  name: string;     // user-defined label e.g. "Shop Account", "Personal"
  accessToken: string;
}

export interface UserSettings {
  customApiKey: string;
  pinterestAccessToken?: string;   // legacy – kept for backward compat
  pinterestAccounts?: PinterestAccount[];
  themeAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'violet';
  defaultExportFormat: 'txt' | 'csv' | 'json' | 'md';
  autoSaveHistory: boolean;
  defaultKeywordCount: number;
}
