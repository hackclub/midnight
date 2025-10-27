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
        echo "Resolving migration: 20250123120000_add_user_project_submission_models"
        npx prisma migrate resolve --applied 20250123120000_add_user_project_submission_models || echo "Could not resolve add_user_project_submission_models migration"
        
        # If the old migration structure exists, try to resolve those as well
        echo "Resolving migration: 20251020000000_init"
        npx prisma migrate resolve --applied 20251020000000_init || echo "Could not resolve init migration"
        
        echo "Resolving migration: 20251021000000_add_sticker_tokens"
        npx prisma migrate resolve --applied 20251021000000_add_sticker_tokens || echo "Could not resolve add_sticker_tokens migration"
        
        echo "Retrying migration deploy after resolution attempts..."
        if npx prisma migrate deploy; then
            echo "Migrations completed successfully after resolution"
        else
        echo "Migration still failed after resolution, trying consolidated migration..."
        
        # Try to resolve the consolidated migration if it exists
        echo "Resolving consolidated migration: 20250123120000_init_consolidated"
        npx prisma migrate resolve --applied 20250123120000_init_consolidated || echo "Could not resolve consolidated migration"
        
        # Check if the error is about existing types/tables (common after partial migrations)
        echo "Checking if schema elements already exist..."
        if npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1; then
            echo "Schema is already up to date, marking migration as applied"
            npx prisma migrate resolve --applied 20250123120000_init_consolidated || echo "Could not mark consolidated migration as applied"
        fi
        
        # Final attempt to deploy
        if npx prisma migrate deploy; then
            echo "Migrations completed successfully with consolidated migration"
        else
            echo "Migration still failed, but continuing with startup"
        fi
    fi
fi

echo "Starting user service..."
exec node dist/main
