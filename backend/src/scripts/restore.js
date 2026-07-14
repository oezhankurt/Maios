/**
 * Restore a database from a .sql dump produced by backup.js.
 * Usage: node src/scripts/restore.js ./backups/maios-<stamp>.sql
 */
require('dotenv').config();
const { spawnSync } = require('child_process');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  logger.error('Provide a valid backup file: node src/scripts/restore.js <file.sql>');
  process.exit(1);
}

const env = { ...process.env, PGPASSWORD: config.db.password };
const args = config.db.url
  ? [config.db.url, '-f', file]
  : [
      '-h', config.db.host,
      '-p', String(config.db.port),
      '-U', config.db.user,
      '-d', config.db.name,
      '-f', file,
    ];

const result = spawnSync('psql', args, { env, stdio: 'inherit' });
if (result.status === 0) {
  logger.info(`Restore complete from ${file}`);
  process.exit(0);
} else {
  logger.error('Restore failed.');
  process.exit(1);
}
