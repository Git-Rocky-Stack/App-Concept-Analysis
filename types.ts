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

// App Name Generator
export interface GeneratedAppNames {
  names: {
    name: string;
    style: string; // e.g., "Playful", "Professional", "Techy"
    available: boolean; // Simulated availability
  }[];
}

// Marketing Copy Writer
export interface MarketingCopy {
  appStoreDescription: {
    short: string; // 80 chars
    full: string; // Full description
  };
  taglines: string[]; // 5 catchy taglines
  socialPosts: {
    twitter: string;
    instagram: string;
    linkedIn: string;
  };
  pressRelease: string; // Short press release paragraph
}

// MVP Feature Planner
export interface MVPFeature {
  name: string;
  description: string;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
}

export interface MVPPlan {
  mustHave: MVPFeature[];
  shouldHave: MVPFeature[];
  niceToHave: MVPFeature[];
  estimatedMVPWeeks: number;
  techStack: string[];
}