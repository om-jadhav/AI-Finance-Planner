"""
Plan context preparation and LLM plan generation.

No fallback plan. If the LLM fails or returns invalid output,
the request fails with a clear error instead of serving a
plan that isn't actually grounded in the user's input.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from config.settings import PROMPTS_DIR
from llm.client import generate_llm_response


class PlanGenerationError(Exception):
    """Raised when the LLM fails to produce a valid, usable plan."""


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


REQUIRED_PLAN_FIELDS = {
    "variant",
    "allocation",
    "expected_annual_return",
    "reasoning",
}


def validate_llm_plans(
    plans: Any,
) -> None:
    """
    Raise PlanGenerationError if the LLM output isn't usable.

    Checks: exactly 3 plans, all required fields present,
    each plan's allocation percentages sum to ~100.
    """

    if not isinstance(plans, list) or len(plans) != 3:
        raise PlanGenerationError(
            f"Expected exactly 3 plans, got: "
            f"{len(plans) if isinstance(plans, list) else type(plans)}"
        )

    for plan_item in plans:
        missing = REQUIRED_PLAN_FIELDS - plan_item.keys()

        if missing:
            raise PlanGenerationError(
                f"Plan '{plan_item.get('variant', '?')}' "
                f"missing fields: {missing}"
            )

        allocation_total = sum(
            item.get("percent", 0)
            for item in plan_item.get("allocation", [])
        )

        if abs(allocation_total - 100) > 1:
            raise PlanGenerationError(
                f"Plan '{plan_item['variant']}' allocation "
                f"sums to {allocation_total}, expected 100"
            )


def generate_plan(
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate the 3 plan variants using the LLM.

    Raises PlanGenerationError if the LLM is unavailable,
    unreachable, or returns output that fails validation.
    Callers (main.py) should catch this and return a proper
    error response to the client — never substitute a fake plan.
    """

    system_prompt = load_prompt(
        "plan_prompt.txt"
    )

    user_prompt = json.dumps(
        context,
        indent=2,
        default=str,
    )

    max_attempts = 3
    last_error: str = "unknown error"
    current_user_prompt = user_prompt

    for attempt in range(1, max_attempts + 1):

        llm_response = generate_llm_response(
            system_prompt=system_prompt,
            user_prompt=current_user_prompt,
        )
        print("\n========== RAW LLM RESPONSE ==========")
        print(llm_response)
        print("=======================================\n")

        if not llm_response:
            last_error = (
                "LLM did not return a response. Check "
                "LLM_API_KEY, LLM_ENABLED, and network "
                "connectivity."
            )
            continue

        try:
            parsed = json.loads(llm_response)
        except json.JSONDecodeError as error:
            last_error = (
                f"LLM response was not valid JSON: {error}"
            )
            continue

        plans = parsed.get("plans")

        try:
            validate_llm_plans(plans)
        except PlanGenerationError as error:
            last_error = str(error)

            print(
                f"Attempt {attempt}/{max_attempts} failed: "
                f"{last_error}. Retrying with correction "
                f"feedback."
            )

            # Feed the exact error back so the LLM can
            # correct itself on the next attempt.
            current_user_prompt = (
                user_prompt
                + "\n\nYour previous response had this "
                f"problem: {last_error}. Regenerate all "
                "3 plans, making sure every plan's "
                "allocation percentages sum to EXACTLY "
                "100 and all required fields are present."
            )
            continue

        return {
            "plans": plans,
            "disclaimer": parsed.get(
                "disclaimer",
                "AI-generated suggestion based on historical "
                "data, not certified financial advice. Consult "
                "a financial advisor before investing.",
            ),
            "warnings": [
                "Historical performance does not guarantee future returns.",
                "AI-generated allocations should be reviewed periodically.",
            ],
            "llm_used": True,
        }

    raise PlanGenerationError(
        f"LLM failed to produce a valid plan after "
        f"{max_attempts} attempts. Last error: {last_error}"
    )