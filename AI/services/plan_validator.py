"""
Validation for generated financial plans.
"""

from typing import Any, Dict, List


def validate_plan(
    risk_profile: Dict[str, Any],
    feasibility: Dict[str, Any],
    selected_instruments: Dict[str, Any],
    plan: Dict[str, Any],
) -> Dict[str, Any]:
    """Validate generated financial plan consistency."""

    errors: List[str] = []
    warnings: List[str] = []

    # Validate risk category
    if risk_profile.get("risk_category") not in [
        "Conservative",
        "Moderate",
        "Aggressive",
    ]:
        errors.append(
            "Invalid risk category."
        )

    # Validate feasibility data
    if feasibility.get(
        "required_monthly_investment"
    ) is None:
        errors.append(
            "Missing required monthly investment."
        )

    # Validate plans exist
    plans = plan.get("plans", [])

    if not plans:
        warnings.append(
            "Plan has no variants."
        )

    # Validate each plan allocation totals 100%
    for plan_item in plans:

        allocation = plan_item.get(
            "allocation",
            [],
        )

        total = sum(
            item.get("percent", 0)
            for item in allocation
        )

        if total != 100:
            errors.append(
                f"{plan_item.get('variant', 'Unknown')} allocation totals {total}%."
            )

    valid = len(errors) == 0

    return {
        "valid": valid,
        "errors": errors,
        "warnings": warnings,
    }