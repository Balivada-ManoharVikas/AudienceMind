# AudienceMind
> **"Your audience. Your memory."**

An AI-powered Social Media Engagement Agent that learns your audience's unique preferences over time using **persistent Hindsight memory**.

---

## Overview

**AudienceMind** bridges the gap between static LLMs and dynamic audience engagement. Instead of treating every prompt as a cold start or relying on flat chat windows, AudienceMind records past social media posts, engagement metrics (likes, comments, shares), and audience feedback into **Hindsight Memory Banks**. When a creator or marketer asks *"What should I post next?"*, AudienceMind recalls relevant historical audience interactions, analyzes high-performing patterns, and generates personalized content recommendations backed by explicit reasoning.

---

## Problem

Social media managers and creators face key challenges with standard AI tools:
1. **Generic, One-Size-Fits-All Content:** Default AI models give the same generic post ideas to every user regardless of niche or audience taste.
2. **Context Loss:** LLMs forget which posts went viral and which flopped.
3. **Guesswork in Strategy:** Creators waste time testing content formats without leveraging past audience feedback.

---

## Solution

AudienceMind turns historical post metrics into structured **Hindsight memories**:
- **Retains** content format, tone, posting time, engagement level, and qualitative audience sentiment.
- **Recalls** relevant prior audience reactions before generating new post ideas.
- **Explains** why a recommendation was made by contrasting past high-performing vs low-performing posts.

---

## Why Persistent Memory Matters

Standard RAG treats data as flat static text documents. In contrast, **Hindsight Agent Memory** enables agents to:
- Retain experience & outcome feedback across separate sessions.
- Synthesize complex audience preferences (e.g., technical tutorials succeed; generic quotes fail).
- Adapt continuously as new post outcomes are recorded.

---

## How Hindsight Is Used

AudienceMind integrates with the official **`hindsight-client`** Python SDK:

1. **`retain_memory(bank_id, content, metadata, tags)`**: Called whenever historical posts or new post outcomes are recorded. Stores extracted topics, format, tone, and engagement levels into Hindsight.
2. **`recall_memory(bank_id, query, limit)`**: Called when generating content recommendations to retrieve the most relevant past audience interactions.
3. **`build_audience_context(bank_id)`**: Aggregates recalled memories into structured high-affinity signals vs low-affinity content patterns.

---

## Architecture

```
User / Creator
      │
      ▼
AudienceMind Dashboard (React + Tailwind)
      │
      ▼
 FastAPI Backend Agent
      │
 ┌────┴───────────────┐
 │ LLM Reasoning     │
 └────────┬───────────┘
          │
          ▼
 ┌───────────────────┐
 │ Hindsight Memory  │
 └────────┬───────────┘
          │
          ▼
 Historical Audience Context
          │
          ▼
 Audience Pattern Analysis
          │
          ▼
 Personalized Recommendation
```

---

## Core Workflow

```
PAST CONTENT ➔ AUDIENCE SIGNALS ➔ HINDSIGHT MEMORY ➔ RECALL RELEVANT HISTORY ➔ ANALYZE PATTERNS ➔ RECOMMEND NEXT CONTENT ➔ NEW OUTCOME ➔ STORE NEW LEARNING
```

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React Icons
- **Backend:** FastAPI, Python 3.14, Uvicorn, Pydantic
- **Memory Engine:** Hindsight Client (`hindsight-client` SDK) with embedded fallback
- **LLM Layer:** OpenAI / Gemini / OpenAI-compatible API client

---

## Features

- 🧠 **Hindsight Memory Retention & Recall**: Stores & queries rich post metadata and audience reactions.
- ⚡ **Before / After Demonstration Mode**:
  - **State 1 (Cold Start):** Generic baseline recommendation with no memory context.
  - **State 2 & 3 (Memory Active):** Synthetic dataset of 10+ historical posts loaded into Hindsight, yielding tailored recommendations.
- 📊 **Audience Overview Dashboard**: Visualizes top topics, preferred formats, tone, and sentiment breakdowns.
- 💡 **Explicit Explanation ("WHY THIS RECOMMENDATION?")**: Explains exactly which historical memories influenced the generated post idea.
- 🔍 **Memory Activity Inspector**: Displays recalled snippets, identified audience signals, and memory bank details.

---

## Before vs After Memory Demonstration

| Metric / State | State 1: Cold Start | State 2 & 3: Hindsight Active |
|---|---|---|
| **Memory Status** | Empty Bank (0 Records) | Active Bank (10+ Historical Posts) |
| **User Request** | *"What should I post next?"* | *"What should I post next?"* |
| **Recommendation** | Generic productivity tips & quote graphics | Deep technical Python/SQL code carousel |
| **Format & Tone** | Text Quote / Motivational | Code Carousel / Practical & Educational |
| **Reasoning** | *"No prior memory found. Showing baseline recommendation."* | *"Recalled Python, SQL & Data Viz tutorials produced 1,400+ likes while generic quotes produced <100 likes."* |

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Clone Repository
```bash
git clone https://github.com/user/audiencemind.git
cd audiencemind
```

### 2. Set Up Python Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Set Up Frontend
```bash
cd frontend
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Hindsight Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io

# LLM Configuration (OpenAI / Gemini)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

*Note: If no API keys are configured, AudienceMind automatically runs in offline demonstration mode using its embedded Hindsight & pattern-reasoning engine.*

---

## Running Locally

### Option A: Run Backend & Frontend Concurrently

**1. Start FastAPI Backend:**
```bash
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000
```

**2. Start React Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Official Hindsight Resources

- 🌐 [Hindsight Documentation](https://hindsight.vectorize.io/)
- 🐙 [Hindsight GitHub Repository](https://github.com/vectorize-io/hindsight)
- 🧠 [Vectorize Agent Memory Guide](https://vectorize.io/what-is-agent-memory)

---

## License

MIT License. Built for Hackathon MVP.
