import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
	size?: 'sm' | 'md' | 'lg';
	fallback?: string;
}

function Avatar({ className, size = 'md', src, alt, fallback, ...props }: AvatarProps) {
	const sizeClasses = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base',
	};

	if (!src && fallback) {
		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-medium text-white',
					sizeClasses[size],
					className,
				)}
			>
				{fallback}
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={cn('rounded-full object-cover', sizeClasses[size], className)}
			{...props}
		/>
	);
}

export { Avatar };
