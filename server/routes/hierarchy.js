const express = require("express")
const router = express.Router()
const { Pool } = require("pg")
const jwt = require("jsonwebtoken")

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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
// GET /api/hierarchy/my
// Member sees their own tree (up + down)
// ─────────────────────────────────────────────
router.get("/my", auth, async (req, res) => {
  try {
    const profile = await pool.query(
      "SELECT * FROM member_profiles WHERE user_id = $1", [req.user.id]
    )
    if (!profile.rows.length) return res.status(404).json({ error: "Profile not found" })

    const visLevels = profile.rows[0].upline_visibility_levels || 1

    // Get upline chain (limited by visibility level)
    const uplineChain = []
    let currentId = req.user.id
    for (let i = 0; i < visLevels; i++) {
      const uplineResult = await pool.query(
        `SELECT u.id, u.name, mp.tier, rc.code AS referral_code
         FROM hierarchy_links hl
         JOIN users u ON hl.upline_user_id = u.id
         LEFT JOIN member_profiles mp ON u.id = mp.user_id
         LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
         WHERE hl.user_id = $1 AND hl.is_current = true`,
        [currentId]
      )
      if (!uplineResult.rows.length) break
      uplineChain.push(uplineResult.rows[0])
      currentId = uplineResult.rows[0].id
    }

    // Get full downline tree (recursive)
    const downlineResult = await pool.query(
      `WITH RECURSIVE downline AS (
        SELECT u.id, u.name, mp.tier, mp.account_status,
               hl.upline_user_id, 1 AS level,
               rc.code AS referral_code
        FROM hierarchy_links hl
        JOIN users u ON hl.user_id = u.id
        LEFT JOIN member_profiles mp ON u.id = mp.user_id
        LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
        WHERE hl.upline_user_id = $1 AND hl.is_current = true

        UNION ALL

        SELECT u.id, u.name, mp.tier, mp.account_status,
               hl.upline_user_id, d.level + 1,
               rc.code
        FROM hierarchy_links hl
        JOIN users u ON hl.user_id = u.id
        LEFT JOIN member_profiles mp ON u.id = mp.user_id
        LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
        JOIN downline d ON hl.upline_user_id = d.id
        WHERE hl.is_current = true AND d.level < 10
      )
      SELECT * FROM downline ORDER BY level, name`,
      [req.user.id]
    )

    res.json({
      upline_chain: uplineChain.reverse(),
      my_profile: {
        id: req.user.id,
        name: req.user.name,
        tier: profile.rows[0].tier
      },
      downline: downlineResult.rows
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/hierarchy/admin
// Superadmin sees full tree
// ─────────────────────────────────────────────
router.get("/admin", auth, async (req, res) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })
  try {
    const result = await pool.query(
      `SELECT
        u.id, u.name, u.email,
        mp.tier, mp.account_status, mp.node_type,
        hl.upline_user_id,
        upline.name AS upline_name,
        rc.code AS referral_code
       FROM users u
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       LEFT JOIN hierarchy_links hl ON u.id = hl.user_id AND hl.is_current = true
       LEFT JOIN users upline ON hl.upline_user_id = upline.id
       LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
       WHERE u.role != 'superadmin'
       ORDER BY mp.tier, u.name`
    )
    res.json({ hierarchy: result.rows })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

// ─────────────────────────────────────────────
// GET /api/hierarchy/directory
// Member directory — visibility controlled by settings
// ─────────────────────────────────────────────
router.get("/directory", auth, async (req, res) => {
  try {
    const settings = await pool.query("SELECT * FROM directory_settings LIMIT 1")
    const s = settings.rows[0] || {}

    const { search } = req.query

    let query = `
      SELECT
        u.id, u.name, mp.tier, mp.account_status,
        ${s.show_referral_code ? "rc.code AS referral_code," : "NULL AS referral_code,"}
        ${s.show_email ? "u.email," : "NULL AS email,"}
        ${s.show_phone ? "mp.primary_phone," : "NULL AS primary_phone,"}
        ${s.show_upline ? "upline.name AS upline_name" : "NULL AS upline_name"}
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      LEFT JOIN referral_codes rc ON mp.active_referral_code_id = rc.id
      LEFT JOIN hierarchy_links hl ON u.id = hl.user_id AND hl.is_current = true
      LEFT JOIN users upline ON hl.upline_user_id = upline.id
      WHERE u.role != 'superadmin'
        AND mp.account_status = 'active'
    `
    const params = []
    if (search) {
      params.push(`%${search}%`)
      query += ` AND (u.name ILIKE $1 OR rc.code ILIKE $1)`
    }
    query += " ORDER BY mp.tier, u.name"

    const result = await pool.query(query, params)
    res.json({ members: result.rows, settings: s })
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
