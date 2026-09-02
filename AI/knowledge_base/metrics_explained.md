# Financial Metrics Used in This App's Recommendations

## CAGR (Compound Annual Growth Rate)

CAGR is the average annual growth rate of an investment over a period of
time, assuming profits are reinvested each year, smoothed into a single
consistent yearly rate. In this app it appears as
`annualized_return_cagr_pct` on a selected instrument — a stock or fund
with a 20% CAGR grew, on average, 20% per year over the measured period,
though actual year-to-year returns almost always varied above and below
that number.

## Annualized Volatility

Volatility measures how much an investment's returns swing around its
average, expressed as a percentage (`annualized_volatility_pct` in this
app). A higher volatility number means the investment's value has
historically moved up and down more sharply and unpredictably.

## Maximum Drawdown

Maximum drawdown (`maximum_drawdown_pct` in this app) is the largest
peak-to-trough decline an investment experienced historically — the
worst percentage drop from its highest point to its subsequent lowest
point. A maximum drawdown of -30% means that, at some point, this
investment lost 30% of its value from a previous high.

## Sharpe Ratio

The Sharpe ratio (`sharpe_ratio` in this app) measures return earned per
unit of risk taken. A higher Sharpe ratio means the investment
historically delivered more return for the volatility involved. It's
useful for comparing instruments with different volatility levels on a
more level footing than comparing raw CAGR alone.

## Important: these are historical, not predictive

None of these metrics are predictions of future performance — they are
calculated purely from real historical price data already in this app's
datasets. Historical performance is not a guarantee of future results.
