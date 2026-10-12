// Sets a new password for an existing account (useful when there is no "forgot password" yet).
// Usage: npm run user:password -- someone@example.com   (reads DATABASE_URL from .env.local)
// The password is typed in hidden and never printed.
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const email = String(process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Add the account's email, e.g. npm run user:password -- admin@formtified.com");
  process.exit(1);
}

// Asks a question without showing what is typed.
function askHidden(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  let prompted = false;
  rl._writeToOutput = (s) => {
    if (!prompted) {
      process.stdout.write(s);
      prompted = true;
    }
  };
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

const sql = neon(url);

try {
  const rows = await sql.query("SELECT id FROM users WHERE email = $1", [email]);
  if (!rows.length) {
    console.error(`No account found for ${email}. Sign up with that email first.`);
    process.exit(1);
  }

  const password = await askHidden("New password (at least 8 characters, hidden): ");
  if (password.length < 8 || password.length > 100) {
    console.error("Password must be 8 to 100 characters. Nothing was changed.");
    process.exit(1);
  }
  const again = await askHidden("Type it again: ");
  if (again !== password) {
    console.error("The two passwords don't match. Nothing was changed.");
    process.exit(1);
  }

  // Same hashing as signup, so the login page accepts it. Raising session_version signs the account out everywhere.
  const hash = await bcrypt.hash(password, 10);
  await sql.query(
    "UPDATE users SET password_hash = $1, session_version = session_version + 1 WHERE id = $2",
    [hash, rows[0].id],
  );
  console.log(`Password updated for ${email}. You can log in now.`);
} catch (e) {
  console.error("Could not update the password:", e.message);
  process.exit(1);
}
