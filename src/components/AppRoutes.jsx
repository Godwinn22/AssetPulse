// src/components/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import StaffDashboard from "../pages/staff/Dashboard";
import LoadingScreen from "./LoadingScreen";

export default function AppRoutes() {
    const { user, profile, loading } = useAuth();

    // Still checking session — show spinner
    if (loading) return <LoadingScreen />;

    // Not logged in — only show the login page
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // Logged in but profile hasn't loaded or has an issue
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow text-center max-w-sm">
                    <p className="text-red-600 font-semibold mb-2">
                        Profile Not Found
                    </p>
                    <p className="text-gray-500 text-sm">
                        Your account exists but has no profile. Please contact
                        your IT administrator.
                    </p>
                </div>
            </div>
        );
    }

    // Admin — goes to admin dashboard
    if (profile.role === "admin") {
        return (
            <Routes>
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        );
    }

    // Staff — goes to staff dashboard
    return (
        <Routes>
            <Route path="/staff/*" element={<StaffDashboard />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
    );
}
