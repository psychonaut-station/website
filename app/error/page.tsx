import type { Metadata } from 'next';
import { Suspense } from 'react';

import Error from '@/app/ui/error';

export const metadata: Metadata = {
	title: 'Hata',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ message?: string; status?: string }> }) {
	const { message, status } = await searchParams;
	return (
		<Suspense>
			<Error message={message || 'Internal Server Error'} status={Number(status) || 500} />
		</Suspense>
	);
}
