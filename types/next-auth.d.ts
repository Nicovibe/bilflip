/**
 * Module augmentation so TypeScript knows about the extra fields we put on
 * the JWT and the session in auth.ts callbacks.
 */
import type { PlanId, SubStatus } from '@/lib/plans';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id: string };
    plan: PlanId;
    status: SubStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    plan?: PlanId;
    status?: SubStatus;
  }
}

export {};
