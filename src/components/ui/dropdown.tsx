'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface DropdownProps {
	trigger: ReactNode;
	children: ReactNode;
	align?: 'left' | 'right';
	className?: string;
}

function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div ref={dropdownRef} className="relative">
			<div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.15 }}
						className={cn(
							'absolute top-full z-50 mt-2 min-w-[160px] rounded-xl border border-zinc-200 bg-white py-1 shadow-lg',
							align === 'right' ? 'right-0' : 'left-0',
							className,
						)}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	destructive?: boolean;
}

function DropdownItem({ className, destructive, ...props }: DropdownItemProps) {
	return (
		<button
			className={cn(
				'w-full px-4 py-2 text-left text-sm transition-colors',
				destructive ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700 hover:bg-zinc-50',
				className,
			)}
			{...props}
		/>
	);
}

function DropdownDivider() {
	return <div className="my-1 border-t border-zinc-100" />;
}

export { Dropdown, DropdownItem, DropdownDivider };
