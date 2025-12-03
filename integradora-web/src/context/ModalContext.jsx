import React, { createContext, useState, useContext, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    return useContext(ModalContext);
};

export const ModalProvider = ({ children }) => {
    const [activeModal, setActiveModal] = useState(null); // 'login', 'register', 'forgot-password', 'reset-password', or null
    const [modalProps, setModalProps] = useState({});

    const openLogin = useCallback(() => setActiveModal('login'), []);
    const openRegister = useCallback(() => setActiveModal('register'), []);
    const openForgotPassword = useCallback(() => setActiveModal('forgot-password'), []);
    const openResetPassword = useCallback((props = {}) => {
        setModalProps(props);
        setActiveModal('reset-password');
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setModalProps({});
    }, []);

    const value = {
        activeModal,
        modalProps,
        openLogin,
        openRegister,
        openForgotPassword,
        openResetPassword,
        closeModal
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
