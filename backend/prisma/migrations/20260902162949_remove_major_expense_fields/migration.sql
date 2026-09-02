-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'STUDENT', 'RETIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentExperience" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "FinancialGoalType" AS ENUM ('RETIREMENT', 'WEALTH_CREATION', 'EDUCATION', 'HOME_PURCHASE', 'MARRIAGE', 'TRAVEL', 'EMERGENCY_FUND', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalFlexibility" AS ENUM ('FLEXIBLE', 'SOMEWHAT_FLEXIBLE', 'FIXED_DEADLINE');

-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InvestmentHolding" AS ENUM ('STOCKS', 'MUTUAL_FUNDS', 'GOLD', 'ETFS', 'FIXED_DEPOSITS', 'BONDS', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketDropReaction" AS ENUM ('SELL_EVERYTHING', 'SELL_SOME', 'HOLD_AND_WAIT', 'INVEST_MORE');

-- CreateEnum
CREATE TYPE "InvestmentHorizon" AS ENUM ('LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_TO_TEN_YEARS', 'TEN_PLUS_YEARS');

-- CreateEnum
CREATE TYPE "RiskPreference" AS ENUM ('PROTECT_MONEY', 'BALANCE_SAFETY_GROWTH', 'MODERATE_RISK', 'HIGH_RISK');

-- CreateEnum
CREATE TYPE "InvestmentCategory" AS ENUM ('MUTUAL_FUNDS', 'STOCKS', 'GOLD', 'GOLD_ETFS', 'SILVER_ETFS', 'NIFTY_ETFS', 'BANKING_ETFS', 'FIXED_DEPOSITS', 'OPEN_TO_ALL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_income_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "employmentStatus" "EmploymentStatus" NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "monthlyExpense" DOUBLE PRECISION NOT NULL,
    "currentSavings" DOUBLE PRECISION NOT NULL,
    "dependents" INTEGER NOT NULL DEFAULT 0,
    "totalDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investmentExperience" "InvestmentExperience" NOT NULL DEFAULT 'BEGINNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_income_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryGoal" "FinancialGoalType" NOT NULL,
    "goalTargetAmount" DOUBLE PRECISION NOT NULL,
    "goalTimeYears" INTEGER NOT NULL,
    "goalFlexibility" "GoalFlexibility" NOT NULL,
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_capacities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyInvestmentCapacity" DOUBLE PRECISION NOT NULL,
    "hasExistingInvestments" BOOLEAN NOT NULL,
    "existingInvestmentTypes" "InvestmentHolding"[] DEFAULT ARRAY[]::"InvestmentHolding"[],
    "existingInvestmentAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketDropReaction" "MarketDropReaction" NOT NULL,
    "investmentHorizon" "InvestmentHorizon" NOT NULL,
    "riskPreference" "RiskPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCategories" "InvestmentCategory"[] DEFAULT ARRAY[]::"InvestmentCategory"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "personal_income_profiles_userId_key" ON "personal_income_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "goals_userId_key" ON "goals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "investment_capacities_userId_key" ON "investment_capacities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "risk_profiles_userId_key" ON "risk_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "investment_preferences_userId_key" ON "investment_preferences"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_income_profiles" ADD CONSTRAINT "personal_income_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_capacities" ADD CONSTRAINT "investment_capacities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_profiles" ADD CONSTRAINT "risk_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_preferences" ADD CONSTRAINT "investment_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_plans" ADD CONSTRAINT "financial_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
