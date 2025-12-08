export interface AppIdea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  viralMechanic: string;
  monetizationStrategy: string;
  estimatedYearOneUsers: number;
  viralityScore: number; // 0-100
  adRevenuePotential: number; // 0-100
  imageUrl?: string;
}

export interface GrowthDataPoint {
  month: string;
  users: number;
  revenue: number;
}

export interface DeepDiveAnalysis {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  growthProjection: GrowthDataPoint[];
  marketVerdict: string;
}

export enum AppCategory {
  HyperCasualGame = "Hyper-Casual Game",
  SocialUtility = "Social Utility",
  AIProductivity = "AI Productivity",
  HealthWellness = "Health & Wellness",
  Entertainment = "Entertainment"
}