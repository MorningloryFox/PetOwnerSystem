#!/usr/bin/env node

// Verification script for deployment readiness
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

async function verifyDeployment() {
  console.log('🔍 Verifying deployment readiness...\n');
  
  let allChecks = true;

  try {
    // Check 1: Environment Variables
    console.log('📋 Environment Variables Check:');
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'DATABASE_URL',
      'SESSION_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
      const isSet = process.env[envVar] ? '✅' : '❌';
      console.log(`${envVar}: ${isSet} ${isSet === '❌' ? 'MISSING' : 'Set'}`);
      if (isSet === '❌') allChecks = false;
    }

    // Check 2: Required Files
    console.log('\n📁 Required Files Check:');
    const requiredFiles = [
      'vercel.json',
      'package.json',
      'api/index.ts',
      'api/index.js',
      'dist/index.html'
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      const status = exists ? '✅' : '❌';
      console.log(`${file}: ${status} ${exists ? 'Exists' : 'MISSING'}`);
      if (!exists) allChecks = false;
    }

    // Check 3: Supabase Connection
    console.log('\n🔗 Supabase Connection Check:');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Supabase client connection failed:', error.message);
      allChecks = false;
    } else {
      console.log('✅ Supabase client connection successful');
    }

    // Check 4: Database Connection
    console.log('\n🗄️ Database Connection Check:');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.log('❌ DATABASE_URL not set');
      allChecks = false;
    } else {
      const client = postgres(connectionString, {
        ssl: 'require',
        max: 1,
      });

      try {
        const result = await client`SELECT NOW() as current_time`;
        console.log('✅ Database connection successful');
        console.log(`Current time: ${result[0].current_time}`);
        await client.end();
      } catch (dbError) {
        console.log('❌ Database connection failed:', dbError.message);
        allChecks = false;
      }
    }

    // Check 5: Build Output
    console.log('\n🏗️ Build Output Check:');
    const distExists = fs.existsSync('dist');
    const assetsExist = fs.existsSync('dist/assets');
    
    console.log(`dist directory: ${distExists ? '✅' : '❌'} ${distExists ? 'Exists' : 'MISSING'}`);
    console.log(`dist/assets directory: ${assetsExist ? '✅' : '❌'} ${assetsExist ? 'Exists' : 'MISSING'}`);
    
    if (!distExists || !assetsExist) allChecks = false;

    // Final Result
    console.log('\n' + '='.repeat(50));
    if (allChecks) {
      console.log('🎉 All checks passed! Ready for deployment to Vercel.');
      console.log('\nNext steps:');
      console.log('1. Push your code to GitHub');
      console.log('2. Connect your repository to Vercel');
      console.log('3. Add environment variables in Vercel dashboard');
      console.log('4. Deploy!');
    } else {
      console.log('❌ Some checks failed. Please fix the issues above before deploying.');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
verifyDeployment();
