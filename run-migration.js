const fs = require("fs")

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdHV6d3V1eHdnZWxyaHlvbWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU1OTIwNiwiZXhwIjoyMDk5MTM1MjA2fQ.gV4WQMEvejiIw0L-01auH174GpDBGxDP1LSth99k3Cg"
const PROJECT_REF = "vctuzwuuxwgelrhyomhi"
const SQL = fs.readFileSync("supabase-migration.sql", "utf-8")

async function main() {
  // Split SQL into individual statements
  const statements = SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))

  console.log(`Running ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      const res = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: stmt + ";" }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        console.error(`Statement ${i + 1} failed:`, text.slice(0, 200))
      } else {
        console.log(`✓ Statement ${i + 1} OK`)
      }
    } catch (err) {
      console.error(`Statement ${i + 1} error:`, err.message)
    }
  }

  console.log("Migration complete!")
}

main().catch(console.error)
