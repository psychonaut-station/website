'use client';

import clsx from 'clsx/lite';
import Link from 'next/link';
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';

import Button from '@/app/ui/button';

type DropdownItem = {
	label: string;
  class?: string;
} & ({
  href: string;
} | {
  action: () => void | Promise<void>;
})

type DropdownProps = {
	children: ReactNode;
	items: DropdownItem[];
}

export default function Dropdown({ children, items }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-sm z-100">
      <details open={isOpen}>
        <summary
          onClick={toggleDropdown}
          className="list-none cursor-pointer outline-hidden appearance-none [&::-webkit-details-marker]:hidden"
        >
          {children}
        </summary>
        <div className={'absolute z-110 right-0 mt-3 min-w-max flex flex-col rounded-sm shadow-2xl overflow-hidden backdrop-blur-md'}>
          {items.map((item) =>
						<Fragment key={item.label}>
							{'href' in item && (
								<Link href={item.href} className={clsx('block not-last:*:border-b-0 *:rounded-none first:*:rounded-t last:*:rounded-b', item.class)}>
									<Button className="w-full text-left px-4 py-2">{item.label}</Button>
								</Link>
							)}
							{'action' in item && (
								<Button
									className={clsx('w-full text-left px-4 py-2 cursor-pointer not-last:border-b-0 rounded-none! first:rounded-t! last:rounded-b!', item.class)}
									onClick={async (event) => {
										event.stopPropagation();
										await item.action();
										setIsOpen(false);
									}}
								>
									{item.label}
								</Button>
							)}
						</Fragment>
          )}
        </div>
      </details>
    </div>
  );
}
