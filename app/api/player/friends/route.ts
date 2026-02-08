import { NextResponse } from 'next/server';

import { getAuthSession } from '@/app/lib/auth';
import { buildUrl } from '@/app/lib/data';
import { get } from '@/app/lib/headers';

const friendsEndpoint = `${process.env.API_URL}/v2/player/friends`;
const invitesEndpoint = `${process.env.API_URL}/v2/player/friend_invites`;

export async function GET() {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	try {
		const [friendsResponse, invitesResponse] = await Promise.all([
			get(buildUrl(friendsEndpoint, { ckey })),
			get(buildUrl(invitesEndpoint, { ckey })),
		]);

		if (!friendsResponse.ok || !invitesResponse.ok) {
			throw new Error('Failed to fetch');
		}

		const [friends, invites] = await Promise.all([
			friendsResponse.json(), invitesResponse.json()
		]);

		return NextResponse.json({ friends: friends, ...invites });
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
