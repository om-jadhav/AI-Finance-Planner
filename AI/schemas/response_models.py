from pydantic import BaseModel
from typing import Dict, List, Any


class RiskProfileResponse(BaseModel):
    risk_score: int
    risk_category: str
    factor_breakdown: Dict[str, Any]
    monthly_surplus: float


class FeasibilityResponse(BaseModel):
    goal_feasible: bool
    status: str
    goal_amount: float
    projected_value: float
    required_monthly_investment: float
    available_monthly_investment: float
    monthly_surplus: float
    investment_gap: float
    assumed_annual_return: float
    investment_horizon_years: int


class PortfolioResponse(BaseModel):
    allocation: Dict[str, float]
    recommended_instruments: Dict[str, List[Dict[str, Any]]]


class PlanResponse(BaseModel):
    plans: List[Dict[str, Any]]
    disclaimer: str
    warnings: List[str]
    llm_used: bool = False


class MetadataResponse(BaseModel):
    metrics_version: str
    generated_at: str


class GeneratePlanResponse(BaseModel):
    success: bool
    risk_profile: RiskProfileResponse
    feasibility: FeasibilityResponse
    portfolio: PortfolioResponse
    plan: PlanResponse
    metadata: MetadataResponse