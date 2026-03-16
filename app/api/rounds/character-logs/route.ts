import { type NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

import { getCharacterIcons } from '@/app/lib/data';

const QuerySchema = z.object({
	round_id: z.string().refine(val => {
		const num = Number(val);
		return !isNaN(num) && num >= 1;
	}, {
		message: 'round_id must be a number greater than or equal to 1',
	}),
});

export async function GET(request: NextRequest) {
	const { success, data } = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

	if (!success) {
		return new NextResponse('Bad Request', { status: 400 });
	}

	const { round_id } = data;

	try {
		const characterLogs = await getCharacterIcons(parseInt(round_id));
		return NextResponse.json(characterLogs);
	} catch {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
