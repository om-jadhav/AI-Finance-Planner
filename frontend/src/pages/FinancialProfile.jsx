import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { fetchFinancialProfile, saveFinancialProfileStep } from "../api/financialProfile";

const STEP_LABELS = [
  "Personal & Income",
  "Goal",
  "Investment Capacity",
  "Risk Profile",
  "Investment Preferences",
];

const EMPLOYMENT_OPTIONS = [
  { value: "SALARIED", label: "Salaried" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "BUSINESS_OWNER", label: "Business owner" },
  { value: "STUDENT", label: "Student" },
  { value: "RETIRED", label: "Retired" },
  { value: "OTHER", label: "Other" },
];

const INVESTMENT_EXPERIENCE_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const GOAL_OPTIONS = [
  { value: "RETIREMENT", label: "Retirement" },
  { value: "WEALTH_CREATION", label: "Wealth Creation" },
  { value: "EDUCATION", label: "Education" },
  { value: "HOME_PURCHASE", label: "Home Purchase" },
  { value: "MARRIAGE", label: "Marriage" },
  { value: "TRAVEL", label: "Travel" },
  { value: "EMERGENCY_FUND", label: "Emergency Fund" },
  { value: "OTHER", label: "Other" },
];

const GOAL_PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const GOAL_FLEXIBILITY_OPTIONS = [
  { value: "FLEXIBLE", label: "Flexible" },
  { value: "SOMEWHAT_FLEXIBLE", label: "Somewhat flexible" },
  { value: "FIXED_DEADLINE", label: "Fixed deadline" },
];

const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const HOLDING_OPTIONS = [
  { value: "STOCKS", label: "Stocks" },
  { value: "MUTUAL_FUNDS", label: "Mutual Funds" },
  { value: "GOLD", label: "Gold" },
  { value: "ETFS", label: "ETFs" },
  { value: "FIXED_DEPOSITS", label: "Fixed Deposits" },
  { value: "BONDS", label: "Bonds" },
  { value: "OTHER", label: "Other" },
];

const MARKET_DROP_OPTIONS = [
  { value: "SELL_EVERYTHING", label: "Sell everything" },
  { value: "SELL_SOME", label: "Sell some investments" },
  { value: "HOLD_AND_WAIT", label: "Hold and wait" },
  { value: "INVEST_MORE", label: "Invest more" },
];

const HORIZON_OPTIONS = [
  { value: "LESS_THAN_1_YEAR", label: "Less than 1 year" },
  { value: "ONE_TO_THREE_YEARS", label: "1–3 years" },
  { value: "THREE_TO_FIVE_YEARS", label: "3–5 years" },
  { value: "FIVE_TO_TEN_YEARS", label: "5–10 years" },
  { value: "TEN_PLUS_YEARS", label: "10+ years" },
];

const RISK_PREFERENCE_OPTIONS = [
  { value: "PROTECT_MONEY", label: "I prioritize protecting my money" },
  { value: "BALANCE_SAFETY_GROWTH", label: "I want a balance between safety and growth" },
  { value: "MODERATE_RISK", label: "I am willing to take moderate risk for higher returns" },
  { value: "HIGH_RISK", label: "I am willing to take high risk for potentially high returns" },
];

const CATEGORY_OPTIONS = [
  { value: "MUTUAL_FUNDS", label: "Mutual Funds" },
  { value: "STOCKS", label: "Stocks" },
  { value: "GOLD", label: "Gold" },
  { value: "GOLD_ETFS", label: "Gold ETFs" },
  { value: "SILVER_ETFS", label: "Silver ETFs" },
  { value: "NIFTY_ETFS", label: "Nifty ETFs" },
  { value: "BANKING_ETFS", label: "Banking ETFs" },
  { value: "FIXED_DEPOSITS", label: "Fixed Deposits" },
  { value: "OPEN_TO_ALL", label: "I'm open to all" },
];

const emptyForms = {
  1: {
    age: "",
    employmentStatus: "",
    monthlyIncome: "",
    monthlyExpense: "",
    currentSavings: "",
    dependents: "",
    totalDebt: "",
    investmentExperience: "",
  },
  2: {
    primaryGoal: "",
    goalTargetAmount: "",
    goalTimeYears: "",
    goalFlexibility: "",
    priority: "",
    hasMajorExpenseBeforeGoal: "",
    majorExpenseAmount: "",
    majorExpenseYear: "",
  },
  3: {
    monthlyInvestmentCapacity: "",
    hasExistingInvestments: "",
    existingInvestmentTypes: [],
    existingInvestmentAmount: "",
  },
  4: { marketDropReaction: "", investmentHorizon: "", riskPreference: "" },
  5: { preferredCategories: [] },
};

function toFormValue(value) {
  if (value === null || value === undefined) return "";
  return value;
}

// Builds initial form state for every step from whatever profile the
// backend already has saved, so resuming/editing is pre-filled.
function buildFormsFromProfile(profile) {
  if (!profile) return emptyForms;
  return {
    1: {
      age: toFormValue(profile.age),
      employmentStatus: toFormValue(profile.employmentStatus),
      monthlyIncome: toFormValue(profile.monthlyIncome),
      monthlyExpense: toFormValue(profile.monthlyExpense),
      currentSavings: toFormValue(profile.currentSavings),
      dependents: toFormValue(profile.dependents),
      totalDebt: toFormValue(profile.totalDebt),
      investmentExperience: toFormValue(profile.investmentExperience),
    },
    2: {
      primaryGoal: toFormValue(profile.primaryGoal),
      goalTargetAmount: toFormValue(profile.goalTargetAmount),
      goalTimeYears: toFormValue(profile.goalTimeYears),
      goalFlexibility: toFormValue(profile.goalFlexibility),
      priority: toFormValue(profile.priority),
      hasMajorExpenseBeforeGoal:
        profile.hasMajorExpenseBeforeGoal === null || profile.hasMajorExpenseBeforeGoal === undefined
          ? ""
          : String(profile.hasMajorExpenseBeforeGoal),
      majorExpenseAmount: toFormValue(profile.majorExpenseAmount),
      majorExpenseYear: toFormValue(profile.majorExpenseYear),
    },
    3: {
      monthlyInvestmentCapacity: toFormValue(profile.monthlyInvestmentCapacity),
      hasExistingInvestments:
        profile.hasExistingInvestments === null || profile.hasExistingInvestments === undefined
          ? ""
          : String(profile.hasExistingInvestments),
      existingInvestmentTypes: profile.existingInvestmentTypes || [],
      existingInvestmentAmount: toFormValue(profile.existingInvestmentAmount),
    },
    4: {
      marketDropReaction: toFormValue(profile.marketDropReaction),
      investmentHorizon: toFormValue(profile.investmentHorizon),
      riskPreference: toFormValue(profile.riskPreference),
    },
    5: {
      preferredCategories: profile.preferredCategories || [],
    },
  };
}

function RadioPillGroup({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`pill-option ${value === opt.value ? "selected" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CheckboxPillGroup({ options, values, onChange }) {
  function toggle(val) {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  }

  return (
    <div className="pill-group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`pill-option ${values.includes(opt.value) ? "selected" : ""}`}
          onClick={() => toggle(opt.value)}
        >
          {values.includes(opt.value) && <span className="pill-check">✓</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function AmountInput({ label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrap">
        <span className="input-prefix">₹</span>
        <input
          type="number"
          min="0"
          className="form-input amount-input"
          value={value}
          placeholder={placeholder || "0"}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function FinancialProfile() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("form"); // 'form' | 'complete'
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [forms, setForms] = useState(emptyForms);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { profile, completedSteps: done, isComplete } = await fetchFinancialProfile();
        if (cancelled) return;

        setForms(buildFormsFromProfile(profile));
        setCompletedSteps(done);

        if (isComplete) {
          setView("complete");
        } else {
          const firstIncomplete = [1, 2, 3, 4, 5].find((s) => !done.includes(s)) || 1;
          setCurrentStep(firstIncomplete);
        }
      } catch (err) {
        if (!cancelled) setError("Couldn't load your financial profile. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxUnlockedStep = useMemo(() => {
    const nextAfterCompleted = completedSteps.length ? Math.max(...completedSteps) + 1 : 1;
    return Math.min(5, nextAfterCompleted);
  }, [completedSteps]);

  function updateField(step, field, value) {
    setForms((prev) => ({
      ...prev,
      [step]: { ...prev[step], [field]: value },
    }));
  }

  function goToStep(step) {
    if (step > maxUnlockedStep) return;
    setError("");
    setView("form");
    setCurrentStep(step);
  }

  function buildPayload(step) {
    const f = forms[step];
    switch (step) {
      case 1:
        return {
          age: f.age,
          employmentStatus: f.employmentStatus,
          monthlyIncome: f.monthlyIncome,
          monthlyExpense: f.monthlyExpense,
          currentSavings: f.currentSavings,
          dependents: f.dependents,
          totalDebt: f.totalDebt,
          investmentExperience: f.investmentExperience,
        };
      case 2: {
        const hasMajorExpense = f.hasMajorExpenseBeforeGoal === "true";
        return {
          primaryGoal: f.primaryGoal,
          goalTargetAmount: f.goalTargetAmount,
          goalTimeYears: f.goalTimeYears,
          goalFlexibility: f.goalFlexibility,
          priority: f.priority,
          hasMajorExpenseBeforeGoal: hasMajorExpense,
          majorExpenseAmount: hasMajorExpense ? f.majorExpenseAmount : null,
          majorExpenseYear: hasMajorExpense ? f.majorExpenseYear : null,
        };
      }
      case 3: {
        const hasExisting = f.hasExistingInvestments === "true";
        return {
          monthlyInvestmentCapacity: f.monthlyInvestmentCapacity,
          hasExistingInvestments: hasExisting,
          existingInvestmentTypes: hasExisting ? f.existingInvestmentTypes : [],
          existingInvestmentAmount: hasExisting ? f.existingInvestmentAmount : null,
        };
      }
      case 4:
        return {
          marketDropReaction: f.marketDropReaction,
          investmentHorizon: f.investmentHorizon,
          riskPreference: f.riskPreference,
        };
      case 5:
        return { preferredCategories: f.preferredCategories };
      default:
        return {};
    }
  }

  function isStepFilled(step) {
    const f = forms[step];
    switch (step) {
      case 1:
        return (
          f.age !== "" &&
          f.employmentStatus &&
          f.monthlyIncome !== "" &&
          f.monthlyExpense !== "" &&
          f.currentSavings !== "" &&
          f.dependents !== "" &&
          f.totalDebt !== "" &&
          f.investmentExperience
        );
      case 2: {
        const base =
          f.primaryGoal &&
          f.goalTargetAmount !== "" &&
          f.goalTimeYears !== "" &&
          f.goalFlexibility &&
          f.priority &&
          f.hasMajorExpenseBeforeGoal !== "";
        if (!base) return false;
        if (f.hasMajorExpenseBeforeGoal === "true") {
          return f.majorExpenseAmount !== "" && f.majorExpenseYear !== "";
        }
        return true;
      }
      case 3: {
        const base = f.monthlyInvestmentCapacity !== "" && f.hasExistingInvestments !== "";
        if (!base) return false;
        if (f.hasExistingInvestments === "true") {
          return f.existingInvestmentTypes.length > 0 && f.existingInvestmentAmount !== "";
        }
        return true;
      }
      case 4:
        return f.marketDropReaction && f.investmentHorizon && f.riskPreference;
      case 5:
        return f.preferredCategories.length > 0;
      default:
        return false;
    }
  }

  async function handleSaveAndContinue() {
    if (!isStepFilled(currentStep)) {
      setError("Please answer all questions in this section before continuing.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = buildPayload(currentStep);
      const { completedSteps: done, isComplete } = await saveFinancialProfileStep(currentStep, payload);
      setCompletedSteps(done);

      if (isComplete) {
        setView("complete");
      } else if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't save this section. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="financial-profile" />
        <main className="dashboard-main">
          <div className="loading-screen" style={{ minHeight: "auto", height: "100%" }}>
            Loading your financial profile...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="financial-profile" />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="user-menu">
            <span className="user-name">Financial Profile</span>
          </div>
        </header>

        <div className="dashboard-content profile-page-content">
          {view === "complete" ? (
            <div className="profile-card profile-complete-card">
              <div className="complete-badge">✓</div>
              <h2>Your Financial Profile is complete</h2>
              <p>
                Thanks — we've saved everything. Your answers will power personalized plans
                once the AI planning engine is connected.
              </p>
              <div className="complete-actions">
                <Link to="/dashboard" className="primary-button complete-link">
                  Back to Overview
                </Link>
                <button className="secondary-button" onClick={() => goToStep(1)}>
                  Review / edit answers
                </button>
              </div>
            </div>
          ) : (
            <>
              <Stepper
                currentStep={currentStep}
                completedSteps={completedSteps}
                maxUnlockedStep={maxUnlockedStep}
                onStepClick={goToStep}
              />

              <div className="profile-card">
                {error && <div className="auth-error profile-error">{error}</div>}

                {currentStep === 1 && (
                  <StepPersonalIncome form={forms[1]} update={(f, v) => updateField(1, f, v)} />
                )}
                {currentStep === 2 && (
                  <StepGoal form={forms[2]} update={(f, v) => updateField(2, f, v)} />
                )}
                {currentStep === 3 && (
                  <StepInvestmentCapacity form={forms[3]} update={(f, v) => updateField(3, f, v)} />
                )}
                {currentStep === 4 && (
                  <StepRiskProfile form={forms[4]} update={(f, v) => updateField(4, f, v)} />
                )}
                {currentStep === 5 && (
                  <StepInvestmentPreferences form={forms[5]} update={(f, v) => updateField(5, f, v)} />
                )}

                <div className="step-actions">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => goToStep(currentStep - 1)}
                      disabled={saving}
                    >
                      ← Back
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    className="primary-button step-save-button"
                    onClick={handleSaveAndContinue}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : currentStep === 5
                      ? "Save & Finish"
                      : "Save & Continue →"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Stepper({ currentStep, completedSteps, maxUnlockedStep, onStepClick }) {
  return (
    <div className="stepper">
      {STEP_LABELS.map((label, idx) => {
        const step = idx + 1;
        const isDone = completedSteps.includes(step);
        const isActive = step === currentStep;
        const isClickable = step <= maxUnlockedStep;

        return (
          <div key={step} className="stepper-item-wrap">
            <button
              type="button"
              className={`stepper-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
            >
              <span className="stepper-circle">{isDone ? "✓" : step}</span>
              <span className="stepper-label">{label}</span>
            </button>
            {idx < STEP_LABELS.length - 1 && (
              <span className={`stepper-connector ${isDone ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepPersonalIncome({ form, update }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Personal & Income</h2>
      <p className="step-subtitle">Tell us a bit about yourself and your monthly cash flow.</p>

      <div className="form-group">
        <label className="form-label">What is your age?</label>
        <input
          type="number"
          min="1"
          className="form-input"
          value={form.age}
          placeholder="e.g. 29"
          onChange={(e) => update("age", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">What is your employment status?</label>
        <RadioPillGroup
          options={EMPLOYMENT_OPTIONS}
          value={form.employmentStatus}
          onChange={(v) => update("employmentStatus", v)}
        />
      </div>

      <AmountInput
        label="What is your monthly income?"
        value={form.monthlyIncome}
        onChange={(v) => update("monthlyIncome", v)}
      />
      <AmountInput
        label="What is your average monthly expense?"
        value={form.monthlyExpense}
        onChange={(v) => update("monthlyExpense", v)}
      />
      <AmountInput
        label="How much do you currently have in savings?"
        value={form.currentSavings}
        onChange={(v) => update("currentSavings", v)}
      />

      <div className="form-group">
        <label className="form-label">How many dependents do you have?</label>
        <input
          type="number"
          min="0"
          className="form-input"
          value={form.dependents}
          placeholder="e.g. 0"
          onChange={(e) => update("dependents", e.target.value)}
        />
      </div>

      <AmountInput
        label="What is your total outstanding debt?"
        value={form.totalDebt}
        onChange={(v) => update("totalDebt", v)}
      />

      <div className="form-group">
        <label className="form-label">How would you describe your investment experience?</label>
        <RadioPillGroup
          options={INVESTMENT_EXPERIENCE_OPTIONS}
          value={form.investmentExperience}
          onChange={(v) => update("investmentExperience", v)}
        />
      </div>
    </div>
  );
}

function StepGoal({ form, update }) {
  const showMajorExpenseFields = form.hasMajorExpenseBeforeGoal === "true";

  return (
    <div className="step-body">
      <h2 className="step-title">Goal</h2>
      <p className="step-subtitle">What are you working toward, and by when?</p>

      <div className="form-group">
        <label className="form-label">What is your primary financial goal?</label>
        <RadioPillGroup
          options={GOAL_OPTIONS}
          value={form.primaryGoal}
          onChange={(v) => update("primaryGoal", v)}
        />
      </div>

      <AmountInput
        label="How much money do you want to accumulate for this goal?"
        value={form.goalTargetAmount}
        onChange={(v) => update("goalTargetAmount", v)}
      />

      <div className="form-group">
        <label className="form-label">When do you want to achieve this goal? (years)</label>
        <input
          type="number"
          min="0"
          className="form-input"
          value={form.goalTimeYears}
          placeholder="e.g. 10"
          onChange={(e) => update("goalTimeYears", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Is this goal flexible or fixed?</label>
        <RadioPillGroup
          options={GOAL_FLEXIBILITY_OPTIONS}
          value={form.goalFlexibility}
          onChange={(v) => update("goalFlexibility", v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">How would you prioritize this goal?</label>
        <RadioPillGroup
          options={GOAL_PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(v) => update("priority", v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Do you expect to make any major expenses before reaching this goal?
        </label>
        <RadioPillGroup
          options={YES_NO_OPTIONS}
          value={form.hasMajorExpenseBeforeGoal}
          onChange={(v) => update("hasMajorExpenseBeforeGoal", v)}
        />
      </div>

      {showMajorExpenseFields && (
        <div className="conditional-fields">
          <AmountInput
            label="Expected expense"
            value={form.majorExpenseAmount}
            onChange={(v) => update("majorExpenseAmount", v)}
          />
          <div className="form-group">
            <label className="form-label">Approximate year</label>
            <input
              type="number"
              min="2024"
              className="form-input"
              value={form.majorExpenseYear}
              placeholder="e.g. 2028"
              onChange={(e) => update("majorExpenseYear", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepInvestmentCapacity({ form, update }) {
  const showExistingFields = form.hasExistingInvestments === "true";

  return (
    <div className="step-body">
      <h2 className="step-title">Investment Capacity</h2>
      <p className="step-subtitle">How much can you put toward investing, and what do you already hold?</p>

      <AmountInput
        label="How much can you invest every month?"
        value={form.monthlyInvestmentCapacity}
        onChange={(v) => update("monthlyInvestmentCapacity", v)}
      />

      <div className="form-group">
        <label className="form-label">Do you already have investments?</label>
        <RadioPillGroup
          options={YES_NO_OPTIONS}
          value={form.hasExistingInvestments}
          onChange={(v) => update("hasExistingInvestments", v)}
        />
      </div>

      {showExistingFields && (
        <div className="conditional-fields">
          <div className="form-group">
            <label className="form-label">Where is your money currently invested?</label>
            <CheckboxPillGroup
              options={HOLDING_OPTIONS}
              values={form.existingInvestmentTypes}
              onChange={(v) => update("existingInvestmentTypes", v)}
            />
          </div>

          <AmountInput
            label="Approximately how much do you currently have invested?"
            value={form.existingInvestmentAmount}
            onChange={(v) => update("existingInvestmentAmount", v)}
          />
        </div>
      )}
    </div>
  );
}

function StepRiskProfile({ form, update }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Risk Profile</h2>
      <p className="step-subtitle">This helps us understand your comfort with market ups and downs.</p>

      <div className="form-group">
        <label className="form-label">
          If your portfolio temporarily falls by 20%, what would you do?
        </label>
        <RadioPillGroup
          options={MARKET_DROP_OPTIONS}
          value={form.marketDropReaction}
          onChange={(v) => update("marketDropReaction", v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          How long are you comfortable keeping your money invested?
        </label>
        <RadioPillGroup
          options={HORIZON_OPTIONS}
          value={form.investmentHorizon}
          onChange={(v) => update("investmentHorizon", v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Which statement best describes your investment preference?
        </label>
        <RadioPillGroup
          options={RISK_PREFERENCE_OPTIONS}
          value={form.riskPreference}
          onChange={(v) => update("riskPreference", v)}
        />
      </div>
    </div>
  );
}

function StepInvestmentPreferences({ form, update }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Investment Preferences</h2>
      <p className="step-subtitle">Which investment categories are you comfortable investing in?</p>

      <div className="form-group">
        <CheckboxPillGroup
          options={CATEGORY_OPTIONS}
          values={form.preferredCategories}
          onChange={(v) => update("preferredCategories", v)}
        />
      </div>
    </div>
  );
}