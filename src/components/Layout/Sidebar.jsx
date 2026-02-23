import React from 'react';
import { LayoutDashboard, Package, Users, Eye, Zap, Settings, LogOut, Calendar, ShoppingCart } from 'lucide-react';

const Sidebar = ({ currentModule, onChangeModule }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
        { id: 'appointments', label: 'Citas', icon: Calendar },
        { id: 'inventory', label: 'Inventario', icon: Package },
        { id: 'crm', label: 'Pacientes & Rx', icon: Users },
        { id: 'engine', label: 'Consultorio', icon: Eye },
        { id: 'automation', label: 'Automatización', icon: Zap },
    ];

    return (
        <div className="sidebar flex col justify-between bg-white h-full" style={{ width: '280px', borderRight: '1px solid #F4F7FE' }}>
            <div>
                <div className="logo-area" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
                    <span className="text-lg" style={{ color: 'var(--color-text-main)' }}>SaaS<span style={{ fontWeight: '400' }}>Óptico</span></span>
                </div>

                <div className="menu-items flex col gap-sm" style={{ padding: '0 16px' }}>
                    {menuItems.map((item) => {
                        const isActive = currentModule === item.id;
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                onClick={() => onChangeModule(item.id)}
                                className={`menu-item flex items-center gap-md ${isActive ? 'active' : ''}`}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    cursor: 'pointer',
                                    color: isActive ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
                                    fontWeight: isActive ? '600' : '500',
                                    position: 'relative'
                                }}
                            >
                                {isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        right: '-16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '4px',
                                        height: '24px',
                                        background: 'var(--color-primary)',
                                        borderRadius: '4px 0 0 4px'
                                    }}></div>
                                )}
                                <Icon size={20} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div className="banner flex col" style={{
                    background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '16px',
                    color: 'white',
                    marginBottom: '20px',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                    }}>
                        <Settings size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Versión Pro</span>
                    <span style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>Mejora tu plan hoy</span>
                </div>

                <div className="link flex items-center gap-md" style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
