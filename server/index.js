require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")
const crypto = require("crypto")
const { sendInviteEmail, sendPasswordResetEmail } = require("./email")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "TM Beauty Hub API running" })
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/admin/users", async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: "Unauthorized" })
  try {
    const token = auth.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })
    const result = await pool.query("SELECT id, name, email, role, is_active FROM users ORDER BY id")
    res.json({ users: result.rows })
  } catch (e) {
    res.status(401).json({ error: "Invalid token" })
  }
})

app.post("/api/admin/impersonate/:id", async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: "Unauthorized" })
  try {
    const token = auth.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: "User not found" })
    const user = result.rows[0]
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )
    res.json({ token: newToken, user })
  } catch (e) {
    res.status(401).json({ error: "Invalid token" })
  }
})

app.post("/api/admin/users", async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: "Unauthorized" })
  try {
    const token = auth.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== "superadmin") return res.status(403).json({ error: "Forbidden" })

    const { name, email, role } = req.body
    if (!name || !email || !role) return res.status(400).json({ error: "Name, email and role are required" })

    const resetToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10)

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, reset_token, reset_token_expires, password_set) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id, name, email, role",
      [name, email, tempHash, role, resetToken, expires]
    )

    await sendInviteEmail({ name, email, token: resetToken })

    res.json({ user: result.rows[0] })
  } catch (e) {
    if (e.code === "23505") return res.status(400).json({ error: "Email already exists" })
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND is_active = true", [email])
    if (result.rows.length === 0) return res.json({ message: "If this email exists, a reset link has been sent" })

    const user = result.rows[0]
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
      [resetToken, expires, user.id]
    )

    await sendPasswordResetEmail({ name: user.name, email: user.email, token: resetToken })
    res.json({ message: "If this email exists, a reset link has been sent" })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/set-password", async (req, res) => {
  const { token, password } = req.body
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    )
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid or expired link. Please request a new one." })

    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, password_set = true WHERE id = $2",
      [hash, result.rows[0].id]
    )
    res.json({ message: "Password set successfully" })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})