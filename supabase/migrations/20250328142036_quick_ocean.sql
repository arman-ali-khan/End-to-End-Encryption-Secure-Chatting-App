/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `username` (text, unique) 
      - `full_name` (text)
      - `password_hash` (text)
      - `profile_image` (text, nullable)
      - `is_online` (boolean)
      - `last_seen` (timestamp)
      - `hide_last_seen` (boolean)
      - `hide_read_receipts` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `encrypted` (boolean)
      - `sender_id` (uuid, foreign key)
      - `receiver_id` (uuid, foreign key, nullable)
      - `group_id` (uuid, foreign key, nullable)
      - `type` (enum)
      - `media_url` (text, nullable)
      - `is_edited` (boolean)
      - `is_deleted` (boolean)
      - `expires_at` (timestamp, nullable)
      - `view_once` (boolean)
      - `reply_to_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `image` (text, nullable)
      - `owner_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `group_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `group_id` (uuid, foreign key)
      - `role` (enum)
      - `joined_at` (timestamp)

    - `reactions`
      - `id` (uuid, primary key)
      - `type` (enum)
      - `user_id` (uuid, foreign key)
      - `message_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `blocked_users`
      - `blocker_id` (uuid, foreign key)
      - `blocked_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create custom types
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'VOICE_NOTE');
CREATE TYPE reaction_type AS ENUM ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY');
CREATE TYPE group_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  hide_last_seen BOOLEAN DEFAULT false,
  hide_read_receipts BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  group_id UUID,
  type message_type DEFAULT 'TEXT',
  media_url TEXT,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  view_once BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint for group_id in messages
ALTER TABLE messages
ADD CONSTRAINT fk_group
FOREIGN KEY (group_id)
REFERENCES groups(id);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  role group_role DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type reaction_type NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  message_id UUID NOT NULL REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Create blocked_users table
CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES users(id),
  blocked_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can edit their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Groups policies
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Group members policies
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Reactions policies
CREATE POLICY "Users can view reactions"
  ON reactions FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT id 
      FROM messages 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Blocked users policies
CREATE POLICY "Users can view their blocked list"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);