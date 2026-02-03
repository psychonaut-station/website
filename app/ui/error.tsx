'use client';

export default function Error({ message, status }: { message: string; status: number }) {
	return (
		<div className="flex-1 flex flex-col items-center justify-end">
			<div className="flex items-center font-system">
				<span className="inline-block mr-5 pr-6 border-r border-r-white/30 text-2xl leading-12 font-medium">{status}</span>
				<span className="inline-block text-sm leading-12">{message}</span>
			</div>
		</div>
	);
}
