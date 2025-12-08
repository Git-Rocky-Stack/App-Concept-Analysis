# Strategia-X: Viral App Architect - Features Guide

## Overview
Strategia-X is an AI-powered market analyzer designed to generate, validate, and visualize high-potential, free-to-play app ideas optimized for ad revenue and viral growth. It leverages Google's Gemini 2.5 models to provide real-time market insights, financial projections, and strategic diagnostics.

---

## Core Features

### 1. AI-Powered Market Generator
*   **Engine:** Powered by Google Gemini 2.5 Flash.
*   **Function:** Generates distinct, high-potential app concepts tailored to specific market segments.
*   **Categories:**
    *   Hyper-Casual Games
    *   Social Utility
    *   AI Productivity
    *   Health & Wellness
    *   Entertainment
*   **Output Metrics:**
    *   **Virality Score (0-100):** A predictive score based on the mechanic's ability to induce user-to-user invites.
    *   **Ad Revenue Potential (0-100):** Estimated efficiency of the monetization strategy (e.g., rewarded ads vs. interstitials).
    *   **Estimated Year One Users:** Realistic user base projections based on viral coefficients.

### 2. Concept Validation Engine
*   **Function:** Allows users to input raw, unstructured app ideas.
*   **Process:** The AI refines the user's input into a structured business concept, optimizing it for a "Free + Ads" revenue model.
*   **Capabilities:**
    *   Auto-generates catchy Titles and Taglines.
    *   Identifies the optimal Viral Mechanic.
    *   Provides immediate scoring on Virality and Revenue potential.

### 3. Deep Dive Diagnostics (Analysis Mode)
Upon selecting an idea, the application performs a comprehensive market analysis:
*   **SWOT Analysis:** Detailed breakdown of Strengths, Weaknesses, Opportunities, and Threats.
*   **Growth Projections:** A 12-month data simulation showing the trajectory of Active Users vs. Ad Revenue (USD).
*   **Market Verdict:** A decisive summary on whether the concept is a potential "Unicorn" or a "Bust."
*   **Optimization Strategy:** Actionable advice on lowering CPI (Cost Per Install) using specific mechanics.

### 4. Generative Concept Art
*   **Engine:** Gemini 2.5 Flash Image.
*   **Function:** Visualizes the app idea by generating high-definition, modern app store thumbnails or concept art on demand.
*   **Style:** Minimalist, high-tech, and vibrant digital art optimized for 16:9 aspect ratios.

### 5. Comparative Analysis System
*   **Queue:** Compare up to 3 distinct app ideas side-by-side.
*   **Metrics:** Direct comparison of:
    *   Virality Scores
    *   Revenue Potential
    *   Year One User Projections
    *   Monetization Strategies
    *   Viral Hooks

### 6. Data Management & Export
*   **Local Persistence:** Ideas can be "Saved" (Bookmarked) and are persisted locally on the device.
*   **JSON Export:** Export the entire list of generated or saved ideas as raw JSON data for developer use.
*   **PDF Report:** Generates a professional business report including all current metrics, descriptions, and analysis data for presentation purposes.
*   **Sharing:** Generates unique, shareable links containing the specific app idea data encoded in the URL.

### 7. Native Mobile Integration (Android)
*   **Hybrid Shell:** The React application is optimized to run within a native Android WebView.
*   **AdMob Integration:**
    *   **Banner Ads:** Supports pinned bottom banner ads via native Android bridges.
    *   **Interstitial Ads:** Triggers full-screen video/static ads before "Deep Dive" analysis, simulating a real-world "Watch to Unlock" monetization flow.
*   **Theme Awareness:** Supports system-wide Light and Dark modes.

---

## Technical Specifications

*   **Frontend:** React 19, Tailwind CSS.
*   **Visualization:** Recharts for financial modeling.
*   **Icons:** Lucide-React.
*   **AI Provider:** Google GenAI SDK (`@google/genai`).
*   **Native Bridge:** JavaScript Interface (`window.Android` / `window.webkit`) for communicating with native mobile ad SDKs.
