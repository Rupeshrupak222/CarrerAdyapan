const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon DB');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "EmailLog" (
        "id" TEXT PRIMARY KEY,
        "applicationId" TEXT,
        "candidateName" TEXT,
        "recipientEmail" TEXT NOT NULL,
        "emailType" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "sentBy" TEXT,
        "status" TEXT DEFAULT 'SENT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "EmailLog_applicationId_idx" ON "EmailLog"("applicationId");
      CREATE INDEX IF NOT EXISTS "EmailLog_emailType_idx" ON "EmailLog"("emailType");
      CREATE INDEX IF NOT EXISTS "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");
    `);

    console.log('EmailLog table and indexes verified successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
