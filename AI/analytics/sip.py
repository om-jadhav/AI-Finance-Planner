"""
Analytics for SIP instrument datasets.

Supports actual files discovered in:
data/datasets/SIP_datasets/

Expected useful columns discovered:
Date, Close, Adj_Close, Percent_Change, etc.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from analytics.common import calculate_price_metrics


def analyze_sip_file(file_path: Path) -> Dict[str, Any]:
    """Analyze one SIP instrument CSV file."""

    df = pd.read_csv(file_path)

    if "Date" not in df.columns:
        return {
            "error": "Missing Date column",
            "file": file_path.name,
        }

    price_column = None

    for candidate in ["Adj_Close", "Close"]:
        if candidate in df.columns:
            price_column = candidate
            break

    if price_column is None:
        return {
            "error": "Missing usable price column",
            "file": file_path.name,
        }

    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce",
    )

    df = df.dropna(
        subset=["Date", price_column]
    )

    df = df.sort_values("Date")

    df = df.drop_duplicates(
        subset=["Date"]
    )

    metrics = calculate_price_metrics(
        df[price_column],
        periods_per_year=12,
    )

    symbol = file_path.stem.replace(
        "_data",
        ""
    ).replace(".NS", "")

    return {
        "asset_name": symbol,
        "source_file": file_path.name,
        "date_range": {
            "start": (
                df["Date"].min().strftime("%Y-%m-%d")
                if not df.empty else None
            ),
            "end": (
                df["Date"].max().strftime("%Y-%m-%d")
                if not df.empty else None
            ),
        },
        "frequency": "monthly",
        "price_column": price_column,
        "metrics": metrics,
    }


def analyze_sip_directory(
    directory: Path,
) -> Dict[str, Any]:
    """Analyze all SIP CSV files."""

    results = {}

    if not directory.exists():
        return {
            "error": f"Directory not found: {directory}"
        }

    for file_path in directory.glob("*.csv"):
        try:
            analysis = analyze_sip_file(file_path)

            asset_name = analysis.get(
                "asset_name",
                file_path.stem,
            )

            results[asset_name] = analysis

        except Exception as error:
            results[file_path.stem] = {
                "error": str(error),
                "source_file": file_path.name,
            }

    return results