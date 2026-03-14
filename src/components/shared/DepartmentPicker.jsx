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

    // useRef lets us detect clicks outside the dropdown
    // so we can close it when admin clicks elsewhere
    const dropdownRef = useRef();

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Department
            </label>
			<p>DepartmentPicker Coming Soon</p>
        </div>
    );
}
