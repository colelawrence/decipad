import 'next-auth';
import type { User as DecipadUser } from '@decipad/interfaces';

declare module 'next-auth' {
  type User = DecipadUser;
  interface Session {
    user?: DecipadUser;
  }
}
