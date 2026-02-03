import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

import { authOptions } from '@/app/lib/auth';
import Tickets from '@/app/ui/player/tickets';

async function TicketsPage() {
	const session = await getServerSession(authOptions);
	// proxy/auth.ts ensures user is authenticated before reaching here
	return <Tickets ckey={session!.user!.ckey!} />;
}

export default async function Page() {
	return (
		<Suspense>
			<TicketsPage/>
		</Suspense>
	);
}
