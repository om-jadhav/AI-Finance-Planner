const prisma = require("../config/prisma");
const { getMergedProfile } = require("./planGeneration.controller");

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

// Only the last N messages are meaningful to the chatbot (see
// chat_service.MAX_HISTORY_MESSAGES on the Python side) -- trimming here
// too keeps the payload small regardless of what the frontend sends.
const MAX_HISTORY_MESSAGES = 10;

// Groq's free/on-demand tier has a per-minute token budget that a full
// plan response (3 variants + full instrument scoring tables) can easily
// exceed. recommended_instruments is by far the largest part of the
// payload and the least needed turn-to-turn -- most chat questions only
// need risk_profile / feasibility / plan.plans (which already lists each
// plan's chosen instruments + percentages). So we keep a SHORT summary
// of recommended_instruments (name + CAGR only, top 4 per category)
// instead of the full scored table, cutting the payload roughly in half.
function summarizeRecommendedInstruments(recommendedInstruments) {
  if (!recommendedInstruments || typeof recommendedInstruments !== "object") return undefined;

  const summary = {};
  for (const [category, instruments] of Object.entries(recommendedInstruments)) {
    if (!Array.isArray(instruments)) continue;
    summary[category] = instruments.slice(0, 4).map((i) => ({
      instrument: i.instrument,
      annualized_return_cagr_pct: i.annualized_return_cagr_pct,
    }));
  }
  return summary;
}

// Builds a TRIMMED version of what /generate-plan returned: enough for
// the chatbot to answer well, small enough to fit Groq's free-tier token
// budget. Never recalculates anything -- purely a size reduction of
// already-computed data.
async function getUserContext(userId) {
  const [profile, latestPlan] = await Promise.all([
    getMergedProfile(userId),
    prisma.financialPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { response: true },
    }),
  ]);

  if (!profile && !latestPlan) return null;

  const response = latestPlan ? latestPlan.response : {};

  return {
    profile: profile || null,
    risk_profile: response.risk_profile || null,
    feasibility: response.feasibility || null,
    portfolio: response.portfolio
      ? {
          allocation: response.portfolio.allocation,
          recommended_instruments: summarizeRecommendedInstruments(response.portfolio.recommended_instruments),
        }
      : null,
    plan: response.plan || null,
  };
}

// POST /api/chat
// Proxies to the FastAPI RAG chatbot. Stateless on the server -- the
// frontend resends the growing message list each turn (frontend keeps
// chat history in memory only, not persisted to Postgres). Personalization
// context is re-fetched fresh from the DB on every call.
async function chat(req, res) {
  const userId = req.userId;
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array." });
  }

  const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  let userContext;
  try {
    userContext = await getUserContext(userId);
  } catch (err) {
    console.error("Failed to load user context for chat:", err);
    userContext = null; // chat still works without personalization
  }

  try {
    const apiRes = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: trimmedMessages, user_context: userContext }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      console.error("FastAPI /chat error:", apiRes.status, errText);
      return res.status(502).json({ error: "The chat assistant failed to respond. Please try again." });
    }

    const data = await apiRes.json();
    return res.json({ reply: data.reply, sources: data.sources || [] });
  } catch (err) {
    console.error("FastAPI /chat request failed:", err);
    const timedOut = err.name === "TimeoutError" || err.name === "AbortError";
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "The chat assistant took too long to respond. Please try again."
        : "Couldn't reach the chat assistant. Is it running?",
    });
  }
}

module.exports = { chat };