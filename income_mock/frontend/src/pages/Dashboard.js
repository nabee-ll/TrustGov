import React, { useEffect, useState } from "react";

export default function Dashboard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        fetch("http://localhost:5000/api/dashboard/summary")
            .then(res => res.json())
            .then(data => setStats(data));

    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div>

            <h2>Tax Dashboard</h2>

            <p>Total Returns Filed: {stats.totalReturns}</p>

            <p>Total Income Reported: ₹{stats.totalIncome}</p>

            <p>Total Tax Calculated: ₹{stats.totalTax}</p>

        </div>
    );
}