#!/bin/sh
# backup.sh
# Automated PostgreSQL backup script

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sponsorflow_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Read credentials
POSTGRES_USER=$(cat /run/secrets/postgres_user)
POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)

# Create backup
echo "Starting backup at $(date)"
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h postgres \
    -U $POSTGRES_USER \
    -d sponsorflow \
    --verbose \
    --no-owner \
    --no-privileges \
    --format=custom \
    --compress=9 \
    > $BACKUP_FILE

# Check backup size
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "Backup completed: $BACKUP_FILE (Size: $BACKUP_SIZE)"

# Remove old backups
echo "Removing backups older than $RETENTION_DAYS days"
find $BACKUP_DIR -name "sponsorflow_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "Current backups:"
ls -lh $BACKUP_DIR/sponsorflow_backup_*.sql.gz

echo "Backup process completed at $(date)"
