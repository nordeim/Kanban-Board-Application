# Build the application
docker compose build

# Start all services
docker compose up -d

# Check service status
docker compose ps

# Run database migrations
docker compose exec app npx prisma migrate deploy

# View logs
docker compose logs -f

# Scale the application
docker compose up -d --scale app=3
