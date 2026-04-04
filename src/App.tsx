import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { InventoryPage } from "./pages/InventoryPage"
import { ActivitiesPage } from "./pages/ActivitiesPage"
import { SoldiersPage } from "./pages/SoldiersPage"
import { SettingsPage } from "./pages/SettingsPage"

export const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="soldiers" element={<SoldiersPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  </Routes>
)
