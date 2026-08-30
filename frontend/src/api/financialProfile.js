import api from "./client";

export async function fetchFinancialProfile() {
  const { data } = await api.get("/profile/financial-profile");
  return data; // { profile, completedSteps, isComplete }
}

export async function saveFinancialProfileStep(step, payload) {
  const { data } = await api.put(`/profile/financial-profile/step/${step}`, payload);
  return data; // { profile, completedSteps, isComplete }
}