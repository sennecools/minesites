'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
	toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error('useToast must be used within ToastProvider');
	return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
				<AnimatePresence>
					{toasts.map((t) => (
						<motion.div
							key={t.id}
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							className={cn('rounded-xl px-4 py-3 text-sm font-medium shadow-lg', {
								'bg-emerald-500 text-white': t.type === 'success',
								'bg-red-500 text-white': t.type === 'error',
								'bg-zinc-800 text-white': t.type === 'info',
							})}
						>
							{t.message}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}
