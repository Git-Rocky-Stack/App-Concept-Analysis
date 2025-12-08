import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppIdea, AppCategory, DeepDiveAnalysis } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const ideaSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      tagline: { type: Type.STRING },
      description: { type: Type.STRING },
      category: { type: Type.STRING },
      viralMechanic: { type: Type.STRING },
      monetizationStrategy: { type: Type.STRING },
      estimatedYearOneUsers: { type: Type.INTEGER },
      viralityScore: { type: Type.INTEGER },
      adRevenuePotential: { type: Type.INTEGER },
    },
    required: ["title", "tagline", "description", "category", "viralMechanic", "monetizationStrategy", "estimatedYearOneUsers", "viralityScore", "adRevenuePotential"],
  },
};

const singleIdeaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    tagline: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    viralMechanic: { type: Type.STRING },
    monetizationStrategy: { type: Type.STRING },
    estimatedYearOneUsers: { type: Type.INTEGER },
    viralityScore: { type: Type.INTEGER },
    adRevenuePotential: { type: Type.INTEGER },
  },
  required: ["title", "tagline", "description", "category", "viralMechanic", "monetizationStrategy", "estimatedYearOneUsers", "viralityScore", "adRevenuePotential"],
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    marketVerdict: { type: Type.STRING },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"],
    },
    growthProjection: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          month: { type: Type.STRING },
          users: { type: Type.INTEGER },
          revenue: { type: Type.NUMBER },
        },
        required: ["month", "users", "revenue"],
      },
    },
  },
  required: ["marketVerdict", "swot", "growthProjection"],
};

export const generateViralIdeas = async (category: AppCategory | "All"): Promise<AppIdea[]> => {
  const prompt = `
    Generate 3 distinct, high-potential free app ideas that monetize heavily via ads.
    Focus on the category: ${category}.
    The ideas should have a high viral coefficient (users inviting users) and high retention for ad impressions.
    Be creative but realistic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ideaSchema,
        temperature: 0.8,
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((idea: any, index: number) => ({
      ...idea,
      id: `idea-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("Error generating ideas:", error);
    return [];
  }
};

export const refineUserIdea = async (userInput: string): Promise<AppIdea | null> => {
  const prompt = `
    Analyze and refine the following raw app idea into a structured business concept:
    "${userInput}"

    Optimize it for a "Free + Ads" revenue model.
    Generate a catchy title and tagline.
    Identify the best category.
    Design a specific viral mechanic (how users invite others).
    Estimate potential year one users (be realistic based on the idea's viral potential).
    Score virality and ad revenue potential (0-100).
    If the input is too vague, invent plausible details to make it a viable viral app.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleIdeaSchema,
        temperature: 0.7,
      },
    });

    const data = JSON.parse(response.text || "null");
    if (!data) return null;

    return {
      ...data,
      id: `custom-${Date.now()}`,
    };
  } catch (error) {
    console.error("Error refining user idea:", error);
    return null;
  }
};

export const analyzeAppIdea = async (idea: AppIdea): Promise<DeepDiveAnalysis | null> => {
  const prompt = `
    Analyze the following app idea for market viability, specifically focusing on a "Free + Ads" revenue model.
    App Title: ${idea.title}
    Description: ${idea.description}
    Viral Mechanic: ${idea.viralMechanic}

    Provide a SWOT analysis.
    Provide a 12-month growth projection data set (Month 1 to Month 12) showing active users and estimated ad revenue (in USD).
    Provide a short 'Market Verdict' paragraph on whether this is a unicorn or a bust.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.7,
      },
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error analyzing idea:", error);
    return null;
  }
};

export const generateAppConceptImage = async (idea: AppIdea): Promise<string | null> => {
  const prompt = `
    Create a sleek, modern, and futuristic app store featured image (thumbnail) for an app named "${idea.title}".
    Tagline: ${idea.tagline}.
    App Category: ${idea.category}.
    Visual Style: Minimalist, high-tech, vibrant gradients, digital art, 4k resolution.
    Avoid text other than the logo or symbolic elements.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating app image:", error);
    return null;
  }
};