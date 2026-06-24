const express = require("express")
const router = express.Router()
const { Pool } = require("pg")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Middleware: verify token
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

// Middleware: superadmin only
function superadmin(req, res, next) {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })
  next()
}

// ─────────────────────────────────────────────
// POST /api/admin/members
// Superadmin creates a member manually
// ─────────────────────────────────────────────
router.post("/", auth, superadmin, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const {
      name, email, role, tier,
      country_code, primary_phone, secondary_phone,
      upline_user_id, onboarding_type,
      package_id, package_price_paid, payment_reference,
      onboarding_date, onboarding_notes,
      base_credits, foc_credits, tssb_credits,
      internal_notes
    } = req.body

    if (!name || !email || !tier || !primary_phone) {
      return res.status(400).json({ error: "Name, email, tier and primary phone are required" })
    }

    // Create user account
    const bcrypt = require("bcrypt")
    const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role, reset_token, reset_token_expires, password_set, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, false, true)
       RETURNING id, name, email, role`,
      [name, email, tempHash, role || tier, resetToken, expires]
    )
    const user = userResult.rows[0]

    // Generate referral code
    const refCode = await client.query(
      "SELECT generate_referral_code($1, $2) AS code",
      [tier, name]
    )
    const code = refCode.rows[0].code

    // Insert referral code
    const rcResult = await client.query(
      "INSERT INTO referral_codes (code, user_id) VALUES ($1, $2) RETURNING id",
      [code, user.id]
    )
    const referralCodeId = rcResult.rows[0].id

    // Create member profile
    const nodeType = onboarding_type === "manual_historical" ? "manually_onboarded" : "full_member"
    await client.query(
      `INSERT INTO member_profiles (
        user_id, country_code, primary_phone, secondary_phone,
        tier, node_type, account_status, onboarding_type,
        onboarding_date, onboarding_notes, payment_reference,
        package_price_paid, package_id, active_referral_code_id,
        internal_notes, activated_at, activated_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9,$10,$11,$12,$13,$14,NOW(),$15,$15)`,
      [
        user.id, country_code || "+65", primary_phone, secondary_phone || null,
        tier, nodeType, onboarding_type || "superadmin_direct",
        onboarding_date || new Date(), onboarding_notes || null,
        payment_reference || null, package_price_paid || null,
        package_id || null, referralCodeId, internal_notes || null, req.user.id
      ]
    )

    // Create hierarchy link
    if (upline_user_id) {
      await client.query(
        `INSERT INTO hierarchy_links (user_id, upline_user_id, link_type, created_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, upline_user_id, onboarding_type === "manual_historical" ? "manual_historical" : "standard", req.user.id, onboarding_notes || null]
      )
    }

    // Create opening credit balance if provided
    if (base_credits || foc_credits || tssb_credits) {
      // Get active credit definition
      const defResult = await client.query(
        "SELECT id FROM credit_definitions WHERE is_active = true LIMIT 1"
      )
      const defId = defResult.rows[0]?.id || null

      if (base_credits) {
        await client.query(
          `INSERT INTO inventory_transactions
           (user_id, product_id, credit_definition_id, credits, direction, transaction_type, notes, acted_by)
           VALUES ($1, NULL, $2, $3, 'IN', 'opening_balance', 'Opening balance — manual historical entry', $4)`,
          [user.id, defId, base_credits, req.user.id]
        )
      }
      if (foc_credits) {
        await client.query(
          `INSERT INTO inventory_transactions
           (user_id, product_id, credit_definition_id, credits, direction, transaction_type, bucket, notes, acted_by)
           VALUES ($1, NULL, $2, $3, 'IN', 'opening_balance', 'foc', 'Opening FOC balance — manual historical entry', $4)`,
          [user.id, defId, foc_credits, req.user.id]
        )
      }
    }

    // Log profile audit
    await client.query(
      `INSERT INTO member_profile_audit (user_id, changed_by, field_changed, old_value, new_value, change_note)
       VALUES ($1, $2, 'account_created', NULL, $3, 'Account created by superadmin')`,
      [user.id, req.user.id, JSON.stringify({ tier, onboarding_type, name, email })]
    )

    await client.query("COMMIT")

    res.json({
      user,
      referral_code: code,
      reset_token: resetToken,
      message: "Member created successfully"
    })
  } catch (e) {
    await client.query("ROLLBACK")
    if (e.code === "23505") return res.status(400).json({ error: "Email already exists" })
    console.error(e)
    res.status(500).json({ error: "Server error" })
  } finally {
    client.release()
  }
})

// ─────────────────────────────────────────────
// GET /api/admin/members
// List all members with basic hierarchy info
// ─────────────────────────────────────────────
router.get("/", auth, superadmin, async (req, res) => {
  try {
    const { search, tier, status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT
        u.id, u.name, u.email, u.role, u.is_active,
        mp.tier, mp.account_status, mp.node_type, mp.onboarding_type,
        mp.country_code, mp.primary_phone, mp.onboarding_date,
        mp.package_price_paid, mp.is_vip, mp.is_under_review,
        rc.code AS referral_code,
        upline.name AS upline_name, upline.id AS upline_id,
        upline_mp.tier AS upline_tier
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
      LEFT JOIN hierarchy_links hl ON u.id = hl.user_id AND hl.is_current = true
      LEFT JOIN users upline ON hl.upline_user_id = upline.id
      LEFT JOIN member_profiles upline_mp ON upline.id = upline_mp.user_id
      WHERE u.role != 'superadmin'
    `
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR rc.code ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }
    if (tier) {
      paramCount++
      query += ` AND mp.tier = $${paramCount}`
      params.push(tier)
    }
    if (status) {
      paramCount++
      query += ` AND mp.account_status = $${paramCount}`
      params.push(status)
    }

    query += ` ORDER BY u.id DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       WHERE u.role != 'superadmin'`
    )

    res.json({
      members: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/admin/members/:id
// Single member full profile
// ─────────────────────────────────────────────
router.get("/:id", auth, superadmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id, u.name, u.email, u.role, u.is_active,
        mp.*,
        rc.code AS referral_code,
        upline.name AS upline_name, upline.id AS upline_id,
        upline_mp.tier AS upline_tier,
        p.english_name AS package_name
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
      LEFT JOIN hierarchy_links hl ON u.id = hl.user_id AND hl.is_current = true
      LEFT JOIN users upline ON hl.upline_user_id = upline.id
      LEFT JOIN member_profiles upline_mp ON upline.id = upline_mp.user_id
      LEFT JOIN packages p ON mp.package_id = p.id
      WHERE u.id = $1`,
      [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: "Member not found" })

    // Get audit log
    const audit = await pool.query(
      `SELECT mpa.*, u.name AS changed_by_name
       FROM member_profile_audit mpa
       LEFT JOIN users u ON mpa.changed_by = u.id
       WHERE mpa.user_id = $1
       ORDER BY mpa.created_at DESC LIMIT 50`,
      [req.params.id]
    )

    // Get direct downline
    const downline = await pool.query(
      `SELECT u.id, u.name, u.email, mp.tier, mp.account_status
       FROM hierarchy_links hl
       JOIN users u ON hl.user_id = u.id
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       WHERE hl.upline_user_id = $1 AND hl.is_current = true`,
      [req.params.id]
    )

    res.json({
      member: result.rows[0],
      audit: audit.rows,
      downline: downline.rows
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// PUT /api/admin/members/:id
// Update member profile (audited)
// ─────────────────────────────────────────────
router.put("/:id", auth, superadmin, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const allowed = [
      "country_code", "primary_phone", "secondary_phone",
      "tier", "account_status", "node_type",
      "upline_visibility_levels", "downline_visibility",
      "commission_eligible", "foc_eligible", "tssb_eligible",
      "is_vip", "is_under_review", "internal_notes",
      "onboarding_notes", "payment_reference"
    ]

    const { field, value, change_note } = req.body
    if (!allowed.includes(field)) return res.status(400).json({ error: "Invalid field" })

    const current = await client.query(
      "SELECT * FROM member_profiles WHERE user_id = $1", [req.params.id]
    )
    if (!current.rows.length) return res.status(404).json({ error: "Member not found" })

    const old_value = current.rows[0][field]

    await client.query(
      `UPDATE member_profiles SET ${field} = $1, updated_at = NOW(), updated_by = $2
       WHERE user_id = $3`,
      [value, req.user.id, req.params.id]
    )

    await client.query(
      `INSERT INTO member_profile_audit (user_id, changed_by, field_changed, old_value, new_value, change_note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, req.user.id, field, String(old_value ?? ""), String(value ?? ""), change_note || null]
    )

    await client.query("COMMIT")
    res.json({ message: "Updated successfully" })
  } catch (e) {
    await client.query("ROLLBACK")
    console.error(e)
    res.status(500).json({ error: "Server error" })
  } finally {
    client.release()
  }
})

// ─────────────────────────────────────────────
// GET /api/admin/members/:id/audit
// Member audit log
// ─────────────────────────────────────────────
router.get("/:id/audit", auth, superadmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mpa.*, u.name AS changed_by_name
       FROM member_profile_audit mpa
       LEFT JOIN users u ON mpa.changed_by = u.id
       WHERE mpa.user_id = $1
       ORDER BY mpa.created_at DESC`,
      [req.params.id]
    )
    res.json({ audit: result.rows })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
