import { useState, useEffect } from "react";

const API = "https://tmbeauty-hub-production.up.railway.app";

const gold = "#A87C2A";
const lightGold = "#D4B86A";
const cardBg = "#FFFDF7";
const black = "#1A1A1A";
const muted = "#8a7050";

const mockUser = {
  hasUpline: true,
  uplineName: "Sarah Tan",
  uplineRole: "Director",
};

export default function MembershipTiers({ isSuperAdmin = false }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [step, setStep] = useState("confirm");
  const [editingTier, setEditingTier] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/packages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(data => {
        const mapped = (data.packages || []).map(p => ({
          id: p.tier_id,
          dbId: p.id,
          chineseName: p.chinese_name,
          englishName: p.english_name,
          price: parseFloat(p.price),
          baseCredits: p.base_credits,
          focCredits: p.foc_credits,
          replenishmentPrice: parseFloat(p.replenishment_price),
          closingFee: parseFloat(p.closing_fee),
          upgradeFee: p.upgrade_fee ? parseFloat(p.upgrade_fee) : null,
          upgradeTarget: p.upgrade_target,
        }));
        setTiers(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSaveEdit() {
    if (!editingTier || !editField) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/admin/packages/${editingTier.dbId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ field: editField, value: editValue, change_note: editNote })
      });
      const r = await fetch(`${API}/api/packages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await r.json();
      const mapped = (data.packages || []).map(p => ({
        id: p.tier_id, dbId: p.id,
        chineseName: p.chinese_name, englishName: p.english_name,
        price: parseFloat(p.price), baseCredits: p.base_credits,
        focCredits: p.foc_credits, replenishmentPrice: parseFloat(p.replenishment_price),
        closingFee: parseFloat(p.closing_fee),
        upgradeFee: p.upgrade_fee ? parseFloat(p.upgrade_fee) : null,
        upgradeTarget: p.upgrade_target,
      }));
      setTiers(mapped);
      setEditingTier(null); setEditField(""); setEditValue(""); setEditNote("");
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  const handleRequest = (tier) => {
    setSelectedTier(tier);
    setStep(mockUser.hasUpline ? "confirm" : "no_upline");
  };

  const handleConfirm = () => setStep("success");
  const handleClose = () => { setSelectedTier(null); setStep("confirm"); };

  const ff = "'Playfair Display', serif";

  const cellStyle = {
    padding: "0 12px",
    borderRight: `0.5px solid #e8dcc8`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    flex: 1,
  };

  const slStyle = {
    fontFamily: ff,
    fontSize: "11px",
    color: muted,
    marginBottom: "5px",
    whiteSpace: "nowrap",
    height: "16px",
    display: "flex",
    alignItems: "center",
  };

  const svStyle = {
    fontFamily: ff,
    fontSize: "14px",
    fontWeight: "600",
    color: black,
    whiteSpace: "nowrap",
    height: "20px",
    display: "flex",
    alignItems: "center",
  };

  if (loading) return (
    <div style={{ fontFamily: ff, textAlign: "center", padding: "3rem", color: "#A87C2A" }}>
      Loading packages...
    </div>
  );

  return (
    <div style={{ fontFamily: ff, background: "transparent", padding: 0 }}>

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "24px", fontWeight: "700", color: black, marginBottom: "4px", letterSpacing: "1px" }}>
          Membership Tiers
        </div>
        <div style={{ fontSize: "13px", color: muted, letterSpacing: "1px" }}>
          Entry package · Full payment · Stock released upon upline confirmation
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tiers.map((tier) => (
          <div key={tier.id} style={{
            display: "flex",
            alignItems: "stretch",
            background: cardBg,
            border: `0.5px solid ${lightGold}`,
            borderTop: `3px solid ${gold}`,
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
            minHeight: "84px",
          }}>
            {/* Watermark */}
            <div style={{
              position: "absolute",
              bottom: "-4px",
              left: "158px",
              fontSize: "52px",
              color: lightGold,
              opacity: 0.1,
              fontStyle: "italic",
              pointerEvents: "none",
              userSelect: "none",
              lineHeight: 1,
              fontFamily: ff,
            }}>{tier.chineseName}</div>

            {/* Left — tier name */}
            <div style={{
              width: "120px",
              flexShrink: 0,
              padding: "12px 14px",
              borderRight: `0.5px solid #e8dcc8`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{ fontSize: "11px", color: gold, letterSpacing: "2px", height: "16px", display: "flex", alignItems: "center", fontFamily: ff }}>
                {tier.chineseName}
              </div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: black, height: "44px", display: "flex", alignItems: "center", fontFamily: ff, lineHeight: 1.2 }}>
                {tier.englishName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", height: "12px" }}>
                <div style={{ width: "20px", height: "0.5px", background: lightGold }} />
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: gold, flexShrink: 0 }} />
                <div style={{ width: "20px", height: "0.5px", background: lightGold }} />
              </div>
            </div>

            {/* Mid — stats */}
            <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
              <div style={cellStyle}>
                <div style={slStyle}>Base credits</div>
                <div style={svStyle}>{tier.baseCredits}</div>
              </div>
              <div style={cellStyle}>
                <div style={slStyle}>FOC credits</div>
                <div style={{ ...svStyle, color: gold }}>+{tier.focCredits}</div>
              </div>
              <div style={cellStyle}>
                <div style={slStyle}>Replenishment</div>
                <div style={svStyle}>SGD {tier.replenishmentPrice}</div>
              </div>
              <div style={cellStyle}>
                <div style={slStyle}>Closing fee</div>
                <div style={svStyle}>SGD {tier.closingFee}</div>
              </div>
              <div style={{ ...cellStyle, borderRight: "none" }}>
                <div style={slStyle}>Upgrade fee</div>
                <div style={svStyle}>
                  {tier.upgradeFee ? `SGD ${tier.upgradeFee}` : "—"}
                </div>
              </div>
            </div>

            {/* Right — price + button */}
            <div style={{
              width: "175px",
              flexShrink: 0,
              padding: "14px 20px",
              borderLeft: `0.5px solid #e8dcc8`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "4px",
            }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: gold, whiteSpace: "nowrap", fontFamily: ff }}>
                SGD {tier.price.toLocaleString()}
              </div>
              <div style={{ fontSize: "10px", color: muted, whiteSpace: "nowrap", fontFamily: ff, marginBottom: "8px" }}>
                One-time entry
              </div>
              {!isSuperAdmin ? (
                <button
                  onClick={() => handleRequest(tier)}
                  style={{
                    width: "135px",
                    height: "36px",
                    background: "linear-gradient(135deg, #C9A84C, #A87C2A)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontFamily: ff,
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    cursor: "pointer",
                  }}
                >Request to Join</button>
              ) : (
                <button
                  onClick={() => { setEditingTier(tier); setEditField("price"); setEditValue(String(tier.price)); setEditNote(""); }}
                  style={{
                    width: "135px",
                    height: "36px",
                    background: "#555",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontFamily: ff,
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >Edit Package</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTier && (
        <div onClick={handleClose} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: cardBg,
            border: `1px solid ${lightGold}`,
            borderTop: `4px solid ${gold}`,
            borderRadius: "12px",
            padding: "2rem 1.5rem",
            width: "100%", maxWidth: "420px",
            fontFamily: ff,
          }}>

            {step === "no_upline" && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: black, marginBottom: "8px" }}>No upline linked</div>
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7", marginBottom: "20px" }}>
                  You need to be linked to an upline before requesting a package. Please contact your upline or the administrator.
                </div>
                <button onClick={handleClose} style={{ padding: "10px 24px", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Close</button>
              </div>
            )}

            {step === "confirm" && (
              <>
                <div style={{ fontSize: "18px", fontWeight: "700", color: black, marginBottom: "6px" }}>Request — {selectedTier.englishName}</div>
                <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>{selectedTier.chineseName} · One-time entry package</div>

                <div style={{ border: `0.5px solid ${lightGold}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                  {[
                    ["Package amount", `SGD ${selectedTier.price.toLocaleString()}`, true],
                    ["Base credits", selectedTier.baseCredits, false],
                    ["FOC credits", `+${selectedTier.focCredits}`, true],
                    ["Total credits", selectedTier.baseCredits + selectedTier.focCredits, false],
                  ].map(([l, v, g]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: muted }}>{l}</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: g ? gold : black }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ border: `0.5px solid ${lightGold}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                  {[
                    ["Request sent to", mockUser.uplineName],
                    ["Upline tier", mockUser.uplineRole],
                  ].map(([l, v]) => (
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
                <div style={{ fontSize: "12px", color: muted, lineHeight: "1.7" }}>
                  Your request for <strong>{selectedTier.englishName}</strong> has been sent to <strong>{mockUser.uplineName}</strong>.<br /><br />
                  You will be notified once your upline confirms payment and stock is released.
                </div>
                <button onClick={handleClose} style={{ marginTop: "20px", width: "100%", padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Done</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Superadmin Edit Modal */}
      {editingTier && (
        <div onClick={() => setEditingTier(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, border: `1px solid ${lightGold}`, borderTop: `4px solid ${gold}`, borderRadius: "12px", padding: "2rem 1.5rem", width: "100%", maxWidth: "460px", fontFamily: ff }}>
            <div style={{ fontSize: "18px", fontWeight: "700", color: black, marginBottom: "4px" }}>Edit Package</div>
            <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>{editingTier.chineseName} · {editingTier.englishName}</div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: gold, letterSpacing: "2px", display: "block", marginBottom: "6px" }}>FIELD</label>
              <select value={editField} onChange={e => { setEditField(e.target.value); const fieldMap = { price: editingTier.price, base_credits: editingTier.baseCredits, foc_credits: editingTier.focCredits, replenishment_price: editingTier.replenishmentPrice, closing_fee: editingTier.closingFee, upgrade_fee: editingTier.upgradeFee || "", upgrade_target: editingTier.upgradeTarget || "", chinese_name: editingTier.chineseName, english_name: editingTier.englishName }; setEditValue(String(fieldMap[e.target.value] || "")); }} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${lightGold}`, borderBottom: `2px solid ${gold}`, background: "#FDFAF2", fontFamily: ff, fontSize: "14px", color: black, outline: "none" }}>
                <option value="price">Price (SGD)</option>
                <option value="base_credits">Base Credits</option>
                <option value="foc_credits">FOC Credits</option>
                <option value="replenishment_price">Replenishment Price</option>
                <option value="closing_fee">Closing Fee</option>
                <option value="upgrade_fee">Upgrade Fee</option>
                <option value="upgrade_target">Upgrade Target</option>
                <option value="chinese_name">Chinese Name</option>
                <option value="english_name">English Name</option>
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: gold, letterSpacing: "2px", display: "block", marginBottom: "6px" }}>NEW VALUE</label>
              <input value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${lightGold}`, borderBottom: `2px solid ${gold}`, background: "#FDFAF2", fontFamily: ff, fontSize: "14px", color: black, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", color: gold, letterSpacing: "2px", display: "block", marginBottom: "6px" }}>REASON FOR CHANGE</label>
              <input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="e.g. Updated per China HQ instruction June 2026" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${lightGold}`, borderBottom: `2px solid ${gold}`, background: "#FDFAF2", fontFamily: ff, fontSize: "14px", color: black, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: "#FDF6E3", border: `0.5px solid ${lightGold}`, borderLeft: `2px solid ${gold}`, padding: "10px 12px", borderRadius: "0 6px 6px 0", marginBottom: "20px", fontSize: "11px", color: muted, lineHeight: "1.6" }}>
              This change will be logged with your name, timestamp, old value and new value. It cannot be undone — only corrected with a new entry.
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setEditingTier(null)} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `0.5px solid ${lightGold}`, borderRadius: "8px", fontFamily: ff, fontSize: "13px", color: muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: "11px 0", background: `linear-gradient(135deg, #C9A84C, ${gold})`, border: "none", borderRadius: "8px", fontFamily: ff, fontSize: "13px", fontWeight: "600", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Saving..." : "Save Change"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
