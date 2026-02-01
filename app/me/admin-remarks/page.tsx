import { Suspense } from 'react';

import PlayerMessages from '@/app/ui/player-messages';

export default async function Page() {
	return (
		<Suspense>
			<PlayerMessages/>
		</Suspense>
	);
}
