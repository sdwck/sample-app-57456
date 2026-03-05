import { useState, useCallback } from 'react';
import type {Toast} from "../types";

const colors = {
    created: 'bg-green-800 border-green-500',
    updated: 'bg-blue-800 border-blue-500',
    deleted: 'bg-red-800 border-red-500',
};

let nextId = 0;

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((text: string, type: Toast['type']) => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    return { toasts, addToast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`${colors[t.type]} border px-4 py-3 rounded shadow-lg text-white text-sm animate-slide-in`}
                >
                    {t.text}
                </div>
            ))}
        </div>
    );
}