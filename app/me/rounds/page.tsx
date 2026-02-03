import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/lib/auth';
import Rounds from '@/app/ui/player/rounds';

async function RoundsPage() {
	const session = await getServerSession(authOptions);
	// proxy/auth.ts ensures user is authenticated before reaching here
	return <Rounds ckey={session!.user!.ckey!}/>;
}

export default async function Page() {
	return (
		<Suspense>
			<RoundsPage/>
		</Suspense>
	);
}
