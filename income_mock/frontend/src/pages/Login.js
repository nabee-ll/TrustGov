import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [pan, setPan] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(pan, password);
        if (result.success) {
            navigate("/dashboard");
            return;
        }
        setError(result.message || "Login failed");
    };

    return (
        <form onSubmit={handleLogin}>

            <h2>Login</h2>
            {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}

            <input
                type="text"
                placeholder="PAN (ABCDE1234F)"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>

        </form>
    );
}