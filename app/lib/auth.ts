import type { NextAuthOptions } from 'next-auth';
import Discord from 'next-auth/providers/discord';

import { buildUrl } from '@/app/lib/data';
import { get, head } from '@/app/lib/headers';

const healthcheckEndpoint = `${process.env.API_URL}/v2/server`;
const ckeyEndpoint = `${process.env.API_URL}/v2/player/discord`;

const clientId = process.env.AUTH_DISCORD_ID!;
const clientSecret = process.env.AUTH_DISCORD_SECRET!;

export const authOptions: NextAuthOptions = {
	pages: {
    signIn: '/sign-in',
		error: '/sign-in',
		signOut: '/sign-in'
  },
  providers: [Discord({ clientId, clientSecret, authorization: { params: { scope: 'identify' } } })],
  callbacks: {
    async signIn() {
      try {
        const response = await head(healthcheckEndpoint);

				if (response.ok) {
					return true;
				}

				return `/error?message=${response.statusText}&status=${response.status}`;
      } catch {
        return '/error';
      }
    },
		async jwt({ token, profile, trigger }) {
			if (trigger === 'signIn' && profile) {
				token.ckey = await getCkey(profile.id);
			}

			if (trigger === 'update' && token.sub) {
				token.ckey = await getCkey(token.sub);
			}

			return token;
		},
		async session({ session, token }) {
			if (token.sub) {
				session.user = { ...session.user, id: token.sub, ckey: token.ckey };
			}
			return session;
		},
	},
};

const getCkey = async (id: string): Promise<string | null | undefined> => {
	try {
		const response = await get(buildUrl(ckeyEndpoint, { discord_id: id }));

		if (response.status === 200) {
			return await response.json();
		} else if (response.status !== 500) {
			return null;
		}
	} catch {}

	return undefined;
};
