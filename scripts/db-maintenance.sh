#!/bin/bash
# Database maintenance script

set -e

echo "Starting database maintenance..."

# Analyze all tables
docker compose exec -T postgres psql -U sponsorflow -d sponsorflow -c "ANALYZE;"

# Reindex for performance
docker compose exec -T postgres psql -U sponsorflow -d sponsorflow -c "REINDEX DATABASE sponsorflow;"

# Update table statistics
docker compose exec -T postgres psql -U sponsorflow -d sponsorflow -c "
    SELECT schemaname, tablename, 
           pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

echo "Database maintenance completed"
