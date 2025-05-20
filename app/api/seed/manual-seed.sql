-- This SQL script can be run directly in the Supabase SQL Editor
-- Use this if the API seeding method is not working

-- First, check if tables exist and create them if they don't
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  when_to_use TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  variables JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'approved',
  created_by TEXT DEFAULT 'system',
  approved_by TEXT DEFAULT 'system',
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  user_id TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (id, name, created_by)
VALUES 
  ('c1', 'Marketing', 'system'),
  ('c2', 'Sales', 'system'),
  ('c3', 'Customer Support', 'system')
ON CONFLICT (id) DO NOTHING;

-- Insert sample subcategories
INSERT INTO subcategories (id, name, category_id, created_by)
VALUES 
  ('sc1', 'Social Media', 'c1', 'system'),
  ('sc2', 'Email Marketing', 'c1', 'system'),
  ('sc3', 'Cold Outreach', 'c2', 'system'),
  ('sc4', 'Follow-ups', 'c2', 'system'),
  ('sc5', 'Troubleshooting', 'c3', 'system'),
  ('sc6', 'Customer Onboarding', 'c3', 'system')
ON CONFLICT (id) DO NOTHING;

-- Insert sample prompts
INSERT INTO prompts (id, title, description, when_to_use, content, category_id, variables, created_by, status, approved_by, approved_at)
VALUES 
  (
    'p1', 
    'LinkedIn Post Template', 
    'A template for creating engaging LinkedIn posts', 
    'Use this template when you need to create a LinkedIn post that drives engagement', 
    'I need to create a LinkedIn post about {{topic}}. The post should be engaging, professional, and include a call to action. The target audience is {{audience}}. The post should be around 3-4 paragraphs long.', 
    'c1',
    '{"topic": {"name": "Topic", "description": "The main topic of the LinkedIn post", "example": "our new product launch"}, "audience": {"name": "Audience", "description": "The target audience for the post", "example": "marketing professionals"}}',
    'system',
    'approved',
    'system',
    NOW()
  ),
  (
    'p2', 
    'Cold Email Template', 
    'A template for cold outreach emails', 
    'Use this template when reaching out to potential clients for the first time', 
    'Subject: {{subject_line}}\n\nHi {{recipient_name}},\n\nI hope this email finds you well. My name is {{sender_name}} from {{company_name}}.\n\nI noticed that your company is {{observation}} and I thought you might be interested in our {{product_or_service}} that helps {{value_proposition}}.\n\nWould you be available for a quick 15-minute call next week to discuss how we might be able to help?\n\nBest regards,\n{{sender_name}}\n{{sender_title}}\n{{company_name}}',
    'c2',
    '{"subject_line": {"name": "Subject Line", "description": "The subject line of the email", "example": "Quick question about your marketing strategy"}, "recipient_name": {"name": "Recipient Name", "description": "The name of the person you are emailing", "example": "John"}, "sender_name": {"name": "Sender Name", "description": "Your name", "example": "Jane"}, "company_name": {"name": "Company Name", "description": "Your company name", "example": "Acme Inc."}, "observation": {"name": "Observation", "description": "An observation about the recipient\'s company", "example": "expanding into new markets"}, "product_or_service": {"name": "Product or Service", "description": "Your product or service", "example": "marketing automation platform"}, "value_proposition": {"name": "Value Proposition", "description": "The value your product or service provides", "example": "increase conversion rates by 30%"}, "sender_title": {"name": "Sender Title", "description": "Your job title", "example": "Marketing Manager"}}',
    'system',
    'approved',
    'system',
    NOW()
  ),
  (
    'p3', 
    'Customer Support Response', 
    'A template for responding to customer support inquiries', 
    'Use this template when responding to customer support tickets', 
    'Hi {{customer_name}},\n\nThank you for reaching out to our support team about {{issue}}.\n\n{{resolution_steps}}\n\nIf you have any further questions or concerns, please don\'t hesitate to reach out. We\'re here to help!\n\nBest regards,\n{{support_agent_name}}\nCustomer Support Team',
    'c3',
    '{"customer_name": {"name": "Customer Name", "description": "The name of the customer", "example": "John"}, "issue": {"name": "Issue", "description": "The issue the customer is experiencing", "example": "login problems"}, "resolution_steps": {"name": "Resolution Steps", "description": "Steps to resolve the issue", "example": "Please try clearing your browser cache and cookies, then restart your browser and try logging in again."}, "support_agent_name": {"name": "Support Agent Name", "description": "Your name", "example": "Jane"}}',
    'system',
    'approved',
    'system',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Return the count of inserted records
SELECT 
  (SELECT COUNT(*) FROM categories) AS categories_count,
  (SELECT COUNT(*) FROM subcategories) AS subcategories_count,
  (SELECT COUNT(*) FROM prompts) AS prompts_count;
