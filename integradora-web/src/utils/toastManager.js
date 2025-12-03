// Global toast notification manager
class ToastManager {
    constructor() {
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    show(message, type = 'error') {
        this.listeners.forEach(listener => listener({ message, type }));
    }

    error(message) {
        this.show(message, 'error');
    }

    success(message) {
        this.show(message, 'success');
    }

    warning(message) {
        this.show(message, 'warning');
    }

    info(message) {
        this.show(message, 'info');
    }
}

export const toastManager = new ToastManager();
