// Run with: npm run db:setup
// Requires POSTGRES_URL environment variable

const { sql } = require("@vercel/postgres");
const fs = require("fs");
const path = require("path");

async function setup() {
  console.log("ð¤ Brotherhood Connect â Database Setup");
  console.log("âââââââââââââââââââââââââââââââââââââââ");

  try {
    const schema = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      await sql.query(statement);
      console.log("â Executed:", statement.substring(0, 60) + "...");
    }

    console.log("\nâ Database setup complete!");
    console.log("You can now run: npm run dev");
  } catch (error) {
    console.error("â Setup failed:", error.message);
    console.log("\nMake sure you have:");
    console.log("1. Created a Vercel Postgres database in your dashboard");
    console.log("2. Linked it to your project (vercel link && vercel env pull)");
    process.exit(1);
  }
}

setup();
