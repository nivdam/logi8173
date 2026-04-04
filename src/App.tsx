import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { RequireAuth } from "./components/RequireAuth"
import { DashboardPage } from "./pages/DashboardPage"
import { InventoryPage } from "./pages/InventoryPage"
import { ActivitiesPage } from "./pages/ActivitiesPage"
import { SoldiersPage } from "./pages/SoldiersPage"
import { SettingsPage } from "./pages/SettingsPage"
import { LoginPage } from "./pages/LoginPage"

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="soldiers" element={<SoldiersPage />} />
      <Route
        path="settings"
        element={
          <RequireAuth requiredRole={["admin"]}>
            <SettingsPage />
          </RequireAuth>
        }
      />
    </Route>
  </Routes>
)
