export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          name: string
          category_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          category_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          description: string
          when_to_use: string
          content: string
          category_id: string
          variables: Json
          status: string
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description: string
          when_to_use: string
          content: string
          category_id: string
          variables?: Json
          status?: string
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          when_to_use?: string
          content?: string
          category_id?: string
          variables?: Json
          status?: string
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_analytics: {
        Row: {
          id: string
          prompt_id: string
          user_id: string | null
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id?: string | null
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string | null
          action?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          permissions?: Json
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          role_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: number
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id: string
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

/**
 * Database Types
 * 
 * This file contains type definitions for database entities and UI-specific types.
 * These types are used throughout the application to ensure type safety.
 */

// Derived types for our application
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Subcategory = Database["public"]["Tables"]["subcategories"]["Row"]
export type Prompt = Database["public"]["Tables"]["prompts"]["Row"]
export type PromptAnalytic = Database["public"]["Tables"]["prompt_analytics"]["Row"]

/**
 * Role type definition
 * Represents a user role in the system with associated permissions
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Json;
  created_at: string;
  updated_at?: string;
}

/**
 * UserRole type definition
 * Represents the many-to-many relationship between users and roles
 */
export interface UserRole {
  id?: number;
  user_id: string;
  role_id: number;
  roles?: Role;
  created_at?: string;
}

/**
 * AuditLog type definition
 * Represents an audit log entry for tracking system changes
 */
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"]

/**
 * Profile type definition
 * Represents a user profile with associated metadata
 */
export interface Profile {
  id: string;
  email?: string;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

// Types for our application UI

/**
 * CategoryWithSubcategories
 * Extended category type that includes its subcategories for UI rendering
 */
export interface CategoryWithSubcategories {
  id: string;
  name: string;
  created_by?: string | null;
  subcategories: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * PromptWithVariables
 * Extended prompt type that includes structured variables for UI rendering
 */
export interface PromptWithVariables {
  id: string;
  title: string;
  description: string;
  when_to_use: string;
  content: string;
  category_id: string;
  status: string;
  created_by: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  variables?: Record<string, { name: string; description: string; example?: string }>;
  searchScore?: number;
}
