import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit for image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Pinterest: Fetch user boards
  app.get("/api/pinterest/boards", async (req, res) => {
    const token = req.headers['x-pinterest-token'] as string;
    if (!token) {
      return res.status(401).json({ error: "Pinterest Access Token is missing. Please add it in Settings." });
    }
    try {
      const response = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data?.message || "Failed to fetch Pinterest boards. Check your Access Token." });
      }
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Could not connect to Pinterest API: " + err.message });
    }
  });

  // Pinterest: Create (publish) a Pin
  app.post("/api/pinterest/pins", async (req, res) => {
    const token = req.headers['x-pinterest-token'] as string;
    if (!token) {
      return res.status(401).json({ error: "Pinterest Access Token is missing. Please add it in Settings." });
    }
    try {
      const { boardId, title, description, altText, imageBase64, mimeType, affiliateLink } = req.body;

      if (!boardId || !imageBase64) {
        return res.status(400).json({ error: "Board ID and image are required." });
      }

      // Pinterest API v5 requires image as a URL or media upload.
      // We use the media_source with content_type for base64 upload.
      const pinPayload: any = {
        board_id: boardId,
        title: title || "",
        description: description || "",
        alt_text: altText || "",
        media_source: {
          source_type: "image_base64",
          content_type: mimeType || "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      };

      // Add affiliate/destination link if provided
      if (affiliateLink && affiliateLink.trim()) {
        pinPayload.link = affiliateLink.trim();
      }

      const response = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pinPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data?.message || "Failed to publish pin to Pinterest." });
      }
      res.json({ success: true, pin: data });
    } catch (err: any) {
      res.status(500).json({ error: "Could not connect to Pinterest API: " + err.message });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { imageBase64, mimeType, promptTemplate, customApiKey } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "No image data provided." });
      }

      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(401).json({
          error:
            "No Gemini API key available. Please add GEMINI_API_KEY in Secrets or enter a custom API key in Settings.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Strip base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imageMime = mimeType || "image/jpeg";

      const promptSystemInstruction = `
You are an elite Senior Pinterest SEO Strategist, Visual E-commerce Specialist, Search Intent Analyst, and Content Creator.
Analyze the uploaded product image in extreme detail and generate complete, production-grade Pinterest SEO data.

Return ONLY a valid JSON object matching the requested schema exactly. No markdown blocks, no code fences, no conversational text before or after.

Include:
1. "imageAnalysis":
   - "productName": Concise title for the product/object.
   - "mainObject": Primary physical object.
   - "objectsDetected": Array of secondary objects.
   - "materials": Array of materials (e.g., Oak Wood, Ceramic, Linen, Cotton, Gold, Brass).
   - "colors": Array of objects { "name": string, "hex": string } for color palette swatches (provide 4 to 6 swatches).
   - "patterns": Array of patterns (e.g., Solid, Floral, Geometric, Minimalist).
   - "designStyle": Architectural/product design style.
   - "targetAudience": Demographics & persona.
   - "productUse": Primary functional or decorative purpose.
   - "category": Main Pinterest category.
   - "subCategory": Specific sub-category.
   - "season": Best season (Spring, Summer, Autumn, Winter, All Season).
   - "occasion": Occasion/Event.
   - "aesthetic": Aesthetic vibe (e.g., Cottagecore, Scandinavian Minimalist, Dark Academia, Boho Chic, Modern Farmhouse).
   - "interiorStyle": Optional style if applicable.
   - "fashionStyle": Optional style if applicable.
   - "hairStyle": Optional style if applicable.
   - "searchIntent": Primary user search intent (e.g. Inspirational, Shopping, DIY, Gift Idea).
   - "emotionalAppeal": What emotion this image triggers.
   - "trendingNiche": Micro-niche trending on Pinterest.
   - "pinterestNiche": Broader Pinterest niche.
   - "visualQualityScore": 1-100 score.
   - "commercialPotential": 1-100 score.
   - "estimatedPinterestDemand": "Low" | "Medium" | "High" | "Viral".

2. "visualScores":
   - "imageQualityScore": 1-100
   - "brightness": 1-100
   - "contrast": 1-100
   - "colorHarmony": 1-100
   - "backgroundQuality": 1-100
   - "compositionScore": 1-100
   - "clickabilityScore": 1-100
   - "pinterestFriendlyScore": 1-100
   - "visualNotes": Concrete visual advice to improve CTR (e.g. contrast, text overlays, 2:3 vertical aspect ratio).

3. "keywords": Generate EXACTLY AT LEAST 50 keywords for Pinterest search optimization.
   Each keyword object must have:
   - "keyword": string
   - "category": One of ("Primary", "Secondary", "Long Tail", "Short Tail", "Seasonal", "Evergreen", "Trending", "Low Competition", "High Volume", "Buyer Intent", "Informational", "Commercial", "Brand-safe")
   - "intent": One of ("Informational", "Inspirational", "Shopping", "DIY", "Tutorial", "Gift", "Decor", "Fashion", "Hair", "Lifestyle", "Seasonal", "Event", "Holiday", "Wedding", "Home", "Kids", "Women's Fashion", "Men's Fashion", "Digital Product", "Printable", "SVG", "PNG", "Craft")
   - "popularityScore": 1-100 integer
   - "competitionScore": 1-100 integer
   - "competitionLevel": "Low" | "Medium" | "High"
   - "difficulty": 1-100 integer
   - "estimatedSearchVolume": string e.g. "18.5k/mo", "42k/mo", "9.1k/mo"
   - "trendScore": 1-100 integer
   - "evergreenScore": 1-100 integer
   - "commercialValue": 1-100 integer
   - "clickPotential": 1-100 integer
   - "savePotential": 1-100 integer
   - "rankingOpportunity": "Easy" | "Moderate" | "Hard"

   Ensure a rich mix covering high volume terms, buyer intent keywords, long-tail phrases, seasonal hooks, and low competition niches! Provide exactly 50 keyword items.

4. "seo":
   - "titles": Array of 5 Pinterest SEO title formulas (under 100 characters).
   - "descriptions": Array of 5 Pinterest SEO descriptions rich in top keywords (under 500 characters).
   - "altText": Array of 3 descriptive image Alt texts for accessibility & visual search ranking.
   - "boardSuggestions": Array of 5 objects { "boardName": string, "category": string, "description": string, "targetPins": number }.
   - "categories": Array of 5 recommended Pinterest categories.
   - "topicIdeas": Array of 8 Pinterest topic tag suggestions.
   - "richPinSuggestions": Array of 3 objects { "type": "Product" | "Article" | "Recipe", "title": string, "priceOrAvailability": string, "structuredData": string }.
   - "pinStyleRecommendation": Object { "format": string, "ratio": string, "textOverlayTip": string, "colorTip": string }.

5. "contentIdeas":
   - "pinterestTitles": Array of EXACTLY 10 catchy Pin headlines.
   - "pinterestDescriptions": Array of EXACTLY 10 pin descriptions.
   - "ctaIdeas": Array of EXACTLY 10 Call-To-Action phrases (e.g. "Tap to Shop the Look", "Save for Later").
   - "pinHooks": Array of EXACTLY 10 text overlay visual hooks (e.g. "5 Ways to Style This...").
   - "blogIdeas": Array of EXACTLY 20 blog post titles.
   - "articleIdeas": Array of EXACTLY 20 guide & article headlines.
   - "socialMediaCaptions": Array of EXACTLY 20 social media captions (Instagram, TikTok, Pinterest).

6. "hashtags":
   - "highVolume": Array of 15 high volume hashtags with # prefix.
   - "mediumVolume": Array of 20 medium volume hashtags with # prefix.
   - "lowCompetition": Array of 15 low competition hashtags with # prefix.

7. "competitors":
   - "popularWording": Array of 8 phrases competitors use in high-performing pins.
   - "popularKeywords": Array of 8 top competitor keywords.
   - "popularCategories": Array of 5 competitor categories.
   - "popularThemes": Array of 5 competitor pin themes.
   - "popularAesthetics": Array of 5 competitor aesthetic styles.
   - "competitorInsights": Strategic analysis of how to outrank competitor pins.

8. "trends":
   - "currentSeasonRelevance": Current season breakdown.
   - "imageStyleMatch": How well the visual style aligns with current Pinterest trends.
   - "pinterestTrends": Array of 6 active Pinterest trends for this product type.
   - "evergreenTrends": Array of 6 evergreen topics.
   - "growthPrediction": Forecasted trend trajectory over the next 6 months.

${promptTemplate ? `Custom Niche Focus Instruction: ${promptTemplate}` : ""}
`;

      const imagePart = {
        inlineData: {
          mimeType: imageMime,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: promptSystemInstruction,
      };

      // Candidate models for fallback if 503 high demand or transient rate limit occurs
      const candidateModels = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-pro"];
      let response = null;
      let lastError: any = null;

      for (const modelCandidate of candidateModels) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Attempting Gemini analysis with model: ${modelCandidate} (Attempt ${attempt}/3)`);
            response = await ai.models.generateContent({
              model: modelCandidate,
              contents: { parts: [imagePart, textPart] },
              config: {
                responseMimeType: "application/json",
                temperature: 0.7,
              },
            });
            if (response && response.text) {
              console.log(`Success with model ${modelCandidate}`);
              break;
            }
          } catch (err: any) {
            lastError = err;
            const errMsg = err?.message || String(err);
            console.warn(`Model ${modelCandidate} attempt ${attempt} error:`, errMsg);

            const isTransient =
              errMsg.includes("503") ||
              errMsg.includes("UNAVAILABLE") ||
              errMsg.includes("high demand") ||
              errMsg.includes("429") ||
              errMsg.includes("RESOURCE_EXHAUSTED") ||
              errMsg.includes("overloaded");

            if (isTransient && attempt < 3) {
              const delay = attempt * 1200;
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else if (!isTransient) {
              break;
            }
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("The AI model is currently under high demand. Please try again in a few seconds.");
      }

      const responseText = response.text || "";

      let parsedData;
      try {
        // Robust JSON cleaning
        let jsonCleaned = responseText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const firstBrace = jsonCleaned.indexOf('{');
        const lastBrace = jsonCleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonCleaned = jsonCleaned.substring(firstBrace, lastBrace + 1);
        }
        parsedData = JSON.parse(jsonCleaned);
      } catch (parseError) {
        console.error("JSON parsing error from Gemini output:", parseError, responseText);
        return res.status(500).json({
          error: "Failed to parse structured analysis output from AI model.",
          raw: responseText,
        });
      }

      res.json(parsedData);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      let errorMessage = err.message || "An error occurred during image analysis.";
      
      // Clean up ugly API key errors from Gemini SDK
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
        errorMessage = "Your Gemini API Key is invalid or missing. Please enter your real API key in the App Settings (bottom left) or in the .env file.";
      }
      
      res.status(500).json({
        error: errorMessage,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
