import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/lib/auth';
import PlayerFriends from '@/app/ui/player-friends';

async function FriendsPage() {
	const session = await getServerSession(authOptions);
	// proxy/auth.ts ensures user is authenticated before reaching here
	return <PlayerFriends ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<FriendsPage/>
		</Suspense>
	);
}
