const bcrypt = require("bcrypt")
const { Pool } = require("pg")

const pool = new Pool({
  connectionString: "postgresql://postgres:rOhcpzzctrGUlROMOogmdeOxgMifErbv@reseau.proxy.rlwy.net:55654/railway",
  ssl: { rejectUnauthorized: false }
})

async function setup() {
  const hash = await bcrypt.hash("TmBeauty@2026!", 10)
  await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
    ["Superadmin", "admin@tmbeautyhub.com", hash, "superadmin"]
  )
  console.log("Superadmin created successfully")
  pool.end()
}

setup()