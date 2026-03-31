-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS resume_sections;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS profiles;

-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'single_download', 'monthly_subscription', 'quarterly_subscription', 'annual_subscription')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  downloads_used INTEGER DEFAULT 0
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Resumes Table
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'bold-neo',
  title TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'fresher',
  personal_info JSONB DEFAULT '{}'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  internships JSONB DEFAULT '[]'::jsonb,
  academic_projects JSONB DEFAULT '[]'::jsonb,
  executive_summary TEXT DEFAULT '',
  certifications JSONB DEFAULT '[]'::jsonb,
  client_projects JSONB DEFAULT '[]'::jsonb,
  research_papers JSONB DEFAULT '[]'::jsonb,
  portfolio JSONB DEFAULT '[]'::jsonb,
  layout_order JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS for Resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" 
  ON resumes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" 
  ON resumes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" 
  ON resumes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" 
  ON resumes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create Resume Custom Sections Table
CREATE TABLE resume_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS for Resume Sections
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume sections" 
  ON resume_sections FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own resume sections" 
  ON resume_sections FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own resume sections" 
  ON resume_sections FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own resume sections" 
  ON resume_sections FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = resume_sections.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );
