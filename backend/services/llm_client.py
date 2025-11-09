import json
from typing import Any, Dict, List

from ..core.config import settings


class BaseLLMClient:
    def explain(self, claim: Dict[str, Any], matched_rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        raise NotImplementedError


class MockLLMClient(BaseLLMClient):
    def explain(self, claim: Dict[str, Any], matched_rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        explanations = []
        recommendations = []
        for r in matched_rules:
            explanations.append({"rule_id": r.get("id"), "text": f"{r.get('id')}: {r.get('description')}"})
            recommendations.append({"rule_id": r.get("id"), "action": r.get("recommendation")})
        return {
            "explanations": explanations,
            "recommendations": recommendations,
            "summary_status": "Not validated" if matched_rules else "Validated",
        }


class OpenAILLMClient(BaseLLMClient):
    def __init__(self) -> None:
        self.api_key = settings.OPENAI_API_KEY

    def explain(self, claim: Dict[str, Any], matched_rules: List[Dict[str, Any]]) -> Dict[str, Any]:  # pragma: no cover
        if not self.api_key:
            # Fallback to mock behavior if key missing
            return MockLLMClient().explain(claim, matched_rules)
        # Minimal placeholder to avoid depending on SDK at this stage.
        # In real implementation, call OpenAI Chat Completions with a structured prompt.
        return MockLLMClient().explain(claim, matched_rules)


def get_llm_client() -> BaseLLMClient:
    provider = (settings.LLM_PROVIDER or "mock").lower()
    if provider == "openai":
        return OpenAILLMClient()
    return MockLLMClient()


