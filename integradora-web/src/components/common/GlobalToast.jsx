import React, { useState, useEffect } from 'react';
import { toastManager } from '../../utils/toastManager';
import Alert from './Alert';

const GlobalToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const unsubscribe = toastManager.subscribe(({ message, type }) => {
            setToast({ message, type });

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setToast(null);
            }, 5000);
        });

        return unsubscribe;
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] max-w-md">
            <Alert
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(null)}
            />
        </div>
    );
};

export default GlobalToast;
