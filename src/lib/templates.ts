import { PromptTemplate } from '../types';

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'general-ecommerce',
    name: 'General E-Commerce & Retail',
    description: 'Optimized for physical products sold on Shopify, Amazon, or standalone online stores.',
    niche: 'E-Commerce',
    systemFocus: 'Focus heavily on high-intent buyer keywords, product use-case long-tail phrases, gift guides, and commercial category terms that convert window shoppers into buyers.'
  },
  {
    id: 'etsy-digital',
    name: 'Etsy, Digital Products & Printables',
    description: 'Tailored for wall art, planner printables, SVG cut files, PNG templates, and digital downloads.',
    niche: 'Digital Products',
    systemFocus: 'Emphasize printable, digital download, SVG, PNG, Canva template, DIY wall art, planner stickers, and instant download search intent keywords.'
  },
  {
    id: 'home-decor',
    name: 'Home Decor & Interior Design',
    description: 'Ideal for furniture, room decor, lighting, rug designs, and architectural aesthetics.',
    niche: 'Home & Decor',
    systemFocus: 'Prioritize interior design aesthetic styles (e.g. Modern Farmhouse, Japandi, Boho Chic), room layout keywords, color palette pairings, and home transformation board ideas.'
  },
  {
    id: 'fashion-apparel',
    name: 'Fashion, Outfits & Accessories',
    description: 'Designed for clothing, jewelry, bags, shoes, and seasonal wardrobe lookbooks.',
    niche: 'Fashion',
    systemFocus: 'Highlight fashion style aesthetics (e.g. Old Money, Y2K, Streetwear, Capsule Wardrobe), outfit coordination keywords, seasonal trend hooks, and body-type styling tags.'
  },
  {
    id: 'diy-crafts',
    name: 'DIY Crafts, Crafts & Handmade',
    description: 'Focused on craft tutorials, hand-made items, sewing patterns, and creative hobbies.',
    niche: 'DIY & Crafts',
    systemFocus: 'Focus on step-by-step tutorial keywords, DIY crafts for beginners, craft supply lists, handmade gift ideas, and craft room inspiration.'
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty, Skincare & Hairstyles',
    description: 'Optimized for cosmetics, hair styling, nail art, and skincare routine products.',
    niche: 'Beauty',
    systemFocus: 'Include hair texture, nail shape aesthetic, skincare ingredient benefits, makeup lookbook terms, and glow-up transformation search hooks.'
  }
];
