import { useState } from "react"
import logo from "./logo.png"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

  async function handleSubmit() {
    setError("")
    if (!email) { setError("Please enter your email address"); return }
    setStatus("loading")
    try {
      await fetch("https://tmbeauty-hub-production.up.railway.app/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      setStatus("sent")
    } catch (e) {
      setError("Unable to connect to server")
      setStatus("idle")
    }
  }

  return (
    <div style={{
      height: "100vh", background: "#F7F0E3",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", boxSizing: "border-box"
    }}>
      <div style={{ width: "100%", maxWidth: "440px", textAlign: "center" }}>

        {/* Logo */}
        <img src={logo} alt="TM Beauty Hub" style={{
          width: "90px", height: "90px", objectFit: "contain",
          margin: "0 auto 14px", display: "block",
          filter: "drop-shadow(0 4px 12px rgba(168,124,42,0.25))"
        }}/>

        {/* Ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ height: "1px", width: "40px", background: "linear-gradient(to right, transparent, #A87C2A)" }}/>
          <div style={{ width: "4px", height: "4px", background: "#A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ height: "1px", width: "40px", background: "linear-gradient(to left, transparent, #A87C2A)" }}/>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#1A1A1A", fontWeight: "700", letterSpacing: "4px", margin: "0 0 6px" }}>
          TM BEAUTY HUB
        </h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: "#A87C2A", margin: "0 0 24px", fontStyle: "italic", letterSpacing: "2px" }}>
          Reset Your Password
        </p>

        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, #FFFDF7 0%, #FDF6E3 100%)",
          border: "1px solid #D4B86A", borderTop: "3px solid #A87C2A",
          padding: "40px 40px 36px", position: "relative",
          boxShadow: "0 32px 80px rgba(168,124,42,0.18)"
        }}>

          {/* Corner accents */}
          <div style={{ position: "absolute", top: "12px", left: "12px", width: "14px", height: "14px", borderTop: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "14px", height: "14px", borderTop: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "14px", height: "14px", borderBottom: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "14px", height: "14px", borderBottom: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>

          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#1A1A1A", margin: "0 0 8px" }}>
                Check your email.
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#666", margin: "0 0 28px", lineHeight: "1.6" }}>
                If an account exists for that email, we have sent a password reset link. Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  width: "100%", padding: "15px",
                  background: "linear-gradient(135deg, #C9A84C 0%, #A87C2A 50%, #C9A84C 100%)",
                  color: "#FFFFFF", border: "none",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "11px", fontWeight: "700",
                  letterSpacing: "5px", textTransform: "uppercase",
                  cursor: "pointer"
                }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 14px", marginBottom: "20px", fontFamily: "'Playfair Display', serif", fontSize: "14px", textAlign: "left" }}>
                  {error}
                </div>
              )}

              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#333", margin: "0 0 24px", lineHeight: "1.7", textAlign: "left" }}>
                Enter your email address and we will send you a link to reset your password.
              </p>

              <div style={{ marginBottom: "32px", textAlign: "left" }}>
                <label style={{ fontSize: "10px", color: "#A87C2A", display: "block", marginBottom: "10px", fontFamily: "'Playfair Display', serif", letterSpacing: "4px", textTransform: "uppercase", fontWeight: "700" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%", padding: "12px 4px",
                    border: "none", borderBottom: "1.5px solid #D4B86A",
                    fontSize: "16px", color: "#1A1A1A",
                    background: "transparent", boxSizing: "border-box",
                    outline: "none", fontFamily: "'Playfair Display', serif"
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: "15px",
                  background: status === "loading" ? "#C9A84C" : "linear-gradient(135deg, #C9A84C 0%, #A87C2A 50%, #C9A84C 100%)",
                  color: "#FFFFFF", border: "none",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "11px", fontWeight: "700",
                  letterSpacing: "5px", textTransform: "uppercase",
                  cursor: status === "loading" ? "not-allowed" : "pointer"
                }}
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <span
                  onClick={() => window.location.href = "/"}
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", color: "#A87C2A", cursor: "pointer", fontStyle: "italic" }}
                >
                  Back to Sign In
                </span>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: "10px", color: "#B8A070", margin: "20px 0 0", fontFamily: "'Playfair Display', serif", letterSpacing: "2px", textTransform: "uppercase" }}>
          © 2026 TM Beauty Hub
        </p>

      </div>
    </div>
  )
}