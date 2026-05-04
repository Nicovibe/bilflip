/**
 * Auth.js v5 mount point. Handles:
 *   /api/auth/signin, /api/auth/signout, /api/auth/callback/*,
 *   /api/auth/session, /api/auth/csrf, /api/auth/providers, ...
 */
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
