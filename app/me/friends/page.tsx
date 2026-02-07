import { Suspense } from 'react';

import { getAuthSession } from '@/app/lib/auth';
import Friends from '@/app/ui/player/friends';

async function FriendsPage() {
	const session = await getAuthSession();
	// proxy/auth.ts ensures user is authenticated before reaching here
	return <Friends ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<FriendsPage/>
		</Suspense>
	);
}
