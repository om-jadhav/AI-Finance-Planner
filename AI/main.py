"""
Financial AI Service.

Receives structured data from the Node.js backend,
performs deterministic financial analysis,
and optionally uses an LLM for explanation.
"""

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException

from data.historical_metrics import (
    HISTORICAL_METRICS,
)

from schemas.request_models import (
    GeneratePlanRequest,
)

from schemas.response_models import (
    GeneratePlanResponse,
)

from services.risk_profile import (
    calculate_risk_profile,
)

from services.feasibility import (
    calculate_feasibility,
)

from services.portfolio_allocator import (
    calculate_portfolio_allocation,
)

from services.instrument_selector import (
    select_instruments,
)

from services.plan_generator import (
    generate_plan,
    PlanGenerationError,
)

from services.plan_validator import (
    validate_plan,
)


app = FastAPI(
    title="Financial AI Service",
    version="1.0.0",
)


def get_assumed_return(
    risk_category: str,
) -> float:
    """
    Conservative planning assumptions.

    These are system assumptions for feasibility,
    not predictions or guarantees.
    """

    assumptions = {
        "Conservative": 0.08,
        "Moderate": 0.10,
        "Aggressive": 0.12,
    }

    return assumptions.get(
        risk_category,
        0.10,
    )


@app.get("/health")
def health():
    """Health check endpoint."""

    return {
        "status": "healthy",
        "service": "financial-ai-service",
        "historical_metrics_loaded":
            bool(HISTORICAL_METRICS),
    }


@app.post(
    "/generate-plan",
    response_model=GeneratePlanResponse,
)
def generate_financial_plan(
    request: GeneratePlanRequest,
):
    """
    Generate structured financial plan.
    """

    try:

        if not HISTORICAL_METRICS:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Historical metrics are not generated. "
                    "Run: python -m data.generate_metrics"
                ),
            )

        profile = request.profile.model_dump()
        goal = request.goal.model_dump()
        risk_answers = request.risk_answers

        # 1. Deterministic risk profile.
        risk_profile = calculate_risk_profile(
            profile=profile,
            goal=goal,
            risk_answers=risk_answers,
        )

        # 2. Return assumption based on risk.
        assumed_return = get_assumed_return(
            risk_profile["risk_category"]
        )

        # 3. Deterministic feasibility.
        feasibility = calculate_feasibility(
            profile=profile,
            goal=goal,
            assumed_annual_return=assumed_return,
        )

        # 4. Portfolio allocation.
        allocation = (
            calculate_portfolio_allocation(
                risk_category=risk_profile[
                    "risk_category"
                ],
                target_years=goal[
                    "target_years"
                ],
            )
        )

        # 5. Select actual instruments, respecting
        #    the user's Step 5 category preferences.
        selected_instruments = (
            select_instruments(
                historical_metrics=
                    HISTORICAL_METRICS,
                risk_category=risk_profile[
                    "risk_category"
                ],
                preferred_categories=
                    request.preferred_categories,
            )
        )

        # 6. Build structured context.
        context = {
            "profile": profile,
            "goal": goal,
            "risk_profile": risk_profile,
            "feasibility": feasibility,
            "allocation": allocation,
            "selected_instruments":
                selected_instruments,
        }

        # 7. LLM plan generation. Raises PlanGenerationError
        #    if the LLM fails or returns invalid output —
        #    no fallback plan is substituted.
        try:
            plan = generate_plan(context)
        except PlanGenerationError as error:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Could not generate a financial plan: "
                    f"{error}"
                ),
            )

        # 8. Validate.
        validation = validate_plan(
            risk_profile=risk_profile,
            feasibility=feasibility,
            allocation=allocation,
            selected_instruments=
                selected_instruments,
            plan=plan,
        )

        return {
            "success": True,
            "risk_profile": risk_profile,
            "feasibility": feasibility,
            "portfolio": {
                "allocation": allocation,
                "recommended_instruments":
                    selected_instruments,
            },
            "plan": plan,
            "validation": validation,
            "metadata": {
                "metrics_version":
                    HISTORICAL_METRICS
                    .get("metadata", {})
                    .get(
                        "dataset_version",
                        "unknown",
                    ),
                "generated_at":
                    datetime.now(
                        timezone.utc
                    ).isoformat(),
            },
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )