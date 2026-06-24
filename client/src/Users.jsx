import { useState, useEffect } from "react"

const GOLD = "#A87C2A"
const GOLD_LIGHT = "#D4B86A"
const WHITE = "#FFFFFF"
const BLACK = "#1A1A1A"
const CREAM = "#F7F0E3"
const API = "https://tmbeauty-hub-production.up.railway.app"

const ff = "'Playfair Display', serif"

const TIERS = ["manager", "director", "ceo", "branch_office"]
const STATUSES = ["pending_setup", "active", "suspended", "deactivated", "ghost"]
const COUNTRIES = [
  { code: "+65", label: "SG +65" },
  { code: "+60", label: "MY +60" },
  { code: "+86", label: "CN +86" },
  { code: "+1",  label: "US +1"  },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+852",label: "HK +852"},
  { code: "+886",label: "TW +886"},
]

function tierLabel(t) {
  if (t === "branch_office") return "Branch Office"
  if (t === "ceo") return "CEO"
  if (t === "director") return "Director"
  if (t === "manager") return "Manager"
  return t || "—"
}

function tierColour(t) {
  if (t === "branch_office") return { bg: "#D6E8F7", color: "#0C2E52" }
  if (t === "ceo") return { bg: "#D4EDD4", color: "#0A3D0A" }
  if (t === "director") return { bg: "#EDD4EA", color: "#3D0A38" }
  if (t === "manager") return { bg: "#E8E8E8", color: "#1A1A1A" }
  return { bg: "#F5F5F5", color: "#555" }
}

function statusColour(s) {
  if (s === "active") return { bg: "#D4EDD4", color: "#0A3D0A" }
  if (s === "pending_setup") return { bg: "#FEF3C7", color: "#92400E" }
  if (s === "suspended") return { bg: "#FEE2E2", color: "#991B1B" }
  if (s === "deactivated") return { bg: "#E5E7EB", color: "#374151" }
  if (s === "ghost") return { bg: "#EDE9FE", color: "#5B21B6" }
  return { bg: "#F5F5F5", color: "#555" }
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: `1px solid ${GOLD_LIGHT}`, borderBottom: `2px solid ${GOLD}`,
  background: "#FDFAF2", fontFamily: ff,
  fontSize: "15px", color: BLACK, outline: "none", boxSizing: "border-box",
  borderRadius: "4px 4px 0 0"
}

const labelStyle = {
  fontFamily: ff, fontSize: "11px", color: GOLD,
  display: "block", marginBottom: "8px",
  letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700"
}

const btnGold = {
  padding: "11px 24px", background: `linear-gradient(135deg, #C9A84C, ${GOLD})`,
  color: WHITE, border: "none", borderRadius: "8px",
  fontFamily: ff, fontSize: "14px", fontWeight: "700",
  cursor: "pointer", whiteSpace: "nowrap"
}

const btnOutline = {
  padding: "11px 24px", background: "transparent",
  color: GOLD, border: `1px solid ${GOLD}`, borderRadius: "8px",
  fontFamily: ff, fontSize: "14px", fontWeight: "700",
  cursor: "pointer", whiteSpace: "nowrap"
}

function Badge({ label, bg, color }) {
  return <span style={{ display: "inline-block", padding: "5px 12px", background: bg, color, fontFamily: ff, fontSize: "12px", fontWeight: "700", borderRadius: "6px", whiteSpace: "nowrap" }}>{label}</span>
}

export default function Users() {
  const [view, setView] = useState("list") // list | detail | create
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")
  const [editNote, setEditNote] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "", email: "", tier: "manager", role: "manager",
    country_code: "+65", primary_phone: "", secondary_phone: "",
    upline_user_id: "", onboarding_type: "manual_historical",
    package_price_paid: "", payment_reference: "",
    onboarding_date: "", onboarding_notes: "",
    base_credits: "", foc_credits: "", internal_notes: ""
  })
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filterTier) params.set("tier", filterTier)
      if (filterStatus) params.set("status", filterStatus)
      const r = await fetch(`${API}/api/admin/members?${params}`, { headers })
      const d = await r.json()
      setMembers(d.members || [])
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
      const r = await fetch(`${API}/api/admin/members`, {
        method: "POST", headers,
        body: JSON.stringify({ ...createForm, role: createForm.tier })
      })
      const d = await r.json()
      if (!r.ok) { setCreateError(d.error || "Failed to create member"); setSaving(false); return }
      setCreateSuccess(`Member created. Referral code: ${d.referral_code}`)
      fetchMembers()
      setTimeout(() => { setView("list"); setCreateSuccess("") }, 3000)
    } catch(e) { setCreateError("Server error") }
    setSaving(false)
  }

  function openEdit(field, value) {
    setEditField(field)
    setEditValue(String(value ?? ""))
    setEditNote("")
    setShowEditModal(true)
  }

  const EDITABLE_FIELDS = [
    { key: "tier", label: "Tier" },
    { key: "account_status", label: "Account Status" },
    { key: "country_code", label: "Country Code" },
    { key: "primary_phone", label: "Primary Phone" },
    { key: "secondary_phone", label: "Secondary Phone" },
    { key: "upline_visibility_levels", label: "Upline Visibility Levels" },
    { key: "commission_eligible", label: "Commission Eligible" },
    { key: "foc_eligible", label: "FOC Eligible" },
    { key: "is_vip", label: "VIP" },
    { key: "is_under_review", label: "Under Review" },
    { key: "internal_notes", label: "Internal Notes" },
    { key: "onboarding_notes", label: "Onboarding Notes" },
    { key: "payment_reference", label: "Payment Reference" },
  ]

  // ── LIST VIEW ──
  if (view === "list") return (
    <div>
      <style>{`
        .users-table { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0; }
        @media (max-width: 768px) { .users-table { grid-template-columns: 1fr 1fr auto; } .col-email { display: none !important; } .col-upline { display: none !important; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
        <div>
          <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
          <h1 style={{ fontFamily: ff, fontSize: "28px", color: BLACK, fontWeight: "700", margin: "0 0 4px" }}>Members</h1>
          <p style={{ fontFamily: ff, fontSize: "15px", color: "#666", margin: 0 }}>{members.length} members registered</p>
        </div>
        <button style={btnGold} onClick={() => setView("create")}>+ Add Member</button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Search name, email, referral code..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchMembers()} style={{ ...inputStyle, flex: 1, minWidth: "200px" }} />
        <select value={filterTier} onChange={e => { setFilterTier(e.target.value); fetchMembers() }} style={{ ...inputStyle, width: "160px", flex: "none" }}>
          <option value="">All Tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); fetchMembers() }} style={{ ...inputStyle, width: "160px", flex: "none" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        <button style={btnOutline} onClick={fetchMembers}>Search</button>
      </div>

      {loading ? (
        <p style={{ fontFamily: ff, color: GOLD, padding: "24px" }}>Loading members...</p>
      ) : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px", background: WHITE, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "12px" }}>
          <p style={{ fontFamily: ff, fontSize: "17px", color: "#999", margin: 0 }}>No members found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="users-table" style={{ padding: "8px 20px" }}>
            {["Name", "Tier", "Status", "Upline", ""].map((h, i) => (
              <p key={i} style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", margin: 0, ...(i === 1 ? {} : i === 3 ? { className: "col-upline" } : {}) }}>{h}</p>
            ))}
          </div>
          {members.map(m => {
            const tc = tierColour(m.tier)
            const sc = statusColour(m.account_status)
            return (
              <div key={m.id} className="users-table" style={{ padding: "14px 20px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: "10px", alignItems: "center", cursor: "pointer" }} onClick={() => { fetchDetail(m.id); setView("detail") }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "15px", fontWeight: "700", color: GOLD, flexShrink: 0, background: "#FDF6E3" }}>{m.name?.charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: ff, fontSize: "15px", color: BLACK, fontWeight: "700", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</p>
                    <p className="col-email" style={{ fontFamily: ff, fontSize: "12px", color: "#6b5d4e", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.email}</p>
                  </div>
                </div>
                <Badge label={tierLabel(m.tier)} bg={tc.bg} color={tc.color} />
                <Badge label={m.account_status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "—"} bg={sc.bg} color={sc.color} />
                <p className="col-upline" style={{ fontFamily: ff, fontSize: "13px", color: "#6b5d4e", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.upline_name || "—"}</p>
                <span style={{ fontFamily: ff, fontSize: "13px", color: GOLD, fontWeight: "700" }}>View →</span>
              </div>
            )
          })}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "22px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{selected.member.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h1 style={{ fontFamily: ff, fontSize: "24px", color: BLACK, fontWeight: "700", margin: "0 0 6px" }}>{selected.member.name}</h1>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Badge label={tierLabel(selected.member.tier)} {...tierColour(selected.member.tier)} />
                  <Badge label={selected.member.account_status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "—"} {...statusColour(selected.member.account_status)} />
                  {selected.member.referral_code && <Badge label={selected.member.referral_code} bg="#F5E6C8" color="#5C3D08" />}
                </div>
              </div>
            </div>
            <button style={btnGold} onClick={() => setShowEditModal(true)}>Edit Profile</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" }}>
            {[
              { label: "Email", value: selected.member.email },
              { label: "Primary Phone", value: `${selected.member.country_code || ""} ${selected.member.primary_phone || "—"}` },
              { label: "Secondary Phone", value: selected.member.secondary_phone || "—" },
              { label: "Upline", value: selected.member.upline_name ? `${selected.member.upline_name} (${tierLabel(selected.member.upline_tier)})` : "—" },
              { label: "Onboarding Type", value: selected.member.onboarding_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "—" },
              { label: "Package Paid", value: selected.member.package_price_paid ? `SGD ${parseFloat(selected.member.package_price_paid).toLocaleString()}` : "—" },
              { label: "Payment Reference", value: selected.member.payment_reference || "—" },
              { label: "Onboarding Date", value: selected.member.onboarding_date ? new Date(selected.member.onboarding_date).toLocaleDateString("en-SG") : "—" },
              { label: "Commission Eligible", value: selected.member.commission_eligible ? "Yes" : "No" },
              { label: "FOC Eligible", value: selected.member.foc_eligible ? "Yes" : "No" },
              { label: "VIP", value: selected.member.is_vip ? "Yes" : "No" },
              { label: "Upline Visibility", value: `${selected.member.upline_visibility_levels || 1} level(s)` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderTop: `2px solid ${GOLD}`, borderRadius: "8px", padding: "16px 18px" }}>
                <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px", fontWeight: "700" }}>{label}</p>
                <p style={{ fontFamily: ff, fontSize: "15px", color: BLACK, margin: 0, fontWeight: "600" }}>{value}</p>
              </div>
            ))}
          </div>

          {selected.member.internal_notes && (
            <div style={{ background: "#FFFBF0", border: `0.5px solid ${GOLD_LIGHT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: "8px", padding: "16px 18px", marginBottom: "28px" }}>
              <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px", fontWeight: "700" }}>Internal Notes</p>
              <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, margin: 0, lineHeight: "1.6" }}>{selected.member.internal_notes}</p>
            </div>
          )}

          {selected.downline?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontFamily: ff, fontSize: "13px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 14px" }}>Direct Downline ({selected.downline.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selected.downline.map(d => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, fontSize: "13px", fontWeight: "700", color: GOLD, background: "#FDF6E3", flexShrink: 0 }}>{d.name?.charAt(0).toUpperCase()}</div>
                    <p style={{ fontFamily: ff, fontSize: "14px", color: BLACK, fontWeight: "600", margin: 0, flex: 1 }}>{d.name}</p>
                    <Badge label={tierLabel(d.tier)} {...tierColour(d.tier)} />
                    <Badge label={d.account_status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "—"} {...statusColour(d.account_status)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.audit?.length > 0 && (
            <div>
              <p style={{ fontFamily: ff, fontSize: "13px", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", fontWeight: "700", margin: "0 0 14px" }}>Audit Log</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selected.audit.slice(0, 10).map(a => (
                  <div key={a.id} style={{ padding: "10px 16px", background: WHITE, border: `0.5px solid ${GOLD_LIGHT}`, borderRadius: "8px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <p style={{ fontFamily: ff, fontSize: "12px", color: "#8a7050", margin: 0, flexShrink: 0 }}>{new Date(a.created_at).toLocaleString("en-SG")}</p>
                    <p style={{ fontFamily: ff, fontSize: "13px", color: BLACK, margin: 0, flex: 1 }}><strong>{a.field_changed.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</strong>: {a.old_value || "—"} → {a.new_value}</p>
                    <p style={{ fontFamily: ff, fontSize: "12px", color: GOLD, margin: 0 }}>{a.changed_by_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showEditModal && (
        <div onClick={() => setShowEditModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFFDF7", border: `1px solid ${GOLD_LIGHT}`, borderTop: `4px solid ${GOLD}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "440px", fontFamily: ff }}>
            <p style={{ fontSize: "18px", fontWeight: "700", color: BLACK, margin: "0 0 4px" }}>Edit Profile</p>
            <p style={{ fontSize: "12px", color: "#8a7050", margin: "0 0 20px" }}>{selected?.member?.name}</p>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Field</label>
              <select value={editField} onChange={e => { setEditField(e.target.value); setEditValue(String(selected?.member?.[e.target.value] ?? "")) }} style={inputStyle}>
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
              <input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="e.g. Corrected tier per payment record" style={inputStyle} />
            </div>
            <div style={{ background: "#FDF6E3", borderLeft: `2px solid ${GOLD_LIGHT}`, padding: "10px 12px", borderRadius: "0 6px 6px 0", marginBottom: "20px", fontSize: "12px", color: "#8a7050", lineHeight: "1.6", fontFamily: ff }}>
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
  if (view === "create") return (
    <div>
      <button style={{ ...btnOutline, marginBottom: "24px" }} onClick={() => setView("list")}>← Back to Members</button>

      <div style={{ marginBottom: "28px", borderBottom: `1px solid ${GOLD_LIGHT}`, paddingBottom: "24px" }}>
        <p style={{ fontFamily: ff, fontSize: "11px", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px" }}>Superadmin</p>
        <h1 style={{ fontFamily: ff, fontSize: "24px", color: BLACK, fontWeight: "700", margin: 0 }}>Add Member</h1>
      </div>

      {createError && <div style={{ background: "#FFF0F0", border: "1px solid #E8AAAA", color: "#8B0000", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createError}</div>}
      {createSuccess && <div style={{ background: "#D4EDD4", border: "1px solid #86EFAC", color: "#0A3D0A", padding: "12px 16px", marginBottom: "20px", fontFamily: ff, fontSize: "14px", borderRadius: "6px" }}>{createSuccess}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Sarah Tan" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value.trim().toLowerCase()})} placeholder="e.g. sarah@email.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tier *</label>
          <select value={createForm.tier} onChange={e => setCreateForm({...createForm, tier: e.target.value, role: e.target.value})} style={inputStyle}>
            {TIERS.map(t => <option key={t} value={t}>{tierLabel(t)}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Primary Phone *</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select value={createForm.country_code} onChange={e => setCreateForm({...createForm, country_code: e.target.value})} style={{ ...inputStyle, width: "110px", flex: "none" }}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <input value={createForm.primary_phone} onChange={e => setCreateForm({...createForm, primary_phone: e.target.value})} placeholder="XXXX XXXX" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Secondary Phone</label>
          <input value={createForm.secondary_phone} onChange={e => setCreateForm({...createForm, secondary_phone: e.target.value})} placeholder="Optional" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Upline Member ID</label>
          <input value={createForm.upline_user_id} onChange={e => setCreateForm({...createForm, upline_user_id: e.target.value})} placeholder="Enter upline's user ID" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Onboarding Type</label>
          <select value={createForm.onboarding_type} onChange={e => setCreateForm({...createForm, onboarding_type: e.target.value})} style={inputStyle}>
            <option value="manual_historical">Manual Historical (Port Over)</option>
            <option value="superadmin_direct">Superadmin Direct</option>
            <option value="stripe">Stripe Payment</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Package Price Paid (SGD)</label>
          <input type="number" value={createForm.package_price_paid} onChange={e => setCreateForm({...createForm, package_price_paid: e.target.value})} placeholder="e.g. 2268" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Payment Reference</label>
          <input value={createForm.payment_reference} onChange={e => setCreateForm({...createForm, payment_reference: e.target.value})} placeholder="e.g. Bank transfer ref / receipt no." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Onboarding Date</label>
          <input type="date" value={createForm.onboarding_date} onChange={e => setCreateForm({...createForm, onboarding_date: e.target.value})} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Opening Base Credits</label>
          <input type="number" value={createForm.base_credits} onChange={e => setCreateForm({...createForm, base_credits: e.target.value})} placeholder="e.g. 10" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Opening FOC Credits</label>
          <input type="number" value={createForm.foc_credits} onChange={e => setCreateForm({...createForm, foc_credits: e.target.value})} placeholder="e.g. 10" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <label style={labelStyle}>Onboarding Notes</label>
        <textarea value={createForm.onboarding_notes} onChange={e => setCreateForm({...createForm, onboarding_notes: e.target.value})} placeholder="e.g. Ported over from manual records June 2026" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div style={{ marginBottom: "28px" }}>
        <label style={labelStyle}>Internal Notes (Superadmin Only)</label>
        <textarea value={createForm.internal_notes} onChange={e => setCreateForm({...createForm, internal_notes: e.target.value})} placeholder="e.g. Referred by Raymond Low, special arrangement" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button style={btnOutline} onClick={() => setView("list")}>Cancel</button>
        <button style={{ ...btnGold, opacity: saving ? 0.6 : 1 }} onClick={createMember} disabled={saving}>{saving ? "Creating..." : "Create Member"}</button>
      </div>
    </div>
  )
}
