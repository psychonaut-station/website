import { NextResponse } from 'next/server';

import { getAuthSession } from '@/app/lib/auth';
import { buildUrl } from '@/app/lib/data';
import { get } from '@/app/lib/headers';

const endpoint = `${process.env.API_URL}/v2/player/ban`;

export async function GET() {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	try {
		const response = await get(buildUrl(endpoint, { ckey }), 3_600);

		if (!response.ok) {
			throw new Error('Failed to fetch');
		}

		return NextResponse.json(await response.json());
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
