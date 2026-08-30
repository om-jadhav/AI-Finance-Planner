"""
Deterministic instrument selection.

Pulls from HISTORICAL_METRICS: stocks, sip (renamed
etf_instruments), nifty, and dummy_assets (mutual funds +
fixed income). Every category here is a genuinely COMPUTED
metric from a price time-series (see analytics/dummy_assets.py
and data/generate_metrics.py) — nothing is a typed-in final
number.

Supports optional category filtering (preferred_categories)
so a user's Step 5 selections are respected.

All CAGR/volatility/drawdown values are converted to percent
(18.59 not 0.1859) for readability.
"""

from typing import Any, Dict, List, Optional


def to_percent(value: Any) -> Any:
    """Convert a decimal fraction (0.1859) to percent (18.59). Passes through None."""

    if value is None:
        return None

    try:
        return round(float(value) * 100, 2)
    except (TypeError, ValueError):
        return value


def get_metric_value(
    asset: Dict[str, Any],
    metric_name: str,
    default: float = -999999,
) -> float:
    """Safely read a metric."""

    value = (
        asset.get("metrics", {})
        .get(metric_name)
    )

    if value is None:
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def select_top_assets(
    assets: Dict[str, Any],
    limit: int = 3,
) -> List[Dict[str, Any]]:
    """
    Rank assets using available risk-adjusted metrics.
    Output values are in percent, not decimal fractions.
    """

    candidates = []

    for name, asset in assets.items():

        metrics = asset.get(
            "metrics",
            {}
        )

        if not metrics.get(
            "sufficient_data",
            False,
        ):
            continue

        annual_return = get_metric_value(
            asset,
            "annualized_return_cagr",
        )

        sharpe = get_metric_value(
            asset,
            "sharpe_ratio",
            default=0,
        )

        max_drawdown = abs(
            get_metric_value(
                asset,
                "maximum_drawdown",
                default=0,
            )
        )

        score = (
            annual_return * 100
            + sharpe * 10
            - max_drawdown * 30
        )

        candidates.append({
            "instrument": name,
            "score": round(score, 4),
            "annualized_return_cagr_pct":
                to_percent(metrics.get(
                    "annualized_return_cagr"
                )),
            "annualized_volatility_pct":
                to_percent(metrics.get(
                    "annualized_volatility"
                )),
            "maximum_drawdown_pct":
                to_percent(metrics.get(
                    "maximum_drawdown"
                )),
            "sharpe_ratio":
                metrics.get(
                    "sharpe_ratio"
                ),
        })

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[:limit]


FIXED_INCOME_NAMES = {"FIXED_DEPOSIT", "PPF"}


CATEGORY_ALIASES = {
    "stocks": ["stocks"],
    "mutual_funds": ["mutual_funds"],
    "gold": ["etf_instruments"],  # GOLDBEES/SILVERBEES live here
    "etf_instruments": ["etf_instruments", "index_funds"],
    "fixed_income": ["fixed_income"],
}


def select_instruments(
    historical_metrics: Dict[str, Any],
    risk_category: str,
    preferred_categories: Optional[List[str]] = None,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Select instruments from computed metrics.
    """

    stocks = historical_metrics.get("stocks", {})
    etf_data = historical_metrics.get("sip", {})
    nifty = historical_metrics.get("nifty", {})
    dummy_assets = historical_metrics.get("dummy_assets", {})

    # Split dummy_assets (computed together) into
    # mutual funds vs fixed income by name.
    dummy_mutual_funds = {
        name: data
        for name, data in dummy_assets.items()
        if name not in FIXED_INCOME_NAMES
    }

    dummy_fixed_income = {
        name: data
        for name, data in dummy_assets.items()
        if name in FIXED_INCOME_NAMES
    }

    stock_limit = (
        4
        if risk_category == "Aggressive"
        else 3
    )

    all_selected = {
        "stocks": select_top_assets(stocks, limit=stock_limit),
        "etf_instruments": select_top_assets(etf_data, limit=4),
        # ^ includes real GOLDBEES/SILVERBEES/NIFTYBEES/BANKBEES data
        "index_funds": select_top_assets(nifty, limit=1),
        "fixed_income": select_top_assets(
            dummy_fixed_income, limit=2
        ),
        "mutual_funds": select_top_assets(
            dummy_mutual_funds, limit=3
        ),
    }

    if not preferred_categories:
        return all_selected

    allowed_keys = set()
    for pref in preferred_categories:
        allowed_keys.update(
            CATEGORY_ALIASES.get(pref, [pref])
        )

    return {
        key: value
        for key, value in all_selected.items()
        if key in allowed_keys
    }