-- 1. Add ownership columns to content tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Create roles table for RBAC
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add approval workflow to prompts
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 6. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert default roles
INSERT INTO roles (name, permissions) VALUES 
('viewer', '{"read": true}'),
('editor', '{"read": true, "create": true, "update": true}'),
('manager', '{"read": true, "create": true, "update": true, "delete": true}'),
('admin', '{"read": true, "create": true, "update": true, "delete": true, "manage_users": true, "approve_content": true}')
ON CONFLICT (name) DO NOTHING;

-- 8. Create audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, ip_address
  ) VALUES (
    auth.uid(), 
    TG_OP, 
    TG_TABLE_NAME, 
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create audit triggers for main tables
DROP TRIGGER IF EXISTS prompts_audit_trigger ON prompts;
CREATE TRIGGER prompts_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompts
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

DROP TRIGGER IF EXISTS categories_audit_trigger ON categories;
CREATE TRIGGER categories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

DROP TRIGGER IF EXISTS subcategories_audit_trigger ON subcategories;
CREATE TRIGGER subcategories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON subcategories
FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- 10. Update RLS policies for ownership-based access
DROP POLICY IF EXISTS "Categories can be updated by authenticated users" ON categories;
CREATE POLICY "Categories can be updated by owner or admin" 
ON categories FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Categories can be deleted by authenticated users" ON categories;
CREATE POLICY "Categories can be deleted by owner or admin" 
ON categories FOR DELETE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Prompts can be updated by authenticated users" ON prompts;
CREATE POLICY "Prompts can be updated by owner or admin" 
ON prompts FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Prompts can be deleted by authenticated users" ON prompts;
CREATE POLICY "Prompts can be deleted by owner or admin" 
ON prompts FOR DELETE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 11. Add RLS policy for draft visibility
DROP POLICY IF EXISTS "Prompts are viewable by everyone" ON prompts;
CREATE POLICY "Users can only see approved prompts or their own drafts" 
ON prompts FOR SELECT USING (
  status = 'approved' OR 
  (status = 'draft' AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
