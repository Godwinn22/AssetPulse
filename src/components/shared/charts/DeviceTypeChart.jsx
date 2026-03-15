import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#f97316", // orange
];

const colorizeData = (data) =>
    data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

// ── Custom tooltip ──
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                    {payload[0].name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                    {payload[0].value} device{payload[0].value !== 1 ? "s" : ""}
                </p>
            </div>
        );
    }
    return null;
}

export default function DeviceTypeChart(data) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No device data available
            </div>
        );
    }
    const coloredData = colorizeData(data);
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={coloredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                        <span className="text-xs text-gray-600">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
