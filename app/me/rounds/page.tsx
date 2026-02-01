import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/lib/auth';
import PlayerRounds from '@/app/ui/player-rounds';

async function PlayerRoundsPage() {
	const session = await getServerSession(authOptions);
	// proxy/auth.ts ensures user is authenticated before reaching here
	return <PlayerRounds ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<PlayerRoundsPage/>
		</Suspense>
	);
}
