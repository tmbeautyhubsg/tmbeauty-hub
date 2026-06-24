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
const ivory = "#F7F0E3";
const cardBg = "#FFFDF7";
const black = "#1A1A1A";
const muted = "#8a7050";

const styles = {
  page: {
    fontFamily: "'Playfair Display', serif",
    background: ivory,
    minHeight: "100vh",
    padding: "2.5rem 1.5rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: black,
    marginBottom: "6px",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "12px",
    color: muted,
    letterSpacing: "1.5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    maxWidth: "980px",
    margin: "0 auto",
  },
  card: {
    background: cardBg,
    border: `0.5px solid ${lightGold}`,
    borderTop: `3px solid ${gold}`,
    borderRadius: "12px",
    padding: "1.5rem 1.25rem",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  watermark: {
    position: "absolute",
    bottom: "10px",
    right: "12px",
    fontSize: "42px",
    color: lightGold,
    opacity: 0.12,
    fontStyle: "italic",
    lineHeight: 1,
    pointerEvents: "none",
    userSelect: "none",
  },
  chineseName: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: gold,
    marginBottom: "4px",
  },
  tierName: {
    fontSize: "20px",
    fontWeight: "700",
    color: black,
    marginBottom: "14px",
  },
  ornament: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "14px",
  },
  ornamentLine: {
    flex: 1,
    height: "0.5px",
    background: lightGold,
  },
  ornamentDot: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: gold,
    flexShrink: 0,
  },
  price: {
    fontSize: "26px",
    fontWeight: "700",
    color: gold,
    marginBottom: "2px",
  },
  priceSub: {
    fontSize: "11px",
    color: muted,
    marginBottom: "16px",
    letterSpacing: "0.5px",
  },
  divider: {
    height: "0.5px",
    background: "#e8dcc8",
    margin: "10px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  rowLabel: {
    fontSize: "12px",
    color: muted,
  },
  rowValue: {
    fontSize: "13px",
    color: black,
    fontWeight: "600",
  },
  rowValueGold: {
    fontSize: "13px",
    color: gold,
    fontWeight: "600",
  },
  requestBtn: {
    marginTop: "18px",
    width: "100%",
    padding: "11px 0",
    background: `linear-gradient(135deg, #C9A84C, ${gold})`,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "600",
    letterSpacing: "1px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: cardBg,
    border: `1px solid ${lightGold}`,
    borderTop: `4px solid ${gold}`,
    borderRadius: "12px",
    padding: "2rem 1.5rem",
    width: "100%",
    maxWidth: "420px",
    fontFamily: "'Playfair Display', serif",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: black,
    marginBottom: "6px",
  },
  modalSub: {
    fontSize: "12px",
    color: muted,
    marginBottom: "20px",
    letterSpacing: "0.5px",
  },
  modalSection: {
    background: ivory,
    border: `0.5px solid ${lightGold}`,
    borderRadius: "8px",
    padding: "12px 14px",
    marginBottom: "16px",
  },
  modalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  modalLabel: {
    fontSize: "12px",
    color: muted,
  },
  modalValue: {
    fontSize: "13px",
    color: black,
    fontWeight: "600",
  },
  modalValueGold: {
    fontSize: "13px",
    color: gold,
    fontWeight: "600",
  },
  modalNote: {
    fontSize: "11px",
    color: muted,
    lineHeight: "1.6",
    marginBottom: "20px",
    padding: "10px 12px",
    borderLeft: `2px solid ${lightGold}`,
    background: ivory,
    borderRadius: "0 6px 6px 0",
  },
  modalBtnRow: {
    display: "flex",
    gap: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "11px 0",
    background: "transparent",
    border: `0.5px solid ${lightGold}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "'Playfair Display', serif",
    color: muted,
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 2,
    padding: "11px 0",
    background: `linear-gradient(135deg, #C9A84C, ${gold})`,
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "600",
    color: "#fff",
    cursor: "pointer",
    letterSpacing: "0.5px",
  },
  successBox: {
    textAlign: "center",
    padding: "1rem 0",
  },
  successIcon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  successTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: black,
    marginBottom: "8px",
  },
  successSub: {
    fontSize: "12px",
    color: muted,
    lineHeight: "1.7",
  },
  noUplineBox: {
    textAlign: "center",
    padding: "1rem 0",
  },
  noUplineIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  noUplineTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: black,
    marginBottom: "8px",
  },
  noUplineSub: {
    fontSize: "12px",
    color: muted,
    lineHeight: "1.7",
    marginBottom: "20px",
  },
};

const mockUser = {
  hasUpline: true,
  uplineName: "Sarah Tan",
  uplineRole: "Director",
  currentTier: null,
};

export default function MembershipTiers({ isSuperAdmin = false }) {
  const [tiers] = useState(TIERS);
  const [selectedTier, setSelectedTier] = useState(null);
  const [step, setStep] = useState("confirm");

  const handleRequest = (tier) => {
    setSelectedTier(tier);
    setStep(mockUser.hasUpline ? "confirm" : "no_upline");
  };

  const handleConfirm = () => {
    setStep("success");
  };

  const handleClose = () => {
    setSelectedTier(null);
    setStep("confirm");
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={styles.header}>
        <div style={styles.title}>Membership Tiers</div>
        <div style={styles.subtitle}>
          Entry package · Full payment · Stock released upon upline confirmation
        </div>
      </div>

      <div style={styles.grid}>
        {tiers.map((tier) => (
          <div key={tier.id} style={styles.card}>
            <div style={styles.watermark}>{tier.chineseName}</div>

            <div style={styles.chineseName}>{tier.chineseName}</div>
            <div style={styles.tierName}>{tier.englishName}</div>

            <div style={styles.ornament}>
              <div style={styles.ornamentLine} />
              <div style={styles.ornamentDot} />
              <div style={styles.ornamentLine} />
            </div>

            <div style={styles.price}>
              SGD {tier.price.toLocaleString()}
            </div>
            <div style={styles.priceSub}>One-time entry package</div>

            <div style={styles.divider} />

            <div style={styles.row}>
              <span style={styles.rowLabel}>Base credits</span>
              <span style={styles.rowValue}>{tier.baseCredits}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.rowLabel}>FOC credits</span>
              <span style={styles.rowValueGold}>+{tier.focCredits}</span>
            </div>

            <div style={styles.divider} />

            <div style={styles.row}>
              <span style={styles.rowLabel}>Replenishment</span>
              <span style={styles.rowValue}>SGD {tier.replenishmentPrice}/unit</span>
            </div>
            <div style={styles.row}>
              <span style={styles.rowLabel}>Closing fee</span>
              <span style={styles.rowValue}>SGD {tier.closingFee}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.rowLabel}>Upgrade fee</span>
              <span style={styles.rowValue}>
                {tier.upgradeFee ? `SGD ${tier.upgradeFee} → ${tier.upgradeTarget}` : "—"}
              </span>
            </div>

            {!isSuperAdmin && (
              <button
                style={styles.requestBtn}
                onClick={() => handleRequest(tier)}
              >
                Request to Join
              </button>
            )}

            {isSuperAdmin && (
              <button
                style={{ ...styles.requestBtn, background: "#555", marginTop: "18px" }}
                onClick={() => alert(`Edit ${tier.englishName} package`)}
              >
                Edit Package
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedTier && (
        <div style={styles.modalOverlay} onClick={handleClose}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {step === "no_upline" && (
              <div style={styles.noUplineBox}>
                <div style={styles.noUplineIcon}>🔗</div>
                <div style={styles.noUplineTitle}>No upline linked</div>
                <div style={styles.noUplineSub}>
                  You need to be linked to an upline before you can request a membership package. Please contact your upline or reach out to the administrator.
                </div>
                <button style={styles.cancelBtn} onClick={handleClose}>
                  Close
                </button>
              </div>
            )}

            {step === "confirm" && (
              <>
                <div style={styles.modalTitle}>
                  Request — {selectedTier.englishName}
                </div>
                <div style={styles.modalSub}>
                  {selectedTier.chineseName} · One-time entry package
                </div>

                <div style={styles.modalSection}>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>Package amount</span>
                    <span style={styles.modalValueGold}>
                      SGD {selectedTier.price.toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>Base credits</span>
                    <span style={styles.modalValue}>{selectedTier.baseCredits}</span>
                  </div>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>FOC credits</span>
                    <span style={styles.modalValueGold}>+{selectedTier.focCredits}</span>
                  </div>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>Total credits</span>
                    <span style={styles.modalValue}>
                      {selectedTier.baseCredits + selectedTier.focCredits}
                    </span>
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>Request sent to</span>
                    <span style={styles.modalValue}>{mockUser.uplineName}</span>
                  </div>
                  <div style={styles.modalRow}>
                    <span style={styles.modalLabel}>Upline tier</span>
                    <span style={styles.modalValue}>{mockUser.uplineRole}</span>
                  </div>
                </div>

                <div style={styles.modalNote}>
                  Your upline will be notified to confirm payment receipt. Stock will only be released after full payment is confirmed by your upline. All transactions are timestamped and recorded.
                </div>

                <div style={styles.modalBtnRow}>
                  <button style={styles.cancelBtn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button style={styles.confirmBtn} onClick={handleConfirm}>
                    Confirm Request
                  </button>
                </div>
              </>
            )}

            {step === "success" && (
              <div style={styles.successBox}>
                <div style={styles.successIcon}>✓</div>
                <div style={styles.successTitle}>Request sent</div>
                <div style={styles.successSub}>
                  Your request for the <strong>{selectedTier.englishName}</strong> package has been sent to <strong>{mockUser.uplineName}</strong>.<br /><br />
                  You will be notified once your upline confirms payment receipt and your stock has been released.
                </div>
                <button
                  style={{ ...styles.confirmBtn, marginTop: "20px", width: "100%" }}
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
