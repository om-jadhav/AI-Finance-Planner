"""
Common functions used by historical analytics modules.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

import numpy as np
import pandas as pd


MONTHS_PER_YEAR = 12
TRADING_PERIODS_PER_YEAR = 12


def safe_float(value: Any) -> Optional[float]:
    """Safely convert a value to float."""
    try:
        if pd.isna(value):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def calculate_returns(series: pd.Series) -> pd.Series:
    """
    Calculate percentage returns.
    Assumes chronological price series.
    """
    numeric = pd.to_numeric(series, errors="coerce").dropna()
    return numeric.pct_change().dropna()


def calculate_total_return(series: pd.Series) -> Optional[float]:
    """Calculate total return."""
    numeric = pd.to_numeric(series, errors="coerce").dropna()

    if len(numeric) < 2 or numeric.iloc[0] == 0:
        return None

    return float((numeric.iloc[-1] / numeric.iloc[0]) - 1)


def calculate_cagr(
    series: pd.Series,
    periods_per_year: int = MONTHS_PER_YEAR,
) -> Optional[float]:
    """Calculate CAGR from a chronological series."""
    numeric = pd.to_numeric(series, errors="coerce").dropna()

    if len(numeric) < 2:
        return None

    start_value = numeric.iloc[0]
    end_value = numeric.iloc[-1]

    if start_value <= 0 or end_value <= 0:
        return None

    years = (len(numeric) - 1) / periods_per_year

    if years <= 0:
        return None

    return float((end_value / start_value) ** (1 / years) - 1)


def calculate_annualized_volatility(
    returns: pd.Series,
    periods_per_year: int = MONTHS_PER_YEAR,
) -> Optional[float]:
    """Calculate annualized volatility."""
    if len(returns) < 2:
        return None

    volatility = returns.std(ddof=1) * np.sqrt(periods_per_year)
    return float(volatility)


def calculate_downside_deviation(
    returns: pd.Series,
    periods_per_year: int = MONTHS_PER_YEAR,
) -> Optional[float]:
    """Calculate annualized downside deviation."""
    negative_returns = returns[returns < 0]

    if len(negative_returns) < 2:
        return None

    downside = negative_returns.std(ddof=1) * np.sqrt(periods_per_year)
    return float(downside)


def calculate_max_drawdown(series: pd.Series) -> Optional[float]:
    """Calculate maximum drawdown."""
    numeric = pd.to_numeric(series, errors="coerce").dropna()

    if len(numeric) < 2:
        return None

    running_max = numeric.cummax()

    drawdown = (numeric - running_max) / running_max

    return float(drawdown.min())


def calculate_positive_period_percentage(
    returns: pd.Series,
) -> Optional[float]:
    """Percentage of periods with positive returns."""
    if len(returns) == 0:
        return None

    return float((returns > 0).mean())


def calculate_negative_period_percentage(
    returns: pd.Series,
) -> Optional[float]:
    """Percentage of periods with negative returns."""
    if len(returns) == 0:
        return None

    return float((returns < 0).mean())


def calculate_sharpe_ratio(
    annualized_return: Optional[float],
    annualized_volatility: Optional[float],
    risk_free_rate: float = 0.06,
) -> Optional[float]:
    """Calculate simplified Sharpe ratio."""
    if (
        annualized_return is None
        or annualized_volatility is None
        or annualized_volatility < 0.0005
    ):
        return None

    return float(
        (annualized_return - risk_free_rate)
        / annualized_volatility
    )


def calculate_sortino_ratio(
    annualized_return: Optional[float],
    downside_deviation: Optional[float],
    risk_free_rate: float = 0.06,
) -> Optional[float]:
    """Calculate Sortino ratio."""
    if (
        annualized_return is None
        or downside_deviation is None
        or downside_deviation == 0
    ):
        return None

    return float(
        (annualized_return - risk_free_rate)
        / downside_deviation
    )


def calculate_calmar_ratio(
    annualized_return: Optional[float],
    max_drawdown: Optional[float],
) -> Optional[float]:
    """Calculate Calmar ratio."""
    if (
        annualized_return is None
        or max_drawdown is None
        or max_drawdown == 0
    ):
        return None

    return float(
        annualized_return / abs(max_drawdown)
    )


def calculate_period_return(
    series: pd.Series,
    periods: int,
) -> Optional[float]:
    """Calculate return for the latest N periods."""
    numeric = pd.to_numeric(series, errors="coerce").dropna()

    if len(numeric) <= periods:
        return None

    start = numeric.iloc[-(periods + 1)]
    end = numeric.iloc[-1]

    if start == 0:
        return None

    return float((end / start) - 1)


def calculate_price_metrics(
    series: pd.Series,
    periods_per_year: int = MONTHS_PER_YEAR,
) -> Dict[str, Any]:
    """
    Calculate meaningful metrics for a chronological price/NAV series.
    """
    numeric = pd.to_numeric(series, errors="coerce").dropna()

    if len(numeric) < 2:
        return {
            "sufficient_data": False,
            "observations": int(len(numeric)),
        }

    returns = calculate_returns(numeric)

    cagr = calculate_cagr(
        numeric,
        periods_per_year=periods_per_year,
    )

    volatility = calculate_annualized_volatility(
        returns,
        periods_per_year=periods_per_year,
    )

    downside = calculate_downside_deviation(
        returns,
        periods_per_year=periods_per_year,
    )

    max_drawdown = calculate_max_drawdown(numeric)

    metrics = {
        "sufficient_data": True,
        "observations": int(len(numeric)),
        "first_value": safe_float(numeric.iloc[0]),
        "latest_value": safe_float(numeric.iloc[-1]),
        "total_return": calculate_total_return(numeric),
        "annualized_return_cagr": cagr,
        "annualized_volatility": volatility,
        "downside_deviation": downside,
        "maximum_drawdown": max_drawdown,
        "sharpe_ratio": calculate_sharpe_ratio(
            cagr,
            volatility,
        ),
        "sortino_ratio": calculate_sortino_ratio(
            cagr,
            downside,
        ),
        "calmar_ratio": calculate_calmar_ratio(
            cagr,
            max_drawdown,
        ),
        "positive_period_percentage":
            calculate_positive_period_percentage(returns),
        "negative_period_percentage":
            calculate_negative_period_percentage(returns),
        "best_period_return":
            safe_float(returns.max()) if len(returns) else None,
        "worst_period_return":
            safe_float(returns.min()) if len(returns) else None,
        "1_month_return":
            calculate_period_return(numeric, 1),
        "3_month_return":
            calculate_period_return(numeric, 3),
        "6_month_return":
            calculate_period_return(numeric, 6),
        "1_year_return":
            calculate_period_return(
                numeric,
                periods_per_year,
            ),
    }

    return metrics