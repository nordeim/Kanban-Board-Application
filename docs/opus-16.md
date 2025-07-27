# 🐳 SponsorFlow Docker Deployment Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Docker Architecture Overview](#docker-architecture-overview)
4. [Development Environment Setup](#development-environment-setup)
5. [Production Environment Setup](#production-environment-setup)
6. [Database Configuration](#database-configuration)
7. [Environment Variables Management](#environment-variables-management)
8. [Security Best Practices](#security-best-practices)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Scaling and Performance](#scaling-and-performance)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Maintenance and Updates](#maintenance-and-updates)

---

## Introduction

This comprehensive guide will walk you through deploying SponsorFlow using Docker containers, covering both development and production environments. Docker provides a consistent, isolated environment that ensures your application runs the same way across different systems, making it ideal for both local development and production deployment.

### Why Docker for SponsorFlow?

Docker offers several advantages for deploying a Next.js application with PostgreSQL:

1. **Consistency**: Identical environments across development, staging, and production
2. **Isolation**: Dependencies are containerized, preventing conflicts
3. **Scalability**: Easy horizontal scaling with container orchestration
4. **Portability**: Deploy anywhere Docker runs - cloud or on-premise
5. **Version Control**: Infrastructure as code with Dockerfiles
6. **Resource Efficiency**: Lighter than virtual machines
7. **Quick Setup**: New developers can start in minutes

### Architecture Overview

Our Docker setup consists of multiple services:

- **Next.js Application**: The main web application
- **PostgreSQL 16**: Primary database
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy and static file serving
- **Adminer**: Database management interface (development only)

---

## Prerequisites

Before beginning, ensure you have the following installed and configured:

### System Requirements

- **Operating System**: Linux, macOS, or Windows 10/11 with WSL2
- **RAM**: Minimum 8GB (16GB recommended for development)
- **Storage**: At least 10GB free space
- **CPU**: Multi-core processor recommended

### Software Requirements

1. **Docker Engine** (v24.0+)
   ```bash
   # Check Docker version
   docker --version
   
   # Should output: Docker version 24.0.x or higher
   ```

2. **Docker Compose** (v2.20+)
   ```bash
   # Check Docker Compose version
   docker compose version
   
   # Should output: Docker Compose version v2.20.x or higher
   ```

3. **Git** for cloning the repository
   ```bash
   git --version
   ```

4. **Text Editor** (VS Code, Sublime, etc.) for editing configuration files

### Installing Docker

#### On Ubuntu/Debian:
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### On macOS:
Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)

#### On Windows:
1. Install WSL2
2. Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
3. Enable WSL2 backend in Docker Desktop settings

---

## Docker Architecture Overview

### Container Structure

Our Docker architecture follows microservices principles:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Nginx     │  │  Next.js    │  │ PostgreSQL  │   │
│  │   Proxy     │◄─┤    App      │◄─┤  Database   │   │
│  │   Port 80   │  │  Port 3000  │  │  Port 5432  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│         ▲                │                             │
│         │         ┌──────┴──────┐                     │
│         │         │    Redis    │                     │
│         │         │   Cache     │                     │
│         │         │  Port 6379  │                     │
│         │         └─────────────┘                     │
└─────────┼───────────────────────────────────────────┘
          │
      Internet
```

### Volume Management

Docker volumes persist data beyond container lifecycle:

- **postgres_data**: Database files
- **redis_data**: Cache persistence
- **uploads**: User-uploaded files
- **logs**: Application and system logs

---

## Development Environment Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/nordeim/Kanban-Board-Application.git sponsorflow
cd sponsorflow
```

### Step 2: Create Development Docker Compose File

Create `docker-compose.dev.yml`:

```yaml
# docker-compose.dev.yml
# Development environment configuration
# Optimized for hot reloading and debugging

version: '3.9'

services:
  # PostgreSQL 16 Database
  postgres:
    image: postgres:16-alpine
    container_name: sponsorflow_postgres_dev
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-sponsorflow}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devsecret}
      POSTGRES_DB: ${POSTGRES_DB:-sponsorflow_dev}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.utf8"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-sponsorflow} -d ${POSTGRES_DB:-sponsorflow_dev}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sponsorflow_dev

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: sponsorflow_redis_dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --appendfilename "appendonly.aof"
    volumes:
      - redis_data_dev:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sponsorflow_dev

  # Next.js Application (Development Mode)
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
      args:
        - NODE_ENV=development
    container_name: sponsorflow_app_dev
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "9229:9229" # Node.js debugging port
    environment:
      # Application
      NODE_ENV: development
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      
      # Database
      DATABASE_URL: postgresql://${POSTGRES_USER:-sponsorflow}:${POSTGRES_PASSWORD:-devsecret}@postgres:5432/${POSTGRES_DB:-sponsorflow_dev}?schema=public
      
      # Redis
      REDIS_URL: redis://redis:6379
      
      # Auth
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:-devsecret_minimum_32_characters_long}
      
      # OAuth (use your actual credentials)
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      
      # Development specific
      NEXT_TELEMETRY_DISABLED: 1
      WATCHPACK_POLLING: true # For file watching in Docker
    volumes:
      # Mount source code for hot reloading
      - ./src:/app/src:delegated
      - ./public:/app/public:delegated
      - ./prisma:/app/prisma:delegated
      - ./next.config.js:/app/next.config.js:delegated
      - ./tailwind.config.ts:/app/tailwind.config.ts:delegated
      - ./tsconfig.json:/app/tsconfig.json:delegated
      - ./.env.local:/app/.env.local:delegated
      
      # Prevent node_modules from being overwritten
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev
    networks:
      - sponsorflow_dev

  # Database Administration Tool
  adminer:
    image: adminer:4.8.1
    container_name: sponsorflow_adminer_dev
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
      ADMINER_DESIGN: pepa-linha-dark
    depends_on:
      - postgres
    networks:
      - sponsorflow_dev

  # Mailhog for Email Testing
  mailhog:
    image: mailhog/mailhog:latest
    container_name: sponsorflow_mailhog_dev
    restart: unless-stopped
    ports:
      - "1025:1025" # SMTP server
      - "8025:8025" # Web UI
    networks:
      - sponsorflow_dev

networks:
  sponsorflow_dev:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data_dev:
    driver: local
  redis_data_dev:
    driver: local
```

### Step 3: Create Development Dockerfile

Create `Dockerfile.dev`:

```dockerfile
# Dockerfile.dev
# Development environment with hot reloading
FROM node:20-alpine AS base

# Install dependencies for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose ports
EXPOSE 3000 9229

# Development command
CMD ["npm", "run", "dev"]
```

### Step 4: Create Development Environment File

Create `.env.development`:

```bash
# Development Environment Variables
# Copy to .env.local and update with your values

# Database
POSTGRES_USER=sponsorflow
POSTGRES_PASSWORD=devsecret
POSTGRES_DB=sponsorflow_dev

# NextAuth
NEXTAUTH_SECRET=development_secret_at_least_32_characters_long

# OAuth - Update with your credentials
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret

# Email (using Mailhog)
EMAIL_SERVER_HOST=mailhog
EMAIL_SERVER_PORT=1025
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=dev@sponsorflow.local
```

### Step 5: Initialize Database Script

Create `scripts/init-db.sql`:

```sql
-- Database initialization script
-- Creates necessary extensions and initial setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'CREATOR', 'EDITOR', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE sponsorflow_dev TO sponsorflow;
GRANT CREATE ON SCHEMA public TO sponsorflow;

-- Performance optimizations
ALTER DATABASE sponsorflow_dev SET random_page_cost = 1.1;
ALTER DATABASE sponsorflow_dev SET effective_cache_size = '3GB';
ALTER DATABASE sponsorflow_dev SET shared_buffers = '1GB';
```

### Step 6: Start Development Environment

```bash
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
```

### Development Workflow

1. **Access the application**: http://localhost:3000
2. **Access Adminer**: http://localhost:8080
3. **Access Mailhog**: http://localhost:8025

4. **View logs**:
   ```bash
   # All services
   docker compose -f docker-compose.dev.yml logs -f
   
   # Specific service
   docker compose -f docker-compose.dev.yml logs -f app
   ```

5. **Execute commands**:
   ```bash
   # Run migrations
   docker compose -f docker-compose.dev.yml exec app npm run db:migrate
   
   # Open Prisma Studio
   docker compose -f docker-compose.dev.yml exec app npm run db:studio
   ```

6. **Debugging**:
   - Node.js debugger available on port 9229
   - Configure VS Code to attach to the debugger

---

## Production Environment Setup

### Step 1: Create Production Dockerfile

Create `Dockerfile`:

```dockerfile
# Dockerfile
# Multi-stage production build optimized for size and security

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Install all dependencies for building
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Create required directories
RUN mkdir -p /app/uploads /app/logs
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
```

### Step 2: Create Production Docker Compose

Create `docker-compose.yml`:

```yaml
# docker-compose.yml
# Production environment configuration
# Optimized for performance, security, and reliability

version: '3.9'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: sponsorflow_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./public:/usr/share/nginx/html:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - sponsorflow_prod
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL 16 Database
  postgres:
    image: postgres:16-alpine
    container_name: sponsorflow_postgres
    restart: always
    ports:
      - "127.0.0.1:5432:5432" # Only bind to localhost
    environment:
      POSTGRES_USER_FILE: /run/secrets/postgres_user
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
      POSTGRES_DB: ${POSTGRES_DB:-sponsorflow}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.utf8"
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
      - ./backups:/backups
    secrets:
      - postgres_user
      - postgres_password
    networks:
      - sponsorflow_prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$(cat /run/secrets/postgres_user) -d ${POSTGRES_DB:-sponsorflow}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # Redis Cache with Persistence
  redis:
    image: redis:7-alpine
    container_name: sponsorflow_redis
    restart: always
    ports:
      - "127.0.0.1:6379:6379" # Only bind to localhost
    command: >
      redis-server
      --appendonly yes
      --appendfilename "appendonly.aof"
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --requirepass $${REDIS_PASSWORD}
    environment:
      REDIS_PASSWORD_FILE: /run/secrets/redis_password
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    secrets:
      - redis_password
    networks:
      - sponsorflow_prod
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "$$(cat /run/secrets/redis_password)", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_ID=${BUILD_ID:-latest}
    image: sponsorflow:${BUILD_ID:-latest}
    container_name: sponsorflow_app
    restart: always
    expose:
      - "3000"
    environment:
      # Application
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: ${APP_URL:-https://sponsorflow.example.com}
      
      # Database
      DATABASE_URL_FILE: /run/secrets/database_url
      
      # Redis
      REDIS_URL_FILE: /run/secrets/redis_url
      
      # Auth
      NEXTAUTH_URL: ${APP_URL:-https://sponsorflow.example.com}
      NEXTAUTH_SECRET_FILE: /run/secrets/nextauth_secret
      
      # OAuth
      GOOGLE_CLIENT_ID_FILE: /run/secrets/google_client_id
      GOOGLE_CLIENT_SECRET_FILE: /run/secrets/google_client_secret
      
      # Email
      EMAIL_SERVER_HOST: ${EMAIL_SERVER_HOST}
      EMAIL_SERVER_PORT: ${EMAIL_SERVER_PORT}
      EMAIL_FROM: ${EMAIL_FROM}
      
      # Performance
      NODE_OPTIONS: "--max-old-space-size=2048"
    volumes:
      - uploads:/app/uploads
      - app_logs:/app/logs
    secrets:
      - database_url
      - redis_url
      - nextauth_secret
      - google_client_id
      - google_client_secret
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sponsorflow_prod
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 30s
      start_period: 40s
      retries: 3
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  # Backup Service
  backup:
    image: postgres:16-alpine
    container_name: sponsorflow_backup
    restart: always
    environment:
      PGPASSWORD_FILE: /run/secrets/postgres_password
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    secrets:
      - postgres_password
    networks:
      - sponsorflow_prod
    depends_on:
      - postgres
    entrypoint: ["/bin/sh", "-c"]
    command: |
      "while true; do
        /backup.sh
        sleep 86400
      done"

networks:
  sponsorflow_prod:
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/16

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local
  app_logs:
    driver: local
  nginx_logs:
    driver: local

secrets:
  postgres_user:
    file: ./secrets/postgres_user.txt
  postgres_password:
    file: ./secrets/postgres_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
  database_url:
    file: ./secrets/database_url.txt
  redis_url:
    file: ./secrets/redis_url.txt
  nextauth_secret:
    file: ./secrets/nextauth_secret.txt
  google_client_id:
    file: ./secrets/google_client_id.txt
  google_client_secret:
    file: ./secrets/google_client_secret.txt
```

### Step 3: Create Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
# nginx/nginx.conf
# Main Nginx configuration

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com wss://sponsorflow.example.com;" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=2r/s;

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
```

Create `nginx/conf.d/sponsorflow.conf`:

```nginx
# nginx/conf.d/sponsorflow.conf
# SponsorFlow application configuration

upstream sponsorflow_backend {
    least_conn;
    server app:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name sponsorflow.example.com www.sponsorflow.example.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name sponsorflow.example.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Root directory for static files
    root /usr/share/nginx/html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static files (Next.js)
    location /_next/static {
        alias /usr/share/nginx/html/_next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Images and other assets
    location /images {
        alias /usr/share/nginx/html/images;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # API routes with rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://sponsorflow_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Authentication routes with stricter rate limiting
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
        
        proxy_pass http://sponsorflow_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time features
    location /ws {
        proxy_pass http://sponsorflow_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Main application
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://sponsorflow_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache control for HTML
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### Step 4: Create Health Check Script

Create `healthcheck.js`:

```javascript
// healthcheck.js
// Production health check endpoint

const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  timeout: 2000,
};

const healthCheck = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('Health check error:', err);
  process.exit(1);
});

healthCheck.end();
```

### Step 5: Create Secrets Directory

```bash
# Create secrets directory
mkdir -p secrets

# Generate secure passwords
openssl rand -base64 32 > secrets/postgres_password.txt
openssl rand -base64 32 > secrets/redis_password.txt
openssl rand -base64 32 > secrets/nextauth_secret.txt

# Create other secret files
echo "sponsorflow" > secrets/postgres_user.txt
echo "your-google-client-id" > secrets/google_client_id.txt
echo "your-google-client-secret" > secrets/google_client_secret.txt

# Create database URL
echo "postgresql://sponsorflow:$(cat secrets/postgres_password.txt)@postgres:5432/sponsorflow?schema=public" > secrets/database_url.txt

# Create Redis URL
echo "redis://:$(cat secrets/redis_password.txt)@redis:6379" > secrets/redis_url.txt

# Set proper permissions
chmod 600 secrets/*.txt
```

### Step 6: Create Backup Script

Create `scripts/backup.sh`:

```bash
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
```

### Step 7: Deploy to Production

```bash
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
```

---

## Database Configuration

### PostgreSQL 16 Optimization

PostgreSQL 16 brings significant performance improvements. Here's how to optimize it for SponsorFlow:

#### 1. Create Custom PostgreSQL Configuration

Create `postgres/postgresql.conf`:

```conf
# PostgreSQL 16 Configuration for SponsorFlow
# Optimized for web application workloads

# Memory Configuration
shared_buffers = 256MB              # 25% of available RAM
effective_cache_size = 1GB          # 50-75% of available RAM
work_mem = 4MB                      # Per operation memory
maintenance_work_mem = 64MB         # For VACUUM, CREATE INDEX

# Checkpoint Configuration
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Query Planner
random_page_cost = 1.1              # For SSD storage
effective_io_concurrency = 200      # For SSD storage
default_statistics_target = 100

# Logging
log_min_duration_statement = 100    # Log slow queries (ms)
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# Connection Settings
max_connections = 200
superuser_reserved_connections = 3

# Performance Features (New in PG16)
enable_partitionwise_join = on
enable_partitionwise_aggregate = on
jit = on

# Parallel Query Execution
max_parallel_workers_per_gather = 2
max_parallel_workers = 8
max_parallel_maintenance_workers = 2

# Autovacuum Tuning
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 30s
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

#### 2. Database Maintenance Script

Create `scripts/db-maintenance.sh`:

```bash
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
```

---

## Environment Variables Management

### Production Environment Structure

Create a comprehensive `.env.production` template:

```bash
# .env.production
# Production Environment Variables Template
# Copy to .env and update with actual values

# ==========================================
# APPLICATION SETTINGS
# ==========================================
NODE_ENV=production
APP_URL=https://sponsorflow.example.com
BUILD_ID=v2.0.0

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
POSTGRES_DB=sponsorflow
POSTGRES_USER=sponsorflow_prod
POSTGRES_PASSWORD=<generate-secure-password>

# Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_ACQUIRE=30000
DATABASE_POOL_IDLE=10000

# ==========================================
# REDIS CONFIGURATION
# ==========================================
REDIS_PASSWORD=<generate-secure-password>
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000

# ==========================================
# AUTHENTICATION
# ==========================================
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# OAuth Providers
GOOGLE_CLIENT_ID=<your-production-google-client-id>
GOOGLE_CLIENT_SECRET=<your-production-google-client-secret>

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@sponsorflow.example.com

# ==========================================
# MONITORING & ANALYTICS
# ==========================================
SENTRY_DSN=https://<your-sentry-dsn>
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ==========================================
# SECURITY SETTINGS
# ==========================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
SESSION_TIMEOUT=3600000
CORS_ALLOWED_ORIGINS=https://sponsorflow.example.com

# ==========================================
# PERFORMANCE SETTINGS
# ==========================================
CACHE_TTL=3600
STATIC_CACHE_MAX_AGE=31536000
API_TIMEOUT=30000
```

### Managing Secrets with Docker

For enhanced security, use Docker secrets in production:

```bash
# Create Docker secrets from files
docker secret create postgres_password secrets/postgres_password.txt
docker secret create redis_password secrets/redis_password.txt
docker secret create nextauth_secret secrets/nextauth_secret.txt

# Or create from stdin
echo "your-secret-value" | docker secret create secret_name -

# List secrets
docker secret ls

# Remove a secret
docker secret rm secret_name
```

---

## Security Best Practices

### 1. Container Security

#### Implement Security Scanning

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'sponsorflow:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

#### 2. Network Security

Implement network policies:

```yaml
# docker-compose.security.yml
# Additional security configurations

version: '3.9'

services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache

  postgres:
    security_opt:
      - no-new-privileges:true
    environment:
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"

  redis:
    security_opt:
      - no-new-privileges:true
    sysctls:
      net.core.somaxconn: 1024
```

### 3. SSL/TLS Configuration

Generate SSL certificates for local development:

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# For production, use Let's Encrypt
docker run -it --rm \
    -v ./nginx/ssl:/etc/letsencrypt \
    -v ./nginx/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@sponsorflow.example.com \
    --agree-tos \
    --no-eff-email \
    -d sponsorflow.example.com
```

### 4. Database Security

Implement database security measures:

```sql
-- Create read-only user for analytics
CREATE USER sponsorflow_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE sponsorflow TO sponsorflow_readonly;
GRANT USAGE ON SCHEMA public TO sponsorflow_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sponsorflow_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sponsorflow_readonly;

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policy for user isolation
CREATE POLICY user_isolation ON deals
    FOR ALL
    TO sponsorflow
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## Monitoring and Logging

### 1. Implement Centralized Logging

Create `docker-compose.monitoring.yml`:

```yaml
# docker-compose.monitoring.yml
# Monitoring stack addition

version: '3.9'

services:
  # Prometheus for metrics
  prometheus:
    image: prom/prometheus:latest
    container_name: sponsorflow_prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - sponsorflow_prod

  # Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: sponsorflow_grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3001:3000"
    networks:
      - sponsorflow_prod

  # Loki for log aggregation
  loki:
    image: grafana/loki:latest
    container_name: sponsorflow_loki
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - sponsorflow_prod

  # Promtail for log collection
  promtail:
    image: grafana/promtail:latest
    container_name: sponsorflow_promtail
    volumes:
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/log:/var/log:ro
      - app_logs:/app/logs:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - sponsorflow_prod

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

### 2. Application Metrics

Create `monitoring/prometheus.yml`:

```yaml
# Prometheus configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Node exporter
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # PostgreSQL exporter
  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Next.js application metrics
  - job_name: 'nextjs'
    static_configs:
      - targets: ['app:9464']
```

### 3. Custom Metrics Implementation

Add to your Next.js application:

```typescript
// lib/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Define metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const activeDeals = new Gauge({
  name: 'sponsorflow_active_deals',
  help: 'Number of active deals',
  labelNames: ['stage'],
});

export const dealValue = new Counter({
  name: 'sponsorflow_deal_value_total',
  help: 'Total value of deals',
  labelNames: ['currency'],
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(activeDeals);
register.registerMetric(dealValue);
```

---

## Scaling and Performance

### 1. Horizontal Scaling with Docker Swarm

Initialize Docker Swarm:

```bash
# Initialize swarm on manager node
docker swarm init --advertise-addr <MANAGER-IP>

# Deploy stack
docker stack deploy -c docker-compose.yml sponsorflow

# Scale services
docker service scale sponsorflow_app=5

# View services
docker service ls

# View service logs
docker service logs sponsorflow_app
```

### 2. Load Balancing Configuration

Update Nginx for multiple app instances:

```nginx
upstream sponsorflow_backend {
    least_conn;
    
    # Health check
    health_check interval=5s fails=3 passes=2;
    
    # Backend servers
    server app_1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app_2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app_3:3000 weight=1 max_fails=3 fail_timeout=30s;
    
    # Keep connections alive
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}
```

### 3. Caching Strategy

Implement Redis caching in your application:

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch and cache
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### 4. Database Connection Pooling

Configure Prisma for production:

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Connection pool configuration via connection string:
// postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=30
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Container Won't Start

```bash
# Check logs
docker compose logs app

# Common solutions:
# - Check environment variables
# - Verify database connection
# - Ensure ports are not in use
# - Check file permissions

# Debug mode
docker compose run --rm app sh
```

#### 2. Database Connection Issues

```bash
# Test database connection
docker compose exec postgres psql -U sponsorflow -d sponsorflow -c "SELECT 1;"

# Check PostgreSQL logs
docker compose logs postgres

# Verify environment variables
docker compose config

# Reset database
docker compose down -v
docker compose up -d
```

#### 3. Performance Issues

```bash
# Check resource usage
docker stats

# Analyze slow queries
docker compose exec postgres psql -U sponsorflow -d sponsorflow -c "
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;"

# Check application metrics
curl http://localhost:3000/api/metrics
```

#### 4. Memory Leaks

```bash
# Monitor memory usage
docker compose exec app top

# Heap snapshot for Node.js
docker compose exec app node --inspect=0.0.0.0:9229

# Restart with memory limits
docker compose up -d --force-recreate app
```

### Debugging Tools

#### 1. Interactive Shell Access

```bash
# Access running container
docker compose exec app sh

# Start new container with shell
docker compose run --rm app sh

# Access database
docker compose exec postgres psql -U sponsorflow -d sponsorflow
```

#### 2. Log Analysis

```bash
# Follow logs in real-time
docker compose logs -f --tail=100 app

# Export logs
docker compose logs > sponsorflow_logs.txt

# Filter logs by time
docker compose logs --since 2024-01-01 --until 2024-01-02
```

---

## Maintenance and Updates

### 1. Update Strategy

Create `scripts/update.sh`:

```bash
#!/bin/bash
# Production update script with zero downtime

set -e

echo "Starting SponsorFlow update process..."

# Pull latest changes
git pull origin main

# Build new image
docker compose build app

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Rolling update
docker compose up -d --no-deps --scale app=2 app

# Wait for health checks
sleep 30

# Remove old containers
docker compose up -d --no-deps --scale app=1 app

# Clean up
docker image prune -f

echo "Update completed successfully!"
```

### 2. Backup and Restore

#### Automated Backup Script

```bash
#!/bin/bash
# backup-automation.sh

# Configuration
BACKUP_DIR="/backups"
S3_BUCKET="s3://sponsorflow-backups"
RETENTION_DAYS=30

# Perform backup
docker compose exec -T postgres pg_dump -U sponsorflow -d sponsorflow | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Upload to S3
aws s3 sync $BACKUP_DIR $S3_BUCKET --exclude "*" --include "*.sql.gz"

# Clean old local backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Clean old S3 backups
aws s3 ls $S3_BUCKET | while read -r line; do
  createDate=$(echo $line | awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "$RETENTION_DAYS days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk {'print $4'})
    aws s3 rm $S3_BUCKET/$fileName
  fi
done
```

#### Restore Procedure

```bash
#!/bin/bash
# restore.sh

# Stop application
docker compose stop app

# Restore database
gunzip < /backups/backup_20240101_120000.sql.gz | docker compose exec -T postgres psql -U sponsorflow -d sponsorflow

# Run migrations
docker compose exec app npx prisma migrate deploy

# Start application
docker compose start app

# Verify
docker compose exec app npm run healthcheck
```

### 3. Monitoring Checklist

Daily:
- [ ] Check application health endpoints
- [ ] Review error logs
- [ ] Monitor disk space
- [ ] Verify backup completion

Weekly:
- [ ] Analyze performance metrics
- [ ] Review security logs
- [ ] Check for updates
- [ ] Test backup restoration

Monthly:
- [ ] Update dependencies
- [ ] Rotate secrets
- [ ] Performance optimization
- [ ] Security audit

---

## Conclusion

This comprehensive Docker deployment guide provides everything needed to successfully deploy SponsorFlow in both development and production environments. The setup includes:

1. **Development Environment**: Hot reloading, debugging tools, and convenient database management
2. **Production Environment**: Optimized builds, security hardening, and high availability
3. **Database Management**: PostgreSQL 16 with performance tuning and automated backups
4. **Security**: SSL/TLS, secrets management, and network isolation
5. **Monitoring**: Comprehensive logging and metrics collection
6. **Scaling**: Horizontal scaling capabilities with load balancing
7. **Maintenance**: Automated updates and backup procedures

By following this guide, you'll have a robust, scalable, and secure deployment of SponsorFlow that can grow with your needs. The Docker setup ensures consistency across environments while providing the flexibility to adapt to different deployment scenarios.

Remember to:
- Regularly update your containers and dependencies
- Monitor system performance and logs
- Maintain secure backup procedures
- Follow the security best practices outlined
- Test your disaster recovery procedures

With this Docker deployment, SponsorFlow is ready to handle production workloads while maintaining the flexibility needed for continued development and scaling.
