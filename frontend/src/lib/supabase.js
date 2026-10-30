import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let initAttempted = false;

export const getSupabaseCredentials = () => {
  return {
    url: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof localStorage !== 'undefined' && localStorage.getItem('CSLM_SUPABASE_URL')) || '',
    key: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('CSLM_SUPABASE_KEY')) || ''
  };
};

export const initSupabase = () => {
  if (initAttempted) return supabaseClient;
  initAttempted = true;

  const { url, key } = getSupabaseCredentials();
  if (url && key && !supabaseClient) {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        supabaseClient = createClient(url, key);
      } else {
        supabaseClient = null;
      }
    } catch (e) {
      console.warn('Supabase client not initialized: invalid URL or placeholder credentials.');
      supabaseClient = null;
    }
  }
  return supabaseClient;
};

export const getSupabase = () => supabaseClient || initSupabase();

export const setSupabaseCredentials = (url, key) => {
  if (typeof localStorage !== 'undefined') {
    if (url) localStorage.setItem('CSLM_SUPABASE_URL', url);
    else localStorage.removeItem('CSLM_SUPABASE_URL');

    if (key) localStorage.setItem('CSLM_SUPABASE_KEY', key);
    else localStorage.removeItem('CSLM_SUPABASE_KEY');
  }

  supabaseClient = null;
  initAttempted = false;
  return initSupabase();
};

// Dynamic Local Storage Fallback Engine when Supabase keys are null
export const DynamicStorage = {
  getItem: (key, defaultValue) => {
    try {
      if (typeof localStorage === 'undefined') return defaultValue;
      const data = localStorage.getItem(`CSLM_DB_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(`CSLM_DB_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  }
};
