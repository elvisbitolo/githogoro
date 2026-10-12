#!/usr/bin/env node
/**
 * Data-only backup of the Githogoro database.
 *
 * Dumps every table in the selected schemas (default: public, auth, storage)
 * to `backups/<timestamp>/data.sql`, plus a row-count manifest. Schema DDL is
 * NOT included — it lives in prisma/schema.prisma and the *.sql files at the repo
 * root. Capturing the `auth` schema means user accounts (including password
 * hashes) can be restored, so lost accounts stay recoverable.
 *
 * Usage:
 *   npm run db:backup                     # public + auth + storage
 *   npm run db:backup:public              # public only
 *   node scripts/backup-db.mjs --schemas public,auth --out /path/to/dir
 *
 * Restore with: psql "$DIRECT_URL" -f backups/<timestamp>/data.sql
 */
import { PrismaClient } from "@prisma/client"
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = join(root, file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!m) continue
      let value = m[2]
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = value
    }
  }
}

loadEnv()
// Prefer the direct/session connection for consistent dumps.
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL

const args = process.argv.slice(2)
const argVal = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const schemas = (argVal("--schemas") || process.env.BACKUP_SCHEMAS || "public,auth,storage")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
const outDirOverride = argVal("--out")

const prisma = new PrismaClient({ log: ["error"] })

const escapeSql = (s) => s.replace(/'/g, "''")
const ident = (s) => '"' + s.replace(/"/g, '""') + '"'

function sqlLiteral(v) {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE"
  if (typeof v === "bigint") return v.toString()
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL"
  if (v instanceof Date) return "'" + v.toISOString() + "'"
  if (Buffer.isBuffer(v)) return "'\\x" + v.toString("hex") + "'::bytea"
  if (typeof v === "object") return "'" + escapeSql(JSON.stringify(v)) + "'"
  return "'" + escapeSql(String(v)) + "'"
}

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    `select table_schema, table_name
       from information_schema.tables
      where table_type = 'BASE TABLE' and table_schema = any($1::text[])
      order by table_schema, table_name`,
    schemas,
  )

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const outDir = outDirOverride ? join(outDirOverride, timestamp) : join(root, "backups", timestamp)
  mkdirSync(outDir, { recursive: true })

  let host = "unknown"
  try { host = new URL(process.env.DATABASE_URL).host } catch {}

  const manifest = {
    createdAt: new Date().toISOString(),
    source: host,
    schemas,
    tables: {},
    totalRows: 0,
  }

  const parts = [
    "-- Githogoro data-only backup",
    `-- Created: ${manifest.createdAt}`,
    `-- Source:  ${host}`,
    "-- Schema DDL lives in prisma/schema.prisma and the *.sql files at the repo root.",
    `-- Restore: psql "$DIRECT_URL" -f data.sql`,
    "",
    "BEGIN;",
    "SET session_replication_role = replica;",
  ]

  for (const { table_schema, table_name } of tables) {
    const columns = await prisma.$queryRawUnsafe(
      `select column_name
         from information_schema.columns
        where table_schema = $1 and table_name = $2 and (is_generated is distinct from 'ALWAYS')
        order by ordinal_position`,
      table_schema,
      table_name,
    )
    const colNames = columns.map((c) => c.column_name)
    if (colNames.length === 0) continue

    const rows = await prisma.$queryRawUnsafe(`select * from ${ident(table_schema)}.${ident(table_name)}`)
    manifest.tables[`${table_schema}.${table_name}`] = rows.length
    manifest.totalRows += rows.length

    parts.push("")
    parts.push(`-- ${table_schema}.${table_name} (${rows.length} rows)`)
    parts.push(`DELETE FROM ${ident(table_schema)}.${ident(table_name)};`)

    const colList = colNames.map(ident).join(", ")
    const table = `${ident(table_schema)}.${ident(table_name)}`
    const BATCH = 100
    for (let i = 0; i < rows.length; i += BATCH) {
      const values = rows
        .slice(i, i + BATCH)
        .map((r) => "(" + colNames.map((c) => sqlLiteral(r[c])).join(", ") + ")")
        .join(",\n")
      parts.push(`INSERT INTO ${table} (${colList}) VALUES\n${values};`)
    }
  }

  parts.push("", "SET session_replication_role = DEFAULT;", "COMMIT;", "")

  const sql = parts.join("\n")
  writeFileSync(join(outDir, "data.sql"), sql)
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")

  const rel = outDir.startsWith(root) ? outDir.slice(root.length + 1) : outDir
  console.log(`Backup written to ${rel}/`)
  console.log(`  tables: ${Object.keys(manifest.tables).length}`)
  console.log(`  rows:   ${manifest.totalRows}`)
  console.log(`  file:   ${rel}/data.sql (${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB)`)
}

main()
  .catch(async (e) => {
    console.error("Backup failed:", e.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
