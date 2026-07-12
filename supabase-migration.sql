-- ============================================
-- GITHOGORO CONNECT — Full Database Setup
-- Paste ALL of this and click RUN
-- ============================================

-- 1. FIX chat_rooms — add missing columns
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. COMMUNITY PLACES (Map landmarks)
CREATE TABLE IF NOT EXISTS community_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT TRUE,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read approved places" ON community_places;
DROP POLICY IF EXISTS "Authenticated users can insert" ON community_places;
DROP POLICY IF EXISTS "Users can update own places" ON community_places;
CREATE POLICY "Anyone can read approved places" ON community_places FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Authenticated users can insert" ON community_places FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own places" ON community_places FOR UPDATE TO authenticated USING (auth.uid() = submitted_by);

-- 3. VIDEOS (social feed with likes & comments)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read videos" ON videos;
DROP POLICY IF EXISTS "Users can insert videos" ON videos;
CREATE POLICY "Anyone can read videos" ON videos FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert videos" ON videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. VIDEO LIKES
CREATE TABLE IF NOT EXISTS video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read likes" ON video_likes;
DROP POLICY IF EXISTS "Users can like" ON video_likes;
DROP POLICY IF EXISTS "Users can unlike" ON video_likes;
CREATE POLICY "Anyone can read likes" ON video_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can like" ON video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. VIDEO COMMENTS
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read comments" ON video_comments;
DROP POLICY IF EXISTS "Users can comment" ON video_comments;
CREATE POLICY "Anyone can read comments" ON video_comments FOR SELECT USING (TRUE);
CREATE POLICY "Users can comment" ON video_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. PRIVATE CONVERSATIONS (Facebook-style 1-on-1 messaging)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their conversations" ON conversations;
CREATE POLICY "Users can read their conversations"
  ON conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = id AND user_id = auth.uid()));

-- 7. CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their participations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can be added to conversations" ON conversation_participants;
CREATE POLICY "Users can see their participations"
  ON conversation_participants FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can be added to conversations"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. PRIVATE MESSAGES
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their messages" ON private_messages;
DROP POLICY IF EXISTS "Users can send messages" ON private_messages;
CREATE POLICY "Users can read their messages"
  ON private_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = private_messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can send messages"
  ON private_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- 9. FIX jobs table — add posted_by column if missing
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'posted_by') THEN
      ALTER TABLE jobs ADD COLUMN posted_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'is_active') THEN
      ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
  END IF;
END $$;

-- ============================================
-- SEED 50+ COMMUNITY LANDMARKS
-- ============================================
INSERT INTO community_places (name, category, description, lat, lng, is_official, is_approved) VALUES
('Githogoro Primary School', 'school', 'Public primary school', -1.2150, 36.8210, TRUE, TRUE),
('Githogoro Secondary School', 'school', 'Public secondary school', -1.2155, 36.8215, TRUE, TRUE),
('Runda Academy', 'school', 'Private primary school', -1.2100, 36.8260, TRUE, TRUE),
('St. Mary''s Githogoro', 'school', 'Catholic-sponsored primary school', -1.2160, 36.8200, TRUE, TRUE),
('Githogoro ECD Centre', 'school', 'Early childhood centre', -1.2140, 36.8220, TRUE, TRUE),
('Runda High School', 'school', 'Private high school', -1.2080, 36.8270, TRUE, TRUE),
('Kianda School', 'school', 'Private school', -1.2180, 36.8180, TRUE, TRUE),
('Githogoro Mosque', 'religious', 'Main mosque', -1.2130, 36.8240, TRUE, TRUE),
('Githogoro Catholic Church', 'religious', 'Catholic parish', -1.2145, 36.8225, TRUE, TRUE),
('Githogoro PCEA Church', 'religious', 'Presbyterian church', -1.2155, 36.8205, TRUE, TRUE),
('Githogoro Baptist Church', 'religious', 'Baptist congregation', -1.2135, 36.8235, TRUE, TRUE),
('Runda Gospel Centre', 'religious', 'Evangelical church', -1.2090, 36.8265, TRUE, TRUE),
('Githogoro SDA Church', 'religious', 'Seventh-day Adventist', -1.2165, 36.8195, TRUE, TRUE),
('Githogoro Salvation Army', 'religious', 'Salvation Army', -1.2140, 36.8230, TRUE, TRUE),
('Githogoro Health Centre', 'health', 'Government health centre', -1.2145, 36.8215, TRUE, TRUE),
('Runda Medical Clinic', 'health', 'Private clinic', -1.2105, 36.8255, TRUE, TRUE),
('Githogoro Pharmacy', 'health', 'Community pharmacy', -1.2140, 36.8220, TRUE, TRUE),
('St. John''s Clinic', 'health', 'Faith-based clinic', -1.2150, 36.8200, TRUE, TRUE),
('Githogoro Maternity Centre', 'health', 'Maternal & child health', -1.2150, 36.8210, TRUE, TRUE),
('Runda Dental Clinic', 'health', 'Dental care', -1.2095, 36.8260, TRUE, TRUE),
('Githogoro Matatu Stage', 'transport', 'Main matatu terminus', -1.2160, 36.8210, TRUE, TRUE),
('Githogoro Junction', 'transport', 'Key road junction', -1.2140, 36.8240, TRUE, TRUE),
('Runda Bus Stop', 'transport', 'Bus stop', -1.2085, 36.8275, TRUE, TRUE),
('Githogoro Bike Stage', 'transport', 'Boda boda stage', -1.2150, 36.8220, TRUE, TRUE),
('Githogoro Market', 'market', 'Open-air market, fresh produce', -1.2150, 36.8220, TRUE, TRUE),
('Githogoro Butchery', 'market', 'Fresh meat supplier', -1.2145, 36.8225, TRUE, TRUE),
('Runda Supermarket', 'market', 'Small supermarket', -1.2095, 36.8265, TRUE, TRUE),
('Githogoro Green Grocers', 'market', 'Fruits & vegetables', -1.2145, 36.8220, TRUE, TRUE),
('Githogoro Hardware', 'market', 'Building materials', -1.2155, 36.8215, TRUE, TRUE),
('Rysa Playground', 'sports', 'Community sports field', -1.2140, 36.8230, TRUE, TRUE),
('Githogoro Football Pitch', 'sports', 'Local football ground', -1.2160, 36.8205, TRUE, TRUE),
('Runda Sports Club', 'sports', 'Tennis & swimming club', -1.2075, 36.8280, TRUE, TRUE),
('Githogoro Chief''s Office', 'government', 'Local chief''s office', -1.2140, 36.8210, TRUE, TRUE),
('Githogoro Youth Centre', 'government', 'Youth training centre', -1.2150, 36.8205, TRUE, TRUE),
('Githogoro Police Post', 'government', 'Local police post', -1.2140, 36.8215, TRUE, TRUE),
('Githogoro Village Hall', 'government', 'Community meeting hall', -1.2145, 36.8210, TRUE, TRUE),
('Kiamumbi Ward Office', 'government', 'Ward administrative office', -1.2170, 36.8190, TRUE, TRUE),
('Githogoro Water Point', 'water', 'Community water kiosk', -1.2155, 36.8210, TRUE, TRUE),
('Githogoro Borehole', 'water', 'Community borehole', -1.2135, 36.8230, TRUE, TRUE),
('Githogoro Community Library', 'community', 'Small community library', -1.2140, 36.8220, TRUE, TRUE),
('Githogoro Women''s Group Hall', 'community', 'Women''s group meeting place', -1.2150, 36.8215, TRUE, TRUE),
('Githogoro Widows & Orphans Centre', 'community', 'Support centre', -1.2145, 36.8206, TRUE, TRUE),
('Runda Community Centre', 'community', 'Multi-purpose facility', -1.2100, 36.8255, TRUE, TRUE),
('Githogoro Fire Assembly Point', 'emergency', 'Emergency assembly point', -1.2140, 36.8218, TRUE, TRUE),
('St. John Ambulance Post', 'emergency', 'Ambulance services', -1.2135, 36.8225, TRUE, TRUE),
('Githogoro M-Pesa Shop', 'business', 'Mobile money services', -1.2148, 36.8220, TRUE, TRUE),
('Githogoro Salon & Barber', 'business', 'Hairdressing & barber', -1.2150, 36.8225, TRUE, TRUE),
('Githogoro Tailoring Shop', 'business', 'Custom clothing & alterations', -1.2145, 36.8223, TRUE, TRUE),
('Githogoro Carpenter Workshop', 'business', 'Furniture & woodwork', -1.2152, 36.8218, TRUE, TRUE),
('Githogoro Cyber Cafe', 'business', 'Internet & printing services', -1.2145, 36.8220, TRUE, TRUE),
('Githogoro Restaurant', 'business', 'Local Kenyan cuisine restaurant', -1.2142, 36.8225, TRUE, TRUE)
ON CONFLICT DO NOTHING;
