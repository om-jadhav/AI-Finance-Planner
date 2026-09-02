# How This App Selects Instruments

This app never lets an AI model pick which stocks, funds, or ETFs to
recommend. Instrument selection is fully deterministic, computed in
`instrument_selector.py`, using only historical price data already
calculated for each instrument.

## The scoring formula

For every instrument with sufficient historical data, the app computes a
single score:

```
score = (annualized CAGR × 100) + (Sharpe ratio × 10) − (|maximum drawdown| × 30)
```

In plain terms: an instrument scores higher if it has historically had a
strong average annual return, a strong Sharpe ratio (good return relative
to its volatility), and a smaller worst-case historical drop. Instruments
are then ranked highest-score-first, and the top few per category are
kept as candidates.

Instruments without enough historical data points are excluded from
scoring entirely (never scored using incomplete or estimated data).

## Categories

Candidates are selected separately within each of these categories, so a
plan generally has some diversification built in rather than five picks
from the same category:
- **stocks** — individual company stocks
- **etf_instruments** — ETFs, including equity, banking, gold, and
  silver-tracking ETFs
- **index_funds** — broad market index-tracking instruments
- **fixed_income** — low-volatility instruments like fixed deposits or
  government savings schemes
- **mutual_funds** — pooled fund instruments

The number of candidates kept per category can vary — for example, more
individual stock candidates are considered for an Aggressive risk profile
than for Conservative or Moderate, since a more aggressive plan draws
more heavily from higher-volatility categories.

## What this means for "why was this instrument recommended"

If asked why a specific instrument appears in someone's plan, the honest
answer is: it scored well on this formula relative to other instruments
in its category, using real historical CAGR, Sharpe ratio, and drawdown
data — not because of any subjective judgment, and not because of a
promise about future performance.
