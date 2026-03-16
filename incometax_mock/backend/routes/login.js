import React, { useState } from "react";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await axios.post("http://localhost:5000/api/login", {
            email,
            password
        });

        alert(res.data.message);
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
        </form>
    );
}

export default Login;