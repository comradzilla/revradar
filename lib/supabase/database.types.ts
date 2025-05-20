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

// Derived types for our application
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Subcategory = Database["public"]["Tables"]["subcategories"]["Row"]
export type Prompt = Database["public"]["Tables"]["prompts"]["Row"]
export type PromptAnalytic = Database["public"]["Tables"]["prompt_analytics"]["Row"]
export type Role = Database["public"]["Tables"]["roles"]["Row"]
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"]
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Types for our application UI
export interface CategoryWithSubcategories extends Omit<Category, "created_at" | "updated_at"> {
  subcategories?: Array<Omit<Subcategory, "created_at" | "updated_at" | "category_id">>
}

export interface PromptWithVariables extends Omit<Prompt, "created_at" | "updated_at" | "variables"> {
  variables?: Record<string, { name: string; description: string; example?: string }>
  searchScore?: number
}
