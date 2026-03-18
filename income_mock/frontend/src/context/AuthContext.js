import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("income_user");
        return raw ? JSON.parse(raw) : null;
    });
    const [loading, setLoading] = useState(false);

    const setAuthState = (token, safeUser) => {
        localStorage.setItem("income_token", token);
        localStorage.setItem("income_user", JSON.stringify(safeUser));
        setUser(safeUser);
    };

    const login = async (arg1, arg2) => {
        // Supports both login(pan, password) and login(token, user) used by register page.
        if (typeof arg2 === "object" && arg2 !== null) {
            setAuthState(arg1, arg2);
            return { success: true };
        }

        setLoading(true);
        try {
            const pan = String(arg1 || "").toUpperCase().trim();
            const password = String(arg2 || "");
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pan, password })
            });

            const data = await res.json();
            if (!res.ok) {
                return { success: false, message: data.error || "Login failed" };
            }

            setAuthState(data.token, data.user);
            return { success: true };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("income_token");
        localStorage.removeItem("income_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}