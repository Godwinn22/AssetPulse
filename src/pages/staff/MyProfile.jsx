import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { User, Mail, Building2, Shield, Calendar } from "lucide-react";

export default function MyProfile() {
    const { profile } = useAuth();
    const [fullProfile, setFullProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;

        const fetchFullProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select(`*, department:departments(id, name)`)
                    .eq("id", profile.id)
                    .single(); // why do we use .single? because we expect only one profile to match the id, and it gives us the profile object directly instead of an array
                if (error) throw error;
                setFullProfile(data);
                console.log("Fetched full profile:", data);
            } catch (err) {
                console.error(`Could not fetch profile ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchFullProfile();
    }, [profile]);

    // format date
    const fmtDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "-";
    console.log("Full profile:", fullProfile);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return (
        <div>
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Your account details
                </p>
            </div>

            {/* ── Profile card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* ── Top banner + avatar ── */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-24 relative" />

                <div className="px-8 pb-8">
                    {/* Avatar circle — positioned to overlap the banner */}
                    <div
                        className="w-20 h-20 rounded-2xl bg-blue-100 border-4 border-white
                          flex items-center justify-center -mt-10 mb-4 shadow-md"
                    >
                        <span className="text-blue-700 font-bold text-2xl">
                            {fullProfile?.full_name?.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Name + role */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {fullProfile?.full_name}
                        </h2>
                        <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                              text-xs font-semibold mt-1
                              ${
                                  fullProfile?.role === "admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-emerald-100 text-emerald-700"
                              }`}
                        >
                            <Shield className="w-3 h-3" />
                            {fullProfile?.role === "admin"
                                ? "Administrator"
                                : "Staff Member"}
                        </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Email
                                </p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                    {fullProfile?.email}
                                </p>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Department
                                </p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                    {fullProfile?.department?.name || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Role
                                </p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">
                                    {fullProfile?.role}
                                </p>
                            </div>
                        </div>

                        {/* Member since */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Member Since
                                </p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                    {fmtDate(fullProfile?.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Password change hint */}
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-blue-700 text-sm font-medium">
                            Want to change your password?
                        </p>
                        <p className="text-blue-500 text-xs mt-0.5">
                            Password management is coming soon in a future
                            update.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
