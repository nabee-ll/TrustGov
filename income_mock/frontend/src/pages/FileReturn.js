import React, { useState } from "react";

export default function FileReturn() {
    const [assessmentYear, setAssessmentYear] = useState("AY 2024-25");
    const [income, setIncome] = useState("");
    const [taxPaid, setTaxPaid] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [receipt, setReceipt] = useState(null);
    const [chainLoading, setChainLoading] = useState(false);
    const [chainError, setChainError] = useState("");
    const [chainData, setChainData] = useState(null);

    const submitReturn = async () => {
        setLoading(true);
        setMessage("");
        setReceipt(null);

        try {
            const token = localStorage.getItem("income_token");
            if (!token) {
                setMessage("Please login first before filing return.");
                return;
            }

            const gross = Number(income) || 0;
            const tds = Number(taxPaid) || 0;

            const res = await fetch("/api/tax/file-return", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    assessment_year: assessmentYear,
                    itr_form: "ITR-1",
                    regime: "new",
                    age: "below60",
                    tds_deducted: tds,
                    income_details: {
                        salary: gross,
                        house_property: 0,
                        capital_gains: 0,
                        other_sources: 0,
                        business_income: 0
                    },
                    deduction_details: {}
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage(data.error || "Unable to file return.");
                return;
            }

            setMessage(data.message || "Return filed successfully");
            setReceipt({
                ackNumber: data.ack_number,
                blockchain: data.blockchain_proof
            });
        } catch {
            setMessage("Network error while filing return.");
        } finally {
            setLoading(false);
        }
    };

    const loadBlockchainAudit = async () => {
        setChainLoading(true);
        setChainError("");
        setChainData(null);

        try {
            const token = localStorage.getItem("income_token");
            if (!token) {
                setChainError("Please login first to view blockchain audit.");
                return;
            }

            const res = await fetch("/api/tax/blockchain", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) {
                setChainError(data.error || "Unable to fetch blockchain audit.");
                return;
            }
            setChainData(data);
        } catch {
            setChainError("Network error while loading blockchain audit.");
        } finally {
            setChainLoading(false);
        }
    };

    return (
        <div>

            <h2>File Tax Return</h2>

            {message && <p>{message}</p>}

            <input
                placeholder="Assessment Year (e.g. AY 2024-25)"
                value={assessmentYear}
                onChange={(e) => setAssessmentYear(e.target.value)}
            />

            <input
                placeholder="Annual Income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
            />

            <input
                placeholder="Tax Paid"
                value={taxPaid}
                onChange={(e) => setTaxPaid(e.target.value)}
            />

            <button onClick={submitReturn} disabled={loading}>
                {loading ? "Submitting..." : "Submit Return"}
            </button>

            {receipt && (
                <div style={{ marginTop: 16, padding: 12, border: "1px solid #d1d5db", borderRadius: 8 }}>
                    <h4>Filing Receipt</h4>
                    <p><strong>ACK:</strong> {receipt.ackNumber}</p>
                    {receipt.blockchain && (
                        <>
                            <p><strong>Blockchain Block #:</strong> {receipt.blockchain.block_index}</p>
                            <p><strong>Transaction Hash:</strong> {receipt.blockchain.tx_hash}</p>
                            <p><strong>Previous Hash:</strong> {receipt.blockchain.previous_hash}</p>
                            <p><strong>Tamper Proof:</strong> {receipt.blockchain.tamper_proof ? "Yes" : "No"}</p>
                        </>
                    )}
                </div>
            )}

            <div style={{ marginTop: 16, padding: 12, border: "1px solid #d1d5db", borderRadius: 8 }}>
                <h4>Blockchain Audit Verification</h4>
                <button onClick={loadBlockchainAudit} disabled={chainLoading}>
                    {chainLoading ? "Loading..." : "View Blockchain Audit"}
                </button>

                {chainError && <p style={{ color: "#b91c1c", marginTop: 10 }}>{chainError}</p>}

                {chainData && (
                    <div style={{ marginTop: 10 }}>
                        <p><strong>Integrity Status:</strong> {chainData.integrity_ok ? "Chain Verified (Tamper Proof)" : "Integrity Check Failed"}</p>
                        <p><strong>Total Blocks:</strong> {Array.isArray(chainData.blocks) ? chainData.blocks.length : 0}</p>

                        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 6, padding: 8 }}>
                            {(chainData.blocks || []).slice().reverse().slice(0, 5).map((block) => (
                                <div key={block.hash} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px dashed #d1d5db" }}>
                                    <p><strong>Block #{block.index}</strong></p>
                                    <p><strong>Timestamp:</strong> {block.timestamp}</p>
                                    <p><strong>Hash:</strong> <span style={{ fontFamily: "monospace", fontSize: 12 }}>{block.hash}</span></p>
                                    <p><strong>Prev Hash:</strong> <span style={{ fontFamily: "monospace", fontSize: 12 }}>{block.previousHash}</span></p>
                                    <p><strong>Event:</strong> {block.payload?.type}</p>
                                    <p><strong>ACK:</strong> {block.payload?.ackNumber}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}