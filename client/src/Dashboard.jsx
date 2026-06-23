import { useState, useEffect } from "react"
import logo from "./logo.png"

const GOLD = "#A87C2A"
const GOLD_LIGHT = "#D4B86A"
const CREAM = "#F7F0E3"
const WHITE = "#FFFFFF"
const BLACK = "#1A1A1A"

function StatCard({ label, value }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, padding: "24px 28px", position: "relative" }}>
      <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "12px", height: "12px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 14px" }}>{label}</p>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", color: BLACK, fontWeight: "700", margin: 0 }}>{value}</p>
    </div>
  )
}

function Ornament() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "16px 0" }}>
      <div style={{ height: "1px", width: "36px", background: `linear-gradient(to right, transparent, ${GOLD})` }}/>
      <div style={{ width: "4px", height: "4px", background: GOLD, transform: "rotate(45deg)" }}/>
      <div style={{ height: "1px", width: "36px", background: `linear-gradient(to left, transparent, ${GOLD})` }}/>
    </div>
  )
}

function NavItem({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  const on = active || hovered
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "15px 24px",
        cursor: "pointer",
        color: on ? GOLD : BLACK,
        fontFamily: "'Playfair Display', serif",
        fontSize: "16px",
        borderLeft: `4px solid ${on ? GOLD : "transparent"}`,
        background: on ? "#FDF6E3" : "transparent",
        fontWeight: on ? "700" : "400",
        transition: "all 0.15s"
      }}
    >{label}</div>
  )
}

function PageHeader({ sub, title }) {
  return (
    <div style={{ marginBottom: "36px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>{sub}</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "34px", color: BLACK, fontWeight: "700", margin: 0 }}>{title}</h1>
    </div>
  )
}

function ComingSoon({ label }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, padding: "52px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: "12px", left: "12px", width: "16px", height: "16px", borderTop: `1px solid ${GOLD_LIGHT}`, borderLeft: `1px solid ${GOLD_LIGHT}` }}/>
      <div style={{ position: "absolute", top: "12px", right: "12px", width: "16px", height: "16px", borderTop: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
      <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "16px", height: "16px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderLeft: `1px solid ${GOLD_LIGHT}` }}/>
      <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "16px", height: "16px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
      <Ornament />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: BLACK, margin: 0 }}>{label} module coming soon</p>
    </div>
  )
}

function DashboardHome({ user }) {
  return (
    <div>
      <PageHeader sub="Welcome back" title={user.name} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        <StatCard label="Total Members" value="—" />
        <StatCard label="Active Packages" value="—" />
        <StatCard label="Commission This Month" value="—" />
        <StatCard label="Inventory Items" value="—" />
      </div>
      <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, padding: "52px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "12px", left: "12px", width: "16px", height: "16px", borderTop: `1px solid ${GOLD_LIGHT}`, borderLeft: `1px solid ${GOLD_LIGHT}` }}/>
        <div style={{ position: "absolute", top: "12px", right: "12px", width: "16px", height: "16px", borderTop: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
        <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "16px", height: "16px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderLeft: `1px solid ${GOLD_LIGHT}` }}/>
        <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "16px", height: "16px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
        <Ornament />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: BLACK, margin: 0 }}>Select a module from the sidebar to get started</p>
      </div>
    </div>
  )
}

function AccountSwitcher({ currentUser }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(null)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "manager" })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetch("https://tmbeauty-hub-production.up.railway.app/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(data => { setAccounts(data.users || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function switchTo(user) {
    setSwitching(user.id)
    try {
      const res = await fetch(`https://tmbeauty-hub-production.up.railway.app/api/admin/impersonate/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem("impersonate_token", localStorage.getItem("token"))
        localStorage.setItem("impersonate_user", localStorage.getItem("user"))
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.location.reload()
      }
    } catch (e) {}
    setSwitching(null)
  }

  async function createAccount() {
    setCreating(true)
    if (!form.name.trim()) { setCreateError("Full name is required"); setCreating(false); return }
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setCreateError("Please enter a valid email address"); setCreating(false); return }
if (form.password && form.password.length < 8) { setCreateError("Password must be at least 8 characters"); setCreating(false); return }
    setCreateError("")
    try {
      const res = await fetch("https://tmbeauty-hub-production.up.railway.app/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error || "Failed to create account"); setCreating(false); return }
      setAccounts(prev => [...prev, data.user])
      setForm({ name: "", email: "", password: "", role: "manager" })
      setShowCreate(false)
    } catch (e) {
      setCreateError("Unable to connect to server")
    }
    setCreating(false)
  }

  const roleLabel = r => r.replace(/_/g, " ").toUpperCase()

  const roleColour = r => {
    if (r === "superadmin") return { bg: "#FDF6E3", color: "#7A5C10" }
    if (r === "branch_office") return { bg: "#EEF4FB", color: "#1A3A5C" }
    if (r === "ceo") return { bg: "#EEF8EE", color: "#1A5C1A" }
    if (r === "director") return { bg: "#F8EEF6", color: "#5C1A4A" }
    return { bg: "#F5F5F5", color: "#333" }
  }

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    border: `1px solid ${GOLD_LIGHT}`,
    borderBottom: `2px solid ${GOLD}`,
    background: "#FDFAF2",
    fontFamily: "'Playfair Display', serif",
    fontSize: "15px", color: BLACK,
    outline: "none", boxSizing: "border-box"
  }

  const labelStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "11px", color: GOLD,
    display: "block", marginBottom: "8px",
    letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700"
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "34px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>Account Switcher</h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#666", margin: 0 }}>{accounts.length} accounts registered</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setCreateError("") }}
          style={{
            padding: "13px 28px",
            background: showCreate ? "#888" : `linear-gradient(135deg, #C9A84C 0%, ${GOLD} 100%)`,
            color: WHITE, border: "none",
            fontFamily: "'Playfair Display', serif",
            fontSize: "12px", fontWeight: "700",
            letterSpacing: "3px", textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(168,124,42,0.25)"
          }}
        >{showCreate ? "Cancel" : "+ Add Account"}</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, padding: "32px 36px", marginBottom: "28px", position: "relative" }}>
          <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "12px", height: "12px", borderBottom: `1px solid ${GOLD_LIGHT}`, borderRight: `1px solid ${GOLD_LIGHT}` }}/>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 24px" }}>New Account</p>

          {createError && (
            <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 16px", marginBottom: "20px", fontFamily: "'Playfair Display', serif", fontSize: "15px" }}>
              {createError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
  type="text"
  placeholder="e.g. Celine Tan"
  value={form.name}
  onChange={e => {
    const cleaned = e.target.value.replace(/\s+/g, ' ')
    const titled = cleaned.replace(/\b\w/g, c => c.toUpperCase())
    setForm({ ...form, name: titled })
  }}
  onBlur={e => setForm({ ...form, name: e.target.value.trim() })}
  style={inputStyle}
/>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
  type="email"
  placeholder="e.g. celine@example.com"
  value={form.email}
  onChange={e => setForm({ ...form, email: e.target.value.trim().toLowerCase() })}
  style={{
    ...inputStyle,
    borderBottom: form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "2px solid #E24B4A"
      : `2px solid ${GOLD}`
  }}
/>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="ceo">CEO</option>
                <option value="branch_office">Branch Office</option>
              </select>
            </div>
          </div>

          <button
            onClick={createAccount}
            disabled={creating}
            style={{
              padding: "14px 36px",
              background: creating ? GOLD_LIGHT : `linear-gradient(135deg, #C9A84C 0%, ${GOLD} 100%)`,
              color: WHITE, border: "none",
              fontFamily: "'Playfair Display', serif",
              fontSize: "12px", fontWeight: "700",
              letterSpacing: "3px", textTransform: "uppercase",
              cursor: creating ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(168,124,42,0.25)"
            }}
          >{creating ? "Creating..." : "Create Account"}</button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: GOLD, padding: "24px" }}>Loading accounts...</p>
      ) : (
        <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr", padding: "14px 24px", borderBottom: `1px solid ${GOLD_LIGHT}`, background: "#FDFAF2" }}>
            {["Name", "Email", "Role", "Action"].map(h => (
              <p key={h} style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", margin: 0 }}>{h}</p>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#999", margin: 0 }}>No accounts found</p>
            </div>
          ) : (
            filtered.map((acc, i) => {
              const rc = roleColour(acc.role)
              const isCurrent = acc.id === currentUser.id
              return (
                <div key={acc.id}
                  style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr", padding: "16px 24px", borderBottom: i < filtered.length - 1 ? `1px solid #F0E8CC` : "none", alignItems: "center", background: isCurrent ? "#FDFAF2" : WHITE, transition: "background 0.1s" }}
                  onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = "#FDFAF2" }}
                  onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = WHITE }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "38px", height: "38px", border: `1.5px solid ${GOLD}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: GOLD, flexShrink: 0 }}>
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: BLACK, fontWeight: "600", margin: 0 }}>{acc.name}</p>
                  </div>

                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: "#555", margin: 0 }}>{acc.email}</p>

                  <span style={{ display: "inline-block", padding: "4px 12px", background: rc.bg, color: rc.color, fontFamily: "'Playfair Display', serif", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
                    {roleLabel(acc.role)}
                  </span>

                  {isCurrent ? (
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "1px", textTransform: "uppercase", margin: 0, fontWeight: "700" }}>You</p>
                  ) : (
                    <button
                      onClick={() => switchTo(acc)}
                      disabled={switching === acc.id}
                      style={{ padding: "8px 16px", background: switching === acc.id ? GOLD_LIGHT : `linear-gradient(135deg, #C9A84C 0%, ${GOLD} 100%)`, color: WHITE, border: "none", fontFamily: "'Playfair Display', serif", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: switching === acc.id ? "not-allowed" : "pointer" }}
                    >
                      {switching === acc.id ? "..." : "Switch"}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard")
  const isImpersonating = !!localStorage.getItem("impersonate_token")

  function stopImpersonating() {
    localStorage.setItem("token", localStorage.getItem("impersonate_token"))
    localStorage.setItem("user", localStorage.getItem("impersonate_user"))
    localStorage.removeItem("impersonate_token")
    localStorage.removeItem("impersonate_user")
    window.location.reload()
  }

  const navItems = [
    "Dashboard", "Hierarchy", "Inventory",
    "Packages", "Commission", "Billing", "Users",
    ...(user.role === "superadmin" ? ["Account Switcher"] : [])
  ]

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex" }}>

      {/* Impersonation banner */}
      {isImpersonating && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: "#7A5C10", color: WHITE, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Playfair Display', serif", fontSize: "15px" }}>
          <span>Viewing as <strong>{user.name}</strong> — Impersonation Mode Active</span>
          <button onClick={stopImpersonating} style={{ background: "transparent", border: `1px solid ${WHITE}`, color: WHITE, padding: "8px 20px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Return to Superadmin
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: "260px", background: WHITE, borderRight: `1px solid ${GOLD_LIGHT}`, display: "flex", flexDirection: "column", flexShrink: 0, marginTop: isImpersonating ? "48px" : 0 }}>

        <div style={{ padding: "32px 20px 24px", borderBottom: `1px solid #EDE0B8`, textAlign: "center" }}>
          <img src={logo} alt="TM Beauty Hub" style={{ width: "80px", height: "80px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(168,124,42,0.25))" }}/>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: GOLD, letterSpacing: "3px", margin: "12px 0 3px", textTransform: "uppercase", fontWeight: "700" }}>TM BEAUTY HUB</h2>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: "#C9A84C", margin: 0, fontStyle: "italic" }}>Members Portal</p>
        </div>

        <div style={{ padding: "18px 20px", borderBottom: `1px solid #EDE0B8`, background: "#FDFAF2" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>{user.name}</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>{user.role.replace(/_/g, " ")}</p>
        </div>

        <nav style={{ flex: 1, padding: "10px 0" }}>
          {navItems.map(item => (
            <NavItem key={item} label={item} active={activePage === item} onClick={() => setActivePage(item)} />
          ))}
        </nav>

        <div style={{ padding: "20px", borderTop: `1px solid #EDE0B8` }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "13px", background: "transparent", border: `1px solid ${GOLD}`, color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "48px 56px", marginTop: isImpersonating ? "48px" : 0, overflowY: "auto" }}>
        {activePage === "Dashboard" && <DashboardHome user={user} />}
        {activePage === "Account Switcher" && <AccountSwitcher currentUser={user} />}
        {!["Dashboard", "Account Switcher"].includes(activePage) && (
          <div>
            <PageHeader sub="Module" title={activePage} />
            <ComingSoon label={activePage} />
          </div>
        )}
      </div>

    </div>
  )
}