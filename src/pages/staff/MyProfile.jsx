import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { User, Mail, Building2, Shield, Calendar } from "lucide-react";

export default function MyProfile() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fullProfile, setFullProfile] = useState(null);

    useEffect(() => {
        if (profile?.id) return;

        const fetchProfile = async () => {
            try {
                const [data, error] = await supabase
                    .from("profiles")
                    .select("*, department:departments(name)")
                    .eq("id", profile.id)
                    .single(); // why do we use .single? because we expect only one profile to match the id, and it gives us the profile object directly instead of an array
                if (error) throw error;
                setFullProfile(data);
            } catch (err) {
                console.error(`Could not fetch profile ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profile]);

    // format date
    const fmtDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en=GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "-";
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return (
        <div>
            <p></p>
        </div>
    );
}
