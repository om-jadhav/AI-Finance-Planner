// Converts the merged Prisma profile into the exact contract
// expected by the FastAPI /generate-plan endpoint.

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0) + str.slice(1).toLowerCase();
}

// Prisma InvestmentCategory enum
// -> FastAPI preferred_categories values
function normalizePreferredCategory(category) {
  if (!category) return null;

  const mapping = {
    MUTUAL_FUNDS: "mutual_funds",
    STOCKS: "stocks",

    // Gold-related categories are currently stored inside
    // the FastAPI etf_instruments dataset.
    GOLD: "gold",
    GOLD_ETFS: "gold",
    SILVER_ETFS: "etf_instruments",
    NIFTY_ETFS: "etf_instruments",
    BANKING_ETFS: "etf_instruments",

    // Prisma FIXED_DEPOSITS maps to FastAPI fixed_income.
    FIXED_DEPOSITS: "fixed_income",

    // OPEN_TO_ALL means no category filtering.
    OPEN_TO_ALL: null,
  };

  return mapping[category] ?? null;
}

function toLlmInputPayload(userId, profile) {
  // remove any extraction/mapping of:
  // hasMajorExpenseBeforeGoal
  // majorExpenseAmount
  // majorExpenseYear

  const hasExisting = !!profile.hasExistingInvestments;

  const rawCategories = Array.isArray(profile.preferredCategories)
    ? profile.preferredCategories
    : [];

  // Convert Prisma enum values to FastAPI category values.
  const normalizedCategories = rawCategories
    .map(normalizePreferredCategory)
    .filter(Boolean);

  // OPEN_TO_ALL means the user accepts every category.
  // FastAPI interprets null/empty as "no filtering".
  const preferredCategories =
    rawCategories.includes("OPEN_TO_ALL")
      ? null
      : [...new Set(normalizedCategories)];

  return {
    user_id: String(userId),

    profile: {
      age: profile.age,
      employment_status: capitalize(
        profile.employmentStatus
      ),

      marital_status: capitalize(
        profile.maritalStatus
      ),
      monthly_income: profile.monthlyIncome,
      monthly_expenses: profile.monthlyExpense,
      current_savings: profile.currentSavings,

      existing_investments: hasExisting
        ? profile.existingInvestmentAmount
        : 0,

      monthly_investment_capacity:
        profile.monthlyInvestmentCapacity,

      dependents: profile.dependents,
      total_debt: profile.totalDebt,

      investment_experience: capitalize(
        profile.investmentExperience
      ),
    },

    goal: {
      goal_type: profile.primaryGoal,
      goal_amount: profile.goalTargetAmount,
      target_years: profile.goalTimeYears,
      priority: capitalize(profile.priority),
    },

    risk_answers: {
      market_drop_reaction: profile.marketDropReaction,
      investment_horizon: profile.investmentHorizon,
      risk_preference: profile.riskPreference,
    },

    preferred_categories: preferredCategories,
  };
  console.log(
    "========== FASTAPI PAYLOAD =========="
  );

  console.log(
    JSON.stringify(payload, null, 2)
  );

  console.log(
    "====================================="
  );
}

module.exports = {
  toLlmInputPayload,
};