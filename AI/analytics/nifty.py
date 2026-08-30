"""
Analytics for nifty50.csv.

The actual dataset contains a Date column and multiple
price columns including NIFTY50 and individual stocks.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from analytics.common import calculate_price_metrics


def analyze_nifty_dataset(
    file_path: Path,
) -> Dict[str, Any]:
    """Analyze NIFTY50 and stock price columns."""

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