import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("AudienceMind.Hindsight")
logging.basicConfig(level=logging.INFO)

# Internal memory storage as fallback
class FallbackMemoryBank:
    def __init__(self):
        self.banks: Dict[str, List[Dict[str, Any]]] = {}

    def retain(self, bank_id: str, content: str, metadata: Optional[Dict[str, Any]] = None, tags: Optional[List[str]] = None):
        if bank_id not in self.banks:
            self.banks[bank_id] = []
        memory = {
            "id": f"mem-{len(self.banks[bank_id]) + 1}",
            "content": content,
            "metadata": metadata or {},
            "tags": tags or [],
            "timestamp": datetime.now().isoformat()
        }
        self.banks[bank_id].append(memory)
        return memory

    def recall(self, bank_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        memories = self.banks.get(bank_id, [])
        if not memories:
            return []
        
        # Keyword-based relevance scoring for fallback
        query_words = set(query.lower().split())
        scored = []
        for mem in memories:
            content_lower = mem["content"].lower()
            tags_lower = " ".join(mem.get("tags", [])).lower()
            score = 0.5 # base score
            for q in query_words:
                if len(q) > 2:
                    if q in content_lower:
                        score += 0.3
                    if q in tags_lower:
                        score += 0.2
            scored.append((score, mem))
        
        # Sort by relevance score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

    def clear(self, bank_id: str):
        if bank_id in self.banks:
            self.banks[bank_id] = []

    def get_all(self, bank_id: str) -> List[Dict[str, Any]]:
        return self.banks.get(bank_id, [])


class HindsightService:
    def __init__(self):
        self.base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
        self.api_key = os.getenv("HINDSIGHT_API_KEY", "")
        self.client = None
        self.fallback_bank = FallbackMemoryBank()
        self.use_official_sdk = False

        if self.api_key or self.base_url != "https://api.hindsight.vectorize.io":
            try:
                from hindsight_client import Hindsight
                self.client = Hindsight(base_url=self.base_url, api_key=self.api_key if self.api_key else None)
                self.use_official_sdk = True
                logger.info(f"Initialized Hindsight Client connected to {self.base_url}")
            except Exception as e:
                logger.warning(f"Could not initialize official Hindsight client ({e}). Using fallback in-memory Hindsight engine.")
        else:
            logger.info("No HINDSIGHT_API_KEY set. Using active fallback Hindsight memory engine.")

    def retain_memory(self, bank_id: str, content: str, metadata: Optional[Dict[str, Any]] = None, tags: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Stores an audience interaction & extracted signals in Hindsight memory bank.
        """
        # Always save to fallback for guaranteed dashboard access
        mem_fallback = self.fallback_bank.retain(bank_id, content, metadata, tags)

        if self.use_official_sdk and self.client:
            try:
                # Call official Hindsight retain API
                res = self.client.retain(
                    bank_id=bank_id,
                    content=content,
                    metadata={k: str(v) for k, v in (metadata or {}).items()},
                    tags=tags
                )
                logger.info(f"Successfully retained memory in Hindsight bank {bank_id}: {res}")
            except Exception as e:
                logger.error(f"Hindsight API retain call failed: {e}. Retained in fallback memory store.")

        return mem_fallback

    def recall_memory(self, bank_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Recalls relevant historical memories from Hindsight based on search query.
        """
        # Try official SDK first
        if self.use_official_sdk and self.client:
            try:
                res = self.client.recall(bank_id=bank_id, query=query)
                results = []
                if hasattr(res, 'results') and res.results:
                    for r in res.results[:limit]:
                        results.append({
                            "id": getattr(r, 'id', 'hindsight-mem'),
                            "content": getattr(r, 'text', str(r)),
                            "metadata": getattr(r, 'metadata', {}),
                            "tags": getattr(r, 'tags', []),
                            "relevance_score": getattr(r, 'score', 0.95),
                            "timestamp": datetime.now().isoformat()
                        })
                    if results:
                        return results
            except Exception as e:
                logger.error(f"Hindsight API recall call failed: {e}. Falling back to internal bank.")

        return self.fallback_bank.recall(bank_id, query, limit)

    def build_audience_context(self, bank_id: str) -> Dict[str, Any]:
        """
        Synthesizes recalled memories to summarize patterns: high performing topics,
        preferred formats, audience sentiment, and timing preferences.
        """
        memories = self.fallback_bank.get_all(bank_id)
        if not memories:
            return {
                "has_memory": False,
                "total_memories": 0,
                "summary": "Cold start state: No historical audience memories recorded yet."
            }

        high_engagement_topics = []
        low_engagement_topics = []
        preferred_formats = []
        preferred_tones = []
        key_signals = []

        for mem in memories:
            meta = mem.get("metadata", {})
            topic = meta.get("topic")
            level = meta.get("engagement_level")
            fmt = meta.get("content_format")
            tone = meta.get("tone")
            feedback = meta.get("feedback_sentiment")

            if level == "High":
                if topic and topic not in high_engagement_topics:
                    high_engagement_topics.append(topic)
                if fmt and fmt not in preferred_formats:
                    preferred_formats.append(fmt)
                if tone and tone not in preferred_tones:
                    preferred_tones.append(tone)
                key_signals.append(f"Strong response to '{topic}' ({fmt}) - {feedback}")
            elif level == "Low":
                if topic and topic not in low_engagement_topics:
                    low_engagement_topics.append(topic)
                key_signals.append(f"Poor response to '{topic}' ({fmt}) - Low audience interest")

        return {
            "has_memory": True,
            "total_memories": len(memories),
            "high_engagement_topics": high_engagement_topics,
            "low_engagement_topics": low_engagement_topics,
            "preferred_formats": preferred_formats,
            "preferred_tones": preferred_tones,
            "key_signals": key_signals,
            "summary": f"Analyzed {len(memories)} historical audience signals. High affinity for {', '.join(high_engagement_topics[:3]) if high_engagement_topics else 'technical content'}. Avoid {', '.join(low_engagement_topics[:2]) if low_engagement_topics else 'generic posts'}."
        }

    def clear_bank(self, bank_id: str):
        self.fallback_bank.clear(bank_id)
        if self.use_official_sdk and self.client:
            try:
                if hasattr(self.client, 'delete_bank'):
                    self.client.delete_bank(bank_id)
            except Exception as e:
                logger.warning(f"Could not delete Hindsight bank {bank_id}: {e}")

hindsight_service = HindsightService()
