import { useAuth } from "../context/AuthContext";

function Icon({ children }) {
  return <span aria-hidden="true">{children}</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();

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
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">₹</div>
          Finance Planner
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            <Icon>⌂</Icon>
            Overview
          </a>

          <a href="#" className="nav-item">
            <Icon>◫</Icon>
            Income
          </a>

          <a href="#" className="nav-item">
            <Icon>↘</Icon>
            Expenses
          </a>

          <a href="#" className="nav-item">
            <Icon>◎</Icon>
            Goals
          </a>

          <a href="#" className="nav-item">
            <Icon>◈</Icon>
            Investments
          </a>

          <a href="#" className="nav-item">
            <Icon>⚙</Icon>
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={logout}>
            ↪ &nbsp; Log out
          </button>
        </div>
      </aside>

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

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Net worth</span>
                <div className="stat-icon">₹</div>
              </div>

              <div className="stat-value">₹8,45,000</div>
              <div className="stat-change">↑ 8.4% from last month</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Monthly income</span>
                <div className="stat-icon">↗</div>
              </div>

              <div className="stat-value">₹75,000</div>
              <div className="stat-change">↑ 4.2% this month</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Monthly expenses</span>
                <div className="stat-icon">↘</div>
              </div>

              <div className="stat-value">₹42,500</div>
              <div className="stat-change">↓ 6.8% from last month</div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Financial health</h3>
                <span>Updated today</span>
              </div>

              <div className="health-score">
                <div className="score-circle">
                  <span className="score-number">82</span>
                </div>

                <div className="health-copy">
                  <h4>You're doing great</h4>
                  <p>
                    Your savings and spending habits are moving
                    in the right direction.
                  </p>
                </div>
              </div>

              <div className="progress-list">
                <div className="progress-row">
                  <div className="progress-label">
                    <span>Savings rate</span>
                    <span>68%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-label">
                    <span>Emergency fund</span>
                    <span>53%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "53%" }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-label">
                    <span>Debt management</span>
                    <span>91%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "91%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Your goals</h3>
                <span>2 active</span>
              </div>

              <div className="goal-list">
                <div className="goal">
                  <div className="goal-top">
                    <div>
                      <div className="goal-name">Emergency Fund</div>
                      <div className="goal-amount">
                        ₹80,000 of ₹1,50,000
                      </div>
                    </div>

                    <span className="goal-percent">53%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "53%" }}
                    />
                  </div>
                </div>

                <div className="goal">
                  <div className="goal-top">
                    <div>
                      <div className="goal-name">Buy a Car</div>
                      <div className="goal-amount">
                        ₹2,00,000 of ₹8,00,000
                      </div>
                    </div>

                    <span className="goal-percent">25%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "25%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Quick actions</h3>
              </div>

              <div className="quick-actions">
                <button className="quick-action">
                  <strong>+ Add income</strong>
                  <span>Record your earnings</span>
                </button>

                <button className="quick-action">
                  <strong>− Add expense</strong>
                  <span>Track your spending</span>
                </button>

                <button className="quick-action">
                  <strong>◎ New goal</strong>
                  <span>Create a financial goal</span>
                </button>

                <button className="quick-action">
                  <strong>◈ View plan</strong>
                  <span>Review your financial plan</span>
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>This month</h3>
                <span>August 2026</span>
              </div>

              <div className="progress-list">
                <div className="progress-row">
                  <div className="progress-label">
                    <span>Housing</span>
                    <span>₹18,000</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "42%" }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-label">
                    <span>Food & lifestyle</span>
                    <span>₹9,500</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "23%" }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress-label">
                    <span>Transport</span>
                    <span>₹5,000</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "12%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}