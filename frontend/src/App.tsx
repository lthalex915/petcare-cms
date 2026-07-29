import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AnalyticsPage from "./pages/AnalyticsPage";
import DailyLogDetailPage from "./pages/DailyLogDetailPage";
import DailyLogFormPage from "./pages/DailyLogFormPage";
import DailyLogListPage from "./pages/DailyLogListPage";
import DashboardPage from "./pages/DashboardPage";
import DbmsPage from "./pages/DbmsPage";
import PetDetailPage from "./pages/PetDetailPage";
import PetListPage from "./pages/PetListPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import ReportListPage from "./pages/ReportListPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pets" element={<PetListPage />} />
        <Route path="pets/:id" element={<PetDetailPage />} />
        <Route path="daily-logs" element={<DailyLogListPage />} />
        <Route path="daily-logs/new" element={<DailyLogFormPage />} />
        <Route path="daily-logs/:date" element={<DailyLogDetailPage />} />
        <Route path="reports" element={<ReportListPage />} />
        <Route path="reports/:id" element={<ReportDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="dbms" element={<DbmsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
