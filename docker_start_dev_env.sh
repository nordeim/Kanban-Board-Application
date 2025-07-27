# Copy environment file
cp .env.development .env.local

# Start all services
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
docker compose -f docker-compose.dev.yml ps

# Run database migrations
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Seed the database
docker compose -f docker-compose.dev.yml exec app npm run db:seed

# View logs
docker compose -f docker-compose.dev.yml logs -f app
