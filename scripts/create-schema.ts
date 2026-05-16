import postgres from "postgres"

async function main() {
  const sql = postgres(process.env.DATABASE_URL!)
  await sql`CREATE SCHEMA IF NOT EXISTS freelancer_copilot`
  console.log("Schema 'freelancer_copilot' created (or already exists).")
  await sql.end()
}

main()
