'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(
					'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
					{
						'gradient-accent glow-hover text-white hover:opacity-90':
							variant === 'primary',
						'border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:border-zinc-300 hover:bg-zinc-50':
							variant === 'secondary',
						'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900': variant === 'ghost',
					},
					{
						'px-3 py-1.5 text-sm': size === 'sm',
						'px-5 py-2.5 text-sm': size === 'md',
						'px-6 py-3 text-base': size === 'lg',
					},
					className,
				)}
				{...props}
			/>
		);
	},
);

Button.displayName = 'Button';

export { Button };
