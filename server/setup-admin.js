const bcrypt = require("bcrypt")
const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function setup() {
  const hash = await bcrypt.hash("TmBeauty@2026!", 10)
  await pool.query(
    "UPDATE users SET password_hash = $1 WHERE email = $2",
    [hash, "admin@tmbeautyhub.com"]
  )
  console.log("Superadmin password set successfully")
  pool.end()
}

setup()