import clsx from 'clsx/lite';
import type { MouseEventHandler } from 'react';

type ButtonProps = {
	children: React.ReactNode;
	className?: string;
	active?: boolean;
	onClick?: MouseEventHandler<HTMLDivElement> | undefined;
	disabled?: boolean;
};

export default function Button({ children, className, active, onClick, disabled }: ButtonProps) {
	return (
		<div
			className={clsx(
				'transition-colors border border-white/10 px-3 py-2 rounded-sm',
				active && 'bg-white/15 hover:bg-white/20' || !disabled && 'bg-white/5 hover:bg-white/10' || 'bg-white/5 text-gray-400',
				disabled && 'cursor-not-allowed' || onClick && 'cursor-pointer',
				className,
			)}
			onClick={onClick}
			aria-disabled={disabled}
		>
			{children}
		</div>
	);
}
