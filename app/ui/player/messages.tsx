'use client';

import { faCalendarAlt, faClock, faExclamationTriangle, faLayerGroup, faSpinner, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { useScrollInto } from '@/app/hooks/useScrollInto';
import type { Message as MessageData } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { Pagination } from '@/app/ui/navigation';

type MessageResponse = {
	data: MessageData[];
	total_count: number;
}

const pageSizeOptions = [5, 10, 15, 20] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];

export default function Messages() {
	return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 pt-8 px-4 sm:px-8 md:px-14 lg:px-56 xl:px-80 ultrawide:px-120 huge:px-160">
			<MessageList/>
			<NoteList/>
		</div>
	);
}

function MessageList() {
	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(10);

	const [optimisticMessages, setOptimisticMessages] = useState<MessageResponse | null>(null);
	const { data: messages, error, isLoading } = useSWRImmutable<MessageResponse>(`/api/player/messages?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);
	useSWRImmutable(`/api/player/messages?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

	useEffect(() => {
		if (messages) setOptimisticMessages(messages);
	}, [messages]);

	useScrollInto('messages-navigation', optimisticMessages);

	return (
		<div className="w-full flex flex-col items-center gap-5">
			<span className="text-center text-3xl font-bold mb-4 flex items-center gap-3">Mesajlar</span>
			<div className="w-full flex flex-col">
				{isLoading && !optimisticMessages && !error && (
					<div className="py-20 flex flex-col items-center justify-center opacity-50">
						<Icon icon={faSpinner} size="3x" spin/>
						<span className="mt-4 text-lg">Mesajlar yükleniyor...</span>
					</div>
				)}
				{optimisticMessages && (
					<div className="flex flex-col gap-6">
						{optimisticMessages.data.map((item, index) => (
							<Message key={index} message={item}/>
						))}
						{optimisticMessages.data.length === 0 && (
							<div className="w-full text-center py-10 text-gray-400">Gösterilecek mesaj bulunamadı.</div>
						)}
					</div>
				)}
				{error && (
					<div className="w-full flex items-center justify-center">
						<span className="text-red-500">An error has occurred: {error.message}</span>
					</div>
				)}
				<Pagination
					id="messages-navigation"
					page={page}
					size={pageSize}
					options={pageSizeOptions}
					totalCount={optimisticMessages?.total_count}
					loading={optimisticMessages !== null && isLoading}
					onPageChange={setPage}
					onPageSizeChange={(size) => { setPageSize(size as PageSizeOption); setPage(1); }}
				/>
			</div>
		</div>
	);
}

function NoteList() {
	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(10);

	const [optimisticNotes, setOptimisticNotes] = useState<MessageResponse | null>(null);
	const { data: notes, error, isLoading } = useSWRImmutable<MessageResponse>(`/api/player/notes?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);
	useSWRImmutable(`/api/player/notes?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

	useEffect(() => {
		if (notes) setOptimisticNotes(notes);
	}, [notes]);

	useScrollInto('notes-navigation', optimisticNotes);

	return (
		<div className="w-full flex flex-col items-center gap-5">
			<span className="text-center text-3xl font-bold mb-4 flex items-center gap-3">Notlar</span>
			<div className="w-full flex flex-col">
				{isLoading && !optimisticNotes && !error && (
					<div className="py-20 flex flex-col items-center justify-center opacity-50">
						<Icon icon={faSpinner} size="3x" spin/>
						<span className="mt-4 text-lg">Notlar yükleniyor...</span>
					</div>
				)}
				{optimisticNotes && (
					<div className="flex flex-col gap-6">
						{optimisticNotes.data.map((item, index) => (
							<Message key={index} message={item}/>
						))}
						{optimisticNotes.data.length === 0 && (
							<div className="w-full text-center py-10 text-gray-400">Gösterilecek not bulunamadı.</div>
						)}
					</div>
				)}
				{error && (
					<div className="w-full flex items-center justify-center">
						<span className="text-red-500">An error has occurred: {error.message}</span>
					</div>
				)}
				<Pagination
					id="notes-navigation"
					page={page}
					size={pageSize}
					options={pageSizeOptions}
					totalCount={optimisticNotes?.total_count}
					loading={optimisticNotes !== null && isLoading}
					onPageChange={setPage}
					onPageSizeChange={(size) => { setPageSize(size as PageSizeOption); setPage(1); }}
				/>
			</div>
		</div>
	);
}

function Message({ message }: { message: MessageData }) {
	// todo: tailwind bunu nasıl yakalıyor la?
	const severityStyles: Record<string, string> = {
    none: 'border-l-gray-500',
    minor: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500 ',
  };

  const currentSeverity = message.severity ? message.severity.toLowerCase() : 'none';
  const activeStyle = severityStyles[currentSeverity];

  return (
    <div className={`flex flex-col gap-3 p-5 pb-3 bg-white/5 border-l-4 rounded-r-md transition-hover hover:bg-white/10 ${activeStyle}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-wider font-semibold opacity-80">
        <div className="flex items-center gap-2">
          <Icon icon={faUserShield} className="text-blue-400" />
          <span>Admin: <span className="text-white">{message.adminckey}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon={faCalendarAlt} />
          <span>{new Date(message.timestamp).toLocaleString('tr-TR')} - {message.days_passed} gün önce</span>
        </div>
      </div>
      <div className="text-sm leading-relaxed text-gray-200 wrap-break-word whitespace-pre-wrap italic bg-black/20 p-3 rounded-sm border border-white/5">
        {message.text}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 border-t border-white/5 pt-2">
        {message.server && (
          <div className="flex items-center gap-1">
            <span className="font-bold">Server:</span> {message.server}
          </div>
        )}
        {message.round_id && (
          <Link href={`/rounds/${message.round_id}`} className="flex items-center gap-1 hover:text-white transition-colors">
            <Icon icon={faLayerGroup} size="xs" />
            <span className="font-bold">Round:</span> #{message.round_id}
          </Link>
        )}
        {message.playtime !== null && (
          <div className="flex items-center gap-1">
            <Icon icon={faClock} size="xs" />
            <span className="font-bold">Oynama Süresi:</span> {Math.floor(message.playtime / 60)} saat
          </div>
        )}
        {message.severity && (
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/5">
            <Icon icon={faExclamationTriangle} size="xs" />
            <span className="uppercase">{message.severity}</span>
          </div>
        )}
      </div>
    </div>
  );
}
