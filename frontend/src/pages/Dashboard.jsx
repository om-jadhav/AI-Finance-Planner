import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { fetchFinancialProfile } from "../api/financialProfile";

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
                  Your personalized AI financial plan will appear here once the planning engine is
                  connected.
                </p>
              </div>
              <Link to="/financial-profile" className="secondary-button cta-button">
                Review your answers
              </Link>
            </section>
          )}

          {isComplete ? (
            <ProfileSnapshot profile={profile} />
          ) : (
            <LockedSection loading={loadingProfile} />
          )}
        </div>
      </main>
    </div>
  );
}

// Shown once the Financial Profile is filled in. Uses only the user's own
// submitted answers — never invented figures — as a placeholder until the
// AI planning engine is connected.
function ProfileSnapshot({ profile }) {
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

        <div className="panel ai-placeholder-panel">
          <div className="panel-header">
            <h3>Your AI financial plan</h3>
          </div>
          <p className="ai-placeholder-copy">
            We're working on connecting the AI planning engine. Once it's live, your
            personalized recommendations will show up here.
          </p>
        </div>
      </section>
    </>
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