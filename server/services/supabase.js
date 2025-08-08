import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database tables setup
const setupDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError && usersError.code === '42P01') {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc('create_users_table');
      if (error) {
        console.log('Users table will be created by Supabase migrations');
      }
    }

    // Create content table if it doesn't exist
    const { error: contentError } = await supabase
      .from('content')
      .select('*')
      .limit(1);

    if (contentError && contentError.code === '42P01') {
      const { error } = await supabase.rpc('create_content_table');
      if (error) {
        console.log('Content table will be created by Supabase migrations');
      }
    }

    // Create social_connections table if it doesn't exist
    const { error: socialError } = await supabase
      .from('social_connections')
      .select('*')
      .limit(1);

    if (socialError && socialError.code === '42P01') {
      const { error } = await supabase.rpc('create_social_connections_table');
      if (error) {
        console.log('Social connections table will be created by Supabase migrations');
      }
    }

    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
};

// User management functions
const userService = {
  // Create new user
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password_hash: userData.passwordHash,
          plan: 'Free',
          usage: { aiGenerations: 0, socialPosts: 0 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user
  async updateUser(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user usage
  async updateUsage(id, usage) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          usage: usage,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Update usage error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Content management functions
const contentService = {
  // Create content
  async createContent(contentData) {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert([{
          user_id: contentData.userId,
          title: contentData.title,
          content: contentData.content,
          type: contentData.type,
          platform: contentData.platform,
          status: contentData.status || 'draft',
          metadata: contentData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, content: data };
    } catch (error) {
      console.error('Create content error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user content
  async getUserContent(userId) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, content: data };
    } catch (error) {
      console.error('Get user content error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update content
  async updateContent(id, updates) {
    try {
      const { data, error } = await supabase
        .from('content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, content: data };
    } catch (error) {
      console.error('Update content error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete content
  async deleteContent(id) {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete content error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Social connections management
const socialService = {
  // Create social connection
  async createConnection(connectionData) {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .insert([{
          user_id: connectionData.userId,
          platform: connectionData.platform,
          platform_user_id: connectionData.platformUserId,
          platform_username: connectionData.platformUsername,
          access_token: connectionData.accessToken,
          refresh_token: connectionData.refreshToken,
          profile_data: connectionData.profileData || {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, connection: data };
    } catch (error) {
      console.error('Create social connection error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user connections
  async getUserConnections(userId) {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return { success: true, connections: data };
    } catch (error) {
      console.error('Get user connections error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update connection
  async updateConnection(id, updates) {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, connection: data };
    } catch (error) {
      console.error('Update connection error:', error);
      return { success: false, error: error.message };
    }
  }
};

export { supabase, setupDatabase, userService, contentService, socialService }; 