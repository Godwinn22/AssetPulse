import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { ChevronDown, Plus, Check, Loader2 } from "lucide-react";

export default function DepartmentPicker({ value, onChange }) {
    // Full list of departments for dropdown
    const [departments, setDepartments] = useState([]);
    // what the admin is typing in the search box
    const [search, setSearch] = useState("");
    // is the dropdown open?
    const [isOpen, setIsOpen] = useState(false);
    // is the component still loading departments from the server?
    const [loading, setLoading] = useState(true);
    // are we saving a new department to the server?
    const [creating, setCreating] = useState(false);

    // Fetch departments from Supabase on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { data, error } = await supabase
                    .from("departments")
                    .select("id, name")
                    .order("name");

                if (error) throw error;
                setDepartments(data || []);
            } catch (err) {
                console.error("Error fetching departments:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    // useRef lets us detect clicks outside the dropdown
    // so we can close it when admin clicks elsewhere
    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            // containerRef.current is our outer div
            // .contains(e.target) checks if the clicked element
            // is inside our div or not

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                // set search back to empty when closing dropdown
                // so that next time admin opens it, they see the full list
                setSearch("");
            }
        };
        // Listen for clicks on the entire document
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup: remove listener when component unmounts
        // WHY: Without this, the listener keeps running even
        // after the modal closes — causes memory leaks
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredDepartment = departments.filter((dept) =>
        dept.name.toLowerCase().includes(search.toLowerCase()),
    );

    const showCreateOption =
        search.trim() !== "" &&
        !departments.some(
            (dept) => dept.name.toLowerCase() === search.toLowerCase(),
        );

    const handleCreate = async () => {
        // trim() removes accidental spaces
        const name = search.trim();
        if (!name) return;

        setCreating(true);
        try {
            // Save new department to database
            const { data, error } = await supabase
                .from("departments")
                .insert({ name })
                .select()
                .single();

            if (error) throw error;

            // Add to local list without refetching
            // WHY: Faster than making another DB call
            setDepartments((prev) =>
                [...prev, data].sort((a, b) => a.name.localeCompare(b.name)),
            );

            // Auto select the newly created department
            onChange(data.id);

            // Close dropdown and clear search
            setIsOpen(false);
            setSearch("");
        } catch (err) {
            console.error("Could not create department:", err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Department
            </label>

            {/* ── Trigger button — shows selected department or placeholder ── */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setSearch("");
                }}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                 text-left flex items-center justify-between
                 bg-gray-50 hover:bg-white focus:outline-none
                 focus:ring-2 focus:ring-blue-500 transition"
            >
                {/* Show selected department name or placeholder */}
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                    {value
                        ? (departments.find((d) => d.id === value)?.name ??
                          "Select department")
                        : "Select or create department"}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform
        ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* ── Dropdown panel ── */}
            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200
                      rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Search input inside dropdown */}
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search or create department..."
                            autoFocus
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       bg-gray-50 focus:bg-white transition"
                        />
                    </div>

                    {/* Department list */}
                    <div className="max-h-48 overflow-y-auto">
                        {loading ? (
                            // Loading state
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                        ) : filteredDepartment.length === 0 &&
                          !showCreateOption ? (
                            // No results and can't create
                            <p className="text-center text-gray-400 text-sm py-4">
                                No departments found
                            </p>
                        ) : (
                            <>
                                {/* Filtered department options */}
                                {filteredDepartment.map((dept) => (
                                    <button
                                        key={dept.id}
                                        type="button"
                                        onClick={() => {
                                            // Tell parent which department was selected
                                            onChange(dept.id);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50
                             hover:text-blue-700 transition flex items-center
                             justify-between"
                                    >
                                        {dept.name}
                                        {/* Show checkmark next to currently selected department */}
                                        {value === dept.id && (
                                            <Check className="w-4 h-4 text-blue-600" />
                                        )}
                                    </button>
                                ))}

                                {/* Create new department option */}
                                {showCreateOption && (
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={creating}
                                        className="w-full text-left px-4 py-2.5 text-sm text-blue-600
                             hover:bg-blue-50 transition flex items-center gap-2
                             border-t border-gray-100"
                                    >
                                        {creating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        {creating
                                            ? "Creating..."
                                            : `Create "${search.trim()}"`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
