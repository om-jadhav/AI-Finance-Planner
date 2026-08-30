"""
Analytics for CPI dataset.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd


def analyze_cpi(
    file_path: Path,
) -> Dict[str, Any]:
    """Analyze CPI dataset."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    try:
        df = pd.read_csv(
            file_path,
            header=1,
        )
    except Exception as error:
        return {
            "error": str(error)
        }

    df.columns = [
        str(column).strip()
        for column in df.columns
    ]

    numeric_columns = []

    for column in df.columns:
        converted = pd.to_numeric(
            df[column],
            errors="coerce",
        )

        if converted.notna().sum() > 0:
            numeric_columns.append(column)

    result = {
        "rows": int(len(df)),
        "columns": df.columns.tolist(),
        "numeric_columns": numeric_columns,
    }

    return result