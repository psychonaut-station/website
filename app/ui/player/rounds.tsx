'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { useScrollInto } from '@/app/hooks/useScrollInto';
import { CharacterLogs, Manifest } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { roundCharacterImageLoader } from '@/app/lib/image-loader';
import { Pagination } from '@/app/ui/navigation';
import Sprite from '@/app/ui/player/sprite';

type ManifestResponse = {
  data: Manifest[];
  total_count: number;
}

const pageSizeOptions = [10, 20, 30, 40] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];


export default function Rounds({ ckey }: { ckey: string; }) {
  const [page, setPage] = useState(1);
  const [debouncedPage] = useDebounce(page, 200);
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);

  const [optimisticRounds, setOptimisticRounds] = useState<ManifestResponse | null>(null);
  const { data: rounds, error, isLoading } = useSWRImmutable<ManifestResponse>(`/api/player/rounds?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);
  useSWRImmutable(`/api/player/rounds?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

  useEffect(() => {
    if (rounds) setOptimisticRounds(rounds);
  }, [rounds]);

  useScrollInto('rounds-navigation', optimisticRounds);

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-5 pt-8 max-w-5xl">
      <div className="w-full flex flex-col items-center gap-5">
        <span className="text-center text-3xl font-bold mb-4 flex items-center gap-3">
          Geçmiş Roundlar
        </span>
        <div className="w-full flex flex-col">
          {isLoading && !optimisticRounds && !error && (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
              <Icon icon={faSpinner} size="3x" spin/>
              <span className="mt-4 text-lg">Roundlar yükleniyor...</span>
            </div>
          )}
          {optimisticRounds && (
            <div className="grid md:grid-cols-2 gap-2">
              {optimisticRounds.data.map((item) => (
                <Round key={`${item.round_id}-${item.id}`} manifest={item} ckey={ckey}/>
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
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size as PageSizeOption); setPage(1); }}
          />
        </div>
      </div>
    </div>
  );
}

function Round({ manifest, ckey }: { manifest: Manifest, ckey: string }) {
  const date = new Date(manifest.timestamp).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const { data: characterLogsData } = useSWRImmutable<CharacterLogs>(`/api/rounds/character-logs?round_id=${manifest.round_id}`, fetcher);
  const characterIcon = characterLogsData?.[`${manifest.character_name}_${ckey}`]?.icon;

  return (
    <Link
      href={`/rounds/${manifest.round_id}`}
      className="group flex items-center w-full bg-black/60 border border-white/5 hover:border-white/20 transition-all p-2 gap-3 sm:gap-4"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-950/80 border border-white/10 shrink-0 flex items-center justify-center">
        <Sprite
          src={characterIcon || null}
          job={manifest.job}
          scale={1.5}
          loader={roundCharacterImageLoader}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-gray-100 font-bold truncate uppercase tracking-wide text-sm sm:text-base">
            {manifest.character_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <span className="text-blue-500/40 font-bold">#</span>
          <span className="text-gray-400 uppercase font-medium tracking-tight truncate">
            {manifest.job}
          </span>
          {manifest.latejoin && (
            <span className="xs:inline-block text-[9px] sm:text-[10px] text-blue-400 border border-white/10 px-1.5 py-0.5 font-mono bg-white/5">
              LATEJOIN
            </span>
          )}
          {manifest.special && manifest.special !== 'NONE' && (
            <span className="xs:inline-block text-[9px] sm:text-[10px] text-red-400 border border-white/10 px-1.5 py-0.5 font-mono bg-white/5">
              {manifest.special}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center shrink-0 sm:border-l border-white/10 sm:pl-6 pr-1 sm:pr-4">
        <span className="text-[10px] sm:text-xs font-mono text-gray-400 group-hover:text-gray-100 transition-colors">
          <span className="hidden sm:inline">ROUND</span> #{manifest.round_id}
        </span>
        <span className="text-[9px] sm:text-[11px] font-mono text-gray-500 mt-0.5">
          {date}
        </span>
      </div>
    </Link>
  );
}
