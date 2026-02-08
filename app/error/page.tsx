import type { Metadata } from 'next';
import { Suspense } from 'react';

import Error from '@/app/ui/error';

export const metadata: Metadata = {
	title: 'Hata',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ message?: string; status?: string }> }) {
	const params = searchParams.then(({ message, status }) => ({ message, status }));

	return (
		<Suspense>
			<ErrorPage params={params} />
		</Suspense>
	);
}

async function ErrorPage({ params }: { params: Promise<{ message?: string; status?: string }> }) {
	const { message, status } = await params;
	return <Error message={message || 'Internal Server Error'} status={Number(status) || 500} />;
}
