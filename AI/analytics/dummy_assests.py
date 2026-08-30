"""
Analytics for dummy_mutual_funds_and_fixed_income.csv.

Same shape as nifty50.csv (Date column + one column per asset),
same shared metric functions (analytics.common.calculate_price_metrics)
as every other real dataset in this project. Nothing here is a
typed-in final number — CAGR/volatility/Sharpe/drawdown are all
computed from the monthly price series, identically to how
stocks and ETFs are handled.

This dataset exists because:
- mutual_funds.csv is a single-day AMFI NAV snapshot (one date
  only), so no real return history can be computed from it.
- FD and PPF are declared/published rates with no market price
  history at all.

The price series here are synthetic monthly paths generated to
be consistent with real, published reference returns (AMFI
5-year fund category averages; RBI/Ministry of Finance FD and
PPF rates) — same idea as a dummy dataset built for a hackathon,
but run through the real calculation pipeline instead of having
the final numbers typed in directly.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from analytics.common import calculate_price_metrics


def analyze_dummy_assets(
    file_path: Path,
) -> Dict[str, Any]:
    """Analyze the dummy mutual fund / fixed income price columns."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    df = pd.read_csv(file_path)

    if "Date" not in df.columns:
        return {
            "error": "Date column not found"
        }

    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce",
    )

    df = df.dropna(subset=["Date"])
    df = df.sort_values("Date")
    df = df.drop_duplicates(subset=["Date"])

    results = {}

    asset_columns = [
        column
        for column in df.columns
        if column != "Date"
    ]

    for column in asset_columns:
        numeric_series = pd.to_numeric(
            df[column],
            errors="coerce",
        ).dropna()

        if len(numeric_series) < 2:
            continue

        results[column] = {
            "asset_name": column,
            "source_file": file_path.name,
            "date_range": {
                "start": df["Date"].min().strftime(
                    "%Y-%m-%d"
                ),
                "end": df["Date"].max().strftime(
                    "%Y-%m-%d"
                ),
            },
            "frequency": "monthly",
            "metrics": calculate_price_metrics(
                numeric_series,
                periods_per_year=12,
            ),
        }

    return results