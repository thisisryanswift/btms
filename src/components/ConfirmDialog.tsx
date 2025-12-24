import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info'
}: ConfirmDialogProps) {
    const confirmButtonClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : variant === 'warning'
            ? 'bg-yellow-600 hover:bg-yellow-700'
            : 'bg-blue-600 hover:bg-blue-700';

    const footer = (
        <>
            <button
                type="button"
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${confirmButtonClass}`}
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
                {confirmLabel}
            </button>
            <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-colors"
                onClick={onClose}
            >
                {cancelLabel}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
            </p>
        </Modal>
    );
}
