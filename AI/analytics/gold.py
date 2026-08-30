"""
Analytics for gold.csv.

The file contains metadata rows before the actual data.
This module attempts to locate a row containing 'Date'
and usable price columns.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd


def analyze_gold_dataset(
    file_path: Path,
) -> Dict[str, Any]:
    """Inspect gold dataset without assuming a header."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    try:
        raw = pd.read_csv(
            file_path,
            header=None,
            dtype=str,
        )
    except Exception as error:
        return {
            "error": str(error)
        }

    header_row = None

    for index, row in raw.iterrows():
        values = [
            str(value).strip().lower()
            for value in row.tolist()
        ]

        if any(
            "date" in value
            for value in values
        ):
            header_row = index
            break

    if header_row is None:
        return {
            "status": "structure_detected_but_no_standard_date_header",
            "rows": int(raw.shape[0]),
            "columns": int(raw.shape[1]),
            "note": (
                "Gold dataset requires source-specific "
                "header inspection before reliable historical "
                "price metrics can be calculated."
            ),
        }

    try:
        df = pd.read_csv(
            file_path,
            skiprows=header_row,
        )

        return {
            "status": "header_detected",
            "header_row": int(header_row),
            "columns": df.columns.tolist(),
            "rows": int(df.shape[0]),
        }

    except Exception as error:
        return {
            "error": str(error)
        }