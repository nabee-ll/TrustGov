import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FileReturn from "./pages/FileReturn";
import { MyReturns, TaxCalculator, RefundStatus } from "./pages/OtherPages";
import Profile from "./pages/Profile";

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "80px", color: "#6b7593" }}>
                Loading...
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="page-wrap">

                    <Header />

                    <div className="main-content" style={{ padding: 0 }}>
                        <Routes>

                            <Route path="/" element={<Home />} />

                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />

                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/file-return"
                                element={
                                    <PrivateRoute>
                                        <FileReturn />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/my-returns"
                                element={
                                    <PrivateRoute>
                                        <MyReturns />
                                    </PrivateRoute>
                                }
                            />

                            <Route path="/calculator" element={<TaxCalculator />} />

                            <Route path="/refund" element={<RefundStatus />} />

                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <Profile />
                                    </PrivateRoute>
                                }
                            />

                            <Route path="*" element={<Navigate to="/" replace />} />

                        </Routes>
                    </div>

                    <Footer />

                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}