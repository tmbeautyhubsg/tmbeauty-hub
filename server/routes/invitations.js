const express = require("express")
const router = express.Router()
const { Pool } = require("pg")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { Resend } = require("resend")

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const resend = new Resend(process.env.RESEND_API_KEY)

function auth(req, res, next) {
  const a = req.headers.authorization
  if (!a) return res.status(401).json({ error: "Unauthorized" })
  try {
    req.user = jwt.verify(a.split(" ")[1], process.env.JWT_SECRET)
    next()
  } catch (e) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// ─────────────────────────────────────────────
// POST /api/invitations/send
// Upline sends invitation to new member
// ─────────────────────────────────────────────
router.post("/send", auth, async (req, res) => {
  try {
    const { invitee_name, invitee_email, package_id, tier } = req.body

    if (!invitee_name || !invitee_email || !package_id || !tier) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check upline has active profile
    const uplineProfile = await pool.query(
      "SELECT * FROM member_profiles WHERE user_id = $1 AND account_status = 'active'",
      [req.user.id]
    )
    if (!uplineProfile.rows.length) {
      return res.status(403).json({ error: "Your account must be active to send invitations" })
    }

    // Check for existing pending invitation to same email
    const existing = await pool.query(
      "SELECT id FROM invitations WHERE invitee_email = $1 AND status IN ('pending','opened') AND expires_at > NOW()",
      [invitee_email]
    )
    if (existing.rows.length) {
      return res.status(400).json({ error: "A pending invitation already exists for this email" })
    }

    // Check email not already a member
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1", [invitee_email]
    )
    if (existingUser.rows.length) {
      return res.status(400).json({ error: "This email is already registered" })
    }

    // Get package details
    const pkg = await pool.query("SELECT * FROM packages WHERE id = $1", [package_id])
    if (!pkg.rows.length) return res.status(404).json({ error: "Package not found" })

    const token = crypto.randomBytes(48).toString("hex")
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    await pool.query(
      `INSERT INTO invitations (token, invited_by, invitee_name, invitee_email, package_id, tier, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [token, req.user.id, invitee_name, invitee_email, package_id, tier, expires]
    )

    // Send invitation email
    const inviteUrl = `${process.env.FRONTEND_URL}/register?token=${token}`
    await resend.emails.send({
      from: "noreply@tmbeautyhub.com",
      to: invitee_email,
      subject: "You have been invited to join TM Beauty Hub",
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F7F0E3;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #A87C2A; letter-spacing: 4px; font-size: 20px;">TM BEAUTY HUB</h1>
            <p style="color: #8a7050; font-style: italic;">Members Portal</p>
          </div>
          <div style="background: #FFFDF7; border: 1px solid #D4B86A; border-top: 3px solid #A87C2A; padding: 36px;">
            <p style="color: #1A1A1A; font-size: 16px;">Dear ${invitee_name},</p>
            <p style="color: #1A1A1A;">You have been personally invited to join TM Beauty Hub as a <strong>${pkg.rows[0].english_name}</strong>.</p>
            <div style="background: #F7F0E3; border: 1px solid #D4B86A; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #8a7050; font-size: 12px; letter-spacing: 2px;">PACKAGE DETAILS</p>
              <p style="margin: 0 0 4px; color: #1A1A1A;"><strong>${pkg.rows[0].english_name}</strong> (${pkg.rows[0].chinese_name})</p>
              <p style="margin: 0; color: #A87C2A; font-size: 20px; font-weight: 700;">SGD ${parseFloat(pkg.rows[0].price).toLocaleString()}</p>
            </div>
            <p style="color: #8a7050; font-size: 13px;">This invitation expires in 48 hours.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #C9A84C, #A87C2A); color: #fff; text-decoration: none; font-weight: 700; letter-spacing: 2px; font-size: 13px;">PROCEED TO REGISTRATION</a>
            </div>
          </div>
          <p style="text-align: center; color: #B8A070; font-size: 11px; margin-top: 24px;">© 2026 TM Beauty Hub</p>
        </div>
      `
    })

    res.json({ message: "Invitation sent successfully", expires_at: expires })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/invitations/my
// Upline sees all their invitations
// ─────────────────────────────────────────────
router.get("/my", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.english_name AS package_name, p.price AS package_price
       FROM invitations i
       LEFT JOIN packages p ON i.package_id = p.id
       WHERE i.invited_by = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    )
    res.json({ invitations: result.rows })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/invitations/:token
// Public — new member opens invitation link
// ─────────────────────────────────────────────
router.get("/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.english_name, p.chinese_name, p.price,
              p.base_credits, p.foc_credits,
              u.name AS upline_name, mp.tier AS upline_tier
       FROM invitations i
       JOIN packages p ON i.package_id = p.id
       JOIN users u ON i.invited_by = u.id
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       WHERE i.token = $1`,
      [req.params.token]
    )

    if (!result.rows.length) return res.status(404).json({ error: "Invitation not found" })

    const inv = result.rows[0]
    if (inv.status === "expired" || new Date(inv.expires_at) < new Date()) {
      await pool.query("UPDATE invitations SET status = 'expired' WHERE token = $1", [req.params.token])
      return res.status(410).json({ error: "This invitation has expired. Please contact your upline for a new one." })
    }
    if (inv.status === "completed") return res.status(410).json({ error: "This invitation has already been used." })
    if (inv.status === "cancelled") return res.status(410).json({ error: "This invitation has been cancelled." })

    // Mark as opened
    if (inv.status === "pending") {
      await pool.query(
        "UPDATE invitations SET status = 'opened', opened_at = NOW() WHERE token = $1",
        [req.params.token]
      )
    }

    res.json({
      invitation: {
        token: inv.token,
        invitee_name: inv.invitee_name,
        invitee_email: inv.invitee_email,
        tier: inv.tier,
        package_name: inv.english_name,
        chinese_name: inv.chinese_name,
        price: inv.price,
        base_credits: inv.base_credits,
        foc_credits: inv.foc_credits,
        upline_name: inv.upline_name,
        upline_tier: inv.upline_tier,
        expires_at: inv.expires_at
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// POST /api/invitations/:token/resend
// Upline resends an invitation
// ─────────────────────────────────────────────
router.post("/:token/resend", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invitations WHERE token = $1 AND invited_by = $2",
      [req.params.token, req.user.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: "Invitation not found" })

    const inv = result.rows[0]
    if (inv.resend_count >= inv.max_resends) {
      return res.status(400).json({ error: "Maximum resends reached. Please create a new invitation." })
    }
    if (inv.status === "completed") return res.status(400).json({ error: "Invitation already completed" })

    const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await pool.query(
      `UPDATE invitations
       SET resend_count = resend_count + 1, last_resent_at = NOW(),
           expires_at = $1, status = 'pending', updated_at = NOW()
       WHERE token = $2`,
      [newExpiry, req.params.token]
    )

    res.json({ message: "Invitation resent", expires_at: newExpiry, resend_count: inv.resend_count + 1 })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// POST /api/invitations/:token/cancel
// Upline cancels an invitation
// ─────────────────────────────────────────────
router.post("/:token/cancel", auth, async (req, res) => {
  try {
    const { reason } = req.body
    await pool.query(
      `UPDATE invitations SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = $1
       WHERE token = $2 AND invited_by = $3`,
      [reason || null, req.params.token, req.user.id]
    )
    res.json({ message: "Invitation cancelled" })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/invitations/admin/all
// Superadmin sees all invitations
// ─────────────────────────────────────────────
router.get("/admin/all", auth, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })
  try {
    const result = await pool.query(
      `SELECT i.*, p.english_name AS package_name,
              u.name AS upline_name, u.email AS upline_email
       FROM invitations i
       LEFT JOIN packages p ON i.package_id = p.id
       LEFT JOIN users u ON i.invited_by = u.id
       ORDER BY i.created_at DESC LIMIT 100`
    )
    res.json({ invitations: result.rows })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
