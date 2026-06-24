import { useState } from "react"
import logo from "./logo.png"
import Dashboard from "./Dashboard"
import SetPassword from "./SetPassword"
import ForgotPassword from "./ForgotPassword"

export default function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
  })

  // Route: Set Password
  if (window.location.pathname === "/set-password") return <SetPassword />

  // Route: Forgot Password
  if (window.location.pathname === "/forgot-password") return <ForgotPassword />

  // Route: Dashboard
  if (currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={() => {
          localStorage.clear()
          setCurrentUser(null)
        }}
      />
    )
  }

  async function handleLogin() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("https://tmbeauty-hub-production.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setCurrentUser(data.user)
    } catch (err) {
      setError("Unable to connect to server")
    }
    setLoading(false)
  }

  // Route: Login
  return (
    <div style={{
      height: "100vh", background: "#F7F0E3",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", boxSizing: "border-box", overflow: "hidden"
    }}>
      <div style={{ width: "100%", maxWidth: "460px", textAlign: "center" }}>

        {/* Logo */}
        <img src={logo} alt="TM Beauty Hub" style={{
          width: "110px", height: "110px", objectFit: "contain",
          margin: "0 auto 10px", display: "block",
          filter: "drop-shadow(0 4px 12px rgba(168,124,42,0.25))"
        }}/>

        {/* Ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ height: "1px", width: "50px", background: "linear-gradient(to right, transparent, #A87C2A)" }}/>
          <div style={{ width: "5px", height: "5px", border: "1px solid #A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ width: "3px", height: "3px", background: "#A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ width: "5px", height: "5px", border: "1px solid #A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ height: "1px", width: "50px", background: "linear-gradient(to left, transparent, #A87C2A)" }}/>
        </div>

        {/* Title */}
        <p style={{ fontSize: "10px", color: "#A87C2A", letterSpacing: "6px", margin: "0 0 8px", fontFamily: "'Playfair Display', serif", textTransform: "uppercase" }}>
          Welcome to
        </p>
        <h1 style={{ fontSize: "30px", color: "#1A1A1A", margin: "0 0 6px", fontFamily: "'Playfair Display', serif", fontWeight: "700", letterSpacing: "5px", lineHeight: "1.2" }}>
          TM BEAUTY HUB
        </h1>
        <p style={{ fontSize: "11px", color: "#A87C2A", margin: "0 0 18px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", letterSpacing: "3px" }}>
          Members Portal
        </p>

        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, #FFFDF7 0%, #FDF6E3 100%)",
          border: "1px solid #D4B86A", borderTop: "3px solid #A87C2A",
          padding: "40px 44px 36px", position: "relative",
          boxShadow: "0 32px 80px rgba(168,124,42,0.18), 0 8px 24px rgba(0,0,0,0.10)"
        }}>

          {/* Corner accents */}
          <div style={{ position: "absolute", top: "12px", left: "12px", width: "16px", height: "16px", borderTop: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "16px", height: "16px", borderTop: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "16px", height: "16px", borderBottom: "1px solid #D4B86A", borderLeft: "1px solid #D4B86A" }}/>
          <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "16px", height: "16px", borderBottom: "1px solid #D4B86A", borderRight: "1px solid #D4B86A" }}/>

          {/* Error */}
          {error && (
            <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "10px 14px", marginBottom: "20px", fontSize: "14px", fontFamily: "'Playfair Display', serif", textAlign: "left" }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "28px", textAlign: "left" }}>
            <label style={{ fontSize: "10px", color: "#A87C2A", display: "block", marginBottom: "10px", fontFamily: "'Playfair Display', serif", letterSpacing: "4px", textTransform: "uppercase", fontWeight: "700" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: "100%", padding: "10px 4px", border: "none", borderBottom: "1.5px solid #D4B86A", fontSize: "15px", color: "#1A1A1A", background: "transparent", boxSizing: "border-box", outline: "none", fontFamily: "'Playfair Display', serif" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "10px", textAlign: "left" }}>
            <label style={{ fontSize: "10px", color: "#A87C2A", display: "block", marginBottom: "10px", fontFamily: "'Playfair Display', serif", letterSpacing: "4px", textTransform: "uppercase", fontWeight: "700" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 36px 10px 4px", border: "none", borderBottom: "1.5px solid #D4B86A", fontSize: "15px", color: "#1A1A1A", background: "transparent", boxSizing: "border-box", outline: "none", fontFamily: "'Playfair Display', serif" }}
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

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginBottom: "32px" }}>
            <span
              onClick={() => window.location.href = "/forgot-password"}
              style={{ fontSize: "11px", color: "#A87C2A", fontFamily: "'Playfair Display', serif", fontStyle: "italic", cursor: "pointer" }}
            >
              Forgot your password?
            </span>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "16px",
              background: loading ? "#C9A84C" : "linear-gradient(135deg, #C9A84C 0%, #A87C2A 50%, #C9A84C 100%)",
              color: "#FFFFFF", border: "none",
              fontSize: "11px", fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "5px", fontFamily: "'Playfair Display', serif",
              textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(168,124,42,0.40)",
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </div>

        {/* Bottom ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "18px 0 10px" }}>
          <div style={{ height: "1px", width: "36px", background: "linear-gradient(to right, transparent, #A87C2A)" }}/>
          <div style={{ width: "3px", height: "3px", background: "#A87C2A", transform: "rotate(45deg)" }}/>
          <div style={{ height: "1px", width: "36px", background: "linear-gradient(to left, transparent, #A87C2A)" }}/>
        </div>

        <p style={{ fontSize: "10px", color: "#B8A070", margin: 0, fontFamily: "'Playfair Display', serif", letterSpacing: "2px", textTransform: "uppercase" }}>
          © 2026 TM Beauty Hub
        </p>

      </div>
    </div>
  )
}