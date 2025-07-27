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
