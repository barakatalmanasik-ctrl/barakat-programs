// Supabase Client - initialized with config from supabase-config.js

const SupabaseClient = {
  client: null,

  init() {
    if (typeof supabase === 'undefined') {
      console.error('Supabase JS library not loaded. Add the CDN script to index.html');
      return false;
    }

    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
      console.warn('Supabase not configured. Using localStorage fallback.');
      return false;
    }

    this.client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return true;
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
