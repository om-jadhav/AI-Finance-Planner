"""
Analytics for mutual_funds.csv.

The dataset contains scheme metadata and NAV values.
Historical metrics are calculated only when multiple
dated NAV observations exist for the same scheme.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from analytics.common import calculate_price_metrics


def analyze_mutual_funds(
    file_path: Path,
) -> Dict[str, Any]:
    """Analyze mutual fund dataset."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    df = pd.read_csv(file_path)

    required_columns = [
        "Scheme Name",
        "Net Asset Value",
        "Date",
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        return {
            "error": (
                "Missing required columns: "
                + ", ".join(missing)
            )
        }

    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce",
    )

    df["Net Asset Value"] = pd.to_numeric(
        df["Net Asset Value"],
        errors="coerce",
    )

    df = df.dropna(
        subset=[
            "Scheme Name",
            "Date",
            "Net Asset Value",
        ]
    )

    results = {}

    grouped = df.groupby("Scheme Name")

    for scheme_name, group in grouped:
        group = group.sort_values("Date")

        group = group.drop_duplicates(
            subset=["Date"],
            keep="last",
        )

        latest_nav = float(
            group["Net Asset Value"].iloc[-1]
        )

        entry = {
            "asset_name": scheme_name,
            "category": (
                group["Category"].iloc[-1]
                if "Category" in group.columns
                else None
            ),
            "amc": (
                group["AMC"].iloc[-1]
                if "AMC" in group.columns
                else None
            ),
            "latest_nav": latest_nav,
            "observations": int(len(group)),
            "date_range": {
                "start": (
                    group["Date"].min()
                    .strftime("%Y-%m-%d")
                ),
                "end": (
                    group["Date"].max()
                    .strftime("%Y-%m-%d")
                ),
            },
        }

        if len(group) >= 12:
            entry["metrics"] = calculate_price_metrics(
                group["Net Asset Value"],
                periods_per_year=12,
            )
        else:
            entry["metrics"] = {
                "sufficient_data": False,
                "reason": (
                    "Insufficient historical observations "
                    "for return/risk metrics"
                ),
            }

        results[str(scheme_name)] = entry

    return results