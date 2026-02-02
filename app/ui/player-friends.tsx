'use client';

import {
	faAddressCard,
	faSearch,
	faSpinner,
	faUserCheck,
	faUserClock,
	faUserFriends,
	faUserMinus,
	faUserPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx/lite';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import { acceptFriend, addFriend, declineFriend, removeFriend } from '@/app/lib/actions';
import { FriendsData, Friendship } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import PlayerSprite from '@/app/ui/player-sprite';

const categories = {
	friends: {
		name: 'Arkadaşlar',
		component: Friends,
	},
	invites: {
		name: 'Davetler',
		component: Invites,
	},
	find: {
		name: 'Arkadaşlarını Bul',
		component: FindFriends,
	}
};

type Category = keyof typeof categories;

export default function PlayerFriends({ ckey }: { ckey: string; }) {
	const [activeCategory, setActiveCategory] = useState<Category>('friends');
	const { component: Category } = categories[activeCategory];

	const { data, error, isLoading, mutate } = useSWR<FriendsData>('/api/player/friends', fetcher, { revalidateOnFocus: false });

	return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 px-2 pt-8 sm:px-14 lg:px-[13.5rem]">
			<div className="w-full flex flex-col items-center gap-5">
				<span className="text-center text-3xl font-bold mb-4">Arkadaşlar</span>
				<div className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
					<div className="h-min p-4 bg-gray-700 bg-opacity-10 rounded-[.25rem]">
						<h2 className="mb-4 text-white text-lg font-bold text-center md:text-base">Kategoriler</h2>
						<ul className="space-y-2 [&>li]:px-4 [&>li]:py-2">
							{Object.entries(categories).map(([category, item]) => (
								<li
									key={category}
									className={clsx(
										activeCategory === category && 'bg-gray-500',
										'text-center cursor-pointer rounded-lg text-white hover:bg-gray-500 transition-colors text-nowrap'
									)}
									onClick={() => setActiveCategory(category as Category)}
								>
									{item.name}
								</li>
							))}
						</ul>
					</div>
					<div className="md:flex-1 bg-gray rounded-xl flex items-center">
						{isLoading && !data && !error && (
							<div className="w-full flex justify-center">
								<div className="w-12 h-12 opacity-50">
									<Icon icon={faSpinner} size="3x" spin/>
								</div>
							</div>
						)}
						{!!data && (
							<div className="h-full flex-1 flex justify-center p-4 bg-opacity-10 rounded-[.25rem] bg-gray-800/10">
								{/* <Category friends={mockFriends} received={receivedMockFriends} sent={sentMockFriends} ckey={ckey} mutate={mutate} /> */}
								<Category friends={data.friends} received={data.received} sent={data.sent} ckey={ckey} mutate={mutate} />
							</div>
						)}
						{!!error && (
							<div className="w-full flex items-center justify-center">
								<span className="text-red-500">An error has occurred: {error.message}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function Friends({ friends, ckey, mutate }: { friends: Friendship[]; ckey: string; mutate: () => void; }) {
	return (
		<div className="flex-1 flex flex-col gap-4">
			<h2 className="text-white text-lg font-bold text-center md:text-base">Arkadaşlarım</h2>
			{friends.length !== 0 ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{friends.map(item => <FriendCard key={item.id} friendship={item} ckey={ckey} mutate={mutate} />)}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<span className='text-gray-400'>Ne yazık ki hiçbir arkadaşın yok :(</span>
				</div>
			)}
		</div>
	);
}

function Invites({ received, sent, ckey, mutate }: { received: Friendship[]; sent: Friendship[]; ckey: string; mutate: () => void; }) {
	return (
		<div className="flex-1 flex flex-col gap-4">
			<h2 className="text-white text-lg font-bold text-center md:text-base">Gelen Davetler</h2>
			{received.length !== 0 ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{received.map(item => <FriendCard key={item.id} friendship={item} ckey={ckey} mutate={mutate} />)}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<span className='text-gray-400'>Gelen aktif bir arkadaşlık isteği bulunmuyor.</span>
				</div>
			)}
			<h2 className="text-white text-lg font-bold text-center md:text-base">Giden Davetler</h2>
			{sent.length !== 0 ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{sent.map(item => <FriendCard key={item.id} friendship={item} ckey={ckey} mutate={mutate} />)}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<span className='text-gray-400'>Gönderdiğin aktif bir arkadaşlık isteği bulunmuyor.</span>
				</div>
			)}
		</div>
	);
}

function FindFriends({ ckey, mutate }: { ckey: string; mutate: () => void; }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef(0);

	const [input, setInput] = useState('');
	const [autocomplete, setAutocomplete] = useState<string[]>([]);

	const { data, isLoading } = useSWRImmutable<string[]>(`/api/autocomplete/ckey?ckey=${input}`, fetcher, {
		isPaused: () => inputRef.current ? inputRef.current.value.length === 0 : true,
	});

	const onInput = useCallback(() => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setInput(inputRef.current?.value ?? '');
		}, 500) as any as number;
	}, []);

	useEffect(() => {
		if (input.length === 0) {
			setAutocomplete([]);
		} else if (data) {
			setAutocomplete(data.filter(item => item !== ckey));
		}
	}, [input, data, ckey]);

	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 1);
	}, []);

	return (
		<div className="flex-1 flex flex-col items-center gap-4">
			<h2 className="text-white text-lg font-bold text-center md:text-base">Arkadaş Bul</h2>
			<div className="w-min flex items-center px-3 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-[.25rem] text-center">
				<input className="h-full flex-1 bg-transparent outline-none" ref={inputRef} onInput={onInput} placeholder="Oyuncu ara"></input>
				<div className="w-5 flex justify-center"><Icon icon={isLoading ? faSpinner : faSearch} spin={isLoading} className={clsx(isLoading && 'opacity-50', 'text-white align-middle')} /></div>
			</div>
			{autocomplete.length !== 0 && (
				<div className='w-full grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{autocomplete.map(item => <LazyFriendCard key={item} ckey={ckey} friend={item} mutate={mutate} />)}
				</div>
			)}
		</div>
	);
}

type FriendCardProps = {
	friendship: Friendship;
	ckey: string;
	mutate: () => void;
} | {
	friend: string;
	ckey: string;
	mutate: () => void;
};

function FriendCard(props: FriendCardProps) {
	const friend = 'friendship' in props ? (props.friendship.user_ckey === props.ckey ? props.friendship.friend_ckey : props.friendship.user_ckey) : props.friend;
	const friendship = 'friendship' in props ? props.friendship : null;

	const { data: character } = useSWRImmutable<[string, string]>(`/api/player/favorite-character?ckey=${friend}`, fetcher, {
		errorRetryCount: 0,
	});

	return (
		<div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-800/40 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all duration-300 group shadow-sm gap-2">
			<div className="flex items-center gap-2 sm:gap-3 min-w-0">
				<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-md bg-gray-950/80 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
					<PlayerSprite ckey={friend} character={character?.[0]} job={character?.[1]} scale={1.4} />
				</div>
				<div className="flex flex-col min-w-0">
					<Link
						href={`/players/${friend}`}
						className="text-gray-100 font-semibold text-sm sm:text-base tracking-wide truncate hover:text-indigo-400 transition-colors"
					>
						{friend}
					</Link>
					<span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-tighter truncate">
						{friendship?.status === 'accepted' ? 'arkadaş' : friendship?.status === 'pending' ? 'bekliyor' : 'oyuncu'}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
				<FriendButton friendship={friendship} ckey={props.ckey} friend={friend} onClick={() => props.mutate()} />
				<Link
					href={`/players/${friend}`}
					className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 bg-gray-500/10 text-gray-500 hover:text-white"
				>
					<Icon icon={faAddressCard} className="text-sm sm:text-base" />
				</Link>
			</div>
		</div>
	);
}

function LazyFriendCard({ ckey, friend, mutate: mutateFriends }: { ckey: string; friend: string; mutate: () => void; }) {
	const { data: friendship, mutate: mutateCard } = useSWR<Friendship | null>(`/api/player/friends/check-friendship?friend=${friend}`, fetcher);

	if (friendship === undefined) {
		// todo: skeleton iyi olurdu
		return <></>;
	}

	const mutate = () => {
		mutateFriends();
		mutateCard();
	};

	return <FriendCard ckey={ckey} mutate={mutate} {...friendship ? { friendship } : { friend }} />;
}

function FriendButton({ friendship, ckey, friend, onClick }: { friendship: Friendship | null; ckey: string; friend: string; onClick: (friendship: Friendship | null) => void; }) {
	const btnBase = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-100 active:scale-90 flex-shrink-0';

	if (friendship?.status === 'pending') {
		if (friendship.user_ckey === ckey) { // sent request
			return (
				<button
					className={`${btnBase} bg-amber-500/10 text-amber-500 hover:bg-red-500/80 hover:text-white group/btn`}
					onClick={() => declineFriend(ckey, friendship.id).then(onClick)}
					title="İsteği iptal et"
				>
					<Icon icon={faUserClock} className="block group-hover/btn:hidden text-sm sm:text-base" />
					<Icon icon={faUserMinus} className="!hidden group-hover/btn:!block text-sm sm:text-base" />
				</button>
			);
		} else if (friendship.friend_ckey === ckey) { // received request
			return (
				<>
					<button
						className={`${btnBase} bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/80 hover:text-white`}
						onClick={() => acceptFriend(ckey, friendship.id).then(onClick)}
						title="Kabul et"
					>
						<Icon icon={faUserCheck} className="text-sm sm:text-base" />
					</button>
					<button
						className={`${btnBase} bg-red-500/10 text-red-500 hover:bg-red-500/80 hover:text-white`}
						onClick={() => declineFriend(ckey, friendship.id).then(onClick)}
						title="Reddet"
					>
						<Icon icon={faUserMinus} className="text-sm sm:text-base" />
					</button>
				</>
			);
		}
	} else if (friendship?.status === 'accepted') {
		return (
			<button
				className={`${btnBase} bg-indigo-500/10 text-indigo-400 hover:bg-red-500/80 hover:text-white group/btn`}
				onClick={() => removeFriend(ckey, friendship.id).then(onClick)}
				title="Arkadaşlıktan çıkar"
			>
				<Icon icon={faUserFriends} className="block group-hover/btn:hidden text-sm sm:text-base" />
				<Icon icon={faUserMinus} className="!hidden group-hover/btn:!block text-sm sm:text-base" />
			</button>
		);
	}

	return (
		<button
			className={`${btnBase} bg-white/5 text-gray-400 hover:bg-indigo-600/80 hover:text-white`}
			onClick={() => addFriend(ckey, friend).then(onClick)}
			title="Arkadaş ekle"
		>
			<Icon icon={faUserPlus} className="text-sm sm:text-base" />
		</button>
	);
}
