const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ---------------- FINANCIAL PROFILE ----------------
// One schema per onboarding step. Kept in sync with the fixed question
// list — do not add/remove/rename fields without updating the frontend
// questions and the Prisma schema together.

const money = (label) => z.coerce.number().min(0, `${label} can't be negative`);

const personalIncomeSchema = z.object({
  age: z.coerce.number().int().min(18, "Minimum age for making investments is 18 years").max(120, "Enter a valid age"),
  employmentStatus: z.enum([
    "SALARIED",
    "SELF_EMPLOYED",
    "BUSINESS_OWNER",
    "STUDENT",
    "RETIRED",
    "OTHER",
  ]),
  monthlyIncome: money("Monthly income"),
  monthlyExpense: money("Monthly expense"),
  currentSavings: money("Current savings"),
  // Added for the Grok/FastAPI plan-generation request contract.
  dependents: z.coerce.number().int().min(0, "Dependents can't be negative"),
  totalDebt: money("Total debt"),
  investmentExperience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

const goalSchema = z.object({
  primaryGoal: z.enum([
    "RETIREMENT",
    "WEALTH_CREATION",
    "EDUCATION",
    "HOME_PURCHASE",
    "MARRIAGE",
    "TRAVEL",
    "EMERGENCY_FUND",
    "OTHER",
  ]),
  goalTargetAmount: money("Goal amount"),
  goalTimeYears: z.coerce.number().min(0, "Enter a valid number of years"),
  goalFlexibility: z.enum(["FLEXIBLE", "SOMEWHAT_FLEXIBLE", "FIXED_DEADLINE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

const investmentCapacitySchema = z
  .object({
    monthlyInvestmentCapacity: z.coerce
      .number()
      .min(500, "Minimum monthly investment amount is ₹500"), hasExistingInvestments: z.boolean(),
    existingInvestmentTypes: z
      .array(
        z.enum(["STOCKS", "MUTUAL_FUNDS", "GOLD", "ETFS", "FIXED_DEPOSITS", "BONDS", "OTHER"])
      )
      .optional()
      .default([]),
    existingInvestmentAmount: money("Existing investment amount").optional().nullable(),
  })
  .refine(
    (data) => !data.hasExistingInvestments || data.existingInvestmentTypes.length > 0,
    { message: "Select at least one investment type", path: ["existingInvestmentTypes"] }
  )
  .refine(
    (data) =>
      !data.hasExistingInvestments ||
      (data.existingInvestmentAmount !== undefined && data.existingInvestmentAmount !== null),
    { message: "Existing investment amount is required", path: ["existingInvestmentAmount"] }
  );

const riskProfileSchema = z.object({
  marketDropReaction: z.enum([
    "SELL_EVERYTHING",
    "SELL_SOME",
    "HOLD_AND_WAIT",
    "INVEST_MORE",
  ]),
  investmentHorizon: z.enum([
    "LESS_THAN_1_YEAR",
    "ONE_TO_THREE_YEARS",
    "THREE_TO_FIVE_YEARS",
    "FIVE_TO_TEN_YEARS",
    "TEN_PLUS_YEARS",
  ]),
  riskPreference: z.enum([
    "PROTECT_MONEY",
    "BALANCE_SAFETY_GROWTH",
    "MODERATE_RISK",
    "HIGH_RISK",
  ]),
});

const investmentPreferencesSchema = z.object({
  preferredCategories: z
    .array(
      z.enum([
        "MUTUAL_FUNDS",
        "STOCKS",
        "GOLD_ETFS",
        "SILVER_ETFS",
        "NIFTY_ETFS",
        "BANKING_ETFS",
        "FIXED_DEPOSITS",
        "OPEN_TO_ALL",
      ])
    )
    .min(1, "Select at least one investment category"),
});

// Each schema corresponds to exactly one Prisma model (see schema.prisma).
const financialProfileStepSchemas = {
  1: personalIncomeSchema,
  2: goalSchema,
  3: investmentCapacitySchema,
  4: riskProfileSchema,
  5: investmentPreferencesSchema,
};

module.exports = {
  registerSchema,
  loginSchema,
  financialProfileStepSchemas,
};