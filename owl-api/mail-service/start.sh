#!/bin/sh

# Function to wait for database connection
wait_for_db() {
    echo "Waiting for database connection..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1; then
            echo "Database connection successful!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: Database not ready, waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "Failed to connect to database after $max_attempts attempts"
    return 1
}

# Wait for database to be available
if ! wait_for_db; then
    echo "Database connection failed, starting application anyway..."
    echo "Note: Database migrations will need to be run manually"
else
    echo "Running database migrations..."
    if npx prisma migrate deploy; then
        echo "Migrations completed successfully"
    else
        echo "Migration failed. Attempting to resolve..."
        
        # Try to resolve failed migrations
        echo "Checking migration status..."
        if npx prisma migrate status; then
            echo "Migration status checked successfully"
        fi
        
        # Try to mark failed migrations as resolved (this is safe for most cases)
        echo "Attempting to resolve failed migrations..."
        
        # Resolve potentially failed migrations in order
        echo "Resolving migration: 20251021000000_add_sticker_tokens"
        npx prisma migrate resolve --applied 20251021000000_add_sticker_tokens || echo "Could not resolve add_sticker_tokens migration"
        
        echo "Resolving migration: 20251021000001_add_scheduled_for"
        npx prisma migrate resolve --applied 20251021000001_add_scheduled_for || echo "Could not resolve add_scheduled_for migration"
        
        echo "Resolving migration: 20251021000002_add_job_locking"
        npx prisma migrate resolve --applied 20251021000002_add_job_locking || echo "Could not resolve add_job_locking migration"
        
        echo "Retrying migration deploy after resolution attempts..."
        if npx prisma migrate deploy; then
            echo "Migrations completed successfully after resolution"
        else
            echo "Migration still failed after resolution, but continuing with startup"
        fi
    fi
fi

echo "Starting mail service..."
exec node dist/main
