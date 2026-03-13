import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../lib/supabase";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error("Could not load profile:", err.message);
            setProfile(null);
            // We do NOT clear the user here — a failed profile fetch
            // doesn't mean they're logged out, just that the DB was slow
            // AppRoutes will show "Profile Not Found" which has a retry button
        }
    };

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "INITIAL_SESSION") {
                try {
                    // INITIAL_SESSION sometimes passes null session even when one exists
                    // so we double-check with getSession() as a fallback
                    let activeSession = session;
                    if (!activeSession) {
                        const { data } = await supabase.auth.getSession();
                        activeSession = data.session;
                    }
                    if (activeSession?.user) {
                        setUser(activeSession.user);
                        await fetchProfile(activeSession.user.id);
                    }
                } finally {
                    setLoading(false); // always runs no matter what
                }
                return;
            }

            if (event === "SIGNED_IN") {
                setLoading(true);
                setUser(session.user);
                await fetchProfile(session.user.id);
                setLoading(false);
                return;
            }

            if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            // TOKEN_REFRESHED, USER_UPDATED → silently ignored
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
