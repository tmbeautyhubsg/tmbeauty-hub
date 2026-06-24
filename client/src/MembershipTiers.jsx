import { useState, useEffect } from "react"

const API = "https://tmbeauty-hub-production.up.railway.app"
const gold = "#A87C2A"
const lightGold = "#D4B86A"
const cardBg = "#FFFDF7"
const black = "#1A1A1A"
const muted = "#8a7050"
const ff = "'Playfair Display', serif"

const mockUser = { hasUpline: true, uplineName: "Sarah Tan", uplineRole: "Director" }

const iStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${lightGold}`, borderBottom: `2px solid ${gold}`, background: "#FDFAF2", fontFamily: ff, fontSize: "14px", color: black, outline: "none", boxSizing: "border-box", borderRadius: "4px 4px 0 0" }
const lStyle = { fontSize: "11px", color: gold, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: "6px", fontFamily: ff, fontWeight: "700" }

export default function MembershipTiers({ isSuperAdmin = false }) {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(null)
  const [step, setStep] = useState("confirm")
  const [editingTier, setEditingTier] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editNote, setEditNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => { fetchTiers() }, [])

  async function fetchTiers() {
    try {
      const r = await fetch(`${API}/api/packages`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      const data = await r.json()
      setTiers((data.packages || []).map(p => ({
        id: p.tier_id, dbId: p.id,
        chineseName: p.chinese_name, englishName: p.english_name,
        price: parseFloat(p.price),
        baseCredits: p.base_credits, focCredits: p.foc_credits,
        replenishmentPrice: parseFloat(p.replenishment_price),
        closingFee: parseFloat(p.closing_fee),
        upgradeFee: p.upgrade_fee ? parseFloat(p.upgrade_fee) : null,
        upgradeTarget: p.upgrade_target || null,
      })))
      setLoading(false)
    } catch(e) { setLoading(false) }
  }

  function openEdit(tier) {
    setEditingTier(tier)
    setEditForm({
      price: String(tier.price),
      base_credits: String(tier.baseCredits),
      foc_credits: String(tier.focCredits),
      replenishment_price: String(tier.replenishmentPrice),
      closing_fee: String(tier.closingFee),
      upgrade_fee: tier.upgradeFee ? String(tier.upgradeFee) : "",
      upgrade_target: tier.upgradeTarget || "",
      chinese_name: tier.chineseName,
      english_name: tier.englishName,
    })
    setEditNote(""); setEditError("")
  }

  async function handleSaveEdit() {
    if (!editNote.trim()) { setEditError("Reason for change is required"); return }
    setSaving(true); setEditError("")
    try {
      const original = {
        price: String(editingTier.price), base_credits: String(editingTier.baseCredits),
        foc_credits: String(editingTier.focCredits), replenishment_price: String(editingTier.replenishmentPrice),
        closing_fee: String(editingTier.closingFee), upgrade_fee: editingTier.upgradeFee ? String(editingTier.upgradeFee) : "",
        upgrade_target: editingTier.upgradeTarget || "", chinese_name: editingTier.chineseName, english_name: editingTier.englishName,
      }
      const changed = Object.keys(editForm).filter(k => editForm[k] !== original[k])
      for (const field of changed) {
        await fetch(`${API}/api/admin/packages/${editingTier.dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ field, value: editForm[field], change_note: editNote })
        })
      }
      await fetchTiers()
      setEditingTier(null)
    } catch(e) { setEditError("Failed to save. Please try again.") }
    setSaving(false)
  }

  const handleRequest = (tier) => { setSelectedTier(tier); setStep(mockUser.hasUpline ? "confirm" : "no_upline") }
  const handleConfirm = () => setStep("success")
  const handleClose = () => { setSelectedTier(null); setStep("confirm") }

  if (loading) return <div style={{ fontFamily: ff, textAlign: "center", padding: "3rem", color: gold }}>Loading packages...</div>

  return (
    <div style={{ fontFamily: ff }}>
      <style>{`
        .mt-card { background: ${cardBg}; border: 0.5px solid ${lightGold}; border-top: 3px solid ${gold}; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .mt-header { padding: 14px 16px; border-bottom: 0.5px solid #e8dcc8; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .mt-name-block {}
        .mt-chinese { font-size: 11px; color: ${gold}; letter-spacing: 2px; font-family: ${ff}; }
        .mt-english { font-size: 18px; font-weight: 700; color: ${black}; font-family: ${ff}; margin: 4px 0 0; }
        .mt-price { font-size: 20px; font-weight: 700; color: ${gold}; font-family: ${ff}; white-space: nowrap; }
        .mt-price-label { font-size: 10px; color: ${muted}; font-family: ${ff}; text-align: right; }
        .mt-stats { display: grid; grid-template-columns: repeat(5, 1fr); border-bottom: 0.5px solid #e8dcc8; }
        .mt-stat { padding: 10px 8px; border-right: 0.5px solid #e8dcc8; text-align: center; }
        .mt-stat:last-child { border-right: none; }
        .mt-sl { font-size: 10px; color: ${muted}; font-family: ${ff}; margin-bottom: 4px; }
        .mt-sv { font-size: 13px; font-weight: 600; color: ${black}; font-family: ${ff}; }
        .mt-footer { padding: 12px 16px; display: flex; justify-content: flex-end; }
        .mt-btn { padding: 9px 20px; border-radius: 8px; font-family: ${ff}; font-size: 13px; font-weight: 600; cursor: pointer; border: none; white-space: nowrap; }
        .mt-btn-gold { background: linear-gradient(135deg, #C9A84C, ${gold}); color: #fff; }
        .mt-btn-dark { background: #1A1A1A; color: #fff; }
        @media (max-width: 768px) {
          .mt-stats { grid-template-columns: repeat(2, 1fr); }
          .mt-stat { border-bottom: 0.5px solid #e8dcc8; }
          .mt-stat:nth-child(2n) { border-right: none; }
          .mt-stat:nth-last-child(-n+1) { border-bottom: none; }
          .mt-stat:nth-last-child(-n+2) { border-bottom: none; }
          .mt-footer { justify-content: stretch; }
          .mt-btn { width: 100%; text-align: center; }
          select, input { max-width: 100% !important; box-sizing: border-box !important; }
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "24px", fontWeight: "700", color: black, marginBottom: "4px", fontFamily: ff }}>Membership Tiers</div>
        <div style={{ fontSize: "13px", color: muted, fontFamily: ff }}>Entry package · Full payment · Stock released upon upline confirmation</div>
      </div>

      {tiers.map(tier => (
        <div key={tier.id} className="mt-card">
          <div className="mt-header">
            <div className="mt-name-block">
              <div className="mt-chinese">{tier.chineseName}</div>
              <div className="mt-english">{tier.englishName}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mt-price">SGD {tier.price.toLocaleString()}</div>
              <div className="mt-price-label">One-time entry</div>
            </div>
          </div>

          <div className="mt-stats">
            <div className="mt-stat"><div className="mt-sl">Base credits</div><div className="mt-sv">{tier.baseCredits}</div></div>
            <div className="mt-stat"><div className="mt-sl">FOC credits</div><div className="mt-sv" style={{ color: gold }}>+{tier.focCredits}</div></div>
            <div className="mt-stat"><div className="mt-sl">Replenishment</div><div className="mt-sv">SGD {tier.replenishmentPrice}</div></div>
            <div className="mt-stat"><div className="mt-sl">Closing fee</div><div className="mt-sv">SGD {tier.closingFee}</div></div>
            <div className="mt-stat"><div className="mt-sl">Upgrade fee</div><div className="mt-sv">{tier.upgradeFee ? `SGD ${tier.upgradeFee}` : "—"}</div></div>
          </div>

          <div className="mt-footer">
            {!isSuperAdmin ? (
              <button className="mt-btn mt-btn-gold" onClick={() => handleRequest(tier)}>Request to Join</button>
            ) : (
              <button className="mt-btn mt-btn-dark" onClick={() => openEdit(tier)}>Edit Package</button>
            )}
          </div>
        </div>
      ))}

      {/* Member request modal */}
      {selectedTier && (
        <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${lightGold}`, borderTop: `4px solid ${gold}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "420px", fontFamily: ff }}>
            {step === "no_upline" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: black, marginBottom: "8px" }}>No upline linked</div>
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7", marginBottom: "20px" }}>You need to be linked to an upline before requesting a package.</div>
                <button onClick={handleClose} className="mt-btn" style={{ background: "transparent", border: `0.5px solid ${lightGold}`, color: muted }}>Close</button>
              </div>
            )}
            {step === "confirm" && (
              <>
                <div style={{ fontSize: "18px", fontWeight: "700", color: black, marginBottom: "6px" }}>Request — {selectedTier.englishName}</div>
                <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>{selectedTier.chineseName} · One-time entry package</div>
                <div style={{ border: `0.5px solid ${lightGold}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                  {[["Package amount", `SGD ${selectedTier.price.toLocaleString()}`, true], ["Base credits", selectedTier.baseCredits, false], ["FOC credits", `+${selectedTier.focCredits}`, true], ["Total credits", selectedTier.baseCredits + selectedTier.focCredits, false]].map(([l, v, g]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: muted }}>{l}</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: g ? gold : black }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: `0.5px solid ${lightGold}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                  {[["Request sent to", mockUser.uplineName], ["Upline tier", mockUser.uplineRole]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: muted }}>{l}</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: black }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: muted, lineHeight: "1.6", marginBottom: "20px", padding: "10px 12px", borderLeft: `2px solid ${lightGold}`, borderRadius: "0 6px 6px 0" }}>
                  Stock releases only after full payment is confirmed by your upline.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleClose} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleConfirm} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Confirm Request</button>
                </div>
              </>
            )}
            {step === "success" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>✓</div>
                <div style={{ fontSize: "17px", fontWeight: "700", color: black, marginBottom: "8px" }}>Request sent</div>
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7" }}>Your request for <strong>{selectedTier.englishName}</strong> has been sent to <strong>{mockUser.uplineName}</strong>.<br /><br />You will be notified once payment is confirmed.</div>
                <button onClick={handleClose} style={{ marginTop: "20px", width: "100%", padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal - scrollable */}
      {editingTier && (
        <div onClick={() => setEditingTier(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${lightGold}`, borderTop: `4px solid ${gold}`, borderRadius: "12px", padding: "1.5rem", width: "100%", maxWidth: "480px", fontFamily: ff, margin: "auto" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", color: black, marginBottom: "4px" }}>Edit Package</div>
            <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>{editingTier.chineseName} · {editingTier.englishName}</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Chinese Name", key: "chinese_name", type: "text" },
                { label: "English Name", key: "english_name", type: "text" },
                { label: "Price (SGD)", key: "price", type: "number" },
                { label: "Replenishment (SGD)", key: "replenishment_price", type: "number" },
                { label: "Base Credits", key: "base_credits", type: "number" },
                { label: "FOC Credits", key: "foc_credits", type: "number" },
                { label: "Closing Fee (SGD)", key: "closing_fee", type: "number" },
                { label: "Upgrade Fee (SGD)", key: "upgrade_fee", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={lStyle}>{label}</label>
                  <input type={type} value={editForm[key] || ""} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                    placeholder={type === "number" ? "0" : ""} style={{ ...iStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lStyle}>Upgrade Target Tier</label>
                <select value={editForm.upgrade_target || ""} onChange={e => setEditForm({...editForm, upgrade_target: e.target.value})} style={iStyle}>
                  <option value="">— Not applicable —</option>
                  <option value="director">Director</option>
                  <option value="ceo">CEO</option>
                  <option value="branch_office">Branch Office</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={lStyle}>Reason for Change *</label>
              <input value={editNote} onChange={e => { setEditNote(e.target.value); setEditError("") }}
                placeholder="e.g. Updated per China HQ instruction June 2026" style={iStyle} />
            </div>

            {editError && <p style={{ fontFamily: ff, fontSize: "12px", color: "#991B1B", margin: "0 0 10px" }}>{editError}</p>}

            <div style={{ background: "#FDF6E3", borderLeft: `2px solid ${gold}`, padding: "10px 12px", borderRadius: "0 6px 6px 0", marginBottom: "16px", fontSize: "11px", color: muted, lineHeight: "1.6" }}>
              Only changed fields will be saved. Each change is logged with your name and timestamp. Cannot be undone.
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setEditingTier(null)} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
