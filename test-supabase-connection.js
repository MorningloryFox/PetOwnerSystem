#!/usr/bin/env node

// Test script to verify Supabase connection
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './shared/schema.js';

// Load environment variables
config();

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check environment variables
    console.log('\n📋 Environment Variables Check:');
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

    // Test 2: Test Supabase client connection
    console.log('\n🔗 Testing Supabase Client Connection...');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );
    
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Supabase client connection failed:', error.message);
    } else {
      console.log('✅ Supabase client connection successful');
    }

    // Test 3: Test database connection
    console.log('\n🗄️ Testing Database Connection...');
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres.mdoalcyygfpblwudtoie:scRJGXtAkKgvFo9t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";
    
    const client = postgres(connectionString, {
      ssl: 'require',
      max: 1,
    });
    
    const db = drizzle(client, { schema });
    
    // Test basic query
    const result = await client`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    console.log('Current time:', result[0].current_time);

    // Test 4: Check existing tables
    console.log('\n📊 Checking existing tables...');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('✅ Existing tables:', tables.map(t => t.table_name));
    } else {
      console.log('ℹ️ No tables found - ready for creation');
    }

    await client.end();
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection();
