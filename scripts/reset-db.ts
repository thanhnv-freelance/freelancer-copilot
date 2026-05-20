import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"

async function main() {
  const sql = postgres(process.env.DATABASE_URL!)

  console.log("Dropping schema freelancer_copilot...")
  await sql`DROP SCHEMA IF EXISTS freelancer_copilot CASCADE`

  console.log("Clearing migration history...")
  await sql`DELETE FROM drizzle.__drizzle_migrations`.catch(() => {
    // drizzle schema might not exist yet — that's fine
  })

  console.log("Recreating schema freelancer_copilot...")
  await sql`CREATE SCHEMA freelancer_copilot`

  console.log("Applying migrations...")
  const db = drizzle(sql)
  await migrate(db, { migrationsFolder: "./drizzle", migrationsSchema: "drizzle" })

  console.log("Done — database is clean.")
  await sql.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
