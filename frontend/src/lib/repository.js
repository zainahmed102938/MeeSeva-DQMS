import { getSupabase, DynamicStorage } from './supabase';

/**
 * Transforms an object's keys from camelCase to snake_case.
 */
export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = val !== undefined ? val : null;
  }
  return result;
};

/**
 * Transforms an object's keys from snake_case to camelCase.
 */
export const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = val;
  }
  return result;
};

/**
 * Table-to-storage key mapping
 */
const TABLE_TO_KEY = {
  projects: 'projects',
  tasks: 'tasks',
  bugs: 'bugs',
  sprints: 'sprints',
  code_files: 'codeFiles',
  code_queries: 'codeQueries',
  git_branches: 'gitBranches',
  git_commits: 'gitCommits',
  git_pull_requests: 'gitPullRequests',
  chat_channels: 'chatChannels',
  chat_messages: 'chatMessages',
  mails: 'mails',
  users: 'allUsers',
  custom_roles: 'customRoles',
  whiteboards: 'whiteboards',
  audit_logs: 'auditLogs',
  pipelines: 'pipelines',
  webhooks: 'webhooks'
};

/**
 * Check if active authenticated Supabase session exists.
 * Prevents anonymous requests from hitting production tables.
 */
export const hasActiveSupabaseSession = async (supabase) => {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (_) {
    return false;
  }
};

/**
 * Robust Data Repository managing Supabase PostgreSQL sync with DynamicStorage sandbox isolation.
 */
export const Repository = {
  /**
   * Fetch records for a table, mapping snake_case -> camelCase.
   * Supports server-side filtering via `filters` object.
   * Gracefully falls back to isolated DynamicStorage if offline or unauthenticated demo mode.
   */
  async getAll(tableName, fallbackData = [], filters = {}) {
    const supabase = getSupabase();
    const storageKey = TABLE_TO_KEY[tableName] || tableName;
    const isAuth = await hasActiveSupabaseSession(supabase);

    if (supabase && isAuth) {
      try {
        let query = supabase.from(tableName).select('*');
        if (filters && typeof filters === 'object') {
          for (const [key, val] of Object.entries(filters)) {
            if (val !== undefined && val !== null) {
              const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
              if (Array.isArray(val)) {
                query = query.in(snakeKey, val);
              } else {
                query = query.eq(snakeKey, val);
              }
            }
          }
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const camelData = data.map(toCamelCase);
          if (!filters || Object.keys(filters).length === 0) {
            DynamicStorage.setItem(storageKey, camelData);
          }
          return camelData;
        }
        if (error) {
          console.warn(`[Repository] Supabase query notice on ${tableName}:`, error.message);
        }
      } catch (err) {
        console.warn(`[Repository] Failed to fetch from Supabase table ${tableName}:`, err);
      }
    }

    // DynamicStorage fallback (Demo Sandbox / Offline)
    let localList = DynamicStorage.getItem(storageKey, fallbackData);
    if (!Array.isArray(localList)) localList = fallbackData;

    if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
      return localList.filter(item => {
        return Object.entries(filters).every(([k, v]) => {
          if (v === undefined || v === null) return true;
          if (Array.isArray(v)) return v.includes(item[k]);
          return item[k] === v;
        });
      });
    }

    return localList;
  },

  /**
   * Insert a new record into Supabase and update local storage.
   * Returns honest outcome with remote sync status and any errors.
   */
  async insert(tableName, record) {
    const storageKey = TABLE_TO_KEY[tableName] || tableName;
    const snakeRecord = toSnakeCase(record);
    const supabase = getSupabase();
    const isAuth = await hasActiveSupabaseSession(supabase);

    let remoteSuccess = false;
    let remoteError = null;

    if (supabase && isAuth) {
      try {
        const { error } = await supabase.from(tableName).insert(snakeRecord);
        if (error) {
          remoteError = error.message;
          console.warn(`[Repository] Supabase insert warning on ${tableName}:`, error.message);
        } else {
          remoteSuccess = true;
        }
      } catch (err) {
        remoteError = err.message || 'Network error';
        console.warn(`[Repository] Supabase insert failed on ${tableName}:`, err);
      }
    }

    // Always update local storage
    const currentList = DynamicStorage.getItem(storageKey, []);
    const updated = [record, ...currentList.filter(item => item.id !== record.id)];
    DynamicStorage.setItem(storageKey, updated);

    return {
      ...record,
      success: !remoteError,
      remote: remoteSuccess,
      error: remoteError,
      data: record
    };
  },

  /**
   * Upsert a record into Supabase and update local storage.
   * Crucial for repeated saves with deterministic keys (e.g., code files, whiteboards).
   */
  async upsert(tableName, record, onConflict = 'id') {
    const storageKey = TABLE_TO_KEY[tableName] || tableName;
    const snakeRecord = toSnakeCase(record);
    const supabase = getSupabase();
    const isAuth = await hasActiveSupabaseSession(supabase);

    let remoteSuccess = false;
    let remoteError = null;

    if (supabase && isAuth) {
      try {
        const { error } = await supabase.from(tableName).upsert(snakeRecord, { onConflict });
        if (error) {
          remoteError = error.message;
          console.warn(`[Repository] Supabase upsert warning on ${tableName}:`, error.message);
        } else {
          remoteSuccess = true;
        }
      } catch (err) {
        remoteError = err.message || 'Network error';
        console.warn(`[Repository] Supabase upsert failed on ${tableName}:`, err);
      }
    }

    // Always update local storage
    const currentList = DynamicStorage.getItem(storageKey, []);
    const exists = currentList.some(item => item.id === record.id);
    const updated = exists
      ? currentList.map(item => item.id === record.id ? { ...item, ...record } : item)
      : [record, ...currentList];
    DynamicStorage.setItem(storageKey, updated);

    return {
      ...record,
      success: !remoteError,
      remote: remoteSuccess,
      error: remoteError,
      data: record
    };
  },

  /**
   * Update an existing record in Supabase and update local storage.
   */
  async update(tableName, id, updates) {
    const storageKey = TABLE_TO_KEY[tableName] || tableName;
    const snakeUpdates = toSnakeCase(updates);
    const supabase = getSupabase();
    const isAuth = await hasActiveSupabaseSession(supabase);

    let remoteSuccess = false;
    let remoteError = null;

    if (supabase && isAuth) {
      try {
        const { error } = await supabase.from(tableName).update(snakeUpdates).eq('id', id);
        if (error) {
          remoteError = error.message;
          console.warn(`[Repository] Supabase update warning on ${tableName}:`, error.message);
        } else {
          remoteSuccess = true;
        }
      } catch (err) {
        remoteError = err.message || 'Network error';
        console.warn(`[Repository] Supabase update failed on ${tableName}:`, err);
      }
    }

    // Always update local storage
    const currentList = DynamicStorage.getItem(storageKey, []);
    const updated = currentList.map(item => item.id === id ? { ...item, ...updates } : item);
    DynamicStorage.setItem(storageKey, updated);

    return {
      ...updates,
      id,
      success: !remoteError,
      remote: remoteSuccess,
      error: remoteError,
      data: updates
    };
  },

  /**
   * Delete a record from Supabase and update local storage.
   */
  async remove(tableName, id) {
    const storageKey = TABLE_TO_KEY[tableName] || tableName;
    const supabase = getSupabase();
    const isAuth = await hasActiveSupabaseSession(supabase);

    let remoteSuccess = false;
    let remoteError = null;

    if (supabase && isAuth) {
      try {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
          remoteError = error.message;
          console.warn(`[Repository] Supabase delete warning on ${tableName}:`, error.message);
        } else {
          remoteSuccess = true;
        }
      } catch (err) {
        remoteError = err.message || 'Network error';
        console.warn(`[Repository] Supabase delete failed on ${tableName}:`, err);
      }
    }

    const currentList = DynamicStorage.getItem(storageKey, []);
    const updated = currentList.filter(item => item.id !== id);
    DynamicStorage.setItem(storageKey, updated);

    return {
      id,
      success: !remoteError,
      remote: remoteSuccess,
      error: remoteError
    };
  }
};
