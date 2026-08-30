"""
Validation for generated financial plans.
"""

from typing import Any, Dict, List


def validate_plan(
    risk_profile: Dict[str, Any],
    feasibility: Dict[str, Any],
    allocation: Dict[str, Any],
    selected_instruments: Dict[str, Any],
    plan: Dict[str, Any],
) -> Dict[str, Any]:
    """Validate deterministic plan consistency."""

    errors: List[str] = []
    warnings: List[str] = []

    allocation_total = sum(
        allocation.values()
    )

    if allocation_total != 100:
        errors.append(
            f"Allocation total is "
            f"{allocation_total}, expected 100."
        )

    for category, percentage in (
        allocation.items()
    ):
        if percentage < 0:
            errors.append(
                f"Negative allocation in "
                f"{category}."
            )

    if risk_profile.get(
        "risk_category"
    ) not in [
        "Conservative",
        "Moderate",
        "Aggressive",
    ]:
        errors.append(
            "Invalid risk category."
        )

    if feasibility.get(
        "required_monthly_investment"
    ) is None:
        errors.append(
            "Missing required monthly investment."
        )

    if not plan.get("plans"):
        warnings.append(
            "Plan has no variants."
        )

    valid = len(errors) == 0

    return {
        "valid": valid,
        "errors": errors,
        "warnings": warnings,
    }