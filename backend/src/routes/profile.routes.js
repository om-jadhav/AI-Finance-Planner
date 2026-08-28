const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");

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

module.exports = router;
