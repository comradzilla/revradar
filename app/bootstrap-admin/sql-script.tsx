"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function SqlScriptPage() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const generateScript = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address to generate the script",
      })
      return
    }

    return `
-- Run this script in the Supabase SQL Editor

-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the profiles table
CREATE POLICY IF NOT EXISTS "Users can read their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);
  
CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
  
CREATE POLICY IF NOT EXISTS "Admin users can read all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
  
CREATE POLICY IF NOT EXISTS "Admin users can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create the execute_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Get the user ID for the email
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = '${email}';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email ${email} not found';
  END IF;
  
  -- Set the user as admin
  INSERT INTO public.profiles (id, is_admin)
  VALUES (user_id, true)
  ON CONFLICT (id) 
  DO UPDATE SET is_admin = true;
END $$;

-- Verify the user is now an admin
SELECT * FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE email = '${email}');
    `
  }

  const copyToClipboard = () => {
    const script = generateScript()
    if (script) {
      navigator.clipboard.writeText(script)
      toast({
        title: "Copied to clipboard",
        description: "SQL script has been copied to your clipboard",
      })
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manual Admin Setup</CardTitle>
          <CardDescription>Generate SQL to manually set up an admin user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500">Enter the email of the user you want to make an admin</p>
          </div>
          {email && (
            <div className="space-y-2">
              <Label>SQL Script</Label>
              <Textarea
                className="font-mono text-xs h-64"
                readOnly
                value={generateScript()}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <p className="text-xs text-gray-500">
                Copy this script and run it in the Supabase SQL Editor to set up the admin user
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/bootstrap-admin")}>
            Back to Form
          </Button>
          <Button onClick={copyToClipboard} disabled={!email}>
            Copy to Clipboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
