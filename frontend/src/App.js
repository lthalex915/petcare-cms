import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AnalyticsPage from "./pages/AnalyticsPage";
import DailyLogDetailPage from "./pages/DailyLogDetailPage";
import DailyLogFormPage from "./pages/DailyLogFormPage";
import DailyLogListPage from "./pages/DailyLogListPage";
import DashboardPage from "./pages/DashboardPage";
import PetDetailPage from "./pages/PetDetailPage";
import PetListPage from "./pages/PetListPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import ReportListPage from "./pages/ReportListPage";
import SettingsPage from "./pages/SettingsPage";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsxs(Route, { path: "/", element: _jsx(AppLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "pets", element: _jsx(PetListPage, {}) }), _jsx(Route, { path: "pets/:id", element: _jsx(PetDetailPage, {}) }), _jsx(Route, { path: "daily-logs", element: _jsx(DailyLogListPage, {}) }), _jsx(Route, { path: "daily-logs/new", element: _jsx(DailyLogFormPage, {}) }), _jsx(Route, { path: "daily-logs/:date", element: _jsx(DailyLogDetailPage, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportListPage, {}) }), _jsx(Route, { path: "reports/:id", element: _jsx(ReportDetailPage, {}) }), _jsx(Route, { path: "analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) })] })] }));
}
