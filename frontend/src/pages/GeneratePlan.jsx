import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { generatePlan, fetchLatestPlan } from "../api/plan";

// Renders dynamic key-value objects returned by the AI.
// Example:
// {
//   gold: 10,
//   equity: 30
// }
function DynamicKeyValue({ data }) {
  if (!data || typeof data !== "object") return null;

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <p className="plan-empty">No data available.</p>;
  }

  return (
    <div className="dynamic-kv-list">
      {entries.map(([key, value]) => (
        <div className="dynamic-kv-row" key={key}>
          <span className="dynamic-kv-key">{formatLabel(key)}</span>
          <span className="dynamic-kv-value">{formatValue(value)}</span>
        </div>
      ))}
    </div>
  );
}

// One recommended instrument, e.g.
// { score, instrument, sharpe_ratio, maximum_drawdown_pct,
//   annualized_volatility_pct, annualized_return_cagr_pct }
// sharpe_ratio is null for fixed-income instruments (PPF, FD) — shown as "—".
// function InstrumentCard({ instrument }) {
//   return (
//     <div className="dynamic-instrument-card">
//       <div className="instrument-card-header">
//         <span className="instrument-name">{formatInstrumentName(instrument.instrument)}</span>
//         <span className="instrument-score">Score {formatDecimal(instrument.score)}</span>
//       </div>

//       <div className="instrument-metrics">
//         <div className="instrument-metric">
//           <span className="instrument-metric-label">CAGR</span>
//           <span className="instrument-metric-value">
//             {formatPercentValue(instrument.annualized_return_cagr_pct)}
//           </span>
//         </div>

//         <div className="instrument-metric">
//           <span className="instrument-metric-label">Volatility</span>
//           <span className="instrument-metric-value">
//             {formatPercentValue(instrument.annualized_volatility_pct)}
//           </span>
//         </div>

//         <div className="instrument-metric">
//           <span className="instrument-metric-label">Max Drawdown</span>
//           <span className="instrument-metric-value">
//             {formatPercentValue(instrument.maximum_drawdown_pct)}
//           </span>
//         </div>

//         <div className="instrument-metric">
//           <span className="instrument-metric-label">Sharpe Ratio</span>
//           <span className="instrument-metric-value">
//             {instrument.sharpe_ratio === null || instrument.sharpe_ratio === undefined
//               ? "—"
//               : formatDecimal(instrument.sharpe_ratio)}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// Renders category -> instruments returned by AI.
// Example:
// {
//   stocks: [ {...}, {...} ],
//   fixed_income: [ {...} ]
// }
// function DynamicCategoryList({ data }) {
//   if (!data || typeof data !== "object") return null;

//   const entries = Object.entries(data);

//   if (entries.length === 0) {
//     return <p className="plan-empty">No recommendations yet.</p>;
//   }

//   return (
//     <div className="dynamic-category-list">
//       {entries.map(([category, items]) => (
//         <div className="dynamic-category" key={category}>
//           <h4 className="dynamic-category-title">{formatLabel(category)}</h4>

//           {Array.isArray(items) && items.length > 0 ? (
//             <div className="instrument-grid">
//               {items.map((item, idx) => (
//                 <InstrumentCard instrument={item} key={idx} />
//               ))}
//             </div>
//           ) : (
//             <p className="plan-empty">None suggested.</p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// One plan variant, e.g.
// { variant, reasoning, allocation: [{percent, category, instrument}],
//   goal_alignment, expected_annual_return }
// Renders the allocation as a proper table instead of dumping the array
// as raw JSON text.
function PlanOptionCard({ plan, index }) {
  const sortedAllocation = Array.isArray(plan.allocation)
    ? [...plan.allocation].sort((a, b) => b.percent - a.percent)
    : [];

  return (
    <div className="dynamic-instrument-card plan-option-card">
      <div className="plan-option-number">{index + 1}</div>

      <div className="plan-option-body">
        <div className="plan-option-header">
          <h4 className="plan-option-variant">{plan.variant}</h4>
          {plan.expected_annual_return !== undefined && (
            <span className="plan-option-return">
              {formatPercentValue(plan.expected_annual_return)} expected return
            </span>
          )}
        </div>

        {plan.reasoning && <p className="plan-option-reasoning">{plan.reasoning}</p>}

        {sortedAllocation.length > 0 && (
          <div className="plan-allocation-table">
            {sortedAllocation.map((item, idx) => (
              <div className="plan-allocation-row" key={idx}>
                <span className="plan-allocation-percent">{item.percent}%</span>
                <span className="plan-allocation-instrument">
                  {formatInstrumentName(item.instrument)}
                </span>
                <span className="plan-allocation-category">{formatLabel(item.category)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatLabel(key) {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Instrument codes come back as UPPER_SNAKE (e.g. "ICICI_PRU_BLUECHIP")
// — keep them uppercase (they're tickers/fund codes, not sentences) but
// swap underscores for spaces so they wrap and read better.
function formatInstrumentName(name) {
  if (!name) return "—";
  return String(name).replace(/_/g, " ");
}

function formatValue(value) {
  if (value === null || value === undefined) return "—";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }

  return String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined) return "—";

  return "₹" + Number(value).toLocaleString("en-IN");
}

function formatDecimal(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(2);
}

// Values already expressed as percentages (e.g. maximum_drawdown_pct:
// -29.57, expected_annual_return: 23.68) just get a % sign appended.
function formatPercentValue(value) {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toFixed(2)}%`;
}

// feasibility.assumed_annual_return comes back as a decimal fraction
// (0.1 = 10%), unlike every other *_pct field in this response which is
// already a whole percentage. Multiply by 100 here specifically.
function formatFractionAsPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

export default function GeneratedPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchLatestPlan()
      .then((p) => {
        if (!cancelled) {
          setPlan(p);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't load your existing plan.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const result = await generatePlan();
      setPlan(result);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't generate a plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="plan" />

        <main className="dashboard-main">
          <div className="loading-screen" style={{ minHeight: "auto", height: "100%" }}>
            <div className="plan-loading-content">
              <div className="plan-loading-spinner" />
              <p>Loading your financial plan...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const response = plan?.response;

  return (
    <div className="dashboard-layout">
      <Sidebar active="plan" />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="user-menu">
            <span className="user-name">Your Financial Plan</span>
          </div>
        </header>

        <div className="dashboard-content profile-page-content">
          {/* PAGE HEADER */}
          <div className="plan-header-row">
            <div>
              <h2 className="step-title">Your Financial Plan</h2>

              <p className="step-subtitle">
                AI-powered recommendations based on your financial profile and investment
                goals.
              </p>
            </div>

            <button
              className="primary-button plan-generate-button"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : plan ? "Regenerate Plan" : "Generate Plan"}
            </button>
          </div>

          {error && <div className="auth-error profile-error">{error}</div>}

          {/* EMPTY STATE */}
          {!response && !generating && (
            <div className="profile-card plan-empty-card">
              <div className="plan-empty-icon">✦</div>

              <h3>Your plan is ready to be created</h3>

              <p>
                Generate a personalized financial plan using your income, expenses, goals,
                investment horizon, and risk profile.
              </p>

              <button className="primary-button plan-empty-button" onClick={handleGenerate}>
                Generate My Plan
              </button>
            </div>
          )}

          {/* GENERATING STATE */}
          {generating && (
            <div className="profile-card plan-generating-card">
              <div className="plan-loading-spinner" />

              <h3>Creating your financial plan</h3>

              <p>
                Our AI is analyzing your financial profile, goals, risk tolerance, and
                investment horizon.
              </p>
            </div>
          )}

          {/* GENERATED PLAN */}
          {response && !generating && (
            <div className="plan-sections">
              {/* RISK PROFILE */}
              <section className="plan-card">
                <div className="plan-card-header">
                  <div>
                    <span className="plan-card-eyebrow">PERSONAL PROFILE</span>

                    <h3>Risk Profile</h3>
                  </div>

                  <div className="plan-section-icon">◈</div>
                </div>

                <div className="plan-stat-row">
                  <div className="plan-stat">
                    <span className="plan-stat-label">Risk Score</span>

                    <span className="plan-stat-value">
                      {response.risk_profile?.risk_score ?? "—"}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Category</span>

                    <span className="plan-stat-value">
                      {response.risk_profile?.risk_category ?? "—"}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Monthly Surplus</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.risk_profile?.monthly_surplus)}
                    </span>
                  </div>
                </div>

                {/* {response.risk_profile?.factor_breakdown && (
                  <>
                    <h4 className="plan-subheading">Risk Factor Breakdown</h4>

                    <DynamicKeyValue data={response.risk_profile.factor_breakdown} />
                  </>
                )} */}
              </section>

              {/* GOAL FEASIBILITY */}
              <section className="plan-card">
                <div className="plan-card-header">
                  <div>
                    <span className="plan-card-eyebrow">GOAL ANALYSIS</span>

                    <h3>Goal Feasibility</h3>
                  </div>

                  <div className="plan-section-icon">✓</div>
                </div>

                <div
                  className={`feasibility-badge ${response.feasibility?.goal_feasible ? "feasible" : "not-feasible"
                    }`}
                >
                  <span className="feasibility-dot" />

                  <span>
                    {response.feasibility?.goal_feasible ? "On track" : "Needs adjustment"}

                    {response.feasibility?.status && ` — ${response.feasibility.status}`}
                  </span>
                </div>

                <div className="plan-stat-row plan-stat-row-large">
                  <div className="plan-stat">
                    <span className="plan-stat-label">Goal Amount</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.feasibility?.goal_amount)}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Projected Value</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.feasibility?.projected_value)}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Required Monthly</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.feasibility?.required_monthly_investment)}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Available Monthly</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.feasibility?.available_monthly_investment)}
                    </span>
                  </div>

                  <div className="plan-stat">
                    <span className="plan-stat-label">Investment Gap</span>

                    <span className="plan-stat-value">
                      {formatCurrency(response.feasibility?.investment_gap)}
                    </span>
                  </div>


                  <div className="plan-stat">
                    <span className="plan-stat-label">Horizon</span>

                    <span className="plan-stat-value">
                      {response.feasibility?.investment_horizon_years ?? "—"} yrs
                    </span>
                  </div>
                </div>
              </section>

              {/* PORTFOLIO */}
            

              {/* PLAN OPTIONS */}
              <section className="plan-card">
                <div className="plan-card-header">
                  <div>
                    <span className="plan-card-eyebrow">ACTION PLAN</span>

                    <h3>Plan Options</h3>
                  </div>

                  <div className="plan-section-icon">◎</div>
                </div>

                {Array.isArray(response.plan?.plans) && response.plan.plans.length > 0 ? (
                  <div className="plan-options-list">
                    {response.plan.plans.map((p, idx) => (
                      <PlanOptionCard plan={p} index={idx} key={idx} />
                    ))}
                  </div>
                ) : (
                  <p className="plan-empty">No plan options returned.</p>
                )}

                {response.plan?.warnings?.length > 0 && (
                  <div className="plan-warning-box">
                    <h4>Important considerations</h4>

                    <ul className="plan-warnings">
                      {response.plan.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {response.plan?.disclaimer && (
                  <div className="plan-disclaimer">
                    <strong>Disclaimer</strong>

                    <p>{response.plan.disclaimer}</p>
                  </div>
                )}
              </section>

              {/* GENERATED TIME */}
              {plan.createdAt && (
                <p className="plan-generated-at">
                  Generated on {new Date(plan.createdAt).toLocaleString()}
                  {response.metadata?.llm_used === false && " · Generated using fallback logic"}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}