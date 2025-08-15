# Supabase Connection and Database Setup Guide

This guide will help you test the connection with Supabase and create the corresponding tables in the database.

## Prerequisites

1. **Supabase Account**: You need a Supabase account and project
2. **Environment Variables**: You need to configure the connection details

## Step 1: Configure Environment Variables

### Option A: Using .env file
Create a `.env` file in the root directory with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://username:password@host:port/database
```

### Option B: Using .env.example
Run the setup script to create the environment file:
```bash
node setup-env.js
```

## Step 2: Test Supabase Connection

Run the connection test:
```bash
node test-supabase-connection.js
```

This will:
- ✅ Check if environment variables are properly configured
- ✅ Test Supabase client connection
- ✅ Test database connection
- ✅ List existing tables

## Step 3: Create Database Tables

Run the table creation script:
```bash
node create-tables.js
```

This will:
- ✅ Generate migration files based on the schema
- ✅ Apply migrations to create all tables
- ✅ Verify table creation

## Database Schema Overview

The following tables will be created:

### Core Tables
- **companies**: Multi-tenant support
- **users**: Authentication and user management
- **customers**: Customer information
- **pets**: Pet information linked to customers

### Business Tables
- **services**: Available services and pricing
- **package_types**: Package definitions
- **customer_packages**: Customer package purchases
- **appointments**: Service appointments
- **notifications**: Customer notifications

### Relationship Tables
- **package_type_services**: Package-service relationships
- **customer_package_services**: Customer package service tracking
- **package_usages**: Package usage history

## Troubleshooting

### Connection Issues
1. **Check credentials**: Ensure all environment variables are correct
2. **SSL requirement**: Supabase requires SSL connections
3. **Firewall**: Ensure your IP is allowed in Supabase settings

### Migration Issues
1. **Existing tables**: The script will skip existing tables
2. **Schema changes**: Run `npx drizzle-kit generate` to create new migrations
3. **Reset database**: Use `npx drizzle-kit push` to reset and recreate tables

### Common Errors
- **"DATABASE_URL not found"**: Ensure .env file exists and is properly configured
- **"SSL required"**: Check if SSL is enabled in your connection string
- **"Permission denied"**: Verify your Supabase project settings and credentials

## Verification

After setup, you can verify the connection by:

1. **Check Supabase Dashboard**: Log into your Supabase project and verify tables exist
2. **Test API endpoints**: Use the test script to verify functionality
3. **Check logs**: Review console output for any errors

## Next Steps

1. **Start development server**: `npm run dev`
2. **Test functionality**: Use the application to ensure everything works
3. **Monitor usage**: Check Supabase dashboard for usage and performance

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check the error logs for specific error messages
