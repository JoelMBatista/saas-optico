import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const DashboardModule = () => {
    const stats = [
        { title: 'Ingresos del Mes', value: '$12,450', icon: DollarSign, color: '#4318FF', bg: '#F4F7FE', change: '+12%' },
        { title: 'Citas Hoy', value: '8', icon: Calendar, color: '#05CD99', bg: '#E6FDF9', change: 'En curso' },
        { title: 'Nuevos Pacientes', value: '24', icon: Users, color: '#FFB547', bg: '#FFF7E6', change: '+4' },
        { title: 'Ventas Totales', value: '45', icon: TrendingUp, color: '#7551FF', bg: '#F2EFFF', change: '+20%' },
    ];

    return (
        <div className="flex col gap-lg">
            <div>
                <h2 className="text-lg">Hola, Dr. Martinez 👋</h2>
                <p className="text-sm">Aquí tienes el resumen de tu óptica hoy.</p>
            </div>

            <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-md">
                        <div style={{ padding: '12px', borderRadius: '50%', background: stat.bg, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm">{stat.title}</p>
                            <h3 className="text-lg">{stat.value}</h3>
                            <span style={{ fontSize: '11px', color: '#05CD99', fontWeight: 'bold' }}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md">Actividad Reciente</h3>
                    </div>
                    <div className="flex col gap-md">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid #F4F7FE' }}>
                                <div className="flex items-center gap-md">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0E5F2' }}></div>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>Venta #102{i}</p>
                                        <p className="text-sm">Lentes Completos - RayBan</p>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 600 }}>$1,200.00</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)', color: 'white' }}>
                    <h3 className="text-md" style={{ color: 'white' }}>Objetivo Mensual</h3>
                    <div style={{ margin: '24px 0' }}>
                        <h2 style={{ fontSize: '32px' }}>$12,450</h2>
                        <p style={{ opacity: 0.8 }}>de $20,000</p>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
                        <div style={{ width: '62%', height: '100%', background: 'white', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardModule;
