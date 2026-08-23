const { Client } = require('pg');
require('dotenv').config({ path: 'F:/Hiring platform/backend/.env' });

const connectionString = process.env.DATABASE_URL;

async function migrate() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon PostgreSQL DB.');

  const sqlStatements = [
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsScore" INTEGER;`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsStatus" TEXT DEFAULT 'ATS_NOT_CHECKED';`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsAnalyzedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsAnalyzedBy" TEXT;`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsResult" JSONB;`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsMatchedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsPartialSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsMissingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsExperienceMatch" JSONB;`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsEducationMatch" JSONB;`,
    `ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "atsKeywordMatch" JSONB;`,
    `CREATE TABLE IF NOT EXISTS "ATSAnalysis" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "applicationId" TEXT NOT NULL,
      "runNumber" INTEGER NOT NULL DEFAULT 1,
      "score" INTEGER NOT NULL,
      "result" JSONB,
      "matchedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "partialSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "experienceMatch" JSONB,
      "educationMatch" JSONB,
      "keywordMatch" JSONB,
      "recommendation" TEXT,
      "analyzedBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ATSAnalysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "ATSAnalysis_applicationId_idx" ON "ATSAnalysis"("applicationId");`,
    `CREATE INDEX IF NOT EXISTS "ATSAnalysis_createdAt_idx" ON "ATSAnalysis"("createdAt");`,
  ];

  for (const sql of sqlStatements) {
    await client.query(sql);
    console.log('Executed:', sql.slice(0, 60) + '...');
  }

  console.log('✅ ALL ATS DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
