"""
Analytics for RBI dataset.

The discovered CSV contains inconsistent field counts,
so parsing is attempted cautiously.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd


def analyze_rbi(
    file_path: Path,
) -> Dict[str, Any]:
    """Attempt safe inspection of RBI CSV."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    try:
        df = pd.read_csv(
            file_path,
            engine="python",
            on_bad_lines="skip",
        )

        return {
            "status": "parsed_with_bad_lines_skipped",
            "rows": int(len(df)),
            "columns": df.columns.tolist(),
            "warning": (
                "Original file contains inconsistent row "
                "field counts. Metrics should not be treated "
                "as complete until source structure is verified."
            ),
        }

    except Exception as error:
        return {
            "error": str(error)
        }