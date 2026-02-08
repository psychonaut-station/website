import { faAngleLeft, faAngleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx/lite';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';

import { NumberInput } from '@/app/ui/input';

type NavigationProps = {
	onPrevious?: () => boolean | void;
	onNext?: () => boolean | void;
	onChange?: (value: number) => boolean | void;
	min?: number;
	max?: number;
	value?: number;
	id: string;
};

export function Navigation({ onPrevious, onNext, onChange, min, max, value, id }: NavigationProps) {
	const scrollIntoView = useCallback(() => {
		setTimeout(() => {
			document.getElementById(id)?.scrollIntoView({
				block: 'end',
				inline: 'nearest',
				behavior: 'smooth',
			});
		}, 1);
	}, [id]);

	const handlePrevious = useCallback(() => {
		if (onPrevious && onPrevious() !== false) {
			scrollIntoView();
		}
	}, [onPrevious, scrollIntoView]);

	const handleNext = useCallback(() => {
		if (onNext && onNext() !== false) {
			scrollIntoView();
		}
	}, [onNext, scrollIntoView]);

	const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		if (onChange && onChange(+event.target.value) !== false) {
			scrollIntoView();
		}
	}, [onChange, scrollIntoView]);

	return (
		<div className="[&>span]:cursor-pointer [&>span]:px-2">
			<span className="inline-block" onClick={handlePrevious}><Icon icon={faAngleLeft} /></span>
			<div className="inline-flex flex-row items-center">
				<NumberInput value={value ?? 1} min={min ?? 1} max={max ?? 1} onChange={handleOnChange} />
				<span className="cursor-default">/</span>
				<NumberInput value={max ?? 1} disabled min={1} max={max ?? 1} />
			</div>
			<span className="inline-block" onClick={handleNext}><Icon icon={faAngleRight} /></span>
			<div id={id} className="relative top-6"></div>
		</div>
	);
}

type PaginationProps = {
	id: string;
	page: number;
	size: number;
	totalCount: number | undefined;
	options?: readonly number[];
	loading: boolean;
	onPageChange?: (page: number) => boolean | void;
	onPageSizeChange?: (size: number) => boolean | void;
};

export function Pagination({
	id,
	page,
	size,
	totalCount = 0,
	options = [10, 20, 30, 40],
	loading = false,
	onPageChange,
	onPageSizeChange,
}: PaginationProps) {
	const maxPage = useMemo(() => Math.max(Math.ceil(totalCount / size), 1), [size, totalCount]);

	const onNext = useCallback(() => {
		const newPage = Math.min(page + 1, maxPage);
		if (newPage !== page) onPageChange?.(newPage);
	}, [page, maxPage, onPageChange]);

	const onPrevious = useCallback(() => {
		const newPage = Math.max(page - 1, 1);
		if (newPage !== page) onPageChange?.(newPage);
	}, [page, onPageChange]);

	const onChange = useCallback((value: number) => {
		const newPage = Math.min(Math.max(value, 1), maxPage);
		if (newPage !== page) onPageChange?.(newPage);
	}, [page, maxPage, onPageChange]);

	useEffect(() => {
		if (page > maxPage) onPageChange?.(maxPage);
	}, [page, maxPage, onPageChange]);

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
			<div className="ml-2 space-x-4" title="Sayfa boyutu">
				{options.map(option => (
					<span key={option} className={clsx(option === size && 'underline', 'hover:underline cursor-pointer')} onClick={() => onPageSizeChange?.(option)}>{option}</span>
				))}
			</div>
			<div className="flex items-center gap-1">
				{loading && <span className="w-5 flex justify-center opacity-50"><Icon icon={faSpinner} spin /></span>}
				<Navigation id={id} value={page} min={1} max={maxPage} onPrevious={onPrevious} onNext={onNext} onChange={onChange} />
			</div>
		</div>
	);
}
