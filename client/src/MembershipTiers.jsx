import { useState } from "react";

const TIERS = [
  {
    id: "manager",
    chineseName: "代颜人",
    englishName: "Manager",
    price: 2268,
    baseCredits: 10,
    focCredits: 10,
    replenishmentPrice: 189,
    closingFee: 100,
    upgradeFee: 100,
    upgradeTarget: "Director",
  },
  {
    id: "director",
    chineseName: "团长",
    englishName: "Director",
    price: 4168,
    baseCredits: 20,
    focCredits: 20,
    replenishmentPrice: 159,
    closingFee: 170,
    upgradeFee: 260,
    upgradeTarget: "CEO",
  },
  {
    id: "ceo",
    chineseName: "服务商",
    englishName: "CEO",
    price: 14868,
    baseCredits: 100,
    focCredits: 100,
    replenishmentPrice: 119,
    closingFee: 350,
    upgradeFee: 500,
    upgradeTarget: "Branch Office",
  },
  {
    id: "branch_office",
    chineseName: "事业部",
    englishName: "Branch Office",
    price: 47068,
    baseCredits: 400,
    focCredits: 300,
    replenishmentPrice: 89,
    closingFee: 650,
    upgradeFee: null,
    upgradeTarget: null,
  },
];

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
  const [selectedTier, setSelectedTier] = useState(null);
  const [step, setStep] = useState("confirm");

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
        {TIERS.map((tier) => (
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
              width: "150px",
              flexShrink: 0,
              padding: "14px 20px",
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
                  {tier.upgradeFee ? `SGD ${tier.upgradeFee} → ${tier.upgradeTarget}` : "—"}
                </div>
              </div>
            </div>

            {/* Right — price + button */}
            <div style={{
              width: "160px",
              flexShrink: 0,
              padding: "14px 16px",
              borderLeft: `0.5px solid #e8dcc8`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px",
            }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: gold, whiteSpace: "nowrap", fontFamily: ff, height: "28px", display: "flex", alignItems: "center" }}>
                SGD {tier.price.toLocaleString()}
              </div>
              <div style={{ fontSize: "10px", color: muted, whiteSpace: "nowrap", fontFamily: ff, height: "16px", display: "flex", alignItems: "center" }}>
                One-time entry
              </div>
              {!isSuperAdmin ? (
                <button
                  onClick={() => handleRequest(tier)}
                  style={{
                    marginTop: "6px",
                    width: "100%",
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
                  onClick={() => alert(`Edit ${tier.englishName}`)}
                  style={{
                    marginTop: "6px",
                    width: "100%",
                    height: "36px",
                    background: "#666",
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
    </div>
  );
}
