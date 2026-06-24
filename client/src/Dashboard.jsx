import { useState, useEffect } from "react"
import logo from "./logo.png"
import MembershipTiers from "./MembershipTiers"
import Users from "./Users"

const GOLD = "#A87C2A"
const GOLD_LIGHT = "#D4B86A"
const CREAM = "#F7F0E3"
const WHITE = "#FFFFFF"
const BLACK = "#1A1A1A"
const SIDEBAR_W = 260

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
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ padding: "8px 24px", cursor: "pointer", color: on ? GOLD : BLACK, fontFamily: "'Playfair Display', serif", fontSize: "16px", borderLeft: `4px solid ${on ? GOLD : "transparent"}`, background: on ? "#FDF6E3" : "transparent", fontWeight: on ? "700" : "400", transition: "all 0.15s", minHeight: "32px", display: "flex", alignItems: "center" }}>{label}</div>
  )
}

function PageHeader({ sub, title }) {
  return (
    <div style={{ marginBottom: "36px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>{sub}</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: BLACK, fontWeight: "700", margin: 0 }}>{title}</h1>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "36px" }}>
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
  const [form, setForm] = useState({ name: "", email: "", role: "manager" })
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
    setCreateError("")
    try {
      const res = await fetch("https://tmbeauty-hub-production.up.railway.app/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error || "Failed to create account"); setCreating(false); return }
      setAccounts(prev => [...prev, data.user])
      setForm({ name: "", email: "", password: "", role: "manager" })
      setShowCreate(false)
    } catch (e) { setCreateError("Unable to connect to server") }
    setCreating(false)
  }

  const roleLabel = r => {
    if (r === "branch_office") return "Branch Office"
    if (r === "superadmin") return "Superadmin"
    if (r === "ceo") return "CEO"
    if (r === "director") return "Director"
    if (r === "manager") return "Manager"
    return r.replace(/_/g, " ")
  }

  const roleColour = r => {
    if (r === "superadmin") return { bg: "#F5E6C8", color: "#5C3D08" }
    if (r === "branch_office") return { bg: "#D6E8F7", color: "#0C2E52" }
    if (r === "ceo") return { bg: "#D4EDD4", color: "#0A3D0A" }
    if (r === "director") return { bg: "#EDD4EA", color: "#3D0A38" }
    return { bg: "#E8E8E8", color: "#1A1A1A" }
  }

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = { width: "100%", padding: "12px 14px", border: `1px solid ${GOLD_LIGHT}`, borderBottom: `2px solid ${GOLD}`, background: "#FDFAF2", fontFamily: "'Playfair Display', serif", fontSize: "15px", color: BLACK, outline: "none", boxSizing: "border-box" }
  const labelStyle = { fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, display: "block", marginBottom: "8px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700" }

  return (
    <div>
      <div style={{ marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>Account Switcher</h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#666", margin: 0 }}>{accounts.length} accounts registered</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setCreateError("") }} style={{ padding: "13px 28px", background: showCreate ? "#888" : `linear-gradient(135deg, #C9A84C 0%, ${GOLD} 100%)`, color: WHITE, border: "none", borderRadius: "8px", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", letterSpacing: "2px", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,124,42,0.25)" }}>{showCreate ? "Cancel" : "+ Add Account"}</button>
      </div>

      {showCreate && (
        <div style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, padding: "32px", marginBottom: "28px" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 24px" }}>New Account</p>
          {createError && <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 16px", marginBottom: "20px", fontFamily: "'Playfair Display', serif", fontSize: "15px" }}>{createError}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            <div><label style={labelStyle}>Full Name</label><input type="text" placeholder="e.g. Celine Tan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Email Address</label><input type="email" placeholder="e.g. celine@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value.trim().toLowerCase() })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}><option value="manager">Manager</option><option value="director">Director</option><option value="ceo">CEO</option><option value="branch_office">Branch Office</option></select></div>
          </div>
          <button onClick={createAccount} disabled={creating} style={{ padding: "14px 36px", background: creating ? GOLD_LIGHT : `linear-gradient(135deg, #C9A84C 0%, ${GOLD} 100%)`, color: WHITE, border: "none", borderRadius: "8px", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", cursor: creating ? "not-allowed" : "pointer" }}>{creating ? "Creating..." : "Create Account"}</button>
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <input type="text" placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: GOLD, padding: "24px" }}>Loading accounts...</p>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center" }}><p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#999", margin: 0 }}>No accounts found</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((acc) => {
            const rc = roleColour(acc.role)
            const isCurrent = acc.id === currentUser.id
            return (
              <div key={acc.id} style={{ padding: "16px 20px", background: isCurrent ? "linear-gradient(135deg, #FFFBF0, #FFF8E8)" : "#FFFDF7", border: `0.5px solid ${isCurrent ? GOLD : GOLD_LIGHT}`, borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "42px", height: "42px", border: `1.5px solid ${GOLD}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: GOLD, flexShrink: 0, background: isCurrent ? "#F5E6C8" : "#FDF6E3" }}>{acc.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: BLACK, fontWeight: "700", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</p>
                    <p className="acc-email" style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", color: "#6b5d4e", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.email}</p>
                  </div>
                  <span className="acc-role" style={{ padding: "7px 14px", background: rc.bg, color: rc.color, fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: "700", borderRadius: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>{roleLabel(acc.role)}</span>
                  {isCurrent ? (
                    <span style={{ padding: "9px 16px", fontSize: "13px", color: "#0A6B2A", fontWeight: "700", background: "#D4EDD4", borderRadius: "8px", fontFamily: "'Playfair Display', serif", whiteSpace: "nowrap", flexShrink: 0 }}>✓ Signed in</span>
                  ) : (
                    <button onClick={() => switchTo(acc)} disabled={switching === acc.id} style={{ padding: "9px 20px", background: switching === acc.id ? GOLD_LIGHT : `linear-gradient(135deg, #C9A84C, ${GOLD})`, color: WHITE, border: "none", borderRadius: "8px", fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: "700", cursor: switching === acc.id ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{switching === acc.id ? "..." : "Switch"}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    "Packages", "Membership Tiers", "Commission", "Billing", "Users",
    ...(user.role === "superadmin" ? ["Account Switcher"] : [])
  ]

  function handleNav(item) {
    setActivePage(item)
    setSidebarOpen(false)
  }

  const topOffset = isImpersonating ? 48 : 0

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex" }}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.25s ease; position: fixed !important; z-index: 200; height: 100vh; top: 0; left: 0; }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; padding: 20px 16px !important; }
          .mobile-topbar { display: flex !important; }
          .impersonate-bar { padding: 10px 16px !important; font-size: 13px !important; }
          .acc-email { display: none !important; }
          .acc-role { display: none !important; }
          select, input, textarea { max-width: 100% !important; box-sizing: border-box !important; }
          .main-content > div { overflow-x: hidden; }
        }
        @media (min-width: 769px) {
          .sidebar { transform: none !important; position: relative !important; }
          .mobile-topbar { display: none !important; }
        }
      `}</style>

      {isImpersonating && (
        <div className="impersonate-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: "#7A5C10", color: WHITE, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Playfair Display', serif", fontSize: "15px" }}>
          <span>Viewing as <strong>{user.name}</strong></span>
          <button onClick={stopImpersonating} style={{ background: "transparent", border: `1px solid ${WHITE}`, borderRadius: "8px", color: WHITE, padding: "10px 20px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700" }}>Return to Superadmin</button>
        </div>
      )}

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 199, marginTop: topOffset }} />}

      <div className={`sidebar${sidebarOpen ? " open" : ""}`} style={{ width: `${SIDEBAR_W}px`, background: WHITE, borderRight: `1px solid ${GOLD_LIGHT}`, display: "flex", flexDirection: "column", flexShrink: 0, marginTop: topOffset, overflowY: "auto" }}>
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
            <NavItem key={item} label={item} active={activePage === item} onClick={() => handleNav(item)} />
          ))}
        </nav>
        <div style={{ padding: "20px", borderTop: `1px solid #EDE0B8` }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "13px", background: "transparent", border: `1px solid ${GOLD}`, borderRadius: "8px", color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", letterSpacing: "2px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div className="main-content" style={{ flex: 1, padding: "48px 56px", marginTop: topOffset, overflowY: "auto", marginLeft: 0 }}>
        <div className="mobile-topbar" style={{ display: "none", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: `1px solid ${GOLD_LIGHT}` }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "8px 10px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", flexShrink: 0 }}>
            <div style={{ width: "18px", height: "1.5px", background: GOLD }} />
            <div style={{ width: "18px", height: "1.5px", background: GOLD }} />
            <div style={{ width: "18px", height: "1.5px", background: GOLD }} />
          </button>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: BLACK }}>{activePage}</span>
        </div>

        {activePage === "Dashboard" && <DashboardHome user={user} />}
        {activePage === "Account Switcher" && <AccountSwitcher currentUser={user} />}
        {activePage === "Membership Tiers" && <MembershipTiers isSuperAdmin={user.role === "superadmin"} />}
        {activePage === "Users" && <Users />}
        {!["Dashboard", "Account Switcher", "Membership Tiers", "Users"].includes(activePage) && (
          <div>
            <PageHeader sub="Module" title={activePage} />
            <ComingSoon label={activePage} />
          </div>
        )}
      </div>
    </div>
  )
}
