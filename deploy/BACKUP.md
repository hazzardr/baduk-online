# PostgreSQL Backup and Restore Procedures

## Backup Strategy

Automated daily backups are configured using systemd timers. Backups are stored locally in `~/backups/postgres/` with a 7-day retention policy.

### Backup Details

- **Frequency**: Daily (randomized within 1 hour window)
- **Method**: Logical backup using `pg_dump`
- **Format**: Compressed SQL (gzip)
- **Retention**: 7 days
- **Location**: `~/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz`
- **Logs**: `~/backups/postgres/backup.log`

### Manual Backup

To create a manual backup:

```bash
~/bin/backup-postgres.sh
```

### Check Backup Status

View backup timer status:
```bash
systemctl --user status postgres-backup.timer
```

View recent backup logs:
```bash
tail -n 50 ~/backups/postgres/backup.log
```

List existing backups:
```bash
ls -lh ~/backups/postgres/backup_*.sql.gz
```

### Trigger Immediate Backup

```bash
systemctl --user start postgres-backup.service
```

## Restore Procedures

### Prerequisites

1. Ensure the PostgreSQL container is running:
   ```bash
   systemctl --user status postgres.service
   ```

2. Stop the application to prevent writes during restore:
   ```bash
   systemctl --user stop baduk.service
   ```

### Restore from Backup

1. Choose a backup file:
   ```bash
   ls -lh ~/backups/postgres/
   ```

2. Restore the database:
   ```bash
   # Drop existing database (WARNING: This deletes all current data)
   podman exec -it postgres psql -U baduk -d postgres -c "DROP DATABASE IF EXISTS baduk;"
   
   # Recreate database
   podman exec -it postgres psql -U baduk -d postgres -c "CREATE DATABASE baduk;"
   
   # Restore from backup
   gunzip -c ~/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz | \
     podman exec -i postgres psql -U baduk -d baduk
   ```

3. Verify the restore:
   ```bash
   podman exec postgres psql -U baduk -d baduk -c "\dt"
   ```

4. Restart the application:
   ```bash
   systemctl --user start baduk.service
   ```

### Restore to a Different Server

1. Copy the backup file to the target server:
   ```bash
   scp ~/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz user@target-server:~/
   ```

2. On the target server, follow the restore procedure above.

## Disaster Recovery

### Complete Data Loss

If the PostgreSQL volume is lost:

1. Recreate the volume and container:
   ```bash
   systemctl --user stop postgres.service
   podman volume rm postgres-data
   systemctl --user start postgres.service
   ```

2. Wait for PostgreSQL to initialize (check logs):
   ```bash
   journalctl --user -u postgres.service -f
   ```

3. Follow the restore procedure above.

### Backup Verification

Periodically verify backups can be restored:

1. Create a test restore in a temporary container:
   ```bash
   podman run -d --name postgres-test \
     -e POSTGRES_USER=baduk \
     -e POSTGRES_PASSWORD=test \
     -e POSTGRES_DB=baduk \
     postgres:17.5
   
   gunzip -c ~/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz | \
     podman exec -i postgres-test psql -U baduk -d baduk
   
   podman exec postgres-test psql -U baduk -d baduk -c "\dt"
   
   podman stop postgres-test
   podman rm postgres-test
   ```

## Off-site Backup (Recommended)

For production systems, implement off-site backups:

### Option 1: AWS S3

Add to backup script:
```bash
aws s3 cp "${BACKUP_FILE}" s3://your-bucket/postgres-backups/
```

### Option 2: Rsync to Remote Server

Add to backup script:
```bash
rsync -avz "${BACKUP_FILE}" backup-server:/path/to/backups/
```

### Option 3: Automated via Ansible

Create a cron job or systemd timer to sync backups:
```bash
rsync -avz --delete ~/backups/postgres/ backup-server:/backups/baduk-postgres/
```

## Monitoring

Set up monitoring alerts for:
- Backup failures (check exit code in logs)
- Backup age (alert if no backup in 25+ hours)
- Backup size anomalies (sudden size changes may indicate issues)
- Disk space in backup directory

## Security Considerations

- Backup files contain sensitive data - ensure proper permissions (0600)
- Consider encrypting backups for off-site storage
- Rotate backup encryption keys periodically
- Limit access to backup directory and scripts
- Use separate credentials for backup operations if possible
