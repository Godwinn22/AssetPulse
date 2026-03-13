// src/pages/admin/Dashboard.jsx
import { useAuth } from "../../contexts/AuthContext";
import { Monitor, LogOut } from "lucide-react";

export default function AdminDashboard() {
    const { profile, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">AssetPulse</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                        Admin
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Hi,{" "}
                        <span className="font-semibold">
                            {profile?.full_name}
                        </span>
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Body */}
            <main className="max-w-7xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Authentication is working!
                    </h2>
                    <p className="text-gray-500">
                        Day 2 complete. The full Admin Dashboard is coming in
                        Day 3.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-full">
                        Role: <strong>{profile?.role}</strong> · Department:{" "}
                        <strong>{profile?.department}</strong>
                    </div>
                </div>
            </main>
        </div>
    );
}
