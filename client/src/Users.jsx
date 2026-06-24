import { useState, useEffect, useRef } from "react"

const GOLD = "#A87C2A"
const GOLD_LIGHT = "#D4B86A"
const WHITE = "#FFFFFF"
const BLACK = "#1A1A1A"
const API = "https://tmbeauty-hub-production.up.railway.app"
const ff = "'Playfair Display', serif"

const TIERS = ["manager", "director", "ceo", "branch_office"]
const STATUSES = ["pending_setup", "active", "suspended", "deactivated", "ghost"]
const COUNTRIES = [
  { code: "+65", label: "SG +65" }, { code: "+60", label: "MY +60" },
  { code: "+86", label: "CN +86" }, { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" }, { code: "+61", label: "AU +61" },
  { code: "+852", label: "HK +852" }, { code: "+886", label: "TW +886" },
]
const PAYMENT_METHODS = ["Bank Transfer", "Cash", "PayNow", "Cheque", "Stripe", "Other"]
const ONBOARDING_TYPES = [
  { value: "manual_historical", label: "Manual Historical (Port Over)" },
  { value: "superadmin_direct", label: "Superadmin Direct" },
  { value: "stripe", label: "Stripe Payment" },
]

function sgt(d) {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " SGT"
}
function sgtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-SG", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric" })
}
function tc(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) }
function tierLabel(t) {
  if (t === "branch_office") return "Branch Office"
  if (t === "ceo") return "CEO"
  if (t === "director") return "Director"
  if (t === "manager") return "Manager"
  return tc(t) || "—"
}
function tierColour(t) {
  if (t === "branch_office") return { bg: "#D6E8F7", color: "#0C2E52" }
  if (t === "ceo") return { bg: "#D4EDD4", color: "#0A3D0A" }
  if (t === "director") return { bg: "#EDD4EA", color: "#3D0A38" }
  return { bg: "#E8E8E8", color: "#1A1A1A" }
}
function statusColour(s) {
  if (s === "active") return { bg: "#D4EDD4", color: "#0A3D0A" }
  if (s === "pending_setup") return { bg: "#FEF3C7", color: "#92400E" }
  if (s === "suspended") return { bg: "#FEE2E2", color: "#991B1B" }
  if (s === "ghost") return { bg: "#EDE9FE", color: "#5B21B6" }
  return { bg: "#E5E7EB", color: "#374151" }
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

function Badge({ label, bg, color }) {
  return <span style={{ display: "inline-block", padding: "4px 10px", background: bg, color, fontFamily: ff, fontSize: "12px", fontWeight: "700", borderRadius: "6px", whiteSpace: "nowrap" }}>{label}</span>
}
function STitle({ children }) {
  return <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "1.5rem 0 0.75rem", borderBottom: `0.5px solid ${GOLD_LIGHT}`, paddingBottom: "8px" }}>{children}</p>
}

const iStyle = { width: "100%", padding: "11px 14px", border: `1px solid ${GOLD_LIGHT}`, borderBottom: `2px solid ${GOLD}`, background: "#FDFAF2", fontFamily: ff, fontSize: "15px", color: BLACK, outline: "none", boxSizing: "border-box", borderRadius: "4px 4px 0 0", maxWidth: "100%" }
const iReadOnly = { ...iStyle, background: "#F0EDE4", color: "#8a7050", cursor: "not-allowed" }
const lStyle = { fontFamily: ff, fontSize: "11px", color: GOLD, display: "block", marginBottom: "8px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700" }
const btnG = { padding: "11px 24px", background: `linear-gradient(135deg, #C9A84C, ${GOLD})`, color: WHITE, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }
const btnO = { padding: "11px 24px", background: "transparent", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: "8px", fontFamily: ff, fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }

function FormField({ label, children, required, note }) {
  return (
    <div>
      <label style={lStyle}>{label}{required ? " *" : ""}</label>
      {children}
      {note && <p style={{ fontFamily: ff, fontSize: "11px", color: "#8a7050", margin: "4px 0 0" }}>{note}</p>}
    </div>
  )
}

function PhoneInput({ countryCode, phone, onCountryChange, onPhoneChange, placeholder }) {
  return (
    <div style={{ display: "flex", gap: "8px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ width: "96px", flexShrink: 0 }}>
        <CustomSelect
          value={countryCode}
          onChange={onCountryChange}
          options={COUNTRIES.map(c => ({ value: c.code, label: c.label }))}
          compact
        />
      </div>
      <input value={phone} onChange={e => onPhoneChange(e.target.value)} placeholder={placeholder || "XXXX XXXX"} style={{ ...iStyle, flex: 1, minWidth: 0 }} />
    </div>
  )
}

// ── Custom dropdown — replaces native <select> in edit fields ──
// compact=true → panel sizes to content (for narrow triggers like phone cc)
// compact=false (default) → panel stretches full width of trigger
function CustomSelect({ value, onChange, options, compact = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => (o.value ?? o) === value)
  const label = selected?.label ?? selected ?? value ?? "Select..."

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [])

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ ...iStyle, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ fontFamily: ff, fontSize: "15px", color: BLACK }}>{label}</span>
        <span style={{ color: GOLD, fontSize: "11px", marginLeft: "8px", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={compact
          ? { position: "absolute", top: "100%", left: 0, minWidth: "max-content", zIndex: 999, background: "#FDFAF2", border: `1px solid ${GOLD_LIGHT}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: "260px", overflowY: "auto" }
          : { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: "#FDFAF2", border: `1px solid ${GOLD_LIGHT}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: "220px", overflowY: "auto" }
        }>
          {options.map(o => {
            const val = o.value ?? o
            const lbl = o.label ?? o
            const isSelected = val === value
            return (
              <div
                key={val}
                onMouseDown={e => { e.preventDefault(); onChange(val); setOpen(false) }}
                onTouchEnd={e => { e.preventDefault(); onChange(val); setOpen(false) }}
                style={{ padding: "12px 16px", cursor: "pointer", fontFamily: ff, fontSize: "15px", color: isSelected ? GOLD : BLACK, fontWeight: isSelected ? "700" : "400", background: isSelected ? "#FDF6E3" : "transparent", borderBottom: `0.5px solid ${GOLD_LIGHT}`, whiteSpace: compact ? "nowrap" : "normal" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#FDF6E3" }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
              >
                {lbl}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Inline editable field ──
function EditableField({ label, value, fieldKey, type = "text", options, unlocked, onSave, isPhone, countryCode }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value || "")
  const [cc, setCc] = useState(countryCode || "+65")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  async function save() {
    if (!note.trim()) { setErr("Reason for change is required"); return }
    setSaving(true); setErr("")
    const saveVal = isPhone ? `${cc} ${val}` : val
    await onSave(fieldKey, saveVal, note)
    setNote(""); setEditing(false); setSaving(false)
  }

  const displayValue = type === "select" && options
    ? (options.find(o => (o.value || o) === value)?.label || value || "—")
    : (value === true || value === "true") ? "Yes"
    : (value === false || value === "false") ? "No"
    : value || "—"

  return (
    <div style={{ padding: "12px 16px", borderRadius: "8px", boxSizing: "border-box", width: "100%", minWidth: 0, background: editing ? "#FFFBF0" : "#FFFDF7", border: `0.5px solid ${editing ? GOLD : GOLD_LIGHT}`, transition: "all 0.15s" }}>
      <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 6px" }}>{label}</p>
      {editing ? (
        <div>
          {isPhone ? (
            <div style={{ marginBottom: "8px" }}>
              <PhoneInput countryCode={cc} phone={val} onCountryChange={setCc} onPhoneChange={setVal} />
            </div>
          ) : type === "select" && options ? (
            <div style={{ marginBottom: "8px" }}>
              <CustomSelect value={val} onChange={setVal} options={options} />
            </div>
          ) : (
            <input value={val} onChange={e => setVal(e.target.value)} style={{ ...iStyle, marginBottom: "8px", width: "100%", boxSizing: "border-box" }} />
          )}
          <input value={note} onChange={e => { setNote(e.target.value); setErr("") }} placeholder="Reason for change (required)" style={{ ...iStyle, fontSize: "13px", marginBottom: "6px", width: "100%", boxSizing: "border-box" }} />
          {err && <p style={{ fontFamily: ff, fontSize: "12px", color: "#991B1B", margin: "0 0 6px" }}>{err}</p>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { setEditing(false); setVal(value || ""); setNote(""); setErr("") }} style={{ ...btnO, padding: "7px 14px", fontSize: "12px" }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ ...btnG, padding: "7px 14px", fontSize: "12px", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <p style={{ fontFamily: ff, fontSize: "15px", color: displayValue === "—" ? "#8a7050" : BLACK, fontWeight: "600", margin: 0 }}>{displayValue}</p>
          {unlocked && (
            <button onClick={() => { setVal(value || ""); setEditing(true) }} style={{ background: "transparent", border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontFamily: ff, fontSize: "11px", color: GOLD, flexShrink: 0 }}>Edit</button>
          )}
        </div>
      )}
    </div>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div style={{ padding: "12px 16px", background: "#FFFDF7", border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px" }}>
      <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontFamily: ff, fontSize: "15px", color: !value || value === "—" ? "#8a7050" : BLACK, fontWeight: "600", margin: 0 }}>{value || "—"}</p>
    </div>
  )
}

function MemberSelector({ value, onChange, placeholder, excludeId }) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [selectedName, setSelectedName] = useState("")
  const [open, setOpen] = useState(false)
  const token = localStorage.getItem("token")

  async function doSearch(q) {
    if (!q || q.length < 2) { setResults([]); return }
    try {
      const r = await fetch(`${API}/api/admin/members?search=${encodeURIComponent(q)}&limit=10`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setResults((d.members || []).filter(m => m.id !== excludeId))
    } catch(e) {}
  }

  return (
    <div style={{ position: "relative" }}>
      <input value={selectedName || search}
        onChange={e => { setSearch(e.target.value); setSelectedName(""); onChange(""); doSearch(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Search by name..."}
        style={iStyle} />
      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "0 0 8px 8px", zIndex: 100, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {results.map(m => (
            <div key={m.id}
              onClick={() => { setSelectedName(m.name); onChange(m.id); setOpen(false); setSearch(""); setResults([]) }}
              style={{ padding: "10px 14px", cursor: "pointer", fontFamily: ff, fontSize: "14px", color: BLACK, borderBottom: `0.5px solid ${GOLD_LIGHT}` }}
              onMouseEnter={e => e.currentTarget.style.background = "#FDF6E3"}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <span style={{ fontWeight: "700" }}>{m.name}</span>
              <span style={{ fontSize: "12px", color: "#8a7050", marginLeft: "8px" }}>{tierLabel(m.tier)} · ID: {m.id}</span>
            </div>
          ))}
        </div>
      )}
      {selectedName && <p style={{ fontFamily: ff, fontSize: "12px", color: GOLD, margin: "4px 0 0", fontWeight: "700" }}>✓ {selectedName} selected</p>}
    </div>
  )
}

export default function Users() {
  const [view, setView] = useState("list")
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("name")
  const [sortDir, setSortDir] = useState("asc")
  const PER_PAGE = 50

  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [profileLocked, setProfileLocked] = useState(true)

  const [packages, setPackages] = useState([])
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")
  const [saving, setSaving] = useState(false)
  const [cf, setCf] = useState({
    name: "", email: "",
    country_code: "+65", primary_phone: "",
    sec_country_code: "+65", secondary_phone: "",
    tier: "manager", package_id: "",
    upline_user_id: "", onboarding_type: "manual_historical",
    payment_status: "full", amount_paid: "",
    payment_method: "Bank Transfer", payment_method_other: "",
    payment_reference: "", payment_date: "", onboarding_date: "",
    onboarding_notes: "", base_credits: "", foc_credits: "", tssb_credits: "", internal_notes: ""
  })

  const token = localStorage.getItem("token")
  const hdrs = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  const isPortOver = cf.onboarding_type === "manual_historical"
  const selectedPkg = packages.find(p => p.id == cf.package_id)
  const totalPages = Math.ceil(total / PER_PAGE) || 1

  useEffect(() => { fetchPkg() }, [])
  useEffect(() => { fetchMembers() }, [page, filterTier, filterStatus])

  async function fetchPkg() {
    try {
      const r = await fetch(`${API}/api/packages`, { headers: hdrs })
      const d = await r.json()
      setPackages(d.packages || [])
    } catch(e) {}
  }

  async function fetchMembers() {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (search) p.set("search", search)
      if (filterTier) p.set("tier", filterTier)
      if (filterStatus) p.set("status", filterStatus)
      p.set("page", page); p.set("limit", PER_PAGE)
      const r = await fetch(`${API}/api/admin/members?${p}`, { headers: hdrs })
      const d = await r.json()
      setMembers(d.members || []); setTotal(d.total || 0)
    } catch(e) {}
    setLoading(false)
  }

  async function fetchDetail(id) {
    setDetailLoading(true); setProfileLocked(true)
    try {
      const r = await fetch(`${API}/api/admin/members/${id}`, { headers: hdrs })
      const d = await r.json()
      setSelected(d)
    } catch(e) {}
    setDetailLoading(false)
  }

  async function saveField(id, field, value, note) {
    await fetch(`${API}/api/admin/members/${id}`, {
      method: "PUT", headers: hdrs,
      body: JSON.stringify({ field, value, change_note: note })
    })
    await fetchDetail(id)
  }

  async function createMember() {
    setCreateError(""); setCreateSuccess("")
    if (!cf.name.trim()) return setCreateError("Full name is required")
    if (!isValidEmail(cf.email)) return setCreateError("A valid email address is required")
    if (!cf.primary_phone.trim()) return setCreateError("Primary phone is required")
    if (cf.payment_method === "Other" && !cf.payment_method_other.trim()) return setCreateError("Please specify the payment method")
    if (cf.payment_status === "partial") {
      if (!cf.amount_paid) return setCreateError("Please enter the partial payment amount")
      if (selectedPkg && parseFloat(cf.amount_paid) >= parseFloat(selectedPkg.price)) return setCreateError("Partial payment must be less than the full package price")
    }
    setSaving(true)
    try {
      const payload = {
        name: cf.name.trim(), email: cf.email.trim().toLowerCase(),
        tier: cf.tier, role: cf.tier,
        country_code: cf.country_code, primary_phone: cf.primary_phone.trim(),
        secondary_phone: cf.secondary_phone.trim() || null,
        upline_user_id: cf.upline_user_id || null,
        onboarding_type: cf.onboarding_type, package_id: cf.package_id || null,
        package_price_paid: cf.payment_status === "full" && selectedPkg ? selectedPkg.price : cf.amount_paid,
        payment_reference: cf.payment_reference || null,
        onboarding_date: cf.onboarding_date || null,
        onboarding_notes: cf.onboarding_notes || null,
        base_credits: isPortOver ? (cf.base_credits || null) : (selectedPkg?.base_credits || null),
        foc_credits: isPortOver ? (cf.foc_credits || null) : (selectedPkg?.foc_credits || null),
        tssb_credits: isPortOver ? (cf.tssb_credits || null) : null,
        internal_notes: cf.internal_notes || null,
      }
      const r = await fetch(`${API}/api/admin/members`, { method: "POST", headers: hdrs, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) { setCreateError(d.error || "Failed to create member"); setSaving(false); return }
      setCreateSuccess(`Member created. Referral code: ${d.referral_code}`)
      fetchMembers()
      setTimeout(() => { setView("list"); setCreateSuccess("") }, 3000)
    } catch(e) { setCreateError("Server error") }
    setSaving(false)
  }

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir("asc") }
  }

  // ── LIST ──
  if (view === "list") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
        <div>
          <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: ff, fontSize: "28px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>Members</h1>
          <p style={{ fontFamily: ff, fontSize: "14px", color: "#666", margin: 0 }}>{total} members registered</p>
        </div>
        <button style={btnG} onClick={() => { setCreateError(""); setCreateSuccess(""); setView("create") }}>+ Add Member</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Search name, email, referral code..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchMembers()}
          style={{ ...iStyle, flex: 1, minWidth: "200px" }} />
        <select value={filterTier} onChange={e => { setFilterTier(e.target.value); setPage(1) }} style={{ ...iStyle, minWidth: "130px", flex: "1 1 130px" }}>
          <option value="">All Tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} style={{ ...iStyle, minWidth: "130px", flex: "1 1 130px" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{tc(s)}</option>)}
        </select>
        <button style={btnO} onClick={() => { setPage(1); fetchMembers() }}>Search</button>
      </div>

      {loading ? <p style={{ fontFamily: ff, color: GOLD, padding: "24px" }}>Loading members...</p>
      : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px", background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "12px" }}>
          <p style={{ fontFamily: ff, fontSize: "17px", color: "#999", margin: 0 }}>No members found</p>
        </div>
      ) : (
        <div style={{ background: "#FFFDF7", border: `0.5px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, borderRadius: "12px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "#FDFAF2" }}>
                {[
                  { label: "Name", col: "name" }, { label: "Referral Code", col: "referral_code" },
                  { label: "Tier", col: "tier" }, { label: "Status", col: "account_status" },
                  { label: "Upline", col: "upline_name" }, { label: "Date Added", col: "onboarding_date" },
                ].map(({ label, col }) => (
                  <th key={col} onClick={() => handleSort(col)} style={{ padding: "12px 16px", textAlign: "left", fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", borderBottom: `2px solid ${GOLD_LIGHT}`, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                    {label} <span style={{ opacity: sortBy === col ? 1 : 0.3 }}>{sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </th>
                ))}
                <th style={{ padding: "12px 16px", borderBottom: `2px solid ${GOLD_LIGHT}` }}></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const tC = tierColour(m.tier); const sC = statusColour(m.account_status)
                return (
                  <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? `0.5px solid #e8dcc8` : "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FFFBF0"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { fetchDetail(m.id); setView("detail") }}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${GOLD_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "14px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{m.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, fontWeight: "700", margin: "0 0 2px" }}>{m.name}</p>
                          <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: 0 }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700" }}>{m.referral_code || "—"}</td>
                    <td style={{ padding: "13px 16px" }}><Badge label={tierLabel(m.tier)} bg={tC.bg} color={tC.color} /></td>
                    <td style={{ padding: "13px 16px" }}><Badge label={tc(m.account_status)} bg={sC.bg} color={sC.color} /></td>
                    <td style={{ padding: "13px 16px", fontFamily: ff, fontSize: "13px", color: "#6b5d4e" }}>{m.upline_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontFamily: ff, fontSize: "13px", color: "#6b5d4e", whiteSpace: "nowrap" }}>{sgtDate(m.onboarding_date)}</td>
                    <td style={{ padding: "13px 16px" }}><span style={{ fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700" }}>View →</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: `0.5px solid #e8dcc8`, flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontFamily: ff, fontSize: "13px", color: "#8a7050", margin: 0 }}>Showing {((page-1)*PER_PAGE)+1}–{Math.min(page*PER_PAGE, total)} of {total} members</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ ...btnO, padding: "7px 16px", fontSize: "13px", opacity: page===1?0.4:1 }}>← Prev</button>
              <span style={{ fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages} style={{ ...btnO, padding: "7px 16px", fontSize: "13px", opacity: page>=totalPages?0.4:1 }}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── DETAIL ──
  if (view === "detail") return (
    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
      <button style={{ ...btnO, marginBottom: "24px" }} onClick={() => setView("list")}>← Back to Members</button>
      {detailLoading || !selected ? <p style={{ fontFamily: ff, color: GOLD }}>Loading...</p> : (() => {
        const m = selected.member
        const uid = m.user_id
        const save = (f, v, n) => saveField(uid, f, v, n)
        return (
          <div>
            <div style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: `1px solid ${GOLD_LIGHT}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "20px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{m.name?.charAt(0).toUpperCase()}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1 style={{ fontFamily: ff, fontSize: "20px", color: BLACK, fontWeight: "700", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</h1>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <Badge label={tierLabel(m.tier)} {...tierColour(m.tier)} />
                    <Badge label={tc(m.account_status)} {...statusColour(m.account_status)} />
                    {m.referral_code && <Badge label={m.referral_code} bg="#F5E6C8" color="#5C3D08" />}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {!profileLocked && <span style={{ fontFamily: ff, fontSize: "12px", color: "#92400E", background: "#FEF3C7", padding: "6px 12px", borderRadius: "6px", fontWeight: "700" }}>Editing Mode</span>}
                <button onClick={() => setProfileLocked(l => !l)} style={{ padding: "9px 20px", fontSize: "13px", fontFamily: ff, fontWeight: "700", cursor: "pointer", borderRadius: "8px", border: profileLocked ? "none" : `1px solid #991B1B`, background: profileLocked ? `linear-gradient(135deg, #C9A84C, ${GOLD})` : "transparent", color: profileLocked ? WHITE : "#991B1B" }}>
                  {profileLocked ? "🔓 Unlock to Edit" : "🔒 Lock Profile"}
                </button>
              </div>
            </div>

            <STitle>Contact Information</STitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <ReadOnlyField label="Email" value={m.email} />
              <EditableField label="Primary Phone" value={m.primary_phone} countryCode={m.country_code || "+65"} fieldKey="primary_phone" isPhone unlocked={!profileLocked} onSave={save} />
              <EditableField label="Secondary Phone" value={m.secondary_phone} countryCode={m.country_code || "+65"} fieldKey="secondary_phone" isPhone unlocked={!profileLocked} onSave={save} />
            </div>

            <STitle>Membership</STitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <EditableField label="Tier" value={m.tier} fieldKey="tier" type="select" options={TIERS.map(t => ({ value: t, label: tierLabel(t) }))} unlocked={!profileLocked} onSave={save} />
              <EditableField label="Status" value={m.account_status} fieldKey="account_status" type="select" options={STATUSES.map(s => ({ value: s, label: tc(s) }))} unlocked={!profileLocked} onSave={save} />
              <ReadOnlyField label="Upline" value={m.upline_name ? `${m.upline_name} (${tierLabel(m.upline_tier)})` : null} />
              <ReadOnlyField label="Onboarding Type" value={tc(m.onboarding_type)} />
              <ReadOnlyField label="Date Added" value={sgtDate(m.onboarding_date)} />
              <ReadOnlyField label="Package Paid" value={m.package_price_paid ? `SGD ${parseFloat(m.package_price_paid).toLocaleString()}` : null} />
              <EditableField label="Payment Reference" value={m.payment_reference} fieldKey="payment_reference" unlocked={!profileLocked} onSave={save} />
              <EditableField label="Upline Visibility Levels" value={String(m.upline_visibility_levels || 1)} fieldKey="upline_visibility_levels" unlocked={!profileLocked} onSave={save} />
            </div>

            <STitle>Eligibility</STitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                { label: "Commission Eligible", key: "commission_eligible", val: m.commission_eligible },
                { label: "FOC Eligible", key: "foc_eligible", val: m.foc_eligible },
                { label: "VIP", key: "is_vip", val: m.is_vip },
                { label: "Under Review", key: "is_under_review", val: m.is_under_review },
              ].map(({ label, key, val }) => (
                <EditableField key={key} label={label}
                  value={val === true || val === "true" ? "true" : "false"}
                  fieldKey={key} type="select"
                  options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]}
                  unlocked={!profileLocked} onSave={save} />
              ))}
            </div>

            <STitle>Internal Notes</STitle>
            <EditableField label="Internal Notes (Superadmin Only)" value={m.internal_notes} fieldKey="internal_notes" unlocked={!profileLocked} onSave={save} />

            {selected.downline?.length > 0 && (
              <>
                <STitle>Direct Downline ({selected.downline.length})</STitle>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selected.downline.map(d => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${GOLD_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "13px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{d.name?.charAt(0).toUpperCase()}</div>
                      <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, fontWeight: "700", margin: 0, flex: 1 }}>{d.name}</p>
                      <Badge label={tierLabel(d.tier)} {...tierColour(d.tier)} />
                      <Badge label={tc(d.account_status)} {...statusColour(d.account_status)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            <STitle>Audit Log (Singapore Time)</STitle>
            {!selected.audit || selected.audit.length === 0 ? (
              <div style={{ padding: "16px 20px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px", fontFamily: ff, fontSize: "14px", color: "#8a7050" }}>No changes recorded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selected.audit.map(a => (
                  <div key={a.id} style={{ display: "flex", gap: "16px", padding: "12px 16px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px", flexWrap: "wrap" }}>
                    <div style={{ flexShrink: 0, minWidth: "190px" }}>
                      <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: "0 0 2px" }}>{sgt(a.created_at)}</p>
                      <p style={{ fontFamily: ff, fontSize: "12px", color: GOLD, margin: 0, fontWeight: "700" }}>{a.changed_by_name || "System"}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <p style={{ fontFamily: ff, fontSize: "13px", color: BLACK, margin: "0 0 2px", fontWeight: "700" }}>{tc(a.field_changed)}</p>
                      {a.old_value && <p style={{ fontFamily: ff, fontSize: "12px", color: "#6b5d4e", margin: "0 0 2px" }}>{a.old_value} → {a.new_value}</p>}
                      {a.change_note && <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: 0, fontStyle: "italic" }}>{a.change_note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )

  // ── CREATE ──
  if (view === "create") return (
    <div>
      <button style={{ ...btnO, marginBottom: "24px" }} onClick={() => setView("list")}>← Back to Members</button>
      <div style={{ marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
        <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
        <h1 style={{ fontFamily: ff, fontSize: "24px", color: BLACK, fontWeight: "700", margin: 0 }}>Add Member</h1>
      </div>

      {createError && <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createError}</div>}
      {createSuccess && <div style={{ background: "#D4EDD4", border: "1px solid #86EFAC", color: "#0A3D0A", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createSuccess}</div>}

      <STitle>Personal Details</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
        <FormField label="Full Name" required>
          <input value={cf.name} onChange={e => setCf({...cf, name: e.target.value})} placeholder="e.g. Sarah Tan" style={iStyle} />
        </FormField>
        <FormField label="Email Address" required note="Must be a valid and unique email address">
          <input type="email" value={cf.email} onChange={e => setCf({...cf, email: e.target.value.trim().toLowerCase()})} placeholder="e.g. sarah@email.com"
            style={{ ...iStyle, borderBottomColor: cf.email && !isValidEmail(cf.email) ? "#E24B4A" : GOLD }} />
          {cf.email && !isValidEmail(cf.email) && <p style={{ fontFamily: ff, fontSize: "11px", color: "#E24B4A", margin: "4px 0 0" }}>Please enter a valid email address</p>}
        </FormField>
        <FormField label="Primary Phone" required>
          <PhoneInput countryCode={cf.country_code} phone={cf.primary_phone} onCountryChange={v => setCf({...cf, country_code: v})} onPhoneChange={v => setCf({...cf, primary_phone: v})} />
        </FormField>
        <FormField label="Secondary Phone">
          <PhoneInput countryCode={cf.sec_country_code} phone={cf.secondary_phone} onCountryChange={v => setCf({...cf, sec_country_code: v})} onPhoneChange={v => setCf({...cf, secondary_phone: v})} placeholder="Optional" />
        </FormField>
      </div>

      <STitle>Membership Details</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
        <FormField label="Tier" required>
          <CustomSelect value={cf.tier} onChange={v => { const pkg = packages.find(p => p.tier_id === v); setCf({...cf, tier: v, package_id: pkg?.id || "", amount_paid: ""}) }} options={TIERS.map(t => ({ value: t, label: tierLabel(t) }))} />
        </FormField>
        <FormField label="Package">
          <CustomSelect value={cf.package_id} onChange={v => setCf({...cf, package_id: v, amount_paid: ""})} options={[{ value: "", label: "Select package..." }, ...packages.filter(p => p.tier_id === cf.tier).map(p => ({ value: String(p.id), label: `${p.english_name} — SGD ${parseFloat(p.price).toLocaleString()}` }))]} />
        </FormField>
        <FormField label="Upline Member">
          <MemberSelector value={cf.upline_user_id} onChange={v => setCf({...cf, upline_user_id: v})} placeholder="Search by name (minimum 2 characters)..." />
        </FormField>
        <FormField label="Onboarding Type">
          <CustomSelect value={cf.onboarding_type} onChange={v => setCf({...cf, onboarding_type: v})} options={ONBOARDING_TYPES} />
        </FormField>
        <FormField label="Date Added">
          <input type="date" value={cf.onboarding_date} onChange={e => setCf({...cf, onboarding_date: e.target.value})} style={iStyle} />
        </FormField>
      </div>

      <STitle>Payment Details</STitle>
      {selectedPkg && (
        <div style={{ background: "#FFFBF0", border: `0.5px solid ${GOLD_LIGHT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: "16px", fontFamily: ff, fontSize: "14px", color: BLACK }}>
          Package total: <strong>SGD {parseFloat(selectedPkg.price).toLocaleString()}</strong> · Base credits: <strong>{selectedPkg.base_credits}</strong> · FOC credits: <strong>{selectedPkg.foc_credits}</strong>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
        <FormField label="Payment Status">
          <CustomSelect value={cf.payment_status} onChange={v => setCf({...cf, payment_status: v, amount_paid: ""})} options={[{ value: "full", label: "Full Payment" }, { value: "partial", label: "Partial Payment" }]} />
        </FormField>
        <FormField label={cf.payment_status === "full" ? "Amount Paid (SGD)" : "First Instalment (SGD)"}>
          {cf.payment_status === "full"
            ? <input value={selectedPkg ? `SGD ${parseFloat(selectedPkg.price).toLocaleString()}` : "Select a package first"} readOnly style={iReadOnly} />
            : <input type="number" value={cf.amount_paid} onChange={e => setCf({...cf, amount_paid: e.target.value})} placeholder={`Less than SGD ${selectedPkg ? parseFloat(selectedPkg.price).toLocaleString() : "package total"}`} style={iStyle} />
          }
        </FormField>
        <FormField label="Payment Method">
          <CustomSelect value={cf.payment_method} onChange={v => setCf({...cf, payment_method: v, payment_method_other: ""})} options={PAYMENT_METHODS.filter(m => (cf.onboarding_type === "manual_historical" || cf.onboarding_type === "superadmin_direct") ? m !== "Stripe" : true).map(m => ({ value: m, label: m }))} />
        </FormField>
        {cf.payment_method === "Other" && (
          <FormField label="Specify Payment Method" note={`${cf.payment_method_other.length}/50 characters`}>
            <input value={cf.payment_method_other} maxLength={50} onChange={e => setCf({...cf, payment_method_other: e.target.value})} placeholder="Describe the payment method" style={iStyle} />
          </FormField>
        )}
        <FormField label="Payment Reference">
          <input value={cf.payment_reference} onChange={e => setCf({...cf, payment_reference: e.target.value})} placeholder="e.g. Bank transfer ref / receipt no." style={iStyle} />
        </FormField>
        <FormField label="Payment Date">
          <input type="date" value={cf.payment_date} onChange={e => setCf({...cf, payment_date: e.target.value})} style={iStyle} />
        </FormField>
      </div>

      {cf.payment_status === "partial" && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontFamily: ff, fontSize: "13px", color: "#92400E" }}>
          Partial payment recorded. Stock will NOT be released until full payment is confirmed. Additional instalments can be logged from the member profile after creation.
        </div>
      )}

      {isPortOver && (
        <>
          <STitle>Opening Credits (Port-Over Only)</STitle>
          <p style={{ fontFamily: ff, fontSize: "13px", color: "#8a7050", margin: "-0.5rem 0 1rem" }}>Only applicable for members being ported over from manual records. For new members, credits are automatically assigned from the selected package.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "8px" }}>
            <FormField label="Base Credits" note={selectedPkg ? `Package default: ${selectedPkg.base_credits}` : ""}>
              <input type="number" value={cf.base_credits} onChange={e => setCf({...cf, base_credits: e.target.value})} placeholder={selectedPkg?.base_credits || "e.g. 10"} style={iStyle} />
            </FormField>
            <FormField label="FOC Credits" note={selectedPkg ? `Package default: ${selectedPkg.foc_credits}` : ""}>
              <input type="number" value={cf.foc_credits} onChange={e => setCf({...cf, foc_credits: e.target.value})} placeholder={selectedPkg?.foc_credits || "e.g. 10"} style={iStyle} />
            </FormField>
            <FormField label="TSSB Credits">
              <input type="number" value={cf.tssb_credits} onChange={e => setCf({...cf, tssb_credits: e.target.value})} placeholder="e.g. 0" style={iStyle} />
            </FormField>
          </div>
        </>
      )}

      {!isPortOver && selectedPkg && (
        <div style={{ background: "#D4EDD4", border: "0.5px solid #86EFAC", borderRadius: "8px", padding: "12px 16px", margin: "16px 0", fontFamily: ff, fontSize: "13px", color: "#0A3D0A" }}>
          Credits will be automatically assigned from the selected package: <strong>{selectedPkg.base_credits} base credits + {selectedPkg.foc_credits} FOC credits</strong>
        </div>
      )}

      <STitle>Notes</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <FormField label="Onboarding Notes">
          <textarea value={cf.onboarding_notes} onChange={e => setCf({...cf, onboarding_notes: e.target.value})} placeholder={isPortOver ? "e.g. Ported over from manual records June 2026" : "e.g. New member onboarded via invitation"} rows={3} style={{ ...iStyle, resize: "vertical" }} />
        </FormField>
        <FormField label="Internal Notes (Superadmin Only)">
          <textarea value={cf.internal_notes} onChange={e => setCf({...cf, internal_notes: e.target.value})} placeholder="e.g. Referred by Raymond Low" rows={3} style={{ ...iStyle, resize: "vertical" }} />
        </FormField>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button style={btnO} onClick={() => setView("list")}>Cancel</button>
        <button style={{ ...btnG, opacity: saving ? 0.6 : 1 }} onClick={createMember} disabled={saving}>{saving ? "Creating..." : "Create Member"}</button>
      </div>
    </div>
  )
}
