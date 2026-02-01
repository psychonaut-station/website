'use client';

import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { useScrollInto, useScrollIntoOnce } from '@/app/hooks/useScrollInto';
import { RoundData } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { relativeTime } from '@/app/lib/time';
import { Pagination } from '@/app/ui/navigation';

const pageSizeOptions = [20, 40, 80] as const;

type PageSizeOption = (typeof pageSizeOptions)[number];

export default function RoundSearch() {
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef(0);

	const [input, setInput] = useState('');

	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(20);

	type Data = { data: RoundData[]; total_count: number; };
	const [optimisticRounds, setOptimisticRounds] = useState<Data | null>(null);
	const { data: rounds, error, isLoading } = useSWRImmutable<Data>(`/api/rounds?page=${debouncedPage}&fetch_size=${pageSize}${Number(input) ? `&round_id=${input}` : ''}`, fetcher);
	useSWRImmutable(`/api/rounds?page=${debouncedPage + 1}&fetch_size=${pageSize}${Number(input) ? `&round_id=${input}` : ''}`, fetcher);

	useEffect(() => {
		if (rounds) {
			setOptimisticRounds(rounds);
		}
	}, [rounds]);

	const onInput = useCallback(() => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			if (inputRef.current) {
				const value = inputRef.current.value ?? '';
				const safeValue = String(Math.min(Math.max(Number(value.replaceAll(/[^0-9]/g, '')) ?? 0, 0), Number.MAX_SAFE_INTEGER));

				setInput(safeValue === '0' ? '' : safeValue);
			}
		}, 500) as any as number;
	}, []);

	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 1);
	}, []);

	useScrollIntoOnce('rounds-navigation', !!optimisticRounds);
	useScrollInto('rounds-navigation', optimisticRounds);

	return (
		<div className="w-full flex-1 flex flex-col gap-5">
			<div className="w-full flex justify-center">
				<div className="flex items-center px-3 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-[.25rem] text-center">
					<input className="h-full flex-1 bg-transparent outline-none" type="number" ref={inputRef} onInput={onInput} placeholder="Round ara"></input>
					<div className="w-5 flex justify-center"><Icon icon={isLoading ? faSpinner : faSearch} spin={isLoading} className={`${isLoading && 'opacity-50'} text-white align-middle`} /></div>
				</div>
			</div>
			<div className="w-full flex-1 flex flex-col gap-4 justify-between px-2 sm:px-4 rounded-xl">
				{isLoading && !optimisticRounds && !error && (
					<div className="w-full flex-1 flex items-center justify-center">
						<div className="w-12 h-12 flex items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin />
						</div>
					</div>
				)}
				{optimisticRounds && (
					<div className="flex flex-wrap justify-center gap-4 px-2 pt-1">
						{optimisticRounds.data.map((item, index) => (
							<Round key={index} round={item} />
						))}
					</div>
				)}
				{error && (
					<div className="w-full flex items-center justify-center">
						<span className="text-red-500">An error has occurred: {error.message}</span>
					</div>
				)}
				<Pagination
					id="rounds-navigation"
					page={page}
					size={pageSize}
					options={pageSizeOptions}
					totalCount={optimisticRounds?.total_count}
					loading={optimisticRounds !== null && isLoading}
					onPageChange={(page) => setPage(page)}
					onPageSizeChange={(size) => { setPageSize(size as PageSizeOption); setPage(1); }}
				/>
			</div>
		</div>
	);
}

function Round({ round }: { round: RoundData }) {
	let roundDuration = '0 dakika';

	if (round.start_datetime && (round.end_datetime || round.shutdown_datetime)) {
		roundDuration = relativeTime(round.start_datetime, round.end_datetime || round.shutdown_datetime || undefined);
	}

	const stationName = round.station_name || 'Space Station 13';

	return (
		<li className="flex justify-center items-center rounded-lg overflow-hidden bg-gray-700 bg-opacity-10 backdrop-blur-md text-white shadow-md transition-all duration-200 hover:bg-opacity-15 hover:shadow-lg group">
			<Link href={`/rounds/${round.round_id}`}>
				<div className="w-full flex flex-col items-center text-center p-3 sm:p-4 text-xs sm:text-sm [&>span>span]:font-bold">
					<span className="text-lg sm:text-xl group-hover:text-yellow-300">Round {round.round_id}</span>
					<span><span>Harita: </span>{round.map_name}</span>
					<span><span>Süre: </span>{roundDuration}</span>
					<span><span>İstasyon: </span>{stationName}</span>
				</div>
			</Link>
		</li>
	);
}
