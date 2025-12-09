import * as webllm from "@mlc-ai/web-llm";
import { AppIdea, AppCategory, DeepDiveAnalysis, GeneratedAppNames, MarketingCopy, MVPPlan, MVPFeature } from "../types";

// Model configuration - using a capable but reasonably-sized model
const MODEL_ID = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

// Singleton engine instance
let engine: webllm.MLCEngine | null = null;
let initializationPromise: Promise<webllm.MLCEngine> | null = null;
let initProgress: (progress: string) => void = () => {};

// Allow external progress callback
export const setProgressCallback = (callback: (progress: string) => void) => {
  initProgress = callback;
};

// Initialize the WebLLM engine (singleton pattern)
const getEngine = async (): Promise<webllm.MLCEngine> => {
  if (engine) return engine;

  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    initProgress("Initializing AI engine...");

    const newEngine = new webllm.MLCEngine();

    newEngine.setInitProgressCallback((report) => {
      const percent = Math.round(report.progress * 100);
      initProgress(`Loading AI model: ${percent}% - ${report.text}`);
    });

    await newEngine.reload(MODEL_ID);
    engine = newEngine;
    initProgress("AI engine ready!");

    return engine;
  })();

  return initializationPromise;
};

// Helper to extract JSON from LLM response
const extractJSON = <T>(text: string): T | null => {
  try {
    // Try direct parse first
    return JSON.parse(text) as T;
  } catch {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        console.error("Failed to parse extracted JSON:", jsonMatch[0]);
        return null;
      }
    }
    console.error("No JSON found in response:", text);
    return null;
  }
};

// Generate viral app ideas
export const generateViralIdeas = async (category: AppCategory | "All"): Promise<AppIdea[]> => {
  const prompt = `You are an expert app strategist. Generate exactly 3 unique, high-potential free app ideas that monetize via ads.
${category !== "All" ? `Focus on the category: ${category}` : "Choose diverse categories."}

Each idea should have high viral potential (users inviting users) and high retention for ad impressions.

IMPORTANT: Respond ONLY with a valid JSON array, no other text. Format:
[
  {
    "title": "App Name",
    "tagline": "Catchy one-liner",
    "description": "2-3 sentence description of the app concept",
    "category": "One of: Hyper-Casual Game, Social Utility, AI Productivity, Health & Wellness, Entertainment",
    "viralMechanic": "How users will share/invite others",
    "monetizationStrategy": "Free + Ads strategy details",
    "estimatedYearOneUsers": 500000,
    "viralityScore": 75,
    "adRevenuePotential": 80
  }
]

Generate 3 creative, realistic ideas with scores between 0-100. JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const rawData = extractJSON<Array<Record<string, unknown>>>(content);

    if (!rawData || !Array.isArray(rawData)) {
      console.error("Failed to parse ideas response");
      return [];
    }

    return rawData.map((idea, index) => ({
      id: `idea-${Date.now()}-${index}`,
      title: String(idea.title || "Untitled"),
      tagline: String(idea.tagline || ""),
      description: String(idea.description || ""),
      category: String(idea.category || "Entertainment"),
      viralMechanic: String(idea.viralMechanic || ""),
      monetizationStrategy: String(idea.monetizationStrategy || "Free + Ads"),
      estimatedYearOneUsers: Number(idea.estimatedYearOneUsers) || 100000,
      viralityScore: Math.min(100, Math.max(0, Number(idea.viralityScore) || 50)),
      adRevenuePotential: Math.min(100, Math.max(0, Number(idea.adRevenuePotential) || 50)),
    }));
  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
};

// Refine a user's custom idea
export const refineUserIdea = async (userInput: string): Promise<AppIdea | null> => {
  const truncatedInput = userInput.slice(0, 1000);

  const prompt = `You are an expert app strategist. Analyze and transform this raw app idea into a structured business concept:

"${truncatedInput}"

Optimize it for a "Free + Ads" revenue model. Create a catchy title and tagline. Identify the best category. Design a viral mechanic. Estimate realistic year-one users. Score virality and ad revenue potential (0-100).

If the input is vague, invent plausible details to make it viable.

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "title": "App Name",
  "tagline": "Catchy one-liner",
  "description": "2-3 sentence description",
  "category": "One of: Hyper-Casual Game, Social Utility, AI Productivity, Health & Wellness, Entertainment",
  "viralMechanic": "How users will share/invite others",
  "monetizationStrategy": "Free + Ads strategy",
  "estimatedYearOneUsers": 500000,
  "viralityScore": 75,
  "adRevenuePotential": 80
}

JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";
    const data = extractJSON<Record<string, unknown>>(content);

    if (!data) {
      console.error("Failed to parse refined idea response");
      return null;
    }

    return {
      id: `custom-${Date.now()}`,
      title: String(data.title || "Untitled"),
      tagline: String(data.tagline || ""),
      description: String(data.description || ""),
      category: String(data.category || "Entertainment"),
      viralMechanic: String(data.viralMechanic || ""),
      monetizationStrategy: String(data.monetizationStrategy || "Free + Ads"),
      estimatedYearOneUsers: Number(data.estimatedYearOneUsers) || 100000,
      viralityScore: Math.min(100, Math.max(0, Number(data.viralityScore) || 50)),
      adRevenuePotential: Math.min(100, Math.max(0, Number(data.adRevenuePotential) || 50)),
    };
  } catch (error) {
    console.error("Error refining user idea:", error);
    return null;
  }
};

// Deep dive analysis of an app idea
export const analyzeAppIdea = async (idea: AppIdea): Promise<DeepDiveAnalysis | null> => {
  const prompt = `You are an expert app market analyst. Analyze this app idea for market viability with a "Free + Ads" revenue model:

App Title: ${idea.title}
Description: ${idea.description}
Viral Mechanic: ${idea.viralMechanic}

Provide:
1. SWOT analysis (2-3 items each)
2. 12-month growth projection (month names, user counts, ad revenue in USD)
3. Market verdict paragraph

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "marketVerdict": "2-3 sentence assessment of whether this is a unicorn or bust",
  "swot": {
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "opportunities": ["opportunity 1", "opportunity 2"],
    "threats": ["threat 1", "threat 2"]
  },
  "growthProjection": [
    {"month": "Month 1", "users": 1000, "revenue": 50},
    {"month": "Month 2", "users": 2500, "revenue": 125},
    {"month": "Month 3", "users": 5000, "revenue": 250},
    {"month": "Month 4", "users": 10000, "revenue": 500},
    {"month": "Month 5", "users": 20000, "revenue": 1000},
    {"month": "Month 6", "users": 40000, "revenue": 2000},
    {"month": "Month 7", "users": 70000, "revenue": 3500},
    {"month": "Month 8", "users": 100000, "revenue": 5000},
    {"month": "Month 9", "users": 150000, "revenue": 7500},
    {"month": "Month 10", "users": 200000, "revenue": 10000},
    {"month": "Month 11", "users": 280000, "revenue": 14000},
    {"month": "Month 12", "users": 400000, "revenue": 20000}
  ]
}

Adjust the numbers to be realistic for this specific app idea. JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const data = extractJSON<Record<string, unknown>>(content);

    if (!data) {
      console.error("Failed to parse analysis response");
      return null;
    }

    // Validate and structure the response
    const swot = data.swot as Record<string, string[]> | undefined;
    const growthProjection = data.growthProjection as Array<Record<string, unknown>> | undefined;

    return {
      marketVerdict: String(data.marketVerdict || "Analysis unavailable."),
      swot: {
        strengths: Array.isArray(swot?.strengths) ? swot.strengths.map(String) : ["Strong concept"],
        weaknesses: Array.isArray(swot?.weaknesses) ? swot.weaknesses.map(String) : ["Needs validation"],
        opportunities: Array.isArray(swot?.opportunities) ? swot.opportunities.map(String) : ["Growing market"],
        threats: Array.isArray(swot?.threats) ? swot.threats.map(String) : ["Competition"],
      },
      growthProjection: Array.isArray(growthProjection)
        ? growthProjection.map((item, index) => ({
            month: String(item.month || `Month ${index + 1}`),
            users: Number(item.users) || 1000 * (index + 1),
            revenue: Number(item.revenue) || 50 * (index + 1),
          }))
        : Array.from({ length: 12 }, (_, i) => ({
            month: `Month ${i + 1}`,
            users: 1000 * Math.pow(1.5, i),
            revenue: 50 * Math.pow(1.5, i),
          })),
    };
  } catch (error) {
    console.error("Error analyzing idea:", error);
    return null;
  }
};

// Generate app concept image using Pollinations.ai (free, no API key needed)
export const generateAppConceptImage = async (idea: AppIdea): Promise<string | null> => {
  const prompt = encodeURIComponent(
    `Modern minimalist app store featured image for "${idea.title}" - ${idea.tagline}. ` +
    `Category: ${idea.category}. Style: sleek futuristic UI mockup, vibrant gradient background, ` +
    `high-tech digital art, 4K resolution, no text, clean professional app icon design`
  );

  try {
    // Pollinations.ai generates images via URL - completely free, no API key
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1280&height=720&nologo=true`;

    // Verify the image loads by creating a test request
    const testResponse = await fetch(imageUrl, { method: 'HEAD' });

    if (testResponse.ok) {
      return imageUrl;
    }

    // Fallback: return the URL anyway as Pollinations sometimes returns 200 on GET but not HEAD
    return imageUrl;
  } catch (error) {
    console.error("Error generating app image:", error);
    // Return URL anyway - browser will handle loading
    const fallbackPrompt = encodeURIComponent(`Modern app icon ${idea.title} digital art gradient`);
    return `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1280&height=720&nologo=true`;
  }
};

// ============ NEW CREATIVE FEATURES ============

// Generate creative app names
export const generateAppNames = async (idea: AppIdea): Promise<GeneratedAppNames | null> => {
  const prompt = `You are a creative branding expert. Generate 10 unique app names for this concept:

App Concept: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Generate names in different styles:
- 2 Playful/Fun names (catchy, memorable)
- 2 Professional/Corporate names (trustworthy, sleek)
- 2 Techy/Modern names (innovative, cutting-edge)
- 2 Minimalist names (short, simple, 1-2 syllables)
- 2 Creative/Abstract names (unique, brandable)

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "names": [
    {"name": "AppName", "style": "Playful", "available": true},
    {"name": "AnotherName", "style": "Professional", "available": false}
  ]
}

For "available", randomly assign true/false to simulate domain availability check.
JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    const data = extractJSON<{ names: Array<{ name: string; style: string; available: boolean }> }>(content);

    if (!data || !Array.isArray(data.names)) {
      console.error("Failed to parse app names response");
      return null;
    }

    return {
      names: data.names.map(n => ({
        name: String(n.name || "AppName"),
        style: String(n.style || "Creative"),
        available: Boolean(n.available),
      })),
    };
  } catch (error) {
    console.error("Error generating app names:", error);
    return null;
  }
};

// Generate marketing copy
export const generateMarketingCopy = async (idea: AppIdea): Promise<MarketingCopy | null> => {
  const prompt = `You are an expert app marketing copywriter. Create compelling marketing materials for this app:

App: ${idea.title}
Tagline: ${idea.tagline}
Description: ${idea.description}
Category: ${idea.category}
Viral Mechanic: ${idea.viralMechanic}

Generate:
1. App Store description (short 80-char version AND full 500-word version)
2. 5 catchy taglines/slogans
3. Social media posts (Twitter 280 chars, Instagram caption, LinkedIn professional post)
4. Short press release paragraph (100 words)

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "appStoreDescription": {
    "short": "80 character short description here",
    "full": "Full detailed app store description here (2-3 paragraphs)"
  },
  "taglines": [
    "Catchy tagline 1",
    "Catchy tagline 2",
    "Catchy tagline 3",
    "Catchy tagline 4",
    "Catchy tagline 5"
  ],
  "socialPosts": {
    "twitter": "Engaging tweet with emoji and hashtags (280 chars max)",
    "instagram": "Instagram caption with emojis and call-to-action",
    "linkedIn": "Professional LinkedIn announcement post"
  },
  "pressRelease": "Short press release paragraph announcing the app launch"
}

JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content || "";
    const data = extractJSON<Record<string, unknown>>(content);

    if (!data) {
      console.error("Failed to parse marketing copy response");
      return null;
    }

    const appStoreDesc = data.appStoreDescription as { short?: string; full?: string } | undefined;
    const socialPosts = data.socialPosts as { twitter?: string; instagram?: string; linkedIn?: string } | undefined;
    const taglines = data.taglines as string[] | undefined;

    return {
      appStoreDescription: {
        short: String(appStoreDesc?.short || `${idea.title} - ${idea.tagline}`).slice(0, 80),
        full: String(appStoreDesc?.full || idea.description),
      },
      taglines: Array.isArray(taglines) ? taglines.map(String).slice(0, 5) : [idea.tagline],
      socialPosts: {
        twitter: String(socialPosts?.twitter || `Check out ${idea.title}! ${idea.tagline} #app #new`),
        instagram: String(socialPosts?.instagram || `Introducing ${idea.title}! ${idea.description}`),
        linkedIn: String(socialPosts?.linkedIn || `Excited to announce ${idea.title} - ${idea.description}`),
      },
      pressRelease: String(data.pressRelease || `${idea.title} launches today, offering ${idea.description}`),
    };
  } catch (error) {
    console.error("Error generating marketing copy:", error);
    return null;
  }
};

// Generate MVP feature plan
export const generateMVPPlan = async (idea: AppIdea): Promise<MVPPlan | null> => {
  const prompt = `You are an expert product manager. Create an MVP feature plan for this app:

App: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Monetization: ${idea.monetizationStrategy}
Viral Mechanic: ${idea.viralMechanic}

Prioritize features using MoSCoW method:
- Must Have: Core features essential for launch (4-5 features)
- Should Have: Important but not critical (3-4 features)
- Nice to Have: Future enhancements (3-4 features)

For each feature, estimate effort (Low/Medium/High) and impact (Low/Medium/High).
Also suggest a tech stack and estimated weeks for MVP.

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "mustHave": [
    {"name": "Feature Name", "description": "Brief description", "effort": "Medium", "impact": "High"}
  ],
  "shouldHave": [
    {"name": "Feature Name", "description": "Brief description", "effort": "Low", "impact": "Medium"}
  ],
  "niceToHave": [
    {"name": "Feature Name", "description": "Brief description", "effort": "High", "impact": "Low"}
  ],
  "estimatedMVPWeeks": 8,
  "techStack": ["React Native", "Firebase", "Node.js"]
}

JSON only:`;

  try {
    const llm = await getEngine();

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content || "";
    const data = extractJSON<Record<string, unknown>>(content);

    if (!data) {
      console.error("Failed to parse MVP plan response");
      return null;
    }

    const parseFeatures = (features: unknown): MVPFeature[] => {
      if (!Array.isArray(features)) return [];
      return features.map(f => {
        const feature = f as Record<string, unknown>;
        return {
          name: String(feature.name || "Feature"),
          description: String(feature.description || ""),
          effort: (['Low', 'Medium', 'High'].includes(String(feature.effort)) ? String(feature.effort) : 'Medium') as 'Low' | 'Medium' | 'High',
          impact: (['Low', 'Medium', 'High'].includes(String(feature.impact)) ? String(feature.impact) : 'Medium') as 'Low' | 'Medium' | 'High',
        };
      });
    };

    return {
      mustHave: parseFeatures(data.mustHave),
      shouldHave: parseFeatures(data.shouldHave),
      niceToHave: parseFeatures(data.niceToHave),
      estimatedMVPWeeks: Number(data.estimatedMVPWeeks) || 8,
      techStack: Array.isArray(data.techStack) ? data.techStack.map(String) : ['React Native', 'Firebase'],
    };
  } catch (error) {
    console.error("Error generating MVP plan:", error);
    return null;
  }
};

// Export engine status check
export const isEngineReady = (): boolean => engine !== null;

// Export engine preload function for eager initialization
export const preloadEngine = async (): Promise<void> => {
  await getEngine();
};
