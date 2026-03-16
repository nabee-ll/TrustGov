import React, { useState } from "react";

export default function FileReturn() {

    const [income, setIncome] = useState("");
    const [taxPaid, setTaxPaid] = useState("");

    const submitReturn = async () => {

        const res = await fetch("http://localhost:5000/api/returns/file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                income,
                taxPaid
            })
        });

        const data = await res.json();

        alert(data.message);
    };

    return (
        <div>

            <h2>File Tax Return</h2>

            <input
                placeholder="Annual Income"
                onChange={(e) => setIncome(e.target.value)}
            />

            <input
                placeholder="Tax Paid"
                onChange={(e) => setTaxPaid(e.target.value)}
            />

            <button onClick={submitReturn}>
                Submit Return
            </button>

        </div>
    );
}