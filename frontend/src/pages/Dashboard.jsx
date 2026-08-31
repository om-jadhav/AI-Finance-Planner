import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { fetchFinancialProfile } from "../api/financialProfile";
import { fetchLatestPlan } from "../api/plan";

function formatINR(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatEnumLabel(value) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const { user } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState(null);

  const [loadingPlan, setLoadingPlan] = useState(true);
  const [latestPlan, setLatestPlan] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { profile: p, isComplete: complete } = await fetchFinancialProfile();
        if (cancelled) return;
        setProfile(p);
        setIsComplete(complete);
      } catch {
        // If this fails, default to the locked/incomplete state — safer
        // than assuming the profile is done.
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPlan() {
      try {
        const p = await fetchLatestPlan();
        if (!cancelled) setLatestPlan(p);
      } catch {
        // No plan yet, or fetch failed — the panel just shows the
        // "generate a plan" prompt either way.
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    }

    loadPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="dashboard-layout">
      <Sidebar active="overview" />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>

            <div className="user-avatar">{initials}</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome">
            <h1>Good evening, {firstName} 👋</h1>
            <p>Here's an overview of your financial journey.</p>
          </section>

          {!loadingProfile && !isComplete && (
            <section className="profile-cta-banner">
              <div>
                <h3>Complete your Financial Profile to unlock personalized plans.</h3>
                <p>
                  Answer a few quick questions about your income, goals, and risk appetite so we
                  can tailor your financial plan.
                </p>
              </div>
              <Link to="/financial-profile" className="primary-button cta-button">
                Complete Financial Profile →
              </Link>
            </section>
          )}

          {!loadingProfile && isComplete && (
            <section className="profile-cta-banner profile-cta-banner--done">
              <div>
                <h3>✓ Financial Profile complete</h3>
                <p>
                  {latestPlan
                    ? "Your AI financial plan is ready — see the summary below or view the full breakdown."
                    : "Generate your AI financial plan to see personalized recommendations."}
                </p>
              </div>
              <Link to="/financial-profile" className="secondary-button cta-button">
                Review your answers
              </Link>
            </section>
          )}

          {isComplete ? (
            <ProfileSnapshot profile={profile} latestPlan={latestPlan} loadingPlan={loadingPlan} />
          ) : (
            <LockedSection loading={loadingProfile} />
          )}
        </div>
      </main>
    </div>
  );
}

// Shown once the Financial Profile is filled in. Uses only the user's own
// submitted answers — never invented figures.
function ProfileSnapshot({ profile, latestPlan, loadingPlan }) {
  if (!profile) return null;

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Monthly income</span>
            <div className="stat-icon">↗</div>
          </div>
          <div className="stat-value">{formatINR(profile.monthlyIncome)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Monthly expenses</span>
            <div className="stat-icon">↘</div>
          </div>
          <div className="stat-value">{formatINR(profile.monthlyExpense)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Current savings</span>
            <div className="stat-icon">₹</div>
          </div>
          <div className="stat-value">{formatINR(profile.currentSavings)}</div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Your goal</h3>
            <span>{formatEnumLabel(profile.primaryGoal)}</span>
          </div>

          <div className="goal-list">
            <div className="goal">
              <div className="goal-top">
                <div>
                  <div className="goal-name">{formatEnumLabel(profile.primaryGoal)}</div>
                  <div className="goal-amount">
                    Target {formatINR(profile.goalTargetAmount)} in {profile.goalTimeYears}{" "}
                    {profile.goalTimeYears === 1 ? "year" : "years"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Investing capacity</h3>
          </div>

          <div className="progress-list">
            <div className="progress-row">
              <div className="progress-label">
                <span>Monthly investment capacity</span>
                <span>{formatINR(profile.monthlyInvestmentCapacity)}</span>
              </div>
            </div>
            <div className="progress-row">
              <div className="progress-label">
                <span>Risk preference</span>
                <span>{formatEnumLabel(profile.riskPreference)}</span>
              </div>
            </div>
          </div>
        </div>

        <PlanPreviewPanel latestPlan={latestPlan} loadingPlan={loadingPlan} />
      </section>
    </>
  );
}

// Compact preview of the most recently generated AI plan. Shows all
// generated variants (Conservative/Moderate/Aggressive) as compact tiles
// in a row, spanning the full dashboard-grid width. Clicking any tile or
// the button takes the user to /plan for the full breakdown.
function PlanPreviewPanel({ latestPlan, loadingPlan }) {
  const response = latestPlan?.response;
  const plans = response?.plan?.plans ?? [];

  return (
    <div className="panel" style={{ gridColumn: "1 / -1" }}>
      <div className="panel-header">
        <h3>Your AI financial plan</h3>
        {latestPlan?.createdAt && (
          <span>{new Date(latestPlan.createdAt).toLocaleDateString()}</span>
        )}
      </div>

      {loadingPlan ? (
        <p className="ai-placeholder-copy">Loading your plan...</p>
      ) : !response ? (
        <>
          <p className="ai-placeholder-copy">
            Generate your personalized AI financial plan based on your income, goals, and risk
            profile.
          </p>
          <Link to="/plan" className="primary-button cta-button" style={{ marginTop: 16 }}>
            Generate Plan →
          </Link>
        </>
      ) : (
        <>
          <div
            className={`feasibility-badge ${
              response.feasibility?.goal_feasible ? "feasible" : "not-feasible"
            }`}
          >
            <span className="feasibility-dot" />
            <span>{response.feasibility?.goal_feasible ? "On track" : "Needs adjustment"}</span>
          </div>

          <div className="goal-list" style={{ marginBottom: 14 }}>
            <div className="goal">
              <div className="goal-top">
                <div>
                  <div className="goal-name">Risk Profile</div>
                  <div className="goal-amount">
                    {response.risk_profile?.risk_category ?? "—"}
                  </div>
                </div>
                <div className="goal-percent">{response.risk_profile?.risk_score ?? "—"}</div>
              </div>
            </div>
          </div>

          {plans.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
                gap: 14,
                marginBottom: 16,
              }}
            >
              {plans.map((p, idx) => (
                <Link to="/plan" key={idx} className="goal" style={{ display: "block" }}>
                  <div className="goal-top">
                    <div>
                      <div className="goal-name">{p.variant}</div>
                      <div className="goal-amount">{p.expected_annual_return}% return</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/plan"
            className="secondary-button cta-button"
            style={{ width: "100%" }}
          >
            View full plan →
          </Link>
        </>
      )}
    </div>
  );
}

// Shown while the Financial Profile isn't complete yet — no fake numbers,
// just a subtly blurred/locked preview of what's coming.
function LockedSection({ loading }) {
  return (
    <section className="dashboard-grid locked-grid" aria-hidden={!loading}>
      <div className="panel locked-panel">
        <div className="lock-overlay">
          <span className="lock-icon">🔒</span>
          <span>Complete your profile to unlock</span>
        </div>
        <div className="panel-header">
          <h3>Financial health</h3>
          <span>Locked</span>
        </div>
        <div className="health-score">
          <div className="score-circle placeholder-circle" />
          <div className="health-copy">
            <h4>Your score will appear here</h4>
            <p>Based on your savings and spending habits.</p>
          </div>
        </div>
      </div>

      <div className="panel locked-panel">
        <div className="lock-overlay">
          <span className="lock-icon">🔒</span>
          <span>Complete your profile to unlock</span>
        </div>
        <div className="panel-header">
          <h3>Your goals</h3>
          <span>Locked</span>
        </div>
        <div className="goal-list">
          <div className="goal">
            <div className="goal-top">
              <div>
                <div className="goal-name">Goal progress</div>
                <div className="goal-amount">Set once your profile is complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}