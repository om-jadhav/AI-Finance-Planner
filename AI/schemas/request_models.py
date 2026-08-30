"""
FastAPI request schemas.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class Profile(BaseModel):

    age: int = Field(
        ge=18,
        le=100,
    )

    monthly_income: float = Field(
        ge=0
    )

    monthly_expenses: float = Field(
        ge=0
    )

    current_savings: float = Field(
        default=0,
        ge=0,
    )

    existing_investments: float = Field(
        default=0,
        ge=0,
    )

    monthly_investment_capacity: float = Field(
        ge=0
    )

    dependents: int = Field(
        default=0,
        ge=0,
    )

    total_debt: float = Field(
        default=0,
        ge=0,
    )

    investment_experience: str = (
        "Beginner"
    )


class Goal(BaseModel):

    goal_type: str

    goal_amount: float = Field(
        gt=0
    )

    target_years: int = Field(
        gt=0,
        le=50,
    )

    priority: str = "Medium"


class GeneratePlanRequest(BaseModel):

    user_id: Optional[str] = None

    profile: Profile

    goal: Goal

    risk_answers: Dict[str, Any] = {}

    preferred_categories: Optional[list[str]] = None
    # Values: "stocks", "mutual_funds", "gold", "etf_instruments",
    # "fixed_income". None or empty list = no filtering (all allowed).
    # "I'm open to all" on the frontend should send None.