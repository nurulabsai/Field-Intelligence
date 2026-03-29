/**
 * NuruOS Field Intelligence — Test User Seed Script
 * Creates a Supabase Auth user for app review purposes.
 *
 * Usage:
 *   npx tsx scripts/seed-test-user.ts
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Service role key — NOT the anon key. Find in Supabase dashboard
 *  → Project Settings → API → service_role key)
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = 'https://gyekncktmsvdtcbhakgl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('   Add it from: Supabase Dashboard → Settings → API → service_role\n');
  process.exit(1);
}

// Admin client — uses service role key, bypasses RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── User config ──────────────────────────────────────────────────────────────

const TEST_USER = {
  email: 'frank.mchaina@gmail.com',
  password: generateSecurePassword(),
  user_metadata: {
    full_name: 'Frank Mchaina',
    role: 'auditor',
    organisation: 'NuruLabs',
    is_test_account: true,
  },
};

function generateSecurePassword(): string {
  // 16 chars: uppercase + lowercase + numbers + symbols
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
  return Array.from(crypto.randomBytes(16))
    .map(b => chars[b % chars.length])
    .join('');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 NuruOS Field Intelligence — Test User Seed');
  console.log('─'.repeat(50));
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Project: gyekncktmsvdtcbhakgl`);
  console.log('─'.repeat(50));

  // 1. Check if user already exists
  console.log('\n📋 Checking if user already exists...');
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const existing = existingUsers.users.find(u => u.email === TEST_USER.email);

  if (existing) {
    console.log(`\n⚠️  User already exists (ID: ${existing.id})`);
    console.log('   Updating password to a fresh one...\n');

    // Update password on existing account
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existing.id,
      {
        password: TEST_USER.password,
        user_metadata: TEST_USER.user_metadata,
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error('❌ Failed to update user:', updateError.message);
      process.exit(1);
    }

    printCredentials(existing.id, true);
    return;
  }

  // 2. Create new user
  console.log('\n👤 Creating new user...');
  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,          // ← skip email verification
      user_metadata: TEST_USER.user_metadata,
    });

  if (createError || !newUser.user) {
    console.error('❌ Failed to create user:', createError?.message);
    process.exit(1);
  }

  // 3. If auditors table exists, insert a profile row
  console.log('📝 Creating auditor profile (if table exists)...');
  const { error: profileError } = await supabase
    .from('auditors')
    .upsert({
      id: newUser.user.id,
      email: TEST_USER.email,
      full_name: 'Frank Mchaina',
      organisation: 'NuruLabs',
      role: 'admin',
      is_active: true,
    }, { onConflict: 'id' });

  // Non-fatal — auditors table may not exist yet
  if (profileError) {
    console.log(`   ℹ️  No auditors table found (${profileError.message}) — skipping profile`);
  } else {
    console.log('   ✅ Auditor profile created');
  }

  printCredentials(newUser.user.id, false);
}

function printCredentials(userId: string, updated: boolean) {
  const divider = '═'.repeat(50);
  console.log(`\n${divider}`);
  console.log(updated ? '✅ ACCOUNT UPDATED' : '✅ ACCOUNT CREATED');
  console.log(divider);
  console.log(`  Email:    ${TEST_USER.email}`);
  console.log(`  Password: ${TEST_USER.password}`);
  console.log(`  User ID:  ${userId}`);
  console.log(divider);
  console.log('\n⚠️  SAVE THIS PASSWORD — it will not be shown again.');
  console.log('   You can change it after first login.\n');

  // Save credentials to a local file (gitignored)
  const credFile = path.resolve(process.cwd(), '.test-credentials.txt');
  const content = [
    'NuruOS Field Intelligence — Test Credentials',
    '─'.repeat(40),
    `Email:    ${TEST_USER.email}`,
    `Password: ${TEST_USER.password}`,
    `User ID:  ${userId}`,
    `Created:  ${new Date().toISOString()}`,
    '─'.repeat(40),
    'DELETE THIS FILE after noting credentials.',
  ].join('\n');

  fs.writeFileSync(credFile, content, 'utf-8');
  console.log(`   Credentials also saved to: .test-credentials.txt`);
  console.log('   (This file is gitignored — delete it after use)\n');
}

main().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
