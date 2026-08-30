"""
Analytics for stocks.xlsx.

The discovered workbook contains metadata rows before the
actual tabular data, so this module inspects sheets and
attempts to detect usable tabular data instead of assuming
a fixed header row.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd


def analyze_stocks_workbook(
    file_path: Path,
) -> Dict[str, Any]:
    """Inspect stock workbook structure safely."""

    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}"
        }

    try:
        workbook = pd.ExcelFile(file_path)
    except Exception as error:
        return {
            "error": str(error)
        }

    results = {
        "source_file": file_path.name,
        "sheets": {},
    }

    for sheet_name in workbook.sheet_names:
        try:
            raw_df = pd.read_excel(
                file_path,
                sheet_name=sheet_name,
                header=None,
            )

            results["sheets"][sheet_name] = {
                "rows": int(raw_df.shape[0]),
                "columns": int(raw_df.shape[1]),
                "preview": raw_df.head(10)
                .fillna("")
                .astype(str)
                .values
                .tolist(),
            }

        except Exception as error:
            results["sheets"][sheet_name] = {
                "error": str(error)
            }

    return results