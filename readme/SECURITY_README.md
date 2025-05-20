# GTM Prompt Library - Security Model

## Overview

The GTM Prompt Library implements a multi-layered security model to protect sensitive content, ensure proper access controls, and maintain data integrity. This document outlines the security architecture, implemented controls, and recommendations for further enhancements.

## Authentication System

### Supabase Authentication

The application uses Supabase Auth for user authentication, which provides:

- Email/password authentication
- Magic link authentication
- OAuth providers (configurable)
- JWT-based session management
- Secure password hashing (bcrypt)
- Rate limiting for login attempts

### Authentication Flow

1. Users register or log in through the `/login` or `/signup` pages
2. Successful authentication generates a JWT token stored in cookies
3. The middleware validates this token on protected routes
4. Session refresh is handled automatically by Supabase Auth helpers

### Session Management

- Sessions are managed via HTTP-only cookies for XSS protection
- Automatic token refresh is implemented via middleware
- Session expiration is enforced both client and server-side

## Authorization Model

### Multi-Tiered Authorization

The application implements multiple layers of authorization:

1. **Admin Status**: Binary admin/non-admin flag in the profiles table
2. **Role-Based Access Control**: Granular permissions via roles
3. **Ownership-Based Access**: Content creators have special permissions on their content
4. **Row-Level Security**: Database-enforced access controls

### Admin Access

- Admin status is stored in the `profiles` table as `is_admin` boolean
- Admin users bypass most permission checks
- Admin-only routes and operations are protected at multiple levels:
  - Frontend UI visibility
  - API route handlers
  - Database RLS policies

### Role-Based Access Control (RBAC)

- Defined roles with permission sets stored in the `roles` table
- User-role assignments in the `user_roles` junction table
- Permission checks via the `usePermission` hook in frontend components
- Server-side permission validation in API routes

#### Default Roles

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Viewer | Read-only access | view_prompts, view_categories |
| Editor | Can create and edit content | create_prompts, edit_own_prompts, create_categories |
| Manager | Can manage all content | delete_prompts, approve_prompts, manage_categories |
| Admin | Full system access | manage_users, manage_roles, view_analytics |

### Ownership-Based Access

- Content tables include `created_by` field linking to the creator
- Special permissions for content owners (e.g., edit_own_prompts)
- RLS policies enforce ownership checks at the database level

## Row Level Security (RLS)

### RLS Policy Implementation

Supabase RLS policies are implemented on all tables to enforce access control at the database level:

#### Categories Table Policies

```sql
-- View categories
CREATE POLICY "Anyone can view categories" 
ON categories FOR SELECT USING (true);

-- Insert categories
CREATE POLICY "Authenticated users with create_categories permission can insert categories" 
ON categories FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE (r.permissions->>'create_categories')::boolean = true
  )
);

-- Update categories
CREATE POLICY "Users can update their own categories" 
ON categories FOR UPDATE 
USING (auth.uid() = created_by);

-- Admin override for categories
CREATE POLICY "Admins can update any category" 
ON categories FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
