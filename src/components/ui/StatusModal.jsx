import React from 'react';
import { Save, AlertCircle, Loader2, Check } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, message, title = "Éxito", type = 'success', showButton = true }) => {
    if (!isOpen) return null;

    // Config based on type
    const isSuccess = type === 'success';
    const isLoading = type === 'loading';

    let bgIcon = isSuccess ? '#E6FDF9' : '#FFF5F5';
    let colorIcon = isSuccess ? '#05CD99' : '#EE5D50';
    let IconComponent = isSuccess ? Check : AlertCircle;
    let btnBg = isSuccess ? '#4318FF' : '#EE5D50';

    if (isLoading) {
        bgIcon = '#F4F7FE';
        colorIcon = '#4318FF';
        IconComponent = Loader2;
        btnBg = '#4318FF';
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '32px',
                width: '90%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: bgIcon, color: colorIcon,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '8px'
                }}>
                    <IconComponent size={32} className={isLoading ? 'animate-spin' : ''} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2B3674' }}>{title}</h3>
                <p style={{ color: '#A3AED0', fontSize: '14px', lineHeight: '1.6' }}>{message}</p>

                {!isLoading && showButton && (
                    <button onClick={onClose} className="btn-primary" style={{
                        width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px',
                        background: btnBg, fontWeight: '600', boxShadow: isSuccess ? '0 8px 16px rgba(67, 24, 255, 0.2)' : '0 8px 16px rgba(238, 93, 80, 0.2)', border: 'none', color: 'white'
                    }}>
                        Aceptar
                    </button>
                )}
            </div>
            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default StatusModal;
