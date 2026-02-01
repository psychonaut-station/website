'use client';

import { faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx/lite';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { useScrollInto } from '@/app/hooks/useScrollInto';
import { TicketGroup } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { Pagination } from '@/app/ui/navigation';

type TicketResponse = {
  data: TicketGroup[];
  total_count: number;
}

const pageSizeOptions = [5, 10, 15, 20] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];

export default function Tickets({ ckey }: { ckey: string }) {
  const [page, setPage] = useState(1);
  const [debouncedPage] = useDebounce(page, 200);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);

  const [optimisticTickets, setOptimisticTickets] = useState<TicketResponse | null>(null);
  const { data: tickets, error, isLoading } = useSWRImmutable<TicketResponse>(`/api/player/tickets?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);
  useSWRImmutable(`/api/player/tickets?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

  useEffect(() => {
    if (tickets) setOptimisticTickets(tickets);
  }, [tickets]);

	// todo: nearest değildi ama bi dursun bakim
	useScrollInto('tickets-navigation', optimisticTickets);

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-5 pt-8 px-4 sm:px-8 md:px-14 lg:px-[13.5rem] xl:px-[20rem] ultrawide:px-[30rem] huge:px-[40rem]">
      <div className="w-full flex flex-col items-center gap-5">
        <span className="text-center text-3xl font-bold mb-4 flex items-center gap-3">Ticketler</span>
        <div className="w-full flex flex-col">
          {isLoading && !optimisticTickets && !error && (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin/>
              <span className="mt-4 text-lg">Ticketler yükleniyor...</span>
            </div>
          )}
          {optimisticTickets && (
            <div className="flex flex-col gap-6">
              {optimisticTickets.data.map((item) => (
                <Ticket key={`${item.round_id}-${item.ticket_id}`} ticket={item} ckey={ckey} />
              ))}
            </div>
          )}
          {error && (
						<div className="w-full flex items-center justify-center">
							<span className="text-red-500">An error has occurred: {error.message}</span>
						</div>
					)}
					<Pagination
						id="tickets-navigation"
						page={page}
						size={pageSize}
						options={pageSizeOptions}
						totalCount={optimisticTickets?.total_count}
						loading={optimisticTickets !== null && isLoading}
						onPageChange={setPage}
						onPageSizeChange={(size) => { setPageSize(size as PageSizeOption); setPage(1); }}
					/>
        </div>
      </div>
    </div>
  );
}

function Ticket({ ticket, ckey }: { ticket: TicketGroup, ckey: string; }) {
  return (
    <div className="flex flex-col bg-black bg-opacity-20 rounded-md border border-gray-700 overflow-hidden">
      <div className="bg-gray-700 bg-opacity-30 px-4 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
					<Link href={`/rounds/${ticket.round_id}`} className="font-bold text-blue-300 hover:underline">Round #{ticket.round_id}</Link>
          <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300 border border-gray-600">
            Ticket #{ticket.ticket_id}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Icon icon={faClock} size="xs" />
          {new Date(ticket.logs[0].timestamp).toLocaleString()}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {ticket.logs.map((log) => {
          const self = log.sender?.toLowerCase() === ckey.toLowerCase();

          return (
            <div key={log.timestamp} className={clsx('flex flex-col', self && 'items-end' || 'items-start')}>
              <div className={clsx(
								'max-w-[90%] p-3 rounded-lg text-sm',
								self && 'bg-blue-900 bg-opacity-40 border border-blue-800 text-blue-50'
								|| 'bg-orange-700 bg-opacity-20 border border-orange-800 text-orange-50',
							)}>
                <div className="flex items-center gap-2 mb-1">
									{log.sender ? (
										<Link href={`/players/${log.sender}`} className={clsx(
											'font-bold text-[11px] uppercase tracking-wider hover:underline',
											self && 'text-blue-300' || 'text-orange-400',
										)}>
											{log.sender}
										</Link>
									) : (
										<span className="font-bold text-[11px] uppercase tracking-wider text-orange-400">Administrator</span>
									)}
                  <span className="text-[10px] text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="whitespace-pre-wrap leading-relaxed">{log.message}</span>
                {log.action !== 'Reply' && log.action !== 'Ticket Opened' && (
                  <div className="mt-2 pt-1 border-t border-white border-opacity-10 text-[10px] italic opacity-60">
                    Action: {log.action}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
