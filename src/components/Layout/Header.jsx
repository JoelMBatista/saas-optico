import React from 'react';
import { Search, Bell, Info } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <div className="header flex justify-between items-center" style={{
            padding: '24px',
            background: 'transparent', // Transparent as per Image1 style usually fits into the background
            marginBottom: '16px'
        }}>
            <div className="breadcrumb">
                <span className="text-sm">Pages / {title}</span>
                <h1 className="text-lg" style={{ marginTop: '4px' }}>{title}</h1>
            </div>

            <div className="top-nav flex items-center" style={{
                background: 'var(--color-bg-card)',
                padding: '10px',
                borderRadius: '30px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div className="search-bar flex items-center" style={{
                    background: 'var(--color-bg-body)',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    marginRight: '16px'
                }}>
                    <Search size={16} color="var(--color-text-secondary)" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        style={{
                            background: 'transparent',
                            padding: '0 8px',
                            fontSize: '13px',
                            width: '150px'
                        }}
                    />
                </div>

                <div className="actions flex items-center gap-md" style={{ marginRight: '8px' }}>
                    <Bell size={20} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
                    <Info size={20} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
                </div>

                <div className="avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#11047A',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    AP
                </div>
            </div>
        </div>
    );
};

export default Header;
