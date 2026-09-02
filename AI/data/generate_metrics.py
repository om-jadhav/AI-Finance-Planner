"""
Generate precomputed historical metrics.

Run this file manually whenever datasets are updated:

python -m data.generate_metrics
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from pprint import pformat

from config.settings import DATASET_DIR, DATA_DIR

from analytics.nifty import analyze_nifty_dataset
from analytics.sip import analyze_sip_directory
from analytics.mutual_funds import analyze_mutual_funds
from analytics.gold import analyze_gold_dataset
from analytics.cpi import analyze_cpi
from analytics.rbi import analyze_rbi
from analytics.stocks import analyze_stocks_workbook
from analytics.dummy_assests import analyze_dummy_assets


def build_metrics():
    """Build complete historical metrics dictionary."""

    datasets = DATASET_DIR

    nifty_file = datasets / "nifty50.csv"
    sip_directory = datasets / "SIP_datasets"
    mutual_funds_file = datasets / "mutual_funds.csv"
    gold_file = datasets / "gold.csv"
    cpi_file = datasets / "cpi.csv"
    rbi_file = datasets / "rbi.csv"
    stocks_file = datasets / "stocks.xlsx"
    dummy_assets_file = datasets / "dummy_mutual_funds_and_fixed_income.csv"

    nifty_results = analyze_nifty_dataset(
        nifty_file
    )

    stocks = {
        name: data
        for name, data in nifty_results.items()
        if name != "NIFTY50"
    }

    nifty = {
        "NIFTY50": nifty_results.get(
            "NIFTY50",
            {}
        )
    }

    metrics = {
        "metadata": {
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "dataset_directory": str(
                datasets
            ),
            "dataset_version": "1.0",
        },

        "stocks": stocks,

        "mutual_funds": analyze_mutual_funds(
            mutual_funds_file
        ),

        "gold": analyze_gold_dataset(
            gold_file
        ),

        "nifty": nifty,

        "sip": analyze_sip_directory(
            sip_directory
        ),

        # Computed the same way as everything else above,
        # from a monthly price series — not typed-in final
        # numbers. See analytics/dummy_assets.py for why
        # this dataset exists (mutual_funds.csv is a single-
        # day snapshot; FD/PPF have no market price history).
        "dummy_assets": analyze_dummy_assets(
            dummy_assets_file
        ),

        "macro": {
            "cpi": analyze_cpi(cpi_file),
            "rbi": analyze_rbi(rbi_file),
        },

        "stocks_workbook_inspection":
            analyze_stocks_workbook(
                stocks_file
            ),
    }

    return metrics


def write_metrics_file(metrics):
    """Write metrics dictionary to historical_metrics.py."""

    output_file = (
        DATA_DIR
        / "historical_metrics.py"
    )

    formatted_metrics = pformat(
        metrics,
        width=100,
        sort_dicts=False,
    )

    content = (
        '"""Auto-generated historical metrics.\n\n'
        'DO NOT manually edit unless necessary.\n'
        'Regenerate using:\n'
        'python -m data.generate_metrics\n'
        '"""\n\n'
        f'HISTORICAL_METRICS = {formatted_metrics}\n'
    )

    output_file.write_text(
        content,
        encoding="utf-8",
    )

    print(
        f"Historical metrics generated: "
        f"{output_file}"
    )


def main():
    """Generate metrics."""

    print("Generating historical metrics...")

    metrics = build_metrics()

    write_metrics_file(metrics)

    print("Done.")

    print(
        f"Stocks processed: "
        f"{len(metrics.get('stocks', {}))}"
    )

    print(
        f"SIP instruments processed: "
        f"{len(metrics.get('sip', {}))}"
    )

    print(
        f"Mutual funds processed: "
        f"{len(metrics.get('mutual_funds', {}))}"
    )


if __name__ == "__main__":
    main()