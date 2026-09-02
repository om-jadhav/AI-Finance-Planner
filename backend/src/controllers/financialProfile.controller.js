const prisma = require("../config/prisma");
const { financialProfileStepSchemas } = require("../utils/validators");

// Maps step number -> Prisma model accessor for that section's table.
const STEP_MODEL = {
  1: "personalIncomeProfile",
  2: "goal",
  3: "investmentCapacity",
  4: "riskProfile",
  5: "investmentPreferences",
};

function omitMeta({ id, userId, createdAt, updatedAt, ...rest }) {
  return rest;
}

// GET /api/profile/financial-profile
// Returns the logged-in user's profile merged from all 5 tables (or an
// empty shell if they haven't started), plus which steps are done so the
// frontend can resume correctly. The merged shape keeps the frontend
// contract identical even though the data now lives in 5 tables.
async function getFinancialProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      personalIncomeProfile: true,
      goal: true,
      investmentCapacity: true,
      riskProfile: true,
      investmentPreferences: true,
    },
  });

  const sections = {
    1: user.personalIncomeProfile,
    2: user.goal,
    3: user.investmentCapacity,
    4: user.riskProfile,
    5: user.investmentPreferences,
  };

  const completedSteps = Object.entries(sections)
    .filter(([, section]) => section !== null)
    .map(([step]) => Number(step));

  const isComplete = completedSteps.length === 5;

  const hasAnyData = completedSteps.length > 0;
  const profile = hasAnyData
    ? {
        userId: req.userId,
        ...omitMeta(user.personalIncomeProfile || {}),
        ...omitMeta(user.goal || {}),
        ...omitMeta(user.investmentCapacity || {}),
        ...omitMeta(user.riskProfile || {}),
        ...omitMeta(user.investmentPreferences || {}),
      }
    : null;

  res.json({ profile, completedSteps, isComplete });
}

// PUT /api/profile/financial-profile/step/:step
// Validates the section's fields and upserts just that step's table row,
// then returns the same merged shape as GET.
async function saveFinancialProfileStep(req, res) {
  const step = Number(req.params.step);
  const schema = financialProfileStepSchemas[step];
  const modelName = STEP_MODEL[step];

  if (!schema || !modelName) {
    return res.status(400).json({ error: "Invalid step. Must be 1-5." });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const data = { ...parsed.data };

  // Conditional fields: if the "no" branch was chosen, don't carry over
  // stale values from a previous edit of this step.
  if (step === 2) {
    // REMOVE these lines if present:
    // if (data.hasMajorExpenseBeforeGoal === "true") {
    //   data.majorExpenseAmount = Number(data.majorExpenseAmount);
    //   data.majorExpenseYear = Number(data.majorExpenseYear);
    // } else {
    //   data.majorExpenseAmount = null;
    //   data.majorExpenseYear = null;
    // }
  }
  if (step === 3 && !data.hasExistingInvestments) {
    data.existingInvestmentTypes = [];
    data.existingInvestmentAmount = null;
  }

  await prisma[modelName].upsert({
    where: { userId: req.userId },
    create: {
      userId: req.userId,
      ...data,
    },
    update: {
      ...data,
    },
  });

  // Reuse the GET logic so the response shape (merged profile,
  // completedSteps, isComplete) always stays in sync in one place.
  return getFinancialProfile(req, res);
}

module.exports = { getFinancialProfile, saveFinancialProfileStep };