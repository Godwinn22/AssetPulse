// src/pages/admin/Users.jsx
// Staff management — coming in Day 4!

import { Users } from "lucide-react";

export default function UsersPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Staff Members
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Create and manage staff accounts
                </p>
            </div>
            <div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                      flex flex-col items-center justify-center py-20 text-gray-400"
            >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-semibold text-gray-500">Coming in Day 4</p>
                <p className="text-sm mt-1">
                    Full staff account management will be built next
                </p>
            </div>
        </div>
    );
}
