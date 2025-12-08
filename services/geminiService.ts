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