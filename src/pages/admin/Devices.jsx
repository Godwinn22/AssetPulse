// src/pages/admin/Devices.jsx
// Full device management — the core of AssetPulse.

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    UserPlus,
    RotateCcw,
    Cpu,
    Laptop,
    Printer,
    Mouse,
    X,
    AlertCircle,
    Package,
    Monitor,
    ScanLine,
    Keyboard,
} from "lucide-react";

// ─────────────────────────────────────────────
// HELPER: Map device type → icon component
// ─────────────────────────────────────────────
function DeviceIcon({ type }) {
    const map = {
        Laptop: Laptop,
        Desktop: Monitor,
        Printer: Printer,
        Scanner: ScanLine,
        Mouse: Mouse,
        Keyboard: Keyboard,
        Other: Package,
    };
    const Icon = map[type] || Cpu;
    return <Icon className="w-4 h-4" />;
}

// ─────────────────────────────────────────────
// HELPER: Status badge styling
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
    const styles = {
        available: "bg-emerald-100 text-emerald-700",
        assigned: "bg-blue-100 text-blue-700",
        under_repair: "bg-amber-100 text-amber-700",
        retired: "bg-gray-100 text-gray-500",
    };
    const labels = {
        available: "Available",
        assigned: "Assigned",
        under_repair: "Under Repair",
        retired: "Retired",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-500"}`}
        >
            {labels[status] || status}
        </span>
    );
}

// ─────────────────────────────────────────────
// REUSABLE: Text input for forms
// ─────────────────────────────────────────────
function FormInput({
    label,
    type = "text",
    value,
    onChange,
    required,
    placeholder,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-gray-50 focus:bg-white transition"
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// REUSABLE: Select dropdown for forms
// ─────────────────────────────────────────────
function FormSelect({ label, value, onChange, required, options }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-gray-50 focus:bg-white transition"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 1: Add / Edit Device
// ─────────────────────────────────────────────
// When `device` prop is passed → Edit mode
// When `device` prop is null → Add mode
function DeviceFormModal({ device, onClose, onSaved }) {
    const isEditing = !!device;

    const [form, setForm] = useState({
        name: device?.name || "",
        type: device?.type || "Laptop",
        brand: device?.brand || "",
        model: device?.model || "",
        serial_number: device?.serial_number || "",
        purchase_price: device?.purchase_price || "",
        status: device?.status || "available",
        notes: device?.notes || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper: update one field without overwriting the rest
    const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                ...form,
                purchase_price: parseFloat(form.purchase_price) || 0,
                updated_at: new Date().toISOString(),
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("devices")
                    .update(payload)
                    .eq("id", device.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("devices")
                    .insert(payload);
                if (error) throw error;
            }

            onSaved(); // tells parent to refresh the device list
        } catch (err) {
            // Handle duplicate serial number error specifically
            if (err.message.includes("serial_number")) {
                setError("A device with this serial number already exists.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {isEditing ? "Edit Device" : "Add New Device"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEditing
                                ? `Editing: ${device.name}`
                                : "Fill in the device details below"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Device name */}
                    <FormInput
                        label="Device Name"
                        value={form.name}
                        onChange={set("name")}
                        required
                        placeholder="e.g. HP LaserJet Pro, Dell Latitude 15"
                    />

                    {/* Type + Status row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Device Type"
                            value={form.type}
                            onChange={set("type")}
                            required
                            options={[
                                { value: "Laptop", label: "💻 Laptop" },
                                { value: "Desktop", label: "🖥️ Desktop" },
                                { value: "Printer", label: "🖨️ Printer" },
                                { value: "Scanner", label: "📠 Scanner" },
                                { value: "Mouse", label: "🖱️ Mouse" },
                                { value: "Keyboard", label: "⌨️ Keyboard" },
                                { value: "Other", label: "📦 Other" },
                            ]}
                        />
                        <FormSelect
                            label="Status"
                            value={form.status}
                            onChange={set("status")}
                            required
                            options={[
                                { value: "available", label: "Available" },
                                { value: "assigned", label: "Assigned" },
                                {
                                    value: "under_repair",
                                    label: "Under Repair",
                                },
                                { value: "retired", label: "Retired" },
                            ]}
                        />
                    </div>

                    {/* Brand + Model row */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Brand"
                            value={form.brand}
                            onChange={set("brand")}
                            placeholder="e.g. HP, Dell, Canon"
                        />
                        <FormInput
                            label="Model"
                            value={form.model}
                            onChange={set("model")}
                            placeholder="e.g. M404n"
                        />
                    </div>

                    {/* Serial number */}
                    <FormInput
                        label="Serial Number"
                        value={form.serial_number}
                        onChange={set("serial_number")}
                        placeholder="e.g. SN2024XYZ001"
                    />

                    {/* Purchase price */}
                    <FormInput
                        label="Purchase Price (₦)"
                        type="number"
                        value={form.purchase_price}
                        onChange={set("purchase_price")}
                        placeholder="0.00"
                    />

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Notes
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => set("notes")(e.target.value)}
                            placeholder="Any extra information about this device..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-gray-50 focus:bg-white transition resize-none"
                        />
                    </div>

                    {/* Form action buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition shadow-sm"
                        >
                            {loading
                                ? "Saving..."
                                : isEditing
                                  ? "Save Changes"
                                  : "Add Device"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 2: Delete Confirmation
// ─────────────────────────────────────────────
function DeleteModal({ device, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from("devices")
                .delete()
                .eq("id", device.id);
            if (error) throw error;
            onDeleted();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Delete Device
                        </h2>
                        <p className="text-sm text-gray-400">
                            This action cannot be undone
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
                    You are about to permanently delete{" "}
                    <strong className="text-gray-900">{device.name}</strong>.
                    All assignment history linked to this device will also be
                    deleted.
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2.5 rounded-xl text-sm mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400
                       text-white rounded-xl text-sm font-semibold transition"
                    >
                        {loading ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 3: Assign Device to Staff
// ─────────────────────────────────────────────
function AssignModal({ device, onClose, onAssigned }) {
    const { profile: adminProfile } = useAuth();

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    // Load staff members when modal opens
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, full_name, department, email")
                    .eq("role", "staff")
                    .order("full_name");
                if (error) throw error;
                setStaffList(data || []);
            } catch (err) {
                setError("Could not load staff list: " + err.message);
            } finally {
                setFetching(false);
            }
        };
        fetchStaff();
    }, []);

    const handleAssign = async () => {
        if (!selectedStaff)
            return setError(
                "Please select a staff member to assign this device to.",
            );
        setLoading(true);
        setError("");

        try {
            // Step 1: Update the device — set status to "assigned" and record who it's assigned to
            const { error: devErr } = await supabase
                .from("devices")
                .update({
                    status: "assigned",
                    assigned_to: selectedStaff,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", device.id);
            if (devErr) throw devErr;

            // Step 2: Create an assignment history record (the paper trail)
            const { error: histErr } = await supabase
                .from("assignment_history")
                .insert({
                    device_id: device.id,
                    assigned_to: selectedStaff,
                    assigned_by: adminProfile.id,
                    notes: notes || null,
                });
            if (histErr) throw histErr;

            onAssigned(); // tell parent to refresh
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Assign Device
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Device:{" "}
                            <span className="font-semibold text-gray-600">
                                {device.name}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2.5 rounded-xl text-sm mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Staff picker */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Assign To <span className="text-red-500">*</span>
                        </label>
                        {fetching ? (
                            // Loading skeleton
                            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                        ) : staffList.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                ⚠️ No staff accounts found. Create staff
                                accounts first in "Staff Members".
                            </div>
                        ) : (
                            <select
                                value={selectedStaff}
                                onChange={(e) =>
                                    setSelectedStaff(e.target.value)
                                }
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                            >
                                <option value="">
                                    Select a staff member...
                                </option>
                                {staffList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.full_name} —{" "}
                                        {s.department || "No Department"}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Optional notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Notes{" "}
                            <span className="text-gray-400 font-normal">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. For use at the Ikeja branch office..."
                            rows={2}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || fetching || staffList.length === 0}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
                    >
                        {loading ? "Assigning..." : "Assign Device"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 4: Return Device
// ─────────────────────────────────────────────
function ReturnModal({ device, onClose, onReturned }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleReturn = async () => {
        setLoading(true);
        setError("");

        try {
            // Step 1: Set device back to available and clear assigned_to
            const { error: devErr } = await supabase
                .from("devices")
                .update({
                    status: "available",
                    assigned_to: null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", device.id);
            if (devErr) throw devErr;

            // Step 2: Close the open assignment history entry by setting returned_at
            // `.is('returned_at', null)` finds the entry that doesn't have a return date yet
            const { error: histErr } = await supabase
                .from("assignment_history")
                .update({ returned_at: new Date().toISOString() })
                .eq("device_id", device.id)
                .is("returned_at", null);
            if (histErr) throw histErr;

            onReturned();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <RotateCcw className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Return Device
                        </h2>
                        <p className="text-sm text-gray-400">
                            Mark this device as returned
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
                    Returning{" "}
                    <strong className="text-gray-900">{device.name}</strong>{" "}
                    will:
                    <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
                        <li>
                            Mark the device as <strong>Available</strong>
                        </li>
                        <li>Remove the current staff assignment</li>
                        <li>
                            Update the assignment history with today's return
                            date
                        </li>
                    </ul>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2.5 rounded-xl text-sm mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReturn}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                       text-white rounded-xl text-sm font-semibold transition"
                    >
                        {loading ? "Processing..." : "Confirm Return"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE: Devices
// ─────────────────────────────────────────────
export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Modal visibility states
    const [showForm, setShowForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null); // null = add mode
    const [deletingDevice, setDeletingDevice] = useState(null);
    const [assigningDevice, setAssigningDevice] = useState(null);
    const [returningDevice, setReturningDevice] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            // We join to profiles to get the assignee's name and department
            // The "!" syntax tells Supabase which foreign key to use for the join
            const { data, error } = await supabase
                .from("devices")
                .select(
                    `
          *,
          assignee:profiles!devices_assigned_to_fkey(id, full_name, department)
        `,
                )
                .order("created_at", { ascending: false });
            if (error) throw error;
            setDevices(data || []);
        } catch (err) {
            console.error("Devices fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // Apply search + filters
    const filtered = devices.filter((d) => {
        const q = search.toLowerCase();
        const matchesSearch =
            d.name?.toLowerCase().includes(q) ||
            d.brand?.toLowerCase().includes(q) ||
            d.model?.toLowerCase().includes(q) ||
            d.serial_number?.toLowerCase().includes(q) ||
            d.assignee?.full_name?.toLowerCase().includes(q);

        const matchesStatus =
            filterStatus === "all" || d.status === filterStatus;
        const matchesType = filterType === "all" || d.type === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    const openAdd = () => {
        setEditingDevice(null);
        setShowForm(true);
    };
    const openEdit = (d) => {
        setEditingDevice(d);
        setShowForm(true);
    };
    const closeForm = () => {
        setShowForm(false);
        setEditingDevice(null);
    };

    const onSaved = () => {
        closeForm();
        fetchDevices();
    };
    const onDeleted = () => {
        setDeletingDevice(null);
        fetchDevices();
    };
    const onAssigned = () => {
        setAssigningDevice(null);
        fetchDevices();
    };
    const onReturned = () => {
        setReturningDevice(null);
        fetchDevices();
    };

    return (
        <div>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Devices
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {devices.length} device{devices.length !== 1 ? "s" : ""}{" "}
                        in inventory
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                     px-5 py-2.5 rounded-xl text-sm font-semibold transition
                     shadow-sm shadow-blue-200 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Add Device
                </button>
            </div>

            {/* ── Filters bar ── */}
            <div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5
                      flex flex-col sm:flex-row gap-3"
            >
                {/* Search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, brand, serial number, or assignee..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-gray-50 focus:bg-white transition"
                    />
                </div>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                >
                    <option value="all">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="under_repair">Under Repair</option>
                    <option value="retired">Retired</option>
                </select>

                {/* Type filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                >
                    <option value="all">All Types</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Printer">Printer</option>
                    <option value="Scanner">Scanner</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* ── Devices table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Cpu className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No devices found</p>
                        <p className="text-sm mt-1">
                            {search ||
                            filterStatus !== "all" ||
                            filterType !== "all"
                                ? "Try adjusting your search or filters"
                                : 'Click "Add Device" to add your first device'}
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
                                        Type
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Serial No.
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((device) => (
                                    <tr
                                        key={device.id}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        {/* Device name + brand/model */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {device.name}
                                            </p>
                                            {(device.brand || device.model) && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {[
                                                        device.brand,
                                                        device.model,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            )}
                                        </td>

                                        {/* Type with icon */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <DeviceIcon
                                                    type={device.type}
                                                />
                                                <span>{device.type}</span>
                                            </div>
                                        </td>

                                        {/* Serial number */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                {device.serial_number || "—"}
                                            </span>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={device.status}
                                            />
                                        </td>

                                        {/* Assigned to */}
                                        <td className="px-6 py-4">
                                            {device.assignee ? (
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            device.assignee
                                                                .full_name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {
                                                            device.assignee
                                                                .department
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">
                                                    Not assigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Value */}
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {device.purchase_price ? (
                                                `₦${Number(device.purchase_price).toLocaleString()}`
                                            ) : (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Action buttons */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Assign — only for available devices */}
                                                {device.status ===
                                                    "available" && (
                                                    <button
                                                        onClick={() =>
                                                            setAssigningDevice(
                                                                device,
                                                            )
                                                        }
                                                        title="Assign to Staff"
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Return — only for assigned devices */}
                                                {device.status ===
                                                    "assigned" && (
                                                    <button
                                                        onClick={() =>
                                                            setReturningDevice(
                                                                device,
                                                            )
                                                        }
                                                        title="Return Device"
                                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Edit */}
                                                <button
                                                    onClick={() =>
                                                        openEdit(device)
                                                    }
                                                    title="Edit Device"
                                                    className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() =>
                                                        setDeletingDevice(
                                                            device,
                                                        )
                                                    }
                                                    title="Delete Device"
                                                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modals (rendered here, shown conditionally) ── */}
            {showForm && (
                <DeviceFormModal
                    device={editingDevice}
                    onClose={closeForm}
                    onSaved={onSaved}
                />
            )}
            {deletingDevice && (
                <DeleteModal
                    device={deletingDevice}
                    onClose={() => setDeletingDevice(null)}
                    onDeleted={onDeleted}
                />
            )}
            {assigningDevice && (
                <AssignModal
                    device={assigningDevice}
                    onClose={() => setAssigningDevice(null)}
                    onAssigned={onAssigned}
                />
            )}
            {returningDevice && (
                <ReturnModal
                    device={returningDevice}
                    onClose={() => setReturningDevice(null)}
                    onReturned={onReturned}
                />
            )}
        </div>
    );
}
