import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Any

from app.models import (
    Post, PostCreate, RecommendationRequest, RecommendationResponse,
    AudienceOverview, MemoryItem
)
from app.demo_data import DEMO_POSTS
from app.hindsight_service import hindsight_service
from app.llm_service import llm_service

app = FastAPI(
    title="AudienceMind API",
    description="A Social Media Engagement Agent That Learns Your Audience using Hindsight Memory",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory post registry
POSTS_DB: List[Dict[str, Any]] = []

@app.get("/api/status")
def get_status(bank_id: str = "audience_mind_demo"):
    context = hindsight_service.build_audience_context(bank_id)
    return {
        "status": "healthy",
        "app_name": "AudienceMind",
        "hindsight_sdk_active": hindsight_service.use_official_sdk,
        "hindsight_base_url": hindsight_service.base_url,
        "total_posts_loaded": len(POSTS_DB),
        "total_hindsight_memories": context.get("total_memories", 0),
        "is_cold_start": not context.get("has_memory", False)
    }

@app.get("/api/posts", response_model=List[Post])
def get_posts():
    return POSTS_DB

@app.post("/api/posts", response_model=Post)
def create_post(post_in: PostCreate, bank_id: str = "audience_mind_demo"):
    post_dict = post_in.dict()
    post_dict["id"] = f"post-{len(POSTS_DB) + 1}"
    POSTS_DB.append(post_dict)

    # Formulate memory string and retain in Hindsight
    memory_text = (
        f"Post Topic: {post_in.topic} | Format: {post_in.content_format} | Tone: {post_in.tone} | "
        f"Posting Time: {post_in.posting_time} | Engagement: {post_in.engagement_level} "
        f"({post_in.likes} likes, {post_in.comments} comments, {post_in.shares} shares) | "
        f"Sentiment: {post_in.feedback_sentiment} | Text: '{post_in.post_text}'"
    )

    hindsight_service.retain_memory(
        bank_id=bank_id,
        content=memory_text,
        metadata={
            "post_id": post_dict["id"],
            "topic": post_in.topic,
            "content_format": post_in.content_format,
            "tone": post_in.tone,
            "engagement_level": post_in.engagement_level,
            "feedback_sentiment": post_in.feedback_sentiment
        },
        tags=[post_in.topic, post_in.engagement_level, post_in.content_format]
    )

    return post_dict

@app.post("/api/demo/load")
def load_demo_data(bank_id: str = "audience_mind_demo"):
    """
    Loads 10 realistic synthetic demo posts into POSTS_DB and retains them in Hindsight.
    """
    global POSTS_DB
    POSTS_DB.clear()
    hindsight_service.clear_bank(bank_id)

    for post in DEMO_POSTS:
        POSTS_DB.append(post)
        memory_text = (
            f"Historical Interaction: Topic='{post['topic']}' | Format='{post['content_format']}' | "
            f"Tone='{post['tone']}' | Time='{post['posting_time']}' | "
            f"Performance: {post['engagement_level']} Engagement ({post['likes']} Likes, {post['comments']} Comments, {post['shares']} Shares) | "
            f"Audience Feedback: {post['feedback_sentiment']} | Snippet: '{post['post_text']}'"
        )
        hindsight_service.retain_memory(
            bank_id=bank_id,
            content=memory_text,
            metadata={
                "post_id": post["id"],
                "topic": post["topic"],
                "content_format": post["content_format"],
                "tone": post["tone"],
                "engagement_level": post["engagement_level"],
                "feedback_sentiment": post["feedback_sentiment"]
            },
            tags=[post["topic"], post["engagement_level"], post["content_format"]]
        )

    return {
        "message": f"Successfully loaded {len(DEMO_POSTS)} historical posts into Hindsight memory bank '{bank_id}'.",
        "total_loaded": len(DEMO_POSTS),
        "bank_id": bank_id
    }

@app.delete("/api/memory")
def clear_memory(bank_id: str = "audience_mind_demo"):
    """
    Clears memory bank to reset app to Cold Start state.
    """
    global POSTS_DB
    POSTS_DB.clear()
    hindsight_service.clear_bank(bank_id)
    return {
        "message": f"Hindsight memory bank '{bank_id}' and posts DB successfully reset to cold start.",
        "is_cold_start": True
    }

@app.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendation(req: RecommendationRequest):
    """
    Recalls Hindsight memory, builds audience context, and generates content recommendation.
    """
    # 1. Recall relevant memories from Hindsight
    recalled_memories = hindsight_service.recall_memory(
        bank_id=req.bank_id,
        query=req.user_prompt,
        limit=8
    )

    # 2. Build structured audience context
    audience_context = hindsight_service.build_audience_context(req.bank_id)

    # 3. Call LLM Service to reason over recalled context & user request
    recommendation = llm_service.generate_recommendation(
        user_prompt=req.user_prompt,
        recalled_memories=recalled_memories,
        audience_context=audience_context,
        bank_id=req.bank_id
    )

    return recommendation

@app.get("/api/overview", response_model=AudienceOverview)
def get_overview():
    """
    Calculates aggregated audience overview stats.
    """
    if not POSTS_DB:
        return AudienceOverview(
            total_posts=0,
            top_topics=[],
            preferred_formats=[],
            preferred_tones=[],
            best_performing_themes=[],
            recent_sentiment_breakdown={"Positive": 0, "Neutral": 0, "Low": 0}
        )

    topic_counts = {}
    format_likes = {}
    tone_likes = {}
    high_themes = []
    sentiments = {"Positive": 0, "Neutral": 0, "Low Interest": 0}

    for p in POSTS_DB:
        topic = p.get("topic", "Other")
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

        fmt = p.get("content_format", "Standard")
        format_likes[fmt] = format_likes.get(fmt, 0) + p.get("likes", 0)

        tone = p.get("tone", "Standard")
        tone_likes[tone] = tone_likes.get(tone, 0) + p.get("likes", 0)

        if p.get("engagement_level") == "High" and topic not in high_themes:
            high_themes.append(topic)

        sentiment = p.get("feedback_sentiment", "")
        if "Positive" in sentiment:
            sentiments["Positive"] = sentiments.get("Positive", 0) + 1
        elif "Low" in sentiment or "Disinterested" in sentiment:
            sentiments["Low Interest"] = sentiments.get("Low Interest", 0) + 1
        else:
            sentiments["Neutral"] = sentiments.get("Neutral", 0) + 1

    top_topics_list = [{"name": k, "count": v} for k, v in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    pref_formats_list = [{"name": k, "likes": v} for k, v in sorted(format_likes.items(), key=lambda x: x[1], reverse=True)[:5]]
    pref_tones_list = [{"name": k, "likes": v} for k, v in sorted(tone_likes.items(), key=lambda x: x[1], reverse=True)[:5]]

    return AudienceOverview(
        total_posts=len(POSTS_DB),
        top_topics=top_topics_list,
        preferred_formats=pref_formats_list,
        preferred_tones=pref_tones_list,
        best_performing_themes=high_themes,
        recent_sentiment_breakdown=sentiments
    )

# Mount frontend dist static files if built
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
