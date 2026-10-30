import { getSupabase, DynamicStorage } from '../../lib/supabase';
import { Repository } from '../../lib/repository';

export const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
};

/**
 * Service managing user authentication, registration, and session restoration.
 * Strips sensitive password fields to maintain zero plaintext exposure.
 */
export const AuthService = {
  /**
   * Check for active persisted session on initial page load.
   */
  async restoreSession() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          return await this._buildUserProfile(session.user);
        }
      } catch (e) {
        console.warn('[AuthService] Session restore failed:', e);
      }
    }

    // Check local storage session fallback and sanitize legacy sessions
    let localUser = DynamicStorage.getItem('auth_session_user', null);
    if (localUser && localUser !== 'logged_out') {
      if (localUser.password !== undefined) {
        localUser = sanitizeUser(localUser);
        DynamicStorage.setItem('auth_session_user', localUser);
      }
      return localUser;
    }

    return null;
  },

  /**
   * Subscribe to real-time auth state changes from Supabase.
   */
  subscribeToAuthState(callback) {
    const supabase = getSupabase();
    if (supabase?.auth?.onAuthStateChange) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await this._buildUserProfile(session.user);
            callback(event, profile);
          } else if (event === 'SIGNED_OUT') {
            DynamicStorage.setItem('auth_session_user', null);
            callback(event, null);
          }
        });
        return subscription;
      } catch (err) {
        console.warn('[AuthService] onAuthStateChange setup warning:', err);
      }
    }
    return null;
  },

  /**
   * Build full application user profile from Supabase Auth User object
   */
  async _buildUserProfile(authUser) {
    const supabase = getSupabase();
    let profile = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if (!error && data) {
          profile = data;
        }
      } catch (_) {}
    }

    const email = authUser.email;
    const meta = authUser.user_metadata || {};
    const name = profile?.name || meta.name || email?.split('@')[0] || 'User';
    const role = profile?.role || meta.role || 'Developer';
    const teamId = profile?.team_id || meta.teamId || 'team-1';
    const avatar = profile?.avatar || meta.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`;

    const userObj = {
      id: authUser.id,
      email,
      name,
      username: profile?.username || email?.split('@')[0] || 'user',
      role,
      teamId,
      avatar,
      isRealAuth: true,
      requiresMfa: false,
    };

    DynamicStorage.setItem('auth_session_user', userObj);
    return userObj;
  },

  /**
   * Sign in with email/password against Supabase, falling back to local session.
   */
  async login(identifier, password) {
    const supabase = getSupabase();

    if (supabase && identifier.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password
        });
        if (!error && data?.user) {
          return await this._buildUserProfile(data.user);
        }
        if (error) {
          throw new Error(error.message);
        }
      } catch (err) {
        console.warn('[AuthService] Supabase sign-in error:', err);
        throw err;
      }
    }

    // Local / offline fallback mode
    const users = await Repository.getAll('users', []);
    const user = users.find(u => 
      (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (user) {
      const safeUser = sanitizeUser(user);
      DynamicStorage.setItem('auth_session_user', safeUser);
      return safeUser;
    }

    throw new Error('Invalid credentials');
  },

  /**
   * Register a new user
   */
  async register({ email, password, name, role = 'Developer', teamId = 'team-1' }) {
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, teamId }
        }
      });
      if (error) throw error;
      if (data?.user) {
        return await this._buildUserProfile(data.user);
      }
    }

    // Local registration
    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      name,
      username: email.split('@')[0],
      role,
      teamId,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      requiresMfa: false
    };

    await Repository.insert('users', { ...newUser, password });
    const safeLocalUser = sanitizeUser(newUser);
    DynamicStorage.setItem('auth_session_user', safeLocalUser);
    return safeLocalUser;
  },

  /**
   * Terminate active user session
   */
  async logout() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[AuthService] Logout warning:', e);
      }
    }
    DynamicStorage.setItem('auth_session_user', 'logged_out');
    return true;
  }
};
