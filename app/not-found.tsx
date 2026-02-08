import type { Metadata } from 'next';

import Error from '@/app/ui/error';

export const metadata: Metadata = {
	title: '404',
};

export default function NotFound() {
	return <Error message="This page could not be found." status={404} />;
}
