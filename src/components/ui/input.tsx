'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={cn(
				'w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-colors duration-200',
				'placeholder:text-zinc-400',
				'focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none',
				error
					? 'border-red-500 focus:ring-red-500'
					: 'border-zinc-200 hover:border-zinc-300',
				className,
			)}
			{...props}
		/>
	);
});

Input.displayName = 'Input';

export { Input };
