// src/pages/admin/AssignmentHistory.jsx
// Shows a full, searchable log of every device assignment and return.

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { History, Search } from "lucide-react";

export default function AssignmentHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from("assignment_history")
                .select(
                    `
          id, assigned_at, returned_at, notes,
          device:devices(name, type),
          assignee:profiles!assignment_history_assigned_to_fkey(full_name, department),
          assigner:profiles!assignment_history_assigned_by_fkey(full_name)
        `,
                )
                .order("assigned_at", { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error("History fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter by device name, assignee, or assigner
    const filtered = history.filter((h) => {
        const q = search.toLowerCase();
        return (
            h.device?.name?.toLowerCase().includes(q) ||
            h.assignee?.full_name?.toLowerCase().includes(q) ||
            h.assigner?.full_name?.toLowerCase().includes(q)
        );
    });

    const fmtDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "—";

    return (
        <div>
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Assignment History
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Complete log of all device assignments and returns
                </p>
            </div>

            {/* ── Search bar ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by device or person..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                    />
                </div>
            </div>

            {/* ── History table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <History className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No history yet</p>
                        <p className="text-sm mt-1">
                            Assignment records will appear here once you assign
                            devices
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Assigned By
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Date Assigned
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Date Returned
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((h) => (
                                    <tr
                                        key={h.id}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {h.device?.name || "—"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {h.device?.type}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">
                                                {h.assignee?.full_name || "—"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {h.assignee?.department}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {h.assigner?.full_name || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {fmtDate(h.assigned_at)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {fmtDate(h.returned_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.returned_at ? (
                                                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Returned
                                                </span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
