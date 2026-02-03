'use client';

import { faCalendarAlt, faCircleExclamation, faHourglassHalf, faLayerGroup, faSpinner, faUnlock, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import useSWRImmutable from 'swr/immutable';

import { departmentColors, jobDepartments } from '@/app/lib/constants';
import { type Ban as BanType } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { relativeTime } from '@/app/lib/time';

export default function Bans() {
  const { data: bans, error, isLoading } = useSWRImmutable<BanType[]>('/api/player/bans', fetcher);

  return (
		<div className='w-full flex-1 flex flex-col items-center gap-5 pt-8 px-4 sm:px-8 md:px-14 lg:px-56 xl:px-80 ultrawide:px-120 huge:px-160'>
      <div className="w-full flex flex-col items-center gap-5">
        <span className="text-center text-3xl font-bold mb-2 flex items-center gap-3">
          Geçmiş Banlar
        </span>
        <div className="w-full flex flex-col">
          {isLoading && !bans && !error && (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin/>
              <span className="mt-4 text-lg">Banlar yükleniyor...</span>
            </div>
          )}
          {bans && (
            <div className="flex flex-col gap-6">
              {bans.toReversed().map((item, index) => (
                <Ban key={index} ban={item} />
              ))}
							{bans.length === 0 && (
								<div className="w-full p-10 text-center text-gray-400">
									Gösterilecek ban bulunamadı.
								</div>
							)}
            </div>
          )}
          {error && (
            <div className="w-full flex items-center justify-center">
							<span className="text-red-500">An error has occurred: {error.message}</span>
						</div>
          )}
        </div>
      </div>
		</div>
  );
}

function Ban({ ban }: { ban: BanType }) {
	const duration = ban.expiration_time ? relativeTime(ban.bantime, ban.expiration_time) : 'Kalıcı';
  const roles = ban.roles ? ban.roles.split(',').map(r => r.trim()).filter(r => !!r) : [];

  return (
    <div className="flex flex-col gap-3 p-5 pb-3 bg-white/5 border-l-4 border-l-gray-500 rounded-r-md transition-hover hover:bg-white/10">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-wider font-semibold opacity-80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon={faUser} className="text-orange-400" />
            <span>Oyuncu: {ban.ckey ? (<Link href={`/players/${ban.ckey}`} className="hover:underline">{ban.ckey}</Link>) : 'Bilinmiyor'}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <Icon icon={faUserShield} className="text-blue-400" />
            <span>Admin: <Link href={`/players/${ban.a_ckey}`} className="hover:underline">{ban.a_ckey}</Link></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon={faCalendarAlt} />
          <span>{new Date(ban.bantime).toLocaleString('tr-TR')} - {relativeTime(ban.bantime)} önce</span>
        </div>
      </div>
      <div className="text-sm leading-relaxed text-gray-200 wrap-break-word whitespace-pre-wrap italic bg-black/20 p-3 rounded-sm border border-white/5">
        {ban.reason}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2">
        <div className="flex items-center gap-2 text-[11px] bg-white/5 p-2 rounded-sm">
          <Icon icon={faHourglassHalf} className="text-purple-400" />
          <span className="text-gray-400">Süre:</span>
          <span className="text-white font-medium">{duration}</span>
        </div>
        {ban.unbanned_datetime && (
          <div className="flex items-center gap-2 text-[11px] bg-white/5 p-2 rounded-sm">
            <Icon icon={faUnlock} className="text-green-400" />
            <span className="text-gray-400">Kaldırıldığı Tarih:</span>
            <span className="text-white font-medium">{relativeTime(ban.unbanned_datetime)} önce</span>
          </div>
        )}
        {ban.unbanned_ckey && (
          <div className="flex items-center gap-2 text-[11px] bg-white/5 p-2 rounded-sm">
            <Icon icon={faUserShield} className="text-blue-400" />
            <span className="text-gray-400">Kaldıran Admin:</span>
						<Link href={`/players/${ban.unbanned_ckey}`} className="text-white font-medium hover:underline">{ban.unbanned_ckey}</Link>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-400 border-t border-white/5 pt-2">
        {ban.round_id && (
          <Link href={`/rounds/${ban.round_id}`} className="flex items-center gap-1 hover:text-white transition-colors">
            <Icon icon={faLayerGroup} size="xs" />
            <span className="font-bold">Round:</span> #{ban.round_id}
          </Link>
        )}
				<div className="flex flex-wrap gap-1.5">
					{roles.map((role) => {
						const colorStyle = { '--color': departmentColors[jobDepartments[role]] ?? '#c5c5c5' } as React.CSSProperties;

						return (
							<div key={role} style={colorStyle} className="inline-flex items-center justify-center gap-1 px-2 h-4 border border-(--color) rounded-sm text-[9px] text-(--color) font-bold uppercase leading-none">
								<Icon icon={faCircleExclamation} className="text-[8px] shrink-0" />
								<span>{role}</span>
							</div>
						);
					})}
				</div>
      </div>
    </div>
  );
}
