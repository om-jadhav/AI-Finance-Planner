import api from "./client";

export async function generatePlan() {
  const { data } = await api.post("/profile/financial-profile/generate-plan");
  return data; // { id, createdAt, response }
}

export async function fetchLatestPlan() {
  const { data } = await api.get("/profile/financial-profile/plans/latest");
  return data.plan; // { id, createdAt, response } | null
}

export async function fetchPlanHistory() {
  const { data } = await api.get("/profile/financial-profile/plans");
  return data.plans; // [{ id, createdAt, response }]
}