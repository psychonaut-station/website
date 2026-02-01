import { publicLogFiles } from '@/app/lib/constants';
import type { ExtendedRoundData, OverviewData, Picture, Player, RoundData } from '@/app/lib/definitions';
import { get } from '@/app/lib/headers';
import { convertToUTC } from '@/app/lib/time';

const revalidate = 3_600; // 1 hour

const apiUrl = process.env.API_URL;

const playerEndpoint = `${apiUrl}/v2/player`;
const charactersEndpoint = `${apiUrl}/v2/player/characters`;
const roletimeEndpoint = `${apiUrl}/v2/player/roletime`;
const activityEndpoint = `${apiUrl}/v2/player/activity`;
const achievementsEndpoint = `${apiUrl}/v2/player/achievements?achievement_type=achievement`;
const bansEndpoint = `${apiUrl}/v2/player/ban?permanent=true&since=2023-08-23%2023:59:59`;
const statisticsEndpoint = `${apiUrl}/v2/events/overview?limit=100`;

const roundEndpoint = `${apiUrl}/v2/round`;
const pictureLogsEndpoint = `${process.env.CDN_URL}/pictures`;
const logsEndpoint = `${process.env.PRODUCTION_URL}/logs`;

export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
	const url = new URL(base);

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		url.searchParams.set(key, String(value));
	}

	return url.toString();
}

export async function getBasicPlayer(ckey: string): Promise<Player | null> {
	const response = await get(buildUrl(playerEndpoint, { ckey }), revalidate);

	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await response.json();
}

export async function getPlayer(ckey: string): Promise<Player | null> {
	const playerPromise = get(buildUrl(playerEndpoint, { ckey }), revalidate);
	const charactersPromise = get(buildUrl(charactersEndpoint, { ckey }), revalidate);
	const roletimePromise = get(buildUrl(roletimeEndpoint, { ckey }), revalidate);
	const activityPromise = get(buildUrl(activityEndpoint, { ckey }), revalidate);
	const achievementsPromise = get(buildUrl(achievementsEndpoint, { ckey }), revalidate);
	const bansPromise = get(buildUrl(bansEndpoint, { ckey }), revalidate);

	const [
		playerResponse, charactersResponse,
		roletimeResponse, activityResponse,
		achievementsResponse, bansResponse
	] = await Promise.all([
		playerPromise, charactersPromise,
		roletimePromise, activityPromise,
		achievementsPromise, bansPromise
	]);

	if (!(
		playerResponse.ok && charactersResponse.ok &&
		roletimeResponse.ok && activityResponse.ok &&
		achievementsResponse.ok && bansResponse.ok
	)) {
		if (playerResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	const [
		player, characters,
		roletime, activity,
		achievements, bans
	] = await Promise.all([
		playerResponse.json(), charactersResponse.json(),
		roletimeResponse.json(), activityResponse.json(),
		achievementsResponse.json(), bansResponse.json()
	]);

	for (const ban of bans) {
		delete ban.edits;
	}

	return {
		...player,
		characters,
		roletime,
		activity,
		achievements,
		bans,
	};
}

export async function getStatistics(): Promise<OverviewData[]> {
	const statisticsResponse = await get(statisticsEndpoint, revalidate);

	if (!statisticsResponse.ok) {
		if (statisticsResponse.status === 404) {
			return [];
		}

		throw new Error('Internal API Error');
	}

	return await statisticsResponse.json();
}

export async function getBasicRound(roundId: number): Promise<RoundData | null> {
	const response = await get(buildUrl(roundEndpoint, { round_id: roundId }), revalidate);

	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await response.json();
}

export async function getRound(roundId: number): Promise<Omit<ExtendedRoundData, 'roundend_stats'> | null> {
	const roundResponse = await get(buildUrl(roundEndpoint, { round_id: roundId }), revalidate);

	if (!roundResponse.ok) {
		if (roundResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	const round: RoundData = await roundResponse.json();

	const roundPictures: ExtendedRoundData['round_pictures'] = [];
	const logFiles: ExtendedRoundData['log_files'] = [];

	const formattedPath = `${convertToUTC(round.initialize_datetime, undefined, 'YYYY/MM/DD')}/round-${roundId}`;

	try {
		const picturesMetadataRequest = await get(`${pictureLogsEndpoint}/${formattedPath}/metadata.json`, revalidate);

		if (picturesMetadataRequest.ok) {
			const picturesMetadata: Record<string, Picture> = await picturesMetadataRequest.json();

			for (const picture of Object.values(picturesMetadata)) {
				roundPictures.push({
					id: picture.id,
					desc: picture.desc,
					name: picture.name,
					caption: picture.caption,
					pixel_size_x: picture.pixel_size_x,
					pixel_size_y: picture.pixel_size_y,
					src: picture.logpath.replace('data/picture_logs/', '')
				});
			}
		}
	} catch {
		// todo: handle error?
	}

	for (const file of publicLogFiles) {
		const fileUrl = `${logsEndpoint}/${formattedPath}/${file}`;

		const logFile: ExtendedRoundData['log_files'][number] = {
			name: file,
			src: null,
		};

		try {
			const logFileResponse = await get(fileUrl, revalidate);

			if (logFileResponse.ok) {
				logFile.src = fileUrl;
			}
		} catch {
			// todo: handle error?
		}

		logFiles.push(logFile);
	}

	return {
		...round,
		round_pictures: roundPictures,
		log_files: logFiles
	};
}

export async function getLogText(url: string): Promise<string | null> {
	const logResponse = await get(url, revalidate);

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.text();
}

export async function getLogJson<T>(url: string): Promise<T | null> {
	const logResponse = await get(url, revalidate);

	if (!logResponse.ok) {
		if (logResponse.status === 404) {
			return null;
		}

		throw new Error('Internal API Error');
	}

	return await logResponse.json();
}
