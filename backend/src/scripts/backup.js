/**
 * Database backup via pg_dump. Writes a timestamped .sql file to ./backups.
 * Usage: node src/scripts/backup.js
 */
require('dotenv').config();
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const backupDir = path.join(__dirname, '..', '..', 'backups');
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(backupDir, `maios-${stamp}.sql`);

const env = { ...process.env, PGPASSWORD: config.db.password };
const args = config.db.url
  ? [config.db.url, '-f', outFile]
  : [
      '-h', config.db.host,
      '-p', String(config.db.port),
      '-U', config.db.user,
      '-d', config.db.name,
      '-f', outFile,
    ];

const result = spawnSync('pg_dump', args, { env, stdio: 'inherit' });
if (result.status === 0) {
  logger.info(`Backup written to ${outFile}`);
  process.exit(0);
} else {
  logger.error('Backup failed. Is pg_dump installed and are credentials correct?');
  process.exit(1);
}
