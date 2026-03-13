// src/components/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import StaffDashboard from "../pages/staff/Dashboard";
import LoadingScreen from "./LoadingScreen";

// Add this component at the TOP of AppRoutes.jsx, outside the main function
function AutoRetry() {
    useEffect(() => {
        // Automatically retry after 3 seconds — no user action needed
        const timer = setTimeout(() => window.location.reload(), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow text-center max-w-sm">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-1">
                    Loading AssetPulse...
                </p>
                <p className="text-gray-400 text-sm">
                    This will refresh automatically
                </p>
            </div>
        </div>
    );
}

export default function AppRoutes() {
    const { user, profile, loading } = useAuth();

    // Always show spinner while auth is being checked
    if (loading) return <LoadingScreen />;

    // Not logged in — show login page only
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // User is logged in but profile is missing — only show AFTER loading is done
    // This prevents the flash since we now only reach here when loading = false
    if (!profile) {
        return <AutoRetry />;
    }

    // Route based on role
    if (profile.role === "admin") {
        return (
            <Routes>
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/staff/*" element={<StaffDashboard />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
    );
}
