"""
Deterministic suggestions for infeasible financial goals.
"""

from typing import Any, Dict, List


def generate_goal_suggestions(
    feasibility: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate deterministic suggestions when a goal
    is not currently feasible.
    """

    if feasibility.get("goal_feasible", False):
        return {
            "goal_feasible": True,
            "suggestions": [],
        }

    investment_gap = max(
        feasibility.get("investment_gap", 0),
        0,
    )

    projected_value = feasibility.get(
        "projected_value",
        0,
    )

    goal_amount = feasibility.get(
        "goal_amount",
        0,
    )

    suggestions: List[Dict[str, str]] = []

    if investment_gap > 0:
        suggestions.append(
            {
                "title": "Increase Monthly Investment",
                "description": (
                    f"Increase your monthly investment "
                    f"by approximately ₹{investment_gap:,.0f} "
                    f"to stay on track for your goal."
                ),
            }
        )

    if projected_value < goal_amount:
        suggestions.append(
            {
                "title": "Reduce Goal Amount",
                "description": (
                    f"Based on your current investment capacity, "
                    f"a target closer to "
                    f"₹{projected_value:,.0f} "
                    f"would be more achievable within your "
                    f"selected investment horizon."
                ),
            }
        )

    suggestions.append(
        {
            "title": "Review Your Financial Plan",
            "description": (
                "As your income increases or expenses reduce, "
                "review and increase your monthly investment "
                "to improve your chances of achieving this goal."
            ),
        }
    )

    return {
        "goal_feasible": False,
        "suggestions": suggestions,
    }