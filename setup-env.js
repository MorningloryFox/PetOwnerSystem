#!/usr/bin/env node

// Script to help set up environment variables
import { config } from 'dotenv';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

config();

console.log('🔧 Setting up environment variables...');

const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_database_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

# Optional: Additional configuration
DATABASE_URL_NON_POOLING=
`;

// Check if .env file exists
const envPath = join(process.cwd(), '.env');
const envExamplePath = join(process.cwd(), '.env.example');

if (!existsSync(envPath)) {
  writeFileSync(envExamplePath, envExample);
  console.log('✅ Created .env.example file');
  console.log('📋 Please copy .env.example to .env and fill in your Supabase credentials');
} else {
  console.log('✅ .env file already exists');
}

// Display current configuration
console.log('\n📊 Current configuration:');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('Database URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

// Instructions
console.log('\n📖 Instructions:');
console.log('1. Get your Supabase credentials from https://supabase.com/dashboard');
console.log('2. Copy .env.example to .env');
console.log('3. Fill in your actual credentials');
console.log('4. Run: node test-supabase-connection.js');
console.log('5. Run: node create-tables.js');
