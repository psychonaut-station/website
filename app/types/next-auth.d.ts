import { DefaultSession } from 'next-auth';
import { DiscordProfile } from 'next-auth/providers/discord';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & ({
			// logged in but not verified
			id: string;
			displayName: string;
			ckey: null;
		} | {
			// logged in and verified
			id: string;
			displayName: string;
			ckey: string;
		} | {
			// logged in but internal error occurred during verification
			id: string;
			displayName: string;
			ckey: undefined;
		});
  }

	// The OAuth profile returned from Discord provider.
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Profile extends DiscordProfile {}
}

declare module 'next-auth/jwt' {
  interface JWT {
		/**
		 * - string: verified
		 * - null: not verified
		 * - undefined: internal error occurred
		 */
    ckey: string | null | undefined;
		displayName: string;
  }
}
