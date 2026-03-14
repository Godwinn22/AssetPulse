// src/pages/staff/Dashboard.jsx
import { Routes, Route } from "react-router-dom";
import MyDevices from "./MyDevices";
import MyHistory from "./MyHistory";
import MyProfile from "./MyProfile";
import AppLayout from "../../components/shared/AppLayout";
import { Cpu, History, User } from "lucide-react";

const navItems = [
    { to: "/staff", label: "My Devices", icon: Cpu, end: true },
    { to: "/staff/history", label: "My History", icon: History },
    { to: "/staff/profile", label: "My Profile", icon: User },
];

export default function StaffDashboard() {
    return (
        <AppLayout navItems={navItems}>
            <Routes>
                {/* /staff → MyDevices */}
                <Route index element={<MyDevices />} />
                {/* /staff/history → MyHistory */}
                <Route path="history" element={<MyHistory />} />
                {/* /staff/profile → MyProfile */}
                <Route path="profile" element={<MyProfile />} />
            </Routes>
        </AppLayout>
    );
}
