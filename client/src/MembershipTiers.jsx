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
    setEditNote("")
    setEditError("")
  }

  async function handleSaveEdit() {
    if (!editNote.trim()) { setEditError("Reason for change is required"); return }
    setSaving(true); setEditError("")
    try {
      // Save each changed field
      const original = {
        price: String(editingTier.price),
        base_credits: String(editingTier.baseCredits),
        foc_credits: String(editingTier.focCredits),
        replenishment_price: String(editingTier.replenishmentPrice),
        closing_fee: String(editingTier.closingFee),
        upgrade_fee: editingTier.upgradeFee ? String(editingTier.upgradeFee) : "",
        upgrade_target: editingTier.upgradeTarget || "",
        chinese_name: editingTier.chineseName,
        english_name: editingTier.englishName,
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

  const slStyle = { fontFamily: ff, fontSize: "11px", color: muted, marginBottom: "5px", whiteSpace: "nowrap" }
  const svStyle = { fontFamily: ff, fontSize: "14px", fontWeight: "600", color: black, whiteSpace: "nowrap" }

  if (loading) return <div style={{ fontFamily: ff, textAlign: "center", padding: "3rem", color: gold }}>Loading packages...</div>

  return (
    <div style={{ fontFamily: ff, background: "transparent", padding: 0 }}>
      <style>{`
        .tier-row { display: flex; align-items: stretch; }
        .tier-left { width: 120px; flex-shrink: 0; padding: 12px 14px; border-right: 0.5px solid #e8dcc8; display: flex; flex-direction: column; justify-content: center; }
        .tier-mid { flex: 1; display: flex; align-items: stretch; }
        .tier-stat { padding: 14px 8px; border-right: 0.5px solid #e8dcc8; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; flex: 1; }
        .tier-stat:last-child { border-right: none; }
        @media (max-width: 768px) {
          .tier-row { flex-direction: column; }
          .tier-left { width: 100%; padding: 14px 16px; border-right: none; border-bottom: 0.5px solid #e8dcc8; }
          .tier-mid { flex-direction: column; }
          .tier-stat { flex-direction: row; justify-content: space-between; padding: 10px 16px; border-right: none; border-bottom: 0.5px solid #e8dcc8; text-align: left; }
          .tier-right { width: 100% !important; padding: 14px 16px !important; border-left: none !important; border-top: 0.5px solid #e8dcc8; }
          .tier-right button { width: 100% !important; }
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "24px", fontWeight: "700", color: black, marginBottom: "4px" }}>Membership Tiers</div>
        <div style={{ fontSize: "13px", color: muted }}>Entry package · Full payment · Stock released upon upline confirmation</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tiers.map(tier => (
          <div key={tier.id} className="tier-row" style={{ background: cardBg, border: `0.5px solid ${lightGold}`, borderTop: `3px solid ${gold}`, borderRadius: "10px", overflow: "hidden", position: "relative", minHeight: "84px" }}>
            <div style={{ position: "absolute", bottom: "-4px", left: "158px", fontSize: "52px", color: lightGold, opacity: 0.1, fontStyle: "italic", pointerEvents: "none", userSelect: "none", lineHeight: 1, fontFamily: ff }}>{tier.chineseName}</div>

            <div className="tier-left">
              <div style={{ fontSize: "11px", color: gold, letterSpacing: "2px", fontFamily: ff }}>{tier.chineseName}</div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: black, fontFamily: ff, lineHeight: 1.2, margin: "6px 0" }}>{tier.englishName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "20px", height: "0.5px", background: lightGold }} />
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: gold, flexShrink: 0 }} />
                <div style={{ width: "20px", height: "0.5px", background: lightGold }} />
              </div>
            </div>

            <div className="tier-mid">
              <div className="tier-stat"><div style={slStyle}>Base credits</div><div style={svStyle}>{tier.baseCredits}</div></div>
              <div className="tier-stat"><div style={slStyle}>FOC credits</div><div style={{ ...svStyle, color: gold }}>+{tier.focCredits}</div></div>
              <div className="tier-stat"><div style={slStyle}>Replenishment</div><div style={svStyle}>SGD {tier.replenishmentPrice}</div></div>
              <div className="tier-stat"><div style={slStyle}>Closing fee</div><div style={svStyle}>SGD {tier.closingFee}</div></div>
              <div className="tier-stat"><div style={slStyle}>Upgrade fee</div><div style={svStyle}>{tier.upgradeFee ? `SGD ${tier.upgradeFee}` : "—"}</div></div>
            </div>

            <div className="tier-right" style={{ width: "175px", flexShrink: 0, padding: "14px 20px", borderLeft: `0.5px solid #e8dcc8`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: gold, whiteSpace: "nowrap", fontFamily: ff }}>SGD {tier.price.toLocaleString()}</div>
              <div style={{ fontSize: "10px", color: muted, whiteSpace: "nowrap", fontFamily: ff, marginBottom: "8px" }}>One-time entry</div>
              {!isSuperAdmin ? (
                <button onClick={() => handleRequest(tier)} style={{ width: "135px", height: "36px", background: `linear-gradient(135deg, #C9A84C, ${gold})`, color: "#fff", border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Request to Join</button>
              ) : (
                <button onClick={() => openEdit(tier)} style={{ width: "135px", height: "36px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Edit Package</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Member request modal */}
      {selectedTier && (
        <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${lightGold}`, borderTop: `4px solid ${gold}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "420px", fontFamily: ff }}>
            {step === "no_upline" && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: black, marginBottom: "8px" }}>No upline linked</div>
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7", marginBottom: "20px" }}>You need to be linked to an upline before requesting a package. Please contact your upline or the administrator.</div>
                <button onClick={handleClose} style={{ padding: "10px 24px", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Close</button>
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
                  Stock releases only after full payment is confirmed by your upline. All transactions are timestamped and recorded.
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleClose} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleConfirm} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Confirm Request</button>
                </div>
              </>
            )}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>✓</div>
                <div style={{ fontSize: "17px", fontWeight: "700", color: black, marginBottom: "8px" }}>Request sent</div>
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7" }}>Your request for <strong>{selectedTier.englishName}</strong> has been sent to <strong>{mockUser.uplineName}</strong>.<br /><br />You will be notified once your upline confirms payment and stock is released.</div>
                <button onClick={handleClose} style={{ marginTop: "20px", width: "100%", padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Superadmin full form edit modal */}
      {editingTier && (
        <div onClick={() => setEditingTier(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${lightGold}`, borderTop: `4px solid ${gold}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "520px", fontFamily: ff, margin: "auto" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", color: black, marginBottom: "4px" }}>Edit Package</div>
            <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>{editingTier.chineseName} · {editingTier.englishName}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={lStyle}>Chinese Name</label>
                <input value={editForm.chinese_name || ""} onChange={e => setEditForm({...editForm, chinese_name: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>English Name</label>
                <input value={editForm.english_name || ""} onChange={e => setEditForm({...editForm, english_name: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Price (SGD)</label>
                <input type="number" value={editForm.price || ""} onChange={e => setEditForm({...editForm, price: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Replenishment Price (SGD)</label>
                <input type="number" value={editForm.replenishment_price || ""} onChange={e => setEditForm({...editForm, replenishment_price: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Base Credits</label>
                <input type="number" value={editForm.base_credits || ""} onChange={e => setEditForm({...editForm, base_credits: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>FOC Credits</label>
                <input type="number" value={editForm.foc_credits || ""} onChange={e => setEditForm({...editForm, foc_credits: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Closing Fee (SGD)</label>
                <input type="number" value={editForm.closing_fee || ""} onChange={e => setEditForm({...editForm, closing_fee: e.target.value})} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Upgrade Fee (SGD)</label>
                <input type="number" value={editForm.upgrade_fee || ""} onChange={e => setEditForm({...editForm, upgrade_fee: e.target.value})} placeholder="Leave blank if not applicable" style={iStyle} />
              </div>
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

            <div style={{ marginBottom: "14px" }}>
              <label style={lStyle}>Reason for Change *</label>
              <input value={editNote} onChange={e => { setEditNote(e.target.value); setEditError("") }} placeholder="e.g. Updated per China HQ instruction June 2026" style={iStyle} />
            </div>

            {editError && <p style={{ fontFamily: ff, fontSize: "12px", color: "#991B1B", margin: "0 0 12px" }}>{editError}</p>}

            <div style={{ background: "#FDF6E3", border: `0.5px solid ${lightGold}`, borderLeft: `2px solid ${gold}`, padding: "10px 12px", borderRadius: "0 6px 6px 0", marginBottom: "20px", fontSize: "11px", color: muted, lineHeight: "1.6", fontFamily: ff }}>
              Only changed fields will be saved. Each change is logged with your name, timestamp, old value and new value. Changes cannot be undone — only corrected with a new entry.
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setEditingTier(null)} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
