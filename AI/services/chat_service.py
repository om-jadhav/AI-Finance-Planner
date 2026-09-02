"""
Chatbot service -- retrieval-augmented generation (RAG).

Orchestrates: retrieve relevant knowledge_base chunks for the user's
latest question -> assemble a context object (retrieved chunks + the
user's own profile/risk/feasibility/plan data, exactly as returned by
/generate-plan, if available) -> call the LLM with the recent
conversation -> return a plain-text reply.

Kept entirely separate from services/plan_generator.py, risk_profile.py,
feasibility.py, portfolio_allocator.py, and instrument_selector.py -- this
module never touches any of that logic. It only READS already-computed
results passed in by the caller (main.py) as `user_context`.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from config.settings import PROMPTS_DIR
from llm.client import generate_chat_reply
from rag.retriever import retrieve_context

# Only the most recent N messages are sent to the LLM, per project
# requirement. Keeps token usage bounded and keeps the model focused on
# the recent thread rather than an ever-growing conversation.
MAX_HISTORY_MESSAGES = 10


class ChatError(Exception):
    """Raised when the chatbot LLM call fails or is unavailable."""


def _load_prompt(filename: str) -> str:
    path = PROMPTS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Prompt not found: {path}")
    return path.read_text(encoding="utf-8")


def _latest_user_question(messages: List[Dict[str, str]]) -> str:
    for message in reversed(messages):
        if message.get("role") == "user":
            return message.get("content", "")
    return ""


def generate_chat_response(
    messages: List[Dict[str, str]],
    user_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate one chatbot reply given the conversation so far.

    Args:
        messages: full turn history the caller has, e.g.
            [{"role": "user", "content": "What is CAGR?"}, ...]
            Only the last MAX_HISTORY_MESSAGES are actually sent to the
            LLM (trimmed here, defensively, even if the caller already
            trimmed on their end).
        user_context: the user's own profile/risk_profile/feasibility/
            portfolio/plan data, in the exact shape /generate-plan
            returns, or None if unavailable.

    Returns:
        {"reply": str, "sources": [str, ...]}

    Raises:
        ChatError if the LLM is unavailable or returns nothing.
    """

    if not messages:
        raise ChatError("No messages provided.")

    trimmed_messages = messages[-MAX_HISTORY_MESSAGES:]

    question = _latest_user_question(trimmed_messages)
    retrieved = retrieve_context(question, top_k=3)

    system_prompt_template = _load_prompt("chat_prompt.txt")

    context_block = json.dumps(
        {
            "knowledge_base_excerpts": retrieved or "No closely matching knowledge base excerpt was found for this question.",
            "user_context": user_context if user_context else "No user profile/plan data is available -- the user has not completed their financial profile or generated a plan yet.",
        },
        indent=2,
        default=str,
    )

    system_prompt = system_prompt_template + "\n\nCONTEXT:\n" + context_block

    reply = generate_chat_reply(
        system_prompt=system_prompt,
        messages=trimmed_messages,
    )

    if not reply:
        raise ChatError(
            "The chat assistant did not return a response. Check "
            "LLM_API_KEY, LLM_ENABLED, and network connectivity."
        )

    sources = []
    if retrieved:
        for block in retrieved.split("\n\n---\n\n"):
            first_line = block.split("\n", 1)[0]
            if first_line.startswith("[Source:"):
                sources.append(first_line.strip("[]").replace("Source: ", ""))

    return {"reply": reply, "sources": sources}
