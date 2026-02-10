"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc" }}>
                <div style={{
                    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem",
                }}>
                    <div style={{
                        background: "#fff", borderRadius: "1.5rem", padding: "2.5rem",
                        maxWidth: "28rem", width: "100%", textAlign: "center",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0",
                    }}>
                        <div style={{
                            width: "4rem", height: "4rem", background: "#fef3c7", borderRadius: "1rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 1.5rem", fontSize: "2rem",
                        }}>
                            ⚠️
                        </div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" }}>
                            เกิดข้อผิดพลาดร้ายแรง
                        </h2>
                        <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                            ระบบไม่สามารถโหลดได้ กรุณาลองใหม่
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.75rem",
                                padding: "0.75rem 1.5rem", fontSize: "0.875rem", fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            🔄 ลองใหม่
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
