const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");
const {
  getFinancialProfile,
  saveFinancialProfileStep,
} = require("../controllers/financialProfile.controller");

const router = express.Router();

// Example of a protected route — copy this pattern for the actual
// finance-profile endpoints (net worth, risk score, goals, plan generation).
router.get("/profile", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true },
  });
  res.json({ user });
});

// Financial Profile onboarding — collects the data our future LLM
// planning engine will consume. Saved progressively, one step at a time,
// each step backed by its own table (see schema.prisma).
router.get("/profile/financial-profile", requireAuth, getFinancialProfile);
router.put("/profile/financial-profile/step/:step", requireAuth, saveFinancialProfileStep);

module.exports = router;