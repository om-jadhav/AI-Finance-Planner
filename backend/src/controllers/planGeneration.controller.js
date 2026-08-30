const prisma = require("../config/prisma");
const { toLlmInputPayload } = require("../utils/transformProfile");

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

// Re-fetches and merges the 5 profile tables the same way
// financialProfile.controller.js does, so this stays independent of
// that controller's res.json flow and can be reused/unit tested.
async function getMergedProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalIncomeProfile: true,
      goal: true,
      investmentCapacity: true,
      riskProfile: true,
      investmentPreferences: true,
    },
  });

  const sections = [
    user.personalIncomeProfile,
    user.goal,
    user.investmentCapacity,
    user.riskProfile,
    user.investmentPreferences,
  ];

  const isComplete = sections.every((s) => s !== null);
  if (!isComplete) return null;

  return {
    ...user.personalIncomeProfile,
    ...user.goal,
    ...user.investmentCapacity,
    ...user.riskProfile,
    ...user.investmentPreferences,
  };
}

// POST /api/profile/generate-plan
// Builds the LLM request payload from the user's saved financial
// profile, calls the FastAPI/Grok service, stores the result, and
// returns it to the frontend.
async function generatePlan(req, res) {
  const userId = req.userId;

  const profile = await getMergedProfile(userId);
  if (!profile) {
    return res.status(400).json({
      error: "Complete your financial profile (all 5 steps) before generating a plan.",
    });
  }

  const requestPayload = toLlmInputPayload(userId, profile);

  let llmResponse;
  try {
    const apiRes = await fetch(`${FASTAPI_BASE_URL}/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
      // Grok/LLM calls can be slow — give it real headroom before giving up.
      signal: AbortSignal.timeout(60_000),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      console.error("FastAPI /generate-plan error:", apiRes.status, errText);
      return res.status(502).json({ error: "The planning service failed to generate a plan. Please try again." });
    }

    llmResponse = await apiRes.json();
  } catch (err) {
    console.error("FastAPI /generate-plan request failed:", err);
    const timedOut = err.name === "TimeoutError" || err.name === "AbortError";
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "The planning service took too long to respond. Please try again."
        : "Couldn't reach the planning service. Is it running?",
    });
  }

  if (llmResponse.success === false) {
    return res.status(502).json({ error: "The planning service reported a failure generating this plan." });
  }

  const saved = await prisma.financialPlan.create({
    data: {
      userId,
      requestPayload,
      response: llmResponse,
    },
  });

  res.status(201).json({
    id: saved.id,
    createdAt: saved.createdAt,
    response: saved.response,
  });
}

// GET /api/profile/plans
// Returns all previously generated plans for the logged-in user,
// newest first, for a history view.
async function listPlans(req, res) {
  const plans = await prisma.financialPlan.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, response: true },
  });

  res.json({ plans });
}

// GET /api/profile/plans/latest
// Convenience endpoint for the dashboard to show the most recent plan
// without fetching the whole history.
async function getLatestPlan(req, res) {
  const plan = await prisma.financialPlan.findFirst({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, response: true },
  });

  res.json({ plan: plan || null });
}

module.exports = { generatePlan, listPlans, getLatestPlan };