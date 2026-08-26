// Supabase Client - initialized with config from supabase-config.js

const SupabaseClient = {
  client: null,

  init() {
    try {
      if (typeof supabase === 'undefined') {
        console.warn('Supabase JS library not loaded. Using localStorage fallback.');
        return false;
      }

      if (typeof SUPABASE_CONFIG === 'undefined') {
        console.warn('Supabase config not found. Using localStorage fallback.');
        return false;
      }

      if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.warn('Supabase not configured. Using localStorage fallback.');
        return false;
      }

      this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      return true;
    } catch (e) {
      console.error('SupabaseClient init error:', e);
      return false;
    }
  },

  get isConfigured() {
    return this.client !== null;
  },

  // Auth helpers
  get auth() {
    return this.client?.auth;
  },

  // Database query builder
  from(table) {
    return this.client?.from(table);
  },

  // RPC (Remote Procedure Call)
  rpc(fn, params) {
    return this.client?.rpc(fn, params);
  }
};
