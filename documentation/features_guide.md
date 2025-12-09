# Strategia-X: Viral App Architect - Features Guide

## Overview
Strategia-X is an AI-powered market analyzer designed to generate, validate, and visualize high-potential, free-to-play app ideas optimized for ad revenue and viral growth. It leverages WebLLM (browser-based AI) for completely free, local AI processing with no API costs.

---

## AI Technology

### Local AI Processing (WebLLM)
*   **Engine:** WebLLM with Llama 3.2 3B Instruct model
*   **Processing:** 100% local - runs entirely in your browser
*   **Cost:** Completely free - no API keys or usage fees
*   **Privacy:** Your data never leaves your device
*   **First Load:** ~2GB model download (cached for future visits)
*   **Subsequent Visits:** Instant loading from browser cache

### Image Generation (Pollinations.ai)
*   Free, no-API-key image generation service
*   Creates concept art and app store thumbnails
*   High-quality 16:9 aspect ratio output

---

## Core Features

### 1. AI-Powered Market Generator
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

### 3. Deep Dive Diagnostics (Pro Feature)
Upon selecting an idea, the application performs a comprehensive market analysis:
*   **SWOT Analysis:** Detailed breakdown of Strengths, Weaknesses, Opportunities, and Threats.
*   **Growth Projections:** A 12-month data simulation showing the trajectory of Active Users vs. Ad Revenue (USD).
*   **Market Verdict:** A decisive summary on whether the concept is a potential "Unicorn" or a "Bust."
*   **Optimization Strategy:** Actionable advice on lowering CPI (Cost Per Install) using specific mechanics.

### 4. Generative Concept Art (Pro Feature)
*   **Engine:** Pollinations.ai (free, no API key required)
*   **Function:** Visualizes the app idea by generating high-definition, modern app store thumbnails or concept art on demand.
*   **Style:** Minimalist, high-tech, and vibrant digital art optimized for 16:9 aspect ratios.

### 5. Comparative Analysis System (Pro Feature)
*   **Queue:** Compare up to 3 distinct app ideas side-by-side.
*   **Metrics:** Direct comparison of:
    *   Virality Scores
    *   Revenue Potential
    *   Year One User Projections
    *   Monetization Strategies
    *   Viral Hooks

### 6. Data Management & Export
*   **Local Persistence:** Ideas can be "Saved" (Bookmarked) and are persisted locally on the device.
*   **JSON Export (Pro):** Export the entire list of generated or saved ideas as raw JSON data for developer use.
*   **CSV Export (Pro):** Export data in spreadsheet-compatible format for analysis.
*   **PDF Report (Pro):** Generates a professional business report including all current metrics, descriptions, and analysis data for presentation purposes.
*   **Sharing:** Generates unique, shareable links containing the specific app idea data encoded in the URL.

---

## Pro Creative Tools

### 7. App Name Generator (Pro Feature)
*   **Function:** Generates 10 unique, creative app names for any concept.
*   **Styles Generated:**
    *   Playful/Fun (catchy, memorable)
    *   Professional/Corporate (trustworthy, sleek)
    *   Techy/Modern (innovative, cutting-edge)
    *   Minimalist (short, simple, 1-2 syllables)
    *   Creative/Abstract (unique, brandable)
*   **Features:**
    *   Simulated domain availability check
    *   One-click copy to clipboard
    *   Regenerate for fresh ideas

### 8. Marketing Copy Writer (Pro Feature)
*   **Function:** Generates complete, ready-to-use marketing materials.
*   **Output Includes:**
    *   **App Store Description:** Short (80 chars) and full versions
    *   **Taglines:** 5 catchy slogans/taglines
    *   **Social Media Posts:**
        *   Twitter/X (280 chars with hashtags)
        *   Instagram caption with CTA
        *   LinkedIn professional announcement
    *   **Press Release:** Short paragraph for media announcements
*   **Features:**
    *   Expandable sections for easy navigation
    *   Copy buttons for each content piece
    *   Regenerate for fresh copy

### 9. MVP Feature Planner (Pro Feature)
*   **Function:** Creates a prioritized feature roadmap using MoSCoW methodology.
*   **Output Includes:**
    *   **Must Have:** Core features essential for MVP launch (4-5 features)
    *   **Should Have:** Important but not critical (3-4 features)
    *   **Nice to Have:** Future enhancements (3-4 features)
*   **Each Feature Includes:**
    *   Name and description
    *   Effort estimate (Low/Medium/High)
    *   Impact rating (Low/Medium/High)
*   **Additional Insights:**
    *   Estimated MVP development timeline (in weeks)
    *   Recommended tech stack

---

## Licensing System

### Free Tier Limitations
*   3 generations per day
*   3 saved ideas maximum
*   Basic idea generation only

### Pro Tier Benefits
*   Unlimited generations
*   Unlimited saved ideas
*   All Pro features unlocked
*   Priority support

### License Activation
*   Purchase via LemonSqueezy checkout
*   Enter license key in app
*   Stored locally (persists across sessions)

---

## Native Mobile Integration (Android/iOS)

*   **Hybrid Shell:** The React application is optimized to run within native WebView containers.
*   **AdMob Integration:**
    *   **Banner Ads:** Supports pinned bottom banner ads via native bridges.
    *   **Interstitial Ads:** Triggers full-screen video/static ads before "Deep Dive" analysis, simulating a real-world "Watch to Unlock" monetization flow.
*   **Theme Awareness:** Supports system-wide Light and Dark modes.

---

## Technical Specifications

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **AI Engine:** WebLLM (@mlc-ai/web-llm) with Llama 3.2 3B Instruct
*   **Image Generation:** Pollinations.ai (free, serverless)
*   **Visualization:** Recharts for financial modeling
*   **Icons:** Lucide-React
*   **PDF Generation:** jsPDF
*   **Build Tool:** Vite
*   **Hosting:** GitHub Pages (static deployment)
*   **Native Bridge:** JavaScript Interface (`window.Android` / `window.webkit`) for mobile ad SDKs

---

## Privacy & Data Handling

*   **Local Processing:** All AI processing happens in your browser
*   **No Server Uploads:** Your app ideas are never sent to external servers
*   **Local Storage:** Saved ideas and license keys stored in browser localStorage
*   **Shareable Links:** Only shared when you explicitly click the Share button
*   **Image Generation:** Concept art requests sent to Pollinations.ai (prompt only, no personal data)

For full privacy policy, see [Privacy Policy](./privacy_policy.md).
