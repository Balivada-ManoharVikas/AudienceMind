from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Post(BaseModel):
    id: Optional[str] = None
    post_text: str
    topic: str
    content_format: str  # e.g., Carousel, Code Snippet, Video, Thread, Single Image, Infographic
    tone: str            # e.g., Practical, Educational, Conversational, Technical, Motivational
    posting_time: str    # e.g., Morning, Afternoon, Evening, Late Night
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_level: str # High, Medium, Low
    feedback_sentiment: str # Positive, Neutral, Critical

class PostCreate(BaseModel):
    post_text: str
    topic: str
    content_format: str
    tone: str
    posting_time: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_level: str
    feedback_sentiment: str

class RecommendationRequest(BaseModel):
    user_prompt: str = "What should I post next?"
    bank_id: str = "audience_mind_demo"

class MemoryItem(BaseModel):
    memory_id: str
    content: str
    timestamp: Optional[str] = None
    relevance_score: Optional[float] = 1.0
    tags: List[str] = []

class MemoryActivity(BaseModel):
    memories_recalled_count: int
    recalled_snippets: List[str]
    signals_identified: List[str]
    historical_interactions_used: int
    memory_bank_id: str
    engine_used: str

class RecommendationResponse(BaseModel):
    recommended_topic: str
    recommended_post_idea: str
    recommended_format: str
    recommended_tone: str
    recommended_posting_time: str
    audience_insight: str
    why_explanation: str
    memory_activity: MemoryActivity
    is_cold_start: bool

class AudienceOverview(BaseModel):
    total_posts: int
    top_topics: List[Dict[str, Any]]
    preferred_formats: List[Dict[str, Any]]
    preferred_tones: List[Dict[str, Any]]
    best_performing_themes: List[str]
    recent_sentiment_breakdown: Dict[str, int]
