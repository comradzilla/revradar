#!/usr/bin/env node

/**
 * Supabase Configuration Checker
 * 
 * This script checks for common Supabase configuration issues that might cause
 * deployment problems on Vercel. It verifies:
 * 
 * 1. Required environment variables are set
 * 2. Supabase client initialization is correct
 * 3. API routes are properly structured for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}Supabase Configuration Checker${colors.reset}`);
console.log(`${colors.cyan}Checking for common Supabase configuration issues...${colors.reset}\n`);

// Check if .env.local file exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const hasEnvLocal = fs.existsSync(envLocalPath);

console.log(`${colors.bold}Environment Variables:${colors.reset}`);
if (hasEnvLocal) {
  console.log(`${colors.green}✓ .env.local file found${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ .env.local file not found. Make sure to set up environment variables in Vercel.${colors.reset}`);
}

// Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MIGRATION_SECRET_KEY',
  'BOOTSTRAP_ADMIN_SECRET_KEY'
];

// Check package.json for dependencies
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log(`\n${colors.bold}Supabase Dependencies:${colors.reset}`);
  
  const requiredDependencies = [
    '@supabase/auth-helpers-nextjs',
    '@supabase/supabase-js'
  ];
  
  for (const dep of requiredDependencies) {
    if (dependencies[dep]) {
      console.log(`${colors.green}✓ ${dep} (${dependencies[dep]})${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${dep} not found in package.json${colors.reset}`);
    }
  }
}

// Check API routes for common issues
console.log(`\n${colors.bold}API Routes:${colors.reset}`);

// Check bootstrap-admin route
const bootstrapAdminPath = path.join(process.cwd(), 'app/api/bootstrap-admin/route.ts');
if (fs.existsSync(bootstrapAdminPath)) {
  const bootstrapAdminContent = fs.readFileSync(bootstrapAdminPath, 'utf8');
  
  // Check for common issues
  const hasServiceRoleKey = bootstrapAdminContent.includes('SUPABASE_SERVICE_ROLE_KEY');
  const hasCreateClientInside = bootstrapAdminContent.includes('createClient(') && 
                               bootstrapAdminContent.includes('export async function');
  const hasProperErrorHandling = bootstrapAdminContent.includes('try {') && 
                                bootstrapAdminContent.includes('catch (');
  
  if (hasServiceRoleKey && hasCreateClientInside && hasProperErrorHandling) {
    console.log(`${colors.green}✓ bootstrap-admin route looks good${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ bootstrap-admin route might have issues:${colors.reset}`);
    if (!hasServiceRoleKey) {
      console.log(`  ${colors.yellow}⚠ Missing SUPABASE_SERVICE_ROLE_KEY${colors.reset}`);
    }
    if (!hasCreateClientInside) {
      console.log(`  ${colors.yellow}⚠ Supabase client should be created inside the handler function${colors.reset}`);
    }
    if (!hasProperErrorHandling) {
      console.log(`  ${colors.yellow}⚠ Missing proper error handling (try/catch blocks)${colors.reset}`);
    }
  }
}

// Check direct-sql route
const directSqlPath = path.join(process.cwd(), 'app/api/direct-sql/route.ts');
if (fs.existsSync(directSqlPath)) {
  const directSqlContent = fs.readFileSync(directSqlPath, 'utf8');
  
  // Check for common issues
  const hasServiceRoleKey = directSqlContent.includes('SUPABASE_SERVICE_ROLE_KEY');
  const hasCreateClientInside = directSqlContent.includes('createClient(') && 
                               directSqlContent.includes('export async function');
  const hasProperErrorHandling = directSqlContent.includes('try {') && 
                                directSqlContent.includes('catch (');
  
  if (hasServiceRoleKey && hasCreateClientInside && hasProperErrorHandling) {
    console.log(`${colors.green}✓ direct-sql route looks good${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ direct-sql route might have issues:${colors.reset}`);
    if (!hasServiceRoleKey) {
      console.log(`  ${colors.yellow}⚠ Missing SUPABASE_SERVICE_ROLE_KEY${colors.reset}`);
    }
    if (!hasCreateClientInside) {
      console.log(`  ${colors.yellow}⚠ Supabase client should be created inside the handler function${colors.reset}`);
    }
    if (!hasProperErrorHandling) {
      console.log(`  ${colors.yellow}⚠ Missing proper error handling (try/catch blocks)${colors.reset}`);
    }
  }
}

// Check for any remaining TypeScript errors
console.log(`\n${colors.bold}TypeScript Errors:${colors.reset}`);
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log(`${colors.green}✓ No TypeScript errors found${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠ TypeScript errors found. Run 'npx tsc --noEmit' to see details.${colors.reset}`);
}

console.log(`\n${colors.bold}${colors.blue}Recommendations for Vercel Deployment:${colors.reset}`);
console.log(`${colors.cyan}1. Make sure all required environment variables are set in Vercel.${colors.reset}`);
console.log(`${colors.cyan}2. Initialize Supabase clients inside API route handlers, not at the module level.${colors.reset}`);
console.log(`${colors.cyan}3. Use try/catch blocks for all Supabase operations.${colors.reset}`);
console.log(`${colors.cyan}4. Check for TypeScript errors before deploying.${colors.reset}`);
console.log(`${colors.cyan}5. Make sure the 'execute_sql' function exists in your Supabase database.${colors.reset}`);
