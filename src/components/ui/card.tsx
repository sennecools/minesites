import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
	return (
		<div
			className={cn('rounded-2xl border border-zinc-200 bg-white shadow-sm', className)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: CardProps) {
	return <div className={cn('px-6 py-4', className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
	return <h3 className={cn('text-lg font-semibold text-zinc-900', className)} {...props} />;
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('mt-1 text-sm text-zinc-500', className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
	return <div className={cn('px-6 py-4', className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
	return <div className={cn('border-t border-zinc-100 px-6 py-4', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
