import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { RequireAuth } from "./components/RequireAuth"
import { RequireOperatorProfile } from "./components/RequireOperatorProfile"
import { RequireSetup } from "./components/RequireSetup"
import { DashboardPage } from "./features/dashboard/DashboardPage"
import { InventoryPage } from "./features/inventory/InventoryPage"
import { SoldiersPage } from "./features/soldiers/SoldiersPage"
import { ActivitiesPage } from "./pages/ActivitiesPage"
import { SettingsPage } from "./pages/SettingsPage"
import { LoginPage } from "./pages/LoginPage"
import { IssuanceForm } from "./features/issuance/IssuanceForm"
import { ReturnForm } from "./features/return/ReturnForm"
import { NotFoundPage } from "./pages/NotFoundPage"
import { SharedFormPage } from "./pages/SharedFormPage"

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/form/:activityId/:txId" element={<SharedFormPage />} />
    <Route
      element={
        <RequireAuth>
          <RequireOperatorProfile>
            <RequireSetup>
              <AppLayout />
            </RequireSetup>
          </RequireOperatorProfile>
        </RequireAuth>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="activities/:activityId" element={<ActivitiesPage />} />
      <Route path="soldiers" element={<SoldiersPage />} />
      <Route path="issue" element={<IssuanceForm />} />
      <Route path="return" element={<ReturnForm />} />
      <Route
        path="settings"
        element={
          <RequireAuth requiredRole={["admin"]}>
            <SettingsPage />
          </RequireAuth>
        }
      />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)
