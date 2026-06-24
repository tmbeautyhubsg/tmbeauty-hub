import { useState, useEffect } from "react"
import logo from "./logo.png"

export default function SetPassword() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) setError("Invalid link. Please request a new one.")
    else setToken(t)
  }, [])

  async function handleSubmit() {
    setError("")
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setStatus("loading")
    try {
      const res = await fetch("https://tmbeauty-hub-production.up.railway.app/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); setStatus("idle"); return }
      setStatus("success")
    } catch (e) {
      setError("Unable to connect to server")
      setStatus("idle")
    }
  }

  const labelStyle = {
    fontSize: "10px", color: "#A87C2A",
    display: "block", marginBottom: "10px",
    fontFamily: "'Playfair Display', serif",
    letterSpacing: "4px", textTransform: "uppercase", fontWeight: "700"
  }

  const inputStyle = {
    width: "100%", padding: "12px 4px",
    border: "none", borderBottom: "1.5px solid #D4B86A",
    fontSize: "16px", color: "#1A1A1A",
    background: "transparent", boxSizing: "border-box",
    outline: "none", fontFamily: "'Playfair Display', serif"
  }

  return (
    <div style={{ height: "100vh", background: "#F7F0E3", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px", textAlign: "center" }}>

        {/* Logo */}
        <img src={logo} alt="TM Beauty Hub" style={{ width: "90px", height: "90px", objectFit: "contain", margin: "0 auto 14px", display: "block", filter: "drop-shadow(0 4px 12px rgba(168,124,42,0.25))" }}/>

        {/* Ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ height: "1px", width: "40px", background: "linear-gradient(to right, transparent, #A87C2A)" }}/>
          <div style={{ width: "4px", height: "4px", background: "#A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ height: "1px", width: "40px", background: "linear-gradient(to left, transparent, #A87C2A)" }}/>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#1A1A1A", fontWeight: "700", letterSpacing: "4px", margin: "0 0 6px" }}>TM BEAUTY HUB</h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: "#A87C2A", margin: "0 0 24px", fontStyle: "italic", letterSpacing: "2px" }}>
          {status === "success" ? "Password Set Successfully" : "Set Your Password"}
        </p>

        {/* Card */}
        <div style={{ background: "linear-gradient(160deg, #FFFDF7 0%, #FDF6E3 100%)", border: "1px solid #D4B86A", borderTop: "3px solid #A87C2A", padding: "40px 40px 36px", position: "relative", boxShadow: "0 32px 80px rgba(168,124,42,0.18)" }}>

          {/* Corner accents */}
          <div style={{ position: "absolute", top: "12px", left: "12px", width: "14px", height: "14px", borderTop: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "14px", height: "14px", borderTop: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "14px", height: "14px", borderBottom: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "14px", height: "14px", borderBottom: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#1A1A1A", margin: "0 0 8px" }}>Your password has been set.</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#666", margin: "0 0 28px", lineHeight: "1.6" }}>You can now sign in to your account.</p>
              <button onClick={() => window.location.href = "/"} style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #C9A84C 0%, #A87C2A 50%, #C9A84C 100%)", color: "#FFFFFF", border: "none", fontFamily: "'Playfair Display', serif", fontSize: "11px", fontWeight: "700", letterSpacing: "5px", textTransform: "uppercase", cursor: "pointer" }}>
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 14px", marginBottom: "20px", fontFamily: "'Playfair Display', serif", fontSize: "14px", textAlign: "left" }}>
                  {error}
                </div>
              )}

              {/* New Password */}
              <div style={{ marginBottom: "24px", textAlign: "left" }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 1 }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A87C2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A87C2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: "32px", textAlign: "left" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={inputStyle}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                style={{ width: "100%", padding: "15px", background: status === "loading" ? "#C9A84C" : "linear-gradient(135deg, #C9A84C 0%, #A87C2A 50%, #C9A84C 100%)", color: "#FFFFFF", border: "none", fontFamily: "'Playfair Display', serif", fontSize: "11px", fontWeight: "700", letterSpacing: "5px", textTransform: "uppercase", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.8 : 1 }}
              >
                {status === "loading" ? "Setting Password..." : "Set Password"}
              </button>
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