import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={e => e.stopPropagation()}>

                <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                    <h3 className="text-md" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                        {title}
                    </h3>
                    <button onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                    {children}
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
                        Entendido
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Modal;
