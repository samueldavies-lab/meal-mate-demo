import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://afuwtrkmkidcsquusuwv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdXd0cmtta2lkY3NxdXVzdXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzUwNzksImV4cCI6MjA5NjM1MTA3OX0.7ioMZ441rXM8zyejTZZ5YSxZZvydjhRtel8HXYgMRxo';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

function findUserByEmail(users, email) {
  return users.find(u => u.email === email) || null;
}

const tableMap = {
  UserStats: 'user_stats',
  UserDog: 'user_dogs',
  FeederProfile: 'feeder_profiles',
  PendingMeal: 'pending_meals',
  SocialPost: 'social_posts',
  PostLike: 'post_likes',
  RewardAllocation: 'reward_allocations',
  DailyFeedingLog: 'daily_feeding_logs',
  DevMessage: 'dev_messages',
  Referral: 'referrals',
  FeedingMedia: 'feeding_media',
  FeedingFeedback: 'feeding_feedback',
  FeederBankDetails: 'feeder_bank_details',
  AccessCode: 'access_codes',
  StrayDog: 'stray_dogs',
  FeedingLog: 'feeding_logs',
  FeedingSession: 'feeding_sessions',
  FeedingPhotoBacklog: 'feeding_photo_backlog',
  SpecialGift: 'special_gifts',
};

function makeStore(entityName) {
  const table = tableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  return {
    list: async (sort, limit) => {
      let query = supabase.from(table).select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        query = query.order(field, { ascending: !desc });
      }
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    filter: async (filterObj, sort, limit) => {
      let query = supabase.from(table).select('*');
      for (const [key, val] of Object.entries(filterObj)) {
        if (typeof val === 'string' && val.includes('*')) {
          const pattern = val.replace(/\*/g, '%');
          query = query.ilike(key, pattern);
        } else {
          query = query.eq(key, val);
        }
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        query = query.order(field, { ascending: !desc });
      }
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    create: async (data) => {
      const { data: result, error } = await supabase.from(table).insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

function doNavigate(path) {
  window.location.href = path;
}

export const supabaseClient = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: profile?.role || user.user_metadata?.role || 'user',
      };
    },
    isAuthenticated: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    updateMe: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const profileFields = {};
      if (data.full_name) profileFields.full_name = data.full_name;
      if (data.role) profileFields.role = data.role;
      if (Object.keys(profileFields).length > 0) {
        await supabase.from('profiles').update(profileFields).eq('id', user.id);
      }
      if (data.full_name) {
        await supabase.auth.updateUser({ data: { full_name: data.full_name } });
      }
      return this.me();
    },
    logout: async () => {
      await supabase.auth.signOut();
    },
    redirectToLogin: () => doNavigate('/Login'),
    redirectToSignup: (path) => doNavigate('/Login?mode=signup'),
  },
  entities: {},
  appLogs: {
    logUserInApp: () => Promise.resolve(),
  },
  functions: {
    invoke: async (name, payload) => {
      return Promise.resolve({ data: {} });
    },
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        return { file_url: publicUrl };
      },
    },
  },
};

for (const name of Object.keys(tableMap)) {
  supabaseClient.entities[name] = makeStore(name);
}
