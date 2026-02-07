'use server';

import { getAuthSession } from '@/app/lib/auth';
import { buildUrl } from '@/app/lib/data';
import type { Friendship } from '@/app/lib/definitions';
import { post } from '@/app/lib/headers';

const verifyEndpoint = `${process.env.API_URL}/v2/verify`;

const addFriendhipEndpoint = `${process.env.API_URL}/v2/player/add_friend`;
const removeFriendhipEndpoint = `${process.env.API_URL}/v2/player/remove_friend`;
const acceptFriendhipEndpoint = `${process.env.API_URL}/v2/player/accept_friend`;
const declineFriendhipEndpoint = `${process.env.API_URL}/v2/player/decline_friend`;

type VerifyResult = { success: false; message: string; } | { success: true; message: string; ckey: string };

export async function verifyUser(code: string): Promise<VerifyResult> {
	const session = await getAuthSession();
	const id = session?.user?.id;

	if (!id) {
		return {
			success: false,
			message: 'Unauthorized',
		};
	}

	try {
		const response = await post(verifyEndpoint, { discord_id: id, one_time_token: code });

		if (!response.ok) {
			if (response.status === 404) {
				return {
					success: false,
					message: 'Doğrulama kodu geçersiz!',
				};
			} else if (response.status === 409) {
				return {
					success: false,
					message: 'Bu hesap zaten başka bir hesap ile bağlantılı!',
				};
			}

			throw new Error('Internal Server Error');
		}

		const ckey = await response.json();

		return {
			success: true,
			message: 'Başarıyla doğrulandı!',
			ckey,
		};
	} catch {
		return {
			success: false,
			message: 'Bir sunucu hatası oluştu.'
		};
	}
}

export async function addFriend(friend: string): Promise<Friendship | null> {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return null;
	}

	try {
		const response = await post(buildUrl(addFriendhipEndpoint, { ckey, friend }));

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function removeFriend(friendship: number): Promise<Friendship | null> {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return null;
	}

	try {
		const response = await post(buildUrl(removeFriendhipEndpoint, { ckey, friendship_id: friendship }));

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function acceptFriend(friendship: number): Promise<Friendship | null> {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return null;
	}

	try {
		const response = await post(buildUrl(acceptFriendhipEndpoint, { ckey, friendship_id: friendship }));

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}

export async function declineFriend(friendship: number): Promise<Friendship | null> {
	const session = await getAuthSession();
	const ckey = session?.user?.ckey;

	if (!ckey) {
		return null;
	}

	try {
		const response = await post(buildUrl(declineFriendhipEndpoint, { ckey, friendship_id: friendship }));

		if (!response.ok) return null;

		return await response.json();
	} catch {
		return null;
	}
}
