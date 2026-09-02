import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import HomePage from "./pages/HomePage";
import AssessmentPage from "./pages/AssessmentPage";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import FinancialProfile from "./pages/FinancialProfile";
import GeneratedPlan from "./pages/GeneratePlan";
import FinancialAssistant from "./pages/FinancialAssistant";
import CalculatorPage from "./pages/CalculatorPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<HomePage />} />

          {/* Public 2-minute financial health quiz (no login required) */}
          <Route path="/assessment" element={<AssessmentPage />} />

          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes – require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-profile"
            element={
              <ProtectedRoute>
                <FinancialProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculators"
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-assistant"
            element={
              <ProtectedRoute>
                <FinancialAssistant />
              </ProtectedRoute>
            }
          />

          {/* Plan page – decide if you want it protected or not. 
              Currently it's not wrapped, so public. If you need auth, wrap it. */}
          <Route path="/plan" element={<ProtectedRoute><GeneratedPlan /></ProtectedRoute>} />

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}