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
    ChatRequest,
)

from schemas.response_models import (
    GeneratePlanResponse,
)

from services.risk_profile import (
    calculate_risk_profile,
)

from services.goal_explanation import (
    generate_goal_explanation,
    GoalExplanationError,
)

from services.feasibility import (
    calculate_feasibility,
)
from services.goal_suggestions import (
    generate_goal_suggestions,
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

from services.chat_service import (
    generate_chat_response,
    ChatError,
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
    
        goal_suggestions = generate_goal_suggestions(
            feasibility
        )
        if not feasibility["goal_feasible"]:

            explanation_context = {
                "profile": profile,
                "goal": goal,
                "risk_profile": risk_profile,
                "feasibility": feasibility,
                "goal_suggestions": goal_suggestions,
            }

            try:
                explanation = generate_goal_explanation(
                    explanation_context
                )

                goal_suggestions["explanation"] = (
                    explanation["explanation"]
                )

            except GoalExplanationError:

                goal_suggestions["explanation"] = (
                    "Your current financial plan is unlikely "
                    "to achieve your goal within the selected "
                    "time horizon. Consider the suggestions "
                    "above and review your investment strategy."
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
        # 6. Decide investment mode based on monthly investment capacity.
        monthly_investment = profile["monthly_investment_capacity"]

        if monthly_investment < 1000:
            investment_mode = {
                "type": "single_asset",
                "monthly_investment": monthly_investment,
            }

        elif monthly_investment <= 3000:
            investment_mode = {
                "type": "two_assets",
                "monthly_investment": monthly_investment,
            }

        else:
            investment_mode = {
                "type": "full_diversification",
                "monthly_investment": monthly_investment,
            }

        # 7. Build structured context.
        context = {
            "profile": profile,
            "goal": goal,
            "risk_profile": risk_profile,
            "feasibility": feasibility,
            "selected_instruments":
                selected_instruments,
            "investment_mode":
                investment_mode,
        }

        # 7. LLM plan generation. Raises PlanGenerationError
        #    if the LLM fails or returns invalid output —
        #    no fallback plan is substituted.
        if feasibility["goal_feasible"]:

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

        else:

            plan = {
                "plans": [],
                "disclaimer": "",
                "warnings": [],
                "llm_used": False,
            }

        # 8. Validate.
        validation = validate_plan(
            risk_profile=risk_profile,
            feasibility=feasibility,
            selected_instruments=
                selected_instruments,
            plan=plan,
        )

        return {
            "success": True,
            "risk_profile": risk_profile,
            "feasibility": feasibility,
             "goal_suggestions":
                goal_suggestions,
            "portfolio": {
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


@app.post("/chat")
def chat(
    request: ChatRequest,
):
    """
    RAG chatbot endpoint.

    Retrieves relevant knowledge-base passages for the user's latest
    message, combines them with the user's own already-computed
    profile/risk/feasibility/portfolio/plan data (request.user_context,
    if any -- in the exact shape /generate-plan returns), and asks the
    LLM to reply. Never recalculates any financial figure -- it only
    explains numbers already produced by the deterministic engine above.
    """

    try:
        result = generate_chat_response(
            messages=[
                message.model_dump()
                for message in request.messages
            ],
            user_context=request.user_context,
        )

        return {
            "success": True,
            "reply": result["reply"],
            "sources": result["sources"],
        }

    except ChatError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Chat assistant unavailable: {error}",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )