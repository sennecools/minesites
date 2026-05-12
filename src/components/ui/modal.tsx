'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useEffect, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
}

function Modal({ isOpen, onClose, children, className }: ModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
					>
						<div
							className={cn(
								'max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white shadow-xl',
								className,
							)}
							onClick={(e) => e.stopPropagation()}
						>
							{children}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('border-b border-zinc-100 px-6 py-4', className)} {...props} />;
}

function ModalTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return <h2 className={cn('text-lg font-semibold text-zinc-900', className)} {...props} />;
}

function ModalContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('px-6 py-4', className)} {...props} />;
}

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('flex justify-end gap-3 border-t border-zinc-100 px-6 py-4', className)}
			{...props}
		/>
	);
}

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter };
