"""
Deterministic portfolio allocation rules.
"""

from typing import Dict


def calculate_portfolio_allocation(
    risk_category: str,
    target_years: int,
) -> Dict[str, int]:
    """
    Calculate portfolio allocation.

    Rules are intentionally simple and deterministic.
    """

    if risk_category == "Conservative":

        allocation = {
            "equity": 25,
            "mutual_funds": 20,
            "gold": 10,
            "debt_or_safe_assets": 45,
        }

    elif risk_category == "Moderate":

        allocation = {
            "equity": 45,
            "mutual_funds": 30,
            "gold": 10,
            "debt_or_safe_assets": 15,
        }

    else:

        allocation = {
            "equity": 55,
            "mutual_funds": 25,
            "gold": 10,
            "debt_or_safe_assets": 10,
        }

    # Shorter horizon reduces equity exposure.
    if target_years < 5:
        reduction = min(
            allocation["equity"],
            15,
        )

        allocation["equity"] -= reduction

        allocation[
            "debt_or_safe_assets"
        ] += reduction

    assert sum(
        allocation.values()
    ) == 100

    return allocation