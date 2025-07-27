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

# Access the application: http://localhost:3000

# Access Adminer: http://localhost:8080

# Access Mailhog: http://localhost:8025

# View logs:
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f app
