"""
Goal feasibility calculations.

All calculations are deterministic.
"""

from typing import Any, Dict


def calculate_future_value(
    present_value: float,
    monthly_investment: float,
    annual_return: float,
    years: int,
) -> float:
    """
    Future value with monthly compounding.
    """

    monthly_rate = annual_return / 12
    months = years * 12

    if months <= 0:
        return present_value

    if monthly_rate == 0:
        return (
            present_value
            + monthly_investment * months
        )

    future_value_lump_sum = (
        present_value
        * (1 + monthly_rate) ** months
    )

    future_value_sip = (
        monthly_investment
        * (
            ((1 + monthly_rate) ** months - 1)
            / monthly_rate
        )
    )

    return (
        future_value_lump_sum
        + future_value_sip
    )


def calculate_required_monthly_investment(
    goal_amount: float,
    present_value: float,
    annual_return: float,
    years: int,
) -> float:
    """
    Calculate required monthly investment.
    """

    monthly_rate = annual_return / 12
    months = years * 12

    if months <= 0:
        return 0.0

    if monthly_rate == 0:
        return max(
            (goal_amount - present_value)
            / months,
            0,
        )

    future_value_existing = (
        present_value
        * (1 + monthly_rate) ** months
    )

    numerator = (
        goal_amount
        - future_value_existing
    ) * monthly_rate

    denominator = (
        (1 + monthly_rate) ** months
        - 1
    )

    if denominator == 0:
        return 0.0

    return max(
        numerator / denominator,
        0,
    )


def calculate_feasibility(
    profile: Dict[str, Any],
    goal: Dict[str, Any],
    assumed_annual_return: float,
) -> Dict[str, Any]:
    """Calculate deterministic goal feasibility."""

    monthly_income = float(
        profile.get("monthly_income", 0)
    )

    monthly_expenses = float(
        profile.get("monthly_expenses", 0)
    )

    current_savings = float(
        profile.get("current_savings", 0)
    )

    existing_investments = float(
        profile.get(
            "existing_investments",
            0,
        )
    )

    available_investment = float(
        profile.get(
            "monthly_investment_capacity",
            max(
                monthly_income
                - monthly_expenses,
                0,
            ),
        )
    )

    goal_amount = float(
        goal.get("goal_amount", 0)
    )

    years = int(
        goal.get("target_years", 1)
    )

    monthly_surplus = max(
        monthly_income
        - monthly_expenses,
        0,
    )

    present_value = (
        current_savings
        + existing_investments
    )

    projected_value = calculate_future_value(
        present_value=present_value,
        monthly_investment=available_investment,
        annual_return=assumed_annual_return,
        years=years,
    )

    required_monthly = (
        calculate_required_monthly_investment(
            goal_amount=goal_amount,
            present_value=present_value,
            annual_return=assumed_annual_return,
            years=years,
        )
    )

    investment_gap = (
        required_monthly
        - available_investment
    )

    if projected_value >= goal_amount:
        status = "Feasible"
        goal_feasible = True
    elif projected_value >= goal_amount * 0.75:
        status = "Partially Feasible"
        goal_feasible = False
    else:
        status = "Difficult"
        goal_feasible = False

    return {
        "goal_feasible": goal_feasible,
        "status": status,
        "goal_amount": goal_amount,
        "projected_value": round(
            projected_value,
            2,
        ),
        "required_monthly_investment": round(
            required_monthly,
            2,
        ),
        "available_monthly_investment": round(
            available_investment,
            2,
        ),
        "monthly_surplus": round(
            monthly_surplus,
            2,
        ),
        "investment_gap": round(
            investment_gap,
            2,
        ),
        "assumed_annual_return": assumed_annual_return,
        "investment_horizon_years": years,
    }