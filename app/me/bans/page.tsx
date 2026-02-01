import { Suspense } from 'react';

import Bans from '@/app/ui/player-bans';

export default async function Page() {
	return (
		<Suspense>
			<Bans />
		</Suspense>
	);
}
