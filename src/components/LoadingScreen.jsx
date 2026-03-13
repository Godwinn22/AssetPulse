import React from "react";

// src/components/LoadingScreen.jsx
// Shown while we check if the user is logged in (usually less than 1 second)
export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">
                Loading AssetPulse...
            </p>
        </div>
    );
}
