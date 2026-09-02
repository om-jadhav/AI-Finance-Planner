# Risk Profiling and Plan Variants in This App

## How the risk category is determined

This app does not let an AI model guess your risk category. A
deterministic scoring function in the codebase (`risk_profile.py`)
calculates a numeric score from your profile and questionnaire answers,
then maps that score to exactly one of three categories: **Conservative**,
**Moderate**, or **Aggressive**. Given the same inputs, this calculation
always produces the same result — it is not influenced by AI at any
point.

## Why age and time horizon matter

Someone with a longer investment horizon (many years before they need the
money) can typically afford to take on more short-term volatility,
because there's more time for the investment to recover from a temporary
downturn before the money is actually needed. This is why a longer
investment horizon often supports a higher risk category, even for two
people with the same stated preference.

## Why this app generates multiple plans

Rather than showing only one recommendation, the app can generate several
plan variants side-by-side so the trade-off is visible directly: a
higher-risk variant is typically projected to have a higher expected
return, but leans on instruments with higher historical volatility and
larger past drawdowns. The plan whose risk level matches the user's own
calculated risk category is generally the best-suited starting point,
since it was calculated to match their actual capacity to withstand
volatility — not just a stated preference.

## When a goal isn't feasible as-is

Sometimes a plan's projected value comes out below the stated goal amount
within the chosen timeframe (this app reports this as `goal_feasible:
false` along with an `investment_gap`). This doesn't mean the goal is
impossible — it usually means one of a few adjustable inputs needs to
change. The realistic options, in general, are:
1. Increasing the monthly investment amount, if there's room in the
   budget.
2. Extending the time horizon, giving the investment more years to grow.
3. Reducing the goal amount, if the original target has some flexibility.
4. Reassessing the risk category, if there is genuine capacity to accept
   more volatility for a higher expected return — never pushed beyond
   what someone could actually sit through during a real downturn.

There isn't one "correct" choice among these — it depends on what's
actually flexible in someone's own situation, and a licensed financial
advisor can help weigh the trade-offs for a specific case.
