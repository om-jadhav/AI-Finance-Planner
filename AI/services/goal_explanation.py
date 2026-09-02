"""
LLM explanation for infeasible financial goals.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from config.settings import PROMPTS_DIR
from llm.client import generate_llm_response


class GoalExplanationError(Exception):
    """Raised when the LLM fails to generate an explanation."""


def load_prompt(
    filename: str,
) -> str:
    """Load a prompt file."""

    path = PROMPTS_DIR / filename

    if not path.exists():
        raise FileNotFoundError(
            f"Prompt not found: {path}"
        )

    return path.read_text(
        encoding="utf-8"
    )


def generate_goal_explanation(
    context: Dict[str, Any],
) -> Dict[str, str]:
    """
    Generate an AI explanation for an infeasible goal.
    """

    system_prompt = load_prompt(
        "goal_explanation_prompt.txt"
    )

    user_prompt = json.dumps(
        context,
        indent=2,
        default=str,
    )

    llm_response = generate_llm_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    if not llm_response:
        raise GoalExplanationError(
            "LLM did not return a response."
        )

    try:
        parsed = json.loads(llm_response)
    except json.JSONDecodeError as error:
        raise GoalExplanationError(
            f"Invalid JSON returned by LLM: {error}"
        )

    explanation = parsed.get("explanation")

    if not explanation:
        raise GoalExplanationError(
            "LLM response missing explanation."
        )

    return {
        "explanation": explanation,
    }