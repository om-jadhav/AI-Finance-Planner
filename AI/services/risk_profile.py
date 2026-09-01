"""
Deterministic risk profiling.

The LLM is NOT used for risk scoring.
"""

from typing import Any, Dict


def calculate_risk_profile(
    profile: Dict[str, Any],
    goal: Dict[str, Any],
    risk_answers: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculate deterministic risk score from 0 to 100.
    """

    score = 0
    factors = {}

    age = profile.get("age", 30)

    if age < 30:
        points = 15
    elif age < 45:
        points = 10
    elif age < 60:
        points = 6
    else:
        points = 3

    score += points
    factors["age"] = points

    years = goal.get("target_years", 5)

    if years >= 10:
        points = 20
    elif years >= 5:
        points = 12
    else:
        points = 5

    score += points
    factors["investment_horizon"] = points

    income = profile.get(
        "monthly_income",
        0,
    )

    expenses = profile.get(
        "monthly_expenses",
        0,
    )

    surplus = max(income - expenses, 0)

    surplus_ratio = (
        surplus / income
        if income > 0
        else 0
    )

    if surplus_ratio >= 0.40:
        points = 15
    elif surplus_ratio >= 0.20:
        points = 10
    else:
        points = 5

    score += points
    factors["monthly_surplus"] = points

    experience = str(
        profile.get(
            "investment_experience",
            "Beginner",
        )
    ).lower()

    experience_map = {
        "beginner": 3,
        "intermediate": 8,
        "advanced": 12,
    }

    points = experience_map.get(
        experience,
        3,
    )

    score += points
    factors["investment_experience"] = points

    debt = profile.get(
        "total_debt",
        0,
    )

    if debt == 0:
        points = 10
    elif income > 0 and debt < income * 6:
        points = 5
    else:
        points = 0

    score += points
    factors["debt"] = points

    dependents = profile.get(
        "dependents",
        0,
    )

    if dependents == 0:
        points = 10
    elif dependents <= 2:
        points = 5
    else:
        points = 0

    score += points
    factors["dependents"] = points

    # Employment status — income stability signal.
    # Stable income (Salaried/Retired) supports slightly
    # more risk tolerance than unstable/variable income
    # (Self-employed/Business owner/Student), since the
    # latter have less predictable cash flow to absorb
    # a market downturn without needing to sell.
    employment_status = str(
        profile.get(
            "employment_status",
            "Salaried",
        )
    ).lower()

    stable_statuses = {"salaried", "retired"}
    unstable_statuses = {
        "self_employed", "self-employed",
        "business_owner", "business owner",
        "student",
    }

    if employment_status in stable_statuses:
        points = 5
    elif employment_status in unstable_statuses:
        points = 0
    else:
        points = 2  # "Other" or unrecognized — neutral

    score += points
    factors["employment_stability"] = points

    # Questionnaire contribution. Answers may arrive as
    # enum-style strings (e.g. "HOLD_AND_WAIT",
    # "BALANCE_SAFETY_GROWTH") from the frontend, not plain
    # phrases — normalize underscores/hyphens to spaces
    # before matching so both formats work.
    answers_text = " ".join(
        str(value).lower().replace("_", " ").replace("-", " ")
        for value in risk_answers.values()
    )

    aggressive_words = [
        "high risk",
        "aggressive",
        "long term",
        "market fall",
        "buy more",
        "invest more",
        "ten years",  # "10+ years" horizon phrasing variants
    ]

    moderate_words = [
        "moderate",
        "balanced",
        "balance safety growth",
        "some risk",
        "hold and wait",
    ]

    if any(
        word in answers_text
        for word in aggressive_words
    ):
        points = 8
    elif any(
        word in answers_text
        for word in moderate_words
    ):
        points = 5
    else:
        points = 2

    score += points
    factors["risk_questionnaire"] = points

    score = min(score, 100)

    if score < 40:
        category = "Conservative"
    elif score < 70:
        category = "Moderate"
    else:
        category = "Aggressive"

    return {
        "risk_score": score,
        "risk_category": category,
        "factor_breakdown": factors,
        "monthly_surplus": surplus,
    }