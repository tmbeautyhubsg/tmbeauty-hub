import { useState, useEffect, useCallback } from "react"

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
const PAYMENT_METHODS = ["Bank Transfer", "Cash", "PayNow", "Cheque", "Other"]
const ONBOARDING_TYPES = [
  { value: "manual_historical", label: "Manual Historical (Port Over)" },
  { value: "superadmin_direct", label: "Superadmin Direct" },
  { value: "stripe", label: "Stripe Payment" },
]

function titleCase(s) {
  return (s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

function tierLabel(t) {
  if (t === "branch_office") return "Branch Office"
  if (t === "ceo") return "CEO"
  if (t === "director") return "Director"
  if (t === "manager") return "Manager"
  return titleCase(t) || "—"
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

function Badge({ label, bg, color }) {
  return <span style={{ display: "inline-block", padding: "4px 10px", background: bg, color, fontFamily: ff, fontSize: "12px", fontWeight: "700", borderRadius: "6px", whiteSpace: "nowrap" }}>{label}</span>
}

function SectionTitle({ children }) {
  return <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "1.5rem 0 0.75rem" }}>{children}</p>
}

function InfoCard({ label, value, highlight }) {
  return (
    <div style={{ padding: "12px 16px", background: "#FFFDF7", border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px" }}>
      <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontFamily: ff, fontSize: "15px", color: highlight || (value === "—" ? "#8a7050" : BLACK), fontWeight: "600", margin: 0 }}>{value || "—"}</p>
    </div>
  )
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: `1px solid ${GOLD_LIGHT}`, borderBottom: `2px solid ${GOLD}`,
  background: "#FDFAF2", fontFamily: ff, fontSize: "15px",
  color: BLACK, outline: "none", boxSizing: "border-box", borderRadius: "4px 4px 0 0"
}
const labelStyle = {
  fontFamily: ff, fontSize: "11px", color: GOLD,
  display: "block", marginBottom: "8px", letterSpacing: "3px",
  textTransform: "uppercase", fontWeight: "700"
}
const btnGold = {
  padding: "11px 24px", background: `linear-gradient(135deg, #C9A84C, ${GOLD})`,
  color: WHITE, border: "none", borderRadius: "8px",
  fontFamily: ff, fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap"
}
const btnOutline = {
  padding: "11px 24px", background: "transparent",
  color: GOLD, border: `1px solid ${GOLD}`, borderRadius: "8px",
  fontFamily: ff, fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap"
}

const EDITABLE_FIELDS = [
  { key: "tier", label: "Tier" },
  { key: "account_status", label: "Account Status" },
  { key: "primary_phone", label: "Primary Phone" },
  { key: "secondary_phone", label: "Secondary Phone" },
  { key: "country_code", label: "Country Code" },
  { key: "upline_visibility_levels", label: "Upline Visibility Levels" },
  { key: "commission_eligible", label: "Commission Eligible" },
  { key: "foc_eligible", label: "FOC Eligible" },
  { key: "is_vip", label: "VIP" },
  { key: "is_under_review", label: "Under Review" },
  { key: "internal_notes", label: "Internal Notes" },
  { key: "onboarding_notes", label: "Onboarding Notes" },
  { key: "payment_reference", label: "Payment Reference" },
]

export default function Users() {
  const [view, setView] = useState("list")
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortDir, setSortDir] = useState("asc")
  const [page, setPage] = useState(1)
  const PER_PAGE = 50

  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")
  const [editNote, setEditNote] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)

  const [packages, setPackages] = useState([])
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")
  const [createForm, setCreateForm] = useState({
    name: "", email: "", tier: "manager",
    country_code: "+65", primary_phone: "", secondary_phone: "",
    upline_user_id: "", onboarding_type: "manual_historical",
    package_id: "", package_price_paid: "",
    payment_status: "full",
    amount_paid: "", payment_method: "Bank Transfer",
    payment_reference: "", payment_date: "",
    onboarding_date: "", onboarding_notes: "",
    base_credits: "", foc_credits: "", internal_notes: ""
  })

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  useEffect(() => { fetchPackages() }, [])
  useEffect(() => { fetchMembers() }, [page, filterTier, filterStatus, sortBy, sortDir])

  async function fetchPackages() {
    try {
      const r = await fetch(`${API}/api/packages`, { headers })
      const d = await r.json()
      setPackages(d.packages || [])
    } catch(e) {}
  }

  async function fetchMembers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filterTier) params.set("tier", filterTier)
      if (filterStatus) params.set("status", filterStatus)
      params.set("page", page)
      params.set("limit", PER_PAGE)
      const r = await fetch(`${API}/api/admin/members?${params}`, { headers })
      const d = await r.json()
      setMembers(d.members || [])
      setTotal(d.total || 0)
    } catch(e) {}
    setLoading(false)
  }

  async function fetchDetail(id) {
    setDetailLoading(true)
    try {
      const r = await fetch(`${API}/api/admin/members/${id}`, { headers })
      const d = await r.json()
      setSelected(d)
    } catch(e) {}
    setDetailLoading(false)
  }

  async function saveEdit() {
    if (!editField || !selected) return
    setSaving(true)
    try {
      await fetch(`${API}/api/admin/members/${selected.member.user_id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ field: editField, value: editValue, change_note: editNote })
      })
      await fetchDetail(selected.member.user_id)
      setShowEditModal(false)
      setEditField(""); setEditValue(""); setEditNote("")
    } catch(e) {}
    setSaving(false)
  }

  async function createMember() {
    setCreateError(""); setCreateSuccess("")
    if (!createForm.name || !createForm.email || !createForm.primary_phone) {
      setCreateError("Name, email and primary phone are required")
      return
    }
    setSaving(true)
    try {
      const pkg = packages.find(p => p.id == createForm.package_id)
      const payload = {
        ...createForm,
        role: createForm.tier,
        package_price_paid: pkg ? pkg.price : createForm.package_price_paid,
      }
      const r = await fetch(`${API}/api/admin/members`, {
        method: "POST", headers, body: JSON.stringify(payload)
      })
      const d = await r.json()
      if (!r.ok) { setCreateError(d.error || "Failed to create member"); setSaving(false); return }
      setCreateSuccess(`Member created successfully. Referral code: ${d.referral_code}`)
      fetchMembers()
      setTimeout(() => { setView("list"); setCreateSuccess("") }, 3000)
    } catch(e) { setCreateError("Server error") }
    setSaving(false)
  }

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(col); setSortDir("asc") }
  }

  function SortIcon({ col }) {
    if (sortBy !== col) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>
    return <span style={{ marginLeft: 4, color: GOLD }}>{sortDir === "asc" ? "↑" : "↓"}</span>
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  // ── LIST VIEW ──
  if (view === "list") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
        <div>
          <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: ff, fontSize: "28px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>Members</h1>
          <p style={{ fontFamily: ff, fontSize: "14px", color: "#666", margin: 0 }}>{total} members registered</p>
        </div>
        <button style={btnGold} onClick={() => { setCreateError(""); setCreateSuccess(""); setView("create") }}>+ Add Member</button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Search name, email, referral code..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchMembers()}
          style={{ ...inputStyle, flex: 1, minWidth: "200px" }} />
        <select value={filterTier} onChange={e => { setFilterTier(e.target.value); setPage(1) }} style={{ ...inputStyle, width: "150px", flex: "none" }}>
          <option value="">All Tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} style={{ ...inputStyle, width: "160px", flex: "none" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <button style={btnOutline} onClick={() => { setPage(1); fetchMembers() }}>Search</button>
      </div>

      {loading ? (
        <p style={{ fontFamily: ff, color: GOLD, padding: "24px" }}>Loading members...</p>
      ) : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px", background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "12px" }}>
          <p style={{ fontFamily: ff, fontSize: "17px", color: "#999", margin: 0 }}>No members found</p>
        </div>
      ) : (
        <div style={{ background: "#FFFDF7", border: `0.5px solid ${GOLD_LIGHT}`, borderTop: `3px solid ${GOLD}`, borderRadius: "12px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "#FDFAF2" }}>
                {[
                  { label: "Name", col: "name" },
                  { label: "Referral Code", col: "referral_code" },
                  { label: "Tier", col: "tier" },
                  { label: "Status", col: "account_status" },
                  { label: "Upline", col: "upline_name" },
                  { label: "Date Added", col: "onboarding_date" },
                ].map(({ label, col }) => (
                  <th key={col} onClick={() => handleSort(col)} style={{ padding: "12px 16px", textAlign: "left", fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", borderBottom: `2px solid ${GOLD_LIGHT}`, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                    {label}<SortIcon col={col} />
                  </th>
                ))}
                <th style={{ padding: "12px 16px", borderBottom: `2px solid ${GOLD_LIGHT}` }}></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const tc = tierColour(m.tier)
                const sc = statusColour(m.account_status)
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
                    <td style={{ padding: "13px 16px" }}><Badge label={tierLabel(m.tier)} bg={tc.bg} color={tc.color} /></td>
                    <td style={{ padding: "13px 16px" }}><Badge label={titleCase(m.account_status)} bg={sc.bg} color={sc.color} /></td>
                    <td style={{ padding: "13px 16px", fontFamily: ff, fontSize: "13px", color: "#6b5d4e" }}>{m.upline_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontFamily: ff, fontSize: "13px", color: "#6b5d4e", whiteSpace: "nowrap" }}>{m.onboarding_date ? new Date(m.onboarding_date).toLocaleDateString("en-SG") : "—"}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700", whiteSpace: "nowrap" }}>View →</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: `0.5px solid #e8dcc8`, flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontFamily: ff, fontSize: "13px", color: "#8a7050", margin: 0 }}>Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} of {total} members</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnOutline, padding: "7px 16px", fontSize: "13px", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...btnOutline, padding: "7px 16px", fontSize: "13px", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── DETAIL VIEW ──
  if (view === "detail") return (
    <div>
      <button style={{ ...btnOutline, marginBottom: "24px" }} onClick={() => setView("list")}>← Back to Members</button>

      {detailLoading || !selected ? (
        <p style={{ fontFamily: ff, color: GOLD }}>Loading...</p>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", paddingBottom: "24px", borderBottom: `1px solid ${GOLD_LIGHT}`, flexWrap: "wrap" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "22px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{selected.member.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: ff, fontSize: "24px", color: BLACK, fontWeight: "700", margin: "0 0 8px" }}>{selected.member.name}</h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Badge label={tierLabel(selected.member.tier)} {...tierColour(selected.member.tier)} />
                <Badge label={titleCase(selected.member.account_status)} {...statusColour(selected.member.account_status)} />
                {selected.member.referral_code && <Badge label={selected.member.referral_code} bg="#F5E6C8" color="#5C3D08" />}
              </div>
            </div>
            <button style={btnGold} onClick={() => setShowEditModal(true)}>Edit Profile</button>
          </div>

          <SectionTitle>Contact Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <InfoCard label="Email" value={selected.member.email} />
            <InfoCard label="Primary Phone" value={[selected.member.country_code, selected.member.primary_phone].filter(Boolean).join(" ") || "—"} />
            <InfoCard label="Secondary Phone" value={selected.member.secondary_phone} />
          </div>

          <SectionTitle>Membership</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <InfoCard label="Tier" value={tierLabel(selected.member.tier)} />
            <InfoCard label="Status" value={titleCase(selected.member.account_status)} />
            <InfoCard label="Upline" value={selected.member.upline_name ? `${selected.member.upline_name} (${tierLabel(selected.member.upline_tier)})` : "—"} />
            <InfoCard label="Onboarding Type" value={titleCase(selected.member.onboarding_type)} />
            <InfoCard label="Date Added" value={selected.member.onboarding_date ? new Date(selected.member.onboarding_date).toLocaleDateString("en-SG") : "—"} />
            <InfoCard label="Package Paid" value={selected.member.package_price_paid ? `SGD ${parseFloat(selected.member.package_price_paid).toLocaleString()}` : "—"} />
            <InfoCard label="Payment Reference" value={selected.member.payment_reference} />
            <InfoCard label="Upline Visibility" value={`${selected.member.upline_visibility_levels || 1} level(s)`} />
          </div>

          <SectionTitle>Eligibility</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <InfoCard label="Commission" value={selected.member.commission_eligible ? "Yes" : "No"} highlight={selected.member.commission_eligible ? "#0A3D0A" : undefined} />
            <InfoCard label="FOC" value={selected.member.foc_eligible ? "Yes" : "No"} highlight={selected.member.foc_eligible ? "#0A3D0A" : undefined} />
            <InfoCard label="VIP" value={selected.member.is_vip ? "Yes" : "No"} />
            <InfoCard label="Under Review" value={selected.member.is_under_review ? "Yes" : "No"} highlight={selected.member.is_under_review ? "#991B1B" : undefined} />
          </div>

          {selected.member.internal_notes && (
            <>
              <SectionTitle>Internal Notes</SectionTitle>
              <div style={{ background: "#FFFBF0", border: `0.5px solid ${GOLD_LIGHT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 8px 8px 0", padding: "14px 18px" }}>
                <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, margin: 0, lineHeight: "1.7" }}>{selected.member.internal_notes}</p>
              </div>
            </>
          )}

          {selected.downline?.length > 0 && (
            <>
              <SectionTitle>Direct Downline ({selected.downline.length})</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selected.downline.map(d => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${GOLD_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "13px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{d.name?.charAt(0).toUpperCase()}</div>
                    <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, fontWeight: "700", margin: 0, flex: 1 }}>{d.name}</p>
                    <Badge label={tierLabel(d.tier)} {...tierColour(d.tier)} />
                    <Badge label={titleCase(d.account_status)} {...statusColour(d.account_status)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {selected.audit?.length > 0 && (
            <>
              <SectionTitle>Audit Log</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selected.audit.slice(0, 20).map(a => (
                  <div key={a.id} style={{ display: "flex", gap: "16px", padding: "10px 16px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: 0, flexShrink: 0, whiteSpace: "nowrap" }}>{new Date(a.created_at).toLocaleString("en-SG")}</p>
                    <p style={{ fontFamily: ff, fontSize: "13px", color: BLACK, margin: 0, flex: 1 }}><strong>{titleCase(a.field_changed)}</strong>{a.old_value ? `: ${a.old_value} → ${a.new_value}` : ""}</p>
                    <p style={{ fontFamily: ff, fontSize: "12px", color: GOLD, margin: 0, flexShrink: 0 }}>{a.changed_by_name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showEditModal && selected && (
        <div onClick={() => setShowEditModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFFDF7", border: `1px solid ${GOLD_LIGHT}`, borderTop: `4px solid ${GOLD}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "440px" }}>
            <p style={{ fontFamily: ff, fontSize: "18px", fontWeight: "700", color: BLACK, margin: "0 0 4px" }}>Edit Profile</p>
            <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: "0 0 20px" }}>{selected.member.name}</p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Field</label>
              <select value={editField} onChange={e => { setEditField(e.target.value); setEditValue(String(selected.member[e.target.value] ?? "")) }} style={inputStyle}>
                <option value="">Select field...</option>
                {EDITABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>New Value</label>
              <input value={editValue} onChange={e => setEditValue(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Reason for Change</label>
              <input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="e.g. Corrected per payment record" style={inputStyle} />
            </div>
            <div style={{ background: "#FDF6E3", borderLeft: `2px solid ${GOLD_LIGHT}`, padding: "10px 12px", borderRadius: "0 6px 6px 0", marginBottom: "20px", fontFamily: ff, fontSize: "12px", color: "#8a7050", lineHeight: "1.6" }}>
              This change will be logged with your name and timestamp. It cannot be undone.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowEditModal(false)} style={btnOutline}>Cancel</button>
              <button onClick={saveEdit} disabled={saving || !editField} style={{ ...btnGold, flex: 1, opacity: saving || !editField ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Change"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── CREATE VIEW ──
  if (view === "create") {
    const selectedPkg = packages.find(p => p.id == createForm.package_id)

    return (
      <div>
        <button style={{ ...btnOutline, marginBottom: "24px" }} onClick={() => setView("list")}>← Back to Members</button>
        <div style={{ marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
          <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: ff, fontSize: "24px", color: BLACK, fontWeight: "700", margin: 0 }}>Add Member</h1>
        </div>

        {createError && <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createError}</div>}
        {createSuccess && <div style={{ background: "#D4EDD4", border: "1px solid #86EFAC", color: "#0A3D0A", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createSuccess}</div>}

        <SectionTitle>Personal Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Sarah Tan" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value.trim().toLowerCase()})} placeholder="e.g. sarah@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Primary Phone *</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={createForm.country_code} onChange={e => setCreateForm({...createForm, country_code: e.target.value})} style={{ ...inputStyle, width: "120px", flex: "none" }}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input value={createForm.primary_phone} onChange={e => setCreateForm({...createForm, primary_phone: e.target.value})} placeholder="XXXX XXXX" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Secondary Phone</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={createForm.country_code} onChange={e => setCreateForm({...createForm, country_code: e.target.value})} style={{ ...inputStyle, width: "120px", flex: "none" }}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input value={createForm.secondary_phone} onChange={e => setCreateForm({...createForm, secondary_phone: e.target.value})} placeholder="Optional" style={inputStyle} />
            </div>
          </div>
        </div>

        <SectionTitle>Membership Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
          <div>
            <label style={labelStyle}>Tier *</label>
            <select value={createForm.tier} onChange={e => {
              const pkg = packages.find(p => p.tier_id === e.target.value)
              setCreateForm({...createForm, tier: e.target.value, role: e.target.value, package_id: pkg?.id || ""})
            }} style={inputStyle}>
              {TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Package</label>
            <select value={createForm.package_id} onChange={e => setCreateForm({...createForm, package_id: e.target.value})} style={inputStyle}>
              <option value="">Select package...</option>
              {packages.filter(p => p.tier_id === createForm.tier).map(p => (
                <option key={p.id} value={p.id}>{p.english_name} — SGD {parseFloat(p.price).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Upline Member ID</label>
            <input value={createForm.upline_user_id} onChange={e => setCreateForm({...createForm, upline_user_id: e.target.value})} placeholder="Enter upline's user ID" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Onboarding Type</label>
            <select value={createForm.onboarding_type} onChange={e => setCreateForm({...createForm, onboarding_type: e.target.value})} style={inputStyle}>
              {ONBOARDING_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date Added</label>
            <input type="date" value={createForm.onboarding_date} onChange={e => setCreateForm({...createForm, onboarding_date: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <SectionTitle>Payment Details</SectionTitle>
        {selectedPkg && (
          <div style={{ background: "#FFFBF0", border: `0.5px solid ${GOLD_LIGHT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: "16px", fontFamily: ff, fontSize: "14px", color: BLACK }}>
            Package total: <strong>SGD {parseFloat(selectedPkg.price).toLocaleString()}</strong> — Base credits: <strong>{selectedPkg.base_credits}</strong> — FOC credits: <strong>{selectedPkg.foc_credits}</strong>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "8px" }}>
          <div>
            <label style={labelStyle}>Payment Status</label>
            <select value={createForm.payment_status} onChange={e => setCreateForm({...createForm, payment_status: e.target.value})} style={inputStyle}>
              <option value="full">Full Payment</option>
              <option value="partial">Partial Payment</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Amount Paid (SGD) {createForm.payment_status === "partial" ? "— First Instalment" : ""}</label>
            <input type="number" value={createForm.amount_paid} onChange={e => setCreateForm({...createForm, amount_paid: e.target.value})} placeholder={selectedPkg ? `${parseFloat(selectedPkg.price).toLocaleString()}` : "0.00"} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Payment Method</label>
            <select value={createForm.payment_method} onChange={e => setCreateForm({...createForm, payment_method: e.target.value})} style={inputStyle}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Payment Reference</label>
            <input value={createForm.payment_reference} onChange={e => setCreateForm({...createForm, payment_reference: e.target.value})} placeholder="e.g. Bank transfer ref / receipt no." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Payment Date</label>
            <input type="date" value={createForm.payment_date} onChange={e => setCreateForm({...createForm, payment_date: e.target.value})} style={inputStyle} />
          </div>
        </div>

        {createForm.payment_status === "partial" && (
          <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontFamily: ff, fontSize: "13px", color: "#92400E" }}>
            ⚠ Partial payment recorded. Stock will NOT be released until full payment is confirmed. Additional instalments can be added after the member is created.
          </div>
        )}

        <SectionTitle>Opening Credits (Historical Port-Over)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "8px" }}>
          <div>
            <label style={labelStyle}>Base Credits</label>
            <input type="number" value={createForm.base_credits} onChange={e => setCreateForm({...createForm, base_credits: e.target.value})} placeholder={selectedPkg?.base_credits || "0"} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>FOC Credits</label>
            <input type="number" value={createForm.foc_credits} onChange={e => setCreateForm({...createForm, foc_credits: e.target.value})} placeholder={selectedPkg?.foc_credits || "0"} style={inputStyle} />
          </div>
        </div>

        <SectionTitle>Notes</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          <div>
            <label style={labelStyle}>Onboarding Notes</label>
            <textarea value={createForm.onboarding_notes} onChange={e => setCreateForm({...createForm, onboarding_notes: e.target.value})} placeholder="e.g. Ported over from manual records June 2026" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>Internal Notes (Superadmin Only)</label>
            <textarea value={createForm.internal_notes} onChange={e => setCreateForm({...createForm, internal_notes: e.target.value})} placeholder="e.g. Referred by Raymond Low" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button style={btnOutline} onClick={() => setView("list")}>Cancel</button>
          <button style={{ ...btnGold, opacity: saving ? 0.6 : 1 }} onClick={createMember} disabled={saving}>{saving ? "Creating..." : "Create Member"}</button>
        </div>
      </div>
    )
  }
}
