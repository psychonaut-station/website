import { useEffect, useRef } from 'react';

export function useScrollInto(id: string, trigger: any) {
	const last = useRef(false);

	useEffect(() => {
		if (trigger) {
			if (last.current !== false) {
				scrollIntoView(id);
			}
			last.current = true;
		}
	}, [id, trigger]);
}

export function useScrollIntoOnce(id: string, trigger: any) {
	const done = useRef(false);

	useEffect(() => {
		if (!done.current && trigger) {
			scrollIntoView(id);
			done.current = true;
		}
	}, [id, trigger]);

	useEffect(() => {
		done.current = false;
	}, [id]);
}

export function scrollIntoView(id: string) {
	setTimeout(() => {
		document.getElementById(id)?.scrollIntoView({
			block: 'end',
			inline: 'nearest',
			behavior: 'smooth',
		});
	}, 1);
}
